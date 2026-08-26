<?php
declare(strict_types=1);

require_once __DIR__ . '/specforge_validation.php';

final class MariaDbSpecForgeRepository
{
    /** @var null|Closure(string,array):void */
    private ?Closure $beforeSnapshotInsert;

    public function __construct(private readonly PDO $pdo, ?Closure $beforeSnapshotInsert = null)
    {
        $this->beforeSnapshotInsert = $beforeSnapshotInsert;
    }

    /** @return array<string,mixed>|null */
    public function getProjectAggregate(array $identity, string $projectId): ?array
    {
        $project = $this->project($identity, $projectId);
        specforge_require_capability($identity, 'view', $project);
        $stmt = $this->pdo->prepare('SELECT w.*, p.name AS project_name FROM specforge_workspaces w INNER JOIN projects p ON p.id=w.project_id WHERE w.organization_id=? AND w.project_id=?');
        $stmt->execute([$identity['org'], $projectId]);
        $workspace = $stmt->fetch();
        return $workspace ? $this->hydrateAggregate($identity, $workspace) : null;
    }

    /** @return array{record:array<string,mixed>,idempotent:bool} */
    public function createWorkspace(array $identity, string $projectId, array $body, string $idempotencyKey): array
    {
        $project = $this->project($identity, $projectId);
        specforge_require_capability($identity, 'edit', $project);
        return $this->command($identity, 'workspace.create', null, null, $idempotencyKey, $body, function () use ($identity, $projectId, $body): array {
            $existing = $this->workspaceRow($identity['org'], $projectId, true, false);
            if ($existing) throw new SpecForgeRepositoryError(409, 'SpecForge workspace already exists.');
            $id = $this->uuid();
            $this->pdo->prepare('INSERT INTO specforge_workspaces (id,organization_id,project_id,profile,stage,revision,issue_status,budget_reviewed_at,created_by,updated_by) VALUES (?,?,?,?,?,? ,"draft",?,?,?)')->execute([
                $id, $identity['org'], $projectId, $body['profile'], $body['stage'], $body['revision'], $body['budget_reviewed_at'] ?? null, $identity['sub'], $identity['sub'],
            ]);
            $row = $this->workspaceById($identity['org'], $id, true);
            $this->audit($identity, 'specforge.workspace.created', 'specforge_workspace', $id, null, $row + ['project_id' => $projectId]);
            return $row;
        });
    }

    /** @return array{record:array<string,mixed>,idempotent:bool} */
    public function createSection(array $identity, string $projectId, array $body, string $idempotencyKey): array
    {
        $workspace = $this->workspaceForCapability($identity, $projectId, 'edit');
        return $this->command($identity, 'section.create', $workspace['id'], null, $idempotencyKey, $body, function () use ($identity, $workspace, $projectId, $body): array {
            $id = $this->uuid();
            $this->pdo->prepare('INSERT INTO specforge_sections (id,organization_id,workspace_id,code,title,discipline,owner_role,reviewer_role,status,standard_source,source_revision,created_by,updated_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')->execute([
                $id, $identity['org'], $workspace['id'], $body['code'], $body['title'], $body['discipline'], $body['owner_role'], $body['reviewer_role'] ?? null, $body['status'], $body['standard_source'] ?? null, $body['source_revision'] ?? null, $identity['sub'], $identity['sub'],
            ]);
            $row = $this->findRow('specforge_sections', $identity['org'], $id);
            $this->audit($identity, 'specforge.section.created', 'specforge_section', $id, null, $row + ['project_id' => $projectId]);
            return $row;
        });
    }

    /** @return array{record:array<string,mixed>,idempotent:bool} */
    public function createItem(array $identity, string $projectId, array $body, string $idempotencyKey): array
    {
        $workspace = $this->workspaceForCapability($identity, $projectId, 'edit');
        return $this->command($identity, 'item.create', $workspace['id'], null, $idempotencyKey, $body, function () use ($identity, $workspace, $projectId, $body): array {
            $section = $this->findRow('specforge_sections', $identity['org'], (string) $body['section_id']);
            if ($section['workspace_id'] !== $workspace['id']) throw new SpecForgeRepositoryError(422, 'Section does not belong to this workspace.');
            $id = $this->uuid();
            $this->pdo->prepare('INSERT INTO specforge_items (id,organization_id,workspace_id,section_id,code,title,room,package_name,description,supplier,model,finish,dimensions,image_url,budget_allowance,estimated_cost,lead_time_days,client_decision,owner_role,reviewer_role,approver_role,status,source_revision,superseded_by,created_by,updated_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')->execute([
                $id, $identity['org'], $workspace['id'], $body['section_id'], $body['code'], $body['title'], $body['room'] ?? '', $body['package_name'] ?? '', $body['description'], $body['supplier'] ?? null, $body['model'] ?? null, $body['finish'] ?? null, $body['dimensions'] ?? null, $body['image_url'] ?? null, $body['budget_allowance'] ?? 0, $body['estimated_cost'] ?? 0, $body['lead_time_days'] ?? 0, !empty($body['client_decision']) ? 1 : 0, $body['owner_role'], $body['reviewer_role'] ?? null, $body['approver_role'] ?? null, $body['status'], $body['source_revision'], $body['superseded_by'] ?? null, $identity['sub'], $identity['sub'],
            ]);
            $row = $this->hydrateItem($this->findRow('specforge_items', $identity['org'], $id));
            $this->audit($identity, 'specforge.item.created', 'specforge_item', $id, null, $row + ['project_id' => $projectId]);
            return $row;
        });
    }

    /** @return array<string,mixed> */
    public function updateWorkspace(array $identity, string $projectId, array $patch, int $expectedVersion): array
    {
        $capability = array_keys($patch) === ['budget_reviewed_at'] ? 'review_budget' : 'edit';
        $workspace = $this->workspaceForCapability($identity, $projectId, $capability);
        $allowed = ['profile','stage','budget_reviewed_at'];
        $changes = array_intersect_key($patch, array_flip($allowed));
        if (!$changes) throw new SpecForgeRepositoryError(422, 'No mutable workspace fields supplied.');
        return $this->updateRecord($identity, 'specforge_workspaces', $workspace['id'], $changes, $expectedVersion, 'specforge.workspace.updated', 'specforge_workspace', $projectId);
    }

    /** @return array<string,mixed> */
    public function updateSection(array $identity, string $projectId, string $sectionId, array $patch, int $expectedVersion): array
    {
        $workspace = $this->workspaceForCapability($identity, $projectId, 'edit');
        $section = $this->findRow('specforge_sections', $identity['org'], $sectionId);
        if ($section['workspace_id'] !== $workspace['id']) throw new SpecForgeRepositoryError(404, 'Specification section not found.');
        specforge_require_capability($identity, 'edit', $this->scopeRecord($identity, $projectId, $section));
        $allowed = ['code','title','discipline','owner_role','reviewer_role','status','standard_source','source_revision','last_reviewed_at'];
        $changes = array_intersect_key($patch, array_flip($allowed));
        if (!$changes) throw new SpecForgeRepositoryError(422, 'No mutable section fields supplied.');
        return $this->updateRecord($identity, 'specforge_sections', $sectionId, $changes, $expectedVersion, 'specforge.section.updated', 'specforge_section', $projectId);
    }

    /** @return array{record:array<string,mixed>,idempotent:bool} */
    public function duplicateItem(array $identity, string $projectId, string $itemId, string $idempotencyKey): array
    {
        $workspace = $this->workspaceForCapability($identity, $projectId, 'edit');
        $source = $this->findRow('specforge_items', $identity['org'], $itemId);
        if ($source['workspace_id'] !== $workspace['id']) throw new SpecForgeRepositoryError(404, 'Specification item not found.');
        specforge_require_capability($identity, 'edit', $this->scopeRecord($identity, $projectId, $source));
        return $this->command($identity, 'item.duplicate', $workspace['id'], $itemId, $idempotencyKey, ['item_id' => $itemId], function () use ($identity, $projectId, $source): array {
            $copy = $source;
            $copy['id'] = $this->uuid();
            $copy['code'] = substr($source['code'], 0, 51) . '-COPY-' . strtoupper(substr(str_replace('-', '', $copy['id']), 0, 6));
            $copy['title'] = substr($source['title'] . ' copy', 0, 220);
            $copy['status'] = 'draft';
            $copy['superseded_by'] = null;
            $copy['lock_version'] = 1;
            $this->pdo->prepare('INSERT INTO specforge_items (id,organization_id,workspace_id,section_id,code,title,room,package_name,description,supplier,model,finish,dimensions,image_url,budget_allowance,estimated_cost,lead_time_days,client_decision,owner_role,reviewer_role,approver_role,status,source_revision,superseded_by,created_by,updated_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')->execute([
                $copy['id'], $identity['org'], $copy['workspace_id'], $copy['section_id'], $copy['code'], $copy['title'], $copy['room'], $copy['package_name'], $copy['description'], $copy['supplier'], $copy['model'], $copy['finish'], $copy['dimensions'], $copy['image_url'], $copy['budget_allowance'], $copy['estimated_cost'], $copy['lead_time_days'], $copy['client_decision'], $copy['owner_role'], $copy['reviewer_role'], $copy['approver_role'], $copy['status'], $copy['source_revision'], null, $identity['sub'], $identity['sub'],
            ]);
            $created = $this->hydrateItem($this->findRow('specforge_items', $identity['org'], $copy['id']));
            $this->audit($identity, 'specforge.item.duplicated', 'specforge_item', $copy['id'], null, $created + ['project_id' => $projectId, 'source_item_id' => $source['id']]);
            return $created;
        });
    }

    /** @return array{record:array<string,mixed>,idempotent:bool} */
    public function requestApproval(array $identity, string $projectId, string $itemId, array $body, string $idempotencyKey): array
    {
        $workspace = $this->workspaceForCapability($identity, $projectId, 'edit');
        $item = $this->findRow('specforge_items', $identity['org'], $itemId);
        if ($item['workspace_id'] !== $workspace['id']) throw new SpecForgeRepositoryError(404, 'Specification item not found.');
        specforge_require_capability($identity, 'edit', $this->scopeRecord($identity, $projectId, $item));
        return $this->command($identity, 'approval.request', $workspace['id'], $itemId, $idempotencyKey, $body, function () use ($identity, $projectId, $workspace, $itemId, $body): array {
            $id = $this->uuid();
            $this->pdo->prepare('INSERT INTO specforge_approvals (id,organization_id,workspace_id,item_id,approval_type,requested_role,requested_user_id,status,due_at) VALUES (?,?,?,?,?,?,?,"pending",?)')->execute([
                $id, $identity['org'], $workspace['id'], $itemId, $body['approval_type'], $body['requested_role'], $body['requested_user_id'] ?? null, $body['due_at'] ?? null,
            ]);
            $row = $this->hydrateApproval($this->findRow('specforge_approvals', $identity['org'], $id));
            $this->audit($identity, 'specforge.approval.requested', 'specforge_approval', $id, null, $row + ['project_id' => $projectId]);
            return $row;
        });
    }

    /** @return array{record:array<string,mixed>,idempotent:bool} */
    public function decideApproval(array $identity, string $projectId, string $approvalId, array $body, string $idempotencyKey): array
    {
        $workspace = $this->workspaceForCapability($identity, $projectId, 'decide');
        $approval = $this->findRow('specforge_approvals', $identity['org'], $approvalId);
        if ($approval['workspace_id'] !== $workspace['id']) throw new SpecForgeRepositoryError(404, 'Specification approval not found.');
        $item = $this->findRow('specforge_items', $identity['org'], $approval['item_id']);
        specforge_require_capability($identity, 'decide', $this->scopeRecord($identity, $projectId, $item));
        if ($approval['requested_user_id'] !== null && $approval['requested_user_id'] !== $identity['sub']) throw new SpecForgeRepositoryError(403, 'Approval is assigned to another user.');
        if ($approval['requested_user_id'] === null && $approval['requested_role'] !== $identity['role'] && $identity['role'] !== 'platform_admin') throw new SpecForgeRepositoryError(403, 'Approval is assigned to another role.');
        return $this->command($identity, 'approval.decision', $workspace['id'], $approvalId, $idempotencyKey, $body, function () use ($identity, $projectId, $approval, $body): array {
            if ($approval['status'] !== 'pending') throw new SpecForgeRepositoryError(409, 'Approval has already been decided.');
            $statement = $this->pdo->prepare('UPDATE specforge_approvals SET status=?,decision_note=?,decided_at=?,decided_by=?,lock_version=lock_version+1 WHERE id=? AND organization_id=? AND status="pending"');
            $statement->execute([$body['decision'], $body['decision_note'] ?? null, gmdate('Y-m-d H:i:s'), $identity['sub'], $approval['id'], $identity['org']]);
            if ($statement->rowCount() !== 1) throw new SpecForgeRepositoryError(409, 'Approval has already been decided.');
            $updated = $this->hydrateApproval($this->findRow('specforge_approvals', $identity['org'], $approval['id']));
            $this->audit($identity, 'specforge.approval.' . $body['decision'], 'specforge_approval', $approval['id'], $this->hydrateApproval($approval), $updated + ['project_id' => $projectId]);
            return $updated;
        });
    }

    /** @return array<string,mixed> */
    public function updateItem(array $identity, string $projectId, string $itemId, array $patch, int $expectedVersion): array
    {
        $workspace = $this->workspaceForCapability($identity, $projectId, 'edit');
        $this->pdo->beginTransaction();
        try {
            $item = $this->findRow('specforge_items', $identity['org'], $itemId, true);
            if ($item['workspace_id'] !== $workspace['id']) throw new SpecForgeRepositoryError(404, 'Specification item not found.');
            specforge_require_capability($identity, 'edit', $this->scopeRecord($identity, $projectId, $item));
            if ((int) $item['lock_version'] !== $expectedVersion) throw new SpecForgeRepositoryError(409, 'Stale specification item version.');
            $mutable = ['section_id','code','title','room','package_name','description','supplier','model','finish','dimensions','image_url','budget_allowance','estimated_cost','lead_time_days','client_decision','owner_role','reviewer_role','approver_role','status','source_revision','superseded_by'];
            $changes = array_intersect_key($patch, array_flip($mutable));
            if (!$changes) throw new SpecForgeRepositoryError(422, 'No mutable specification item fields supplied.');
            $sets = [];
            $values = [];
            foreach ($changes as $field => $value) { $sets[] = "`{$field}`=?"; $values[] = $field === 'client_decision' ? ($value ? 1 : 0) : $value; }
            $sets[] = 'updated_by=?'; $values[] = $identity['sub'];
            $values[] = $itemId; $values[] = $identity['org']; $values[] = $expectedVersion;
            $sql = 'UPDATE specforge_items SET ' . implode(',', $sets) . ', lock_version=lock_version+1 WHERE id=? AND organization_id=? AND lock_version=?';
            $statement = $this->pdo->prepare($sql);
            $statement->execute($values);
            if ($statement->rowCount() !== 1) throw new SpecForgeRepositoryError(409, 'Stale specification item version.');
            $updated = $this->hydrateItem($this->findRow('specforge_items', $identity['org'], $itemId));
            $this->audit($identity, 'specforge.item.updated', 'specforge_item', $itemId, $this->hydrateItem($item), $updated + ['project_id' => $projectId]);
            $this->pdo->commit();
            return $updated;
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $error;
        }
    }

    /** @return array{ready:bool,codes:list<string>} */
    public function validateIssue(array $identity, string $projectId): array
    {
        $workspace = $this->workspaceForCapability($identity, $projectId, 'view');
        return $this->issueReadiness($workspace['id']);
    }

    /** @return list<array<string,mixed>> */
    public function listJobs(array $identity, string $projectId, ?string $issueId = null): array
    {
        $this->workspaceForCapability($identity, $projectId, 'issue');
        $sql = "SELECT id,job_type,status,result_json,last_error,attempts,created_at,updated_at FROM jobs WHERE organization_id=? AND JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$.project_id'))=? AND (job_type LIKE 'specforge.%' OR job_type='ai_drawing_scan')";
        $values = [$identity['org'], $projectId];
        if ($issueId !== null && $issueId !== '') {
            $sql .= " AND JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$.issue_id'))=?";
            $values[] = $issueId;
        }
        $sql .= ' ORDER BY created_at ASC,id ASC';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($values);
        return array_map(function (array $row): array {
            $row['attempts'] = (int) $row['attempts'];
            $row['result'] = $this->decode($row['result_json']);
            unset($row['result_json']);
            return $row;
        }, $stmt->fetchAll());
    }

    /** @return array{record:array<string,mixed>,idempotent:bool} */
    public function requestDrawingScan(array $identity, string $projectId, string $drawingRevisionId, string $idempotencyKey): array
    {
        $workspace = $this->workspaceForCapability($identity, $projectId, 'drawing_request');
        $body = ['drawing_revision_id' => $drawingRevisionId];
        return $this->command($identity, 'drawing_scan.create', $workspace['id'], $drawingRevisionId, $idempotencyKey, $body, function () use ($identity, $projectId, $workspace, $drawingRevisionId): array {
            $job = $this->enqueueJob($identity['org'], 'ai_drawing_scan', [
                'consumer' => 'specforge',
                'project_id' => $projectId,
                'workspace_id' => $workspace['id'],
                'drawing_revision_id' => $drawingRevisionId,
            ]);
            $this->audit($identity, 'specforge.drawing_scan.requested', 'job', $job['id'], null, $job + ['project_id' => $projectId]);
            return $job;
        });
    }

    /** @return array{record:array<string,mixed>,idempotent:bool} */
    public function createIssue(array $identity, string $projectId, array $body, string $idempotencyKey): array
    {
        $workspace = $this->workspaceForCapability($identity, $projectId, 'issue');
        return $this->command($identity, 'issue.create', $workspace['id'], null, $idempotencyKey, $body, function () use ($identity, $projectId, $body, $workspace): array {
            $locked = $this->workspaceById($identity['org'], $workspace['id'], true);
            $readiness = $this->issueReadiness($locked['id']);
            if (!$readiness['ready']) throw new SpecForgeRepositoryError(409, 'Specification is not ready to issue: ' . implode(', ', $readiness['codes']));
            $snapshot = $this->snapshot($locked['id']);
            $snapshotJson = $this->encode($snapshot);
            $issueId = $this->uuid();
            $now = gmdate('Y-m-d H:i:s');
            $hash = hash('sha256', $snapshotJson);
            $this->pdo->prepare('INSERT INTO specforge_issues (id,organization_id,workspace_id,revision,title,audience,status,snapshot_hash,issued_by,issued_at) VALUES (?,?,?,?,?,? ,"issued",?,?,?)')->execute([
                $issueId, $identity['org'], $locked['id'], $locked['revision'], $body['title'], $body['audience'], $hash, $identity['sub'], $now,
            ]);
            $ordinal = 0;
            foreach ($snapshot as $type => $records) {
                foreach ($records as $record) {
                    if ($this->beforeSnapshotInsert) ($this->beforeSnapshotInsert)($type, $record);
                    $sourceId = (string) ($record['id'] ?? $type . '-' . $ordinal);
                    $this->pdo->prepare('INSERT INTO specforge_issue_items (id,organization_id,issue_id,source_type,source_id,ordinal,snapshot_json) VALUES (?,?,?,?,?,?,?)')->execute([
                        $this->uuid(), $identity['org'], $issueId, rtrim($type, 's'), $sourceId, $ordinal++, $this->encode($record),
                    ]);
                }
            }
            $nextRevision = $this->nextRevision((string) $locked['revision']);
            $this->pdo->prepare('UPDATE specforge_workspaces SET revision=?, issue_status="issued", lock_version=lock_version+1, updated_by=? WHERE id=? AND organization_id=?')->execute([$nextRevision, $identity['sub'], $locked['id'], $identity['org']]);
            $issue = $this->findRow('specforge_issues', $identity['org'], $issueId);
            $downstream = [];
            foreach (['action-centre','messaging','programme','bom-sync','rfq','document','escrow'] as $destination) {
                $downstream[] = $this->enqueueJob($identity['org'], 'specforge.' . $destination, [
                    'project_id' => $projectId,
                    'workspace_id' => $locked['id'],
                    'issue_id' => $issueId,
                    'revision' => $locked['revision'],
                    'requested_by' => $identity['sub'],
                ]);
            }
            $this->audit($identity, 'specforge.issue.created', 'specforge_issue', $issueId, null, $issue + ['project_id' => $projectId]);
            return ['issue' => $issue, 'downstream' => $downstream];
        });
    }

    /** @return list<array<string,mixed>> */
    public function auditEvents(array $identity, string $projectId): array
    {
        $this->workspaceForCapability($identity, $projectId, 'view');
        $stmt = $this->pdo->prepare("SELECT id,actor_user_id,entity_type,entity_id,action_key,before_json,after_json,created_at FROM audit_log WHERE organization_id=? AND action_key LIKE 'specforge.%' AND JSON_UNQUOTE(JSON_EXTRACT(after_json, '$.project_id'))=? ORDER BY id DESC");
        $stmt->execute([$identity['org'], $projectId]);
        return array_map(function (array $row): array {
            $row['id'] = (int) $row['id'];
            $row['before'] = $this->decode($row['before_json']); unset($row['before_json']);
            $row['after'] = $this->decode($row['after_json']); unset($row['after_json']);
            return $row;
        }, $stmt->fetchAll());
    }

    /** @return array<string,mixed> */
    private function updateRecord(array $identity, string $table, string $id, array $changes, int $expectedVersion, string $action, string $entityType, string $projectId): array
    {
        $allowed = ['specforge_workspaces','specforge_sections'];
        if (!in_array($table, $allowed, true)) throw new LogicException('Unsupported mutable SpecForge table.');
        $this->pdo->beginTransaction();
        try {
            $before = $this->findRow($table, $identity['org'], $id, true);
            if ((int) $before['lock_version'] !== $expectedVersion) throw new SpecForgeRepositoryError(409, 'Stale SpecForge record version.');
            $sets = []; $values = [];
            foreach ($changes as $field => $value) { $sets[] = "`{$field}`=?"; $values[] = $value; }
            $sets[] = 'updated_by=?'; $values[] = $identity['sub'];
            $values[] = $id; $values[] = $identity['org']; $values[] = $expectedVersion;
            $statement = $this->pdo->prepare('UPDATE `' . $table . '` SET ' . implode(',', $sets) . ',lock_version=lock_version+1 WHERE id=? AND organization_id=? AND lock_version=?');
            $statement->execute($values);
            if ($statement->rowCount() !== 1) throw new SpecForgeRepositoryError(409, 'Stale SpecForge record version.');
            $after = $this->findRow($table, $identity['org'], $id);
            $after['lock_version'] = (int) $after['lock_version'];
            $this->audit($identity, $action, $entityType, $id, $before, $after + ['project_id' => $projectId]);
            $this->pdo->commit();
            return $after;
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $error;
        }
    }

    /** @return array{record:array<string,mixed>,idempotent:bool} */
    private function command(array $identity, string $route, ?string $workspaceId, ?string $targetId, string $key, array $body, callable $operation): array
    {
        if ($key === '' || strlen($key) > 180) throw new SpecForgeRepositoryError(400, 'A valid Idempotency-Key is required.');
        $hash = hash('sha256', $this->encode($body));
        $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare('SELECT body_hash,response_json FROM specforge_commands WHERE organization_id=? AND actor_user_id=? AND route_key=? AND idempotency_key=? FOR UPDATE');
            $stmt->execute([$identity['org'], $identity['sub'], $route, $key]);
            $existing = $stmt->fetch();
            if ($existing) {
                if (!hash_equals((string) $existing['body_hash'], $hash)) throw new SpecForgeRepositoryError(409, 'Idempotency key conflicts with a different request.');
                $this->pdo->commit();
                return ['record' => $this->decode($existing['response_json']), 'idempotent' => true];
            }
            $record = $operation();
            $resolvedWorkspace = $workspaceId ?? ($record['id'] ?? null);
            $this->pdo->prepare('INSERT INTO specforge_commands (id,organization_id,actor_user_id,workspace_id,route_key,target_id,idempotency_key,body_hash,status,response_status,response_json) VALUES (?,?,?,?,?,?,?,?,"completed",201,?)')->execute([
                $this->uuid(), $identity['org'], $identity['sub'], $resolvedWorkspace, $route, $targetId ?? ($record['id'] ?? null), $key, $hash, $this->encode($record),
            ]);
            $this->pdo->commit();
            return ['record' => $record, 'idempotent' => false];
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $error;
        }
    }

    /** @return array<string,mixed> */
    private function project(array $identity, string $projectId): array
    {
        $stmt = $this->pdo->prepare('SELECT id AS project_id,organization_id,name AS project_name,lifecycle_stage FROM projects WHERE id=? AND organization_id=?');
        $stmt->execute([$projectId, $identity['org']]);
        $project = $stmt->fetch();
        if (!$project) throw new SpecForgeRepositoryError(404, 'Project not found.');
        return $project;
    }

    /** @return array<string,mixed> */
    private function workspaceForCapability(array $identity, string $projectId, string $capability): array
    {
        $project = $this->project($identity, $projectId);
        specforge_require_capability($identity, $capability, $project);
        $workspace = $this->workspaceRow($identity['org'], $projectId, false, true);
        if (!$workspace) throw new SpecForgeRepositoryError(404, 'SpecForge workspace not found.');
        return $workspace;
    }

    /** @return array<string,mixed>|false */
    private function workspaceRow(string $organizationId, string $projectId, bool $lock, bool $required): array|false
    {
        $stmt = $this->pdo->prepare('SELECT * FROM specforge_workspaces WHERE organization_id=? AND project_id=?' . ($lock ? ' FOR UPDATE' : ''));
        $stmt->execute([$organizationId, $projectId]);
        $row = $stmt->fetch();
        if (!$row && $required) throw new SpecForgeRepositoryError(404, 'SpecForge workspace not found.');
        return $row;
    }

    /** @return array<string,mixed> */
    private function workspaceById(string $organizationId, string $id, bool $lock): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM specforge_workspaces WHERE organization_id=? AND id=?' . ($lock ? ' FOR UPDATE' : ''));
        $stmt->execute([$organizationId, $id]);
        $row = $stmt->fetch();
        if (!$row) throw new SpecForgeRepositoryError(404, 'SpecForge workspace not found.');
        return $row;
    }

    /** @return array<string,mixed> */
    private function findRow(string $table, string $organizationId, string $id, bool $lock = false): array
    {
        $allowed = ['specforge_workspaces','specforge_sections','specforge_items','specforge_approvals','specforge_issues'];
        if (!in_array($table, $allowed, true)) throw new LogicException('Unsupported SpecForge table.');
        $stmt = $this->pdo->prepare("SELECT * FROM `{$table}` WHERE organization_id=? AND id=?" . ($lock ? ' FOR UPDATE' : ''));
        $stmt->execute([$organizationId, $id]);
        $row = $stmt->fetch();
        if (!$row) throw new SpecForgeRepositoryError(404, 'SpecForge record not found.');
        return $row;
    }

    /** @return array<string,mixed> */
    private function hydrateAggregate(array $identity, array $workspace): array
    {
        $workspaceId = $workspace['id'];
        $projectId = $workspace['project_id'];
        $items = array_map([$this, 'hydrateItem'], $this->rows('specforge_items', $workspaceId));
        $visibleItems = array_values(array_filter($items, fn (array $item): bool => $this->can($identity, 'view', $this->scopeRecord($identity, $projectId, $item))));
        $visibleItemIds = array_column($visibleItems, 'id');
        $visibleSectionIds = array_unique(array_column($visibleItems, 'section_id'));
        $role = $identity['role'] ?? '';
        $restricted = in_array($role, ['client','developer','engineer','energy_professional','fire_engineer','contractor','subcontractor','supplier','site_manager'], true);
        $sections = $this->rows('specforge_sections', $workspaceId);
        if ($restricted) $sections = array_values(array_filter($sections, fn (array $section): bool => in_array($section['id'], $visibleSectionIds, true)));
        $approvals = $this->rows('specforge_approvals', $workspaceId);
        $findings = $this->rows('specforge_drawing_findings', $workspaceId);
        if ($restricted) {
            $approvals = array_values(array_filter($approvals, fn (array $row): bool => in_array($row['item_id'], $visibleItemIds, true)));
            $findings = array_values(array_filter($findings, fn (array $row): bool => $row['item_id'] === null || in_array($row['item_id'], $visibleItemIds, true)));
        }
        $workspace['lock_version'] = (int) $workspace['lock_version'];
        $workspace['items'] = $visibleItems;
        $workspace['sections'] = $sections;
        $workspace['approvals'] = $approvals;
        $workspace['drawing_findings'] = $findings;
        $workspace['issues'] = $this->rows('specforge_issues', $workspaceId);
        $workspace['commands'] = $this->rows('specforge_commands', $workspaceId, 'created_at DESC');
        return $workspace;
    }

    /** @return list<array<string,mixed>> */
    private function rows(string $table, string $workspaceId, ?string $order = null): array
    {
        $allowed = ['specforge_sections','specforge_items','specforge_approvals','specforge_drawing_findings','specforge_issues','specforge_commands'];
        if (!in_array($table, $allowed, true)) throw new LogicException('Unsupported SpecForge table.');
        $order ??= $table === 'specforge_approvals' ? 'requested_at ASC, id ASC' : 'created_at ASC, id ASC';
        $stmt = $this->pdo->prepare("SELECT * FROM `{$table}` WHERE workspace_id=? ORDER BY {$order}");
        $stmt->execute([$workspaceId]);
        return $stmt->fetchAll();
    }

    /** @return array<string,mixed> */
    private function hydrateItem(array $row): array
    {
        $row['budget_allowance'] = (float) $row['budget_allowance'];
        $row['estimated_cost'] = (float) $row['estimated_cost'];
        $row['lead_time_days'] = (int) $row['lead_time_days'];
        $row['client_decision'] = (bool) $row['client_decision'];
        $row['lock_version'] = (int) $row['lock_version'];
        return $row;
    }

    /** @return array<string,mixed> */
    private function hydrateApproval(array $row): array
    {
        $row['lock_version'] = (int) $row['lock_version'];
        return $row;
    }

    /** @return array<string,mixed> */
    private function scopeRecord(array $identity, string $projectId, array $record): array
    {
        return $record + ['organization_id' => $identity['org'], 'project_id' => $projectId];
    }

    private function can(array $identity, string $capability, array $record): bool
    {
        try { specforge_require_capability($identity, $capability, $record); return true; }
        catch (SpecForgeRepositoryError) { return false; }
    }

    /** @return array{ready:bool,codes:list<string>} */
    private function issueReadiness(string $workspaceId): array
    {
        $codes = [];
        if ((int) $this->scalar('SELECT COUNT(*) FROM specforge_sections WHERE workspace_id=? AND status NOT IN ("approved","issued")', $workspaceId) > 0) $codes[] = 'SECTIONS_UNAPPROVED';
        if ((int) $this->scalar('SELECT COUNT(*) FROM specforge_approvals WHERE workspace_id=? AND status="pending"', $workspaceId) > 0) $codes[] = 'APPROVALS_PENDING';
        if ((int) $this->scalar('SELECT COUNT(*) FROM specforge_workspaces WHERE id=? AND budget_reviewed_at IS NULL', $workspaceId) > 0) $codes[] = 'BUDGET_REVIEW_PENDING';
        if ((int) $this->scalar('SELECT COUNT(*) FROM specforge_items WHERE workspace_id=? AND superseded_by IS NOT NULL', $workspaceId) > 0) $codes[] = 'STALE_SOURCE';
        if ((int) $this->scalar('SELECT COUNT(*) FROM specforge_drawing_findings WHERE workspace_id=? AND severity="critical" AND status<>"resolved"', $workspaceId) > 0) $codes[] = 'CRITICAL_DRAWING_FINDING';
        return ['ready' => $codes === [], 'codes' => $codes];
    }

    private function scalar(string $sql, string $workspaceId): mixed
    {
        $stmt = $this->pdo->prepare($sql); $stmt->execute([$workspaceId]); return $stmt->fetchColumn();
    }

    /** @return array<string,mixed> */
    private function enqueueJob(string $organizationId, string $jobType, array $payload): array
    {
        $job = [
            'id' => $this->uuid(),
            'job_type' => $jobType,
            'status' => 'pending',
            'last_error' => null,
        ];
        $this->pdo->prepare('INSERT INTO jobs (id,organization_id,job_type,status,payload_json) VALUES (?,?,?,"pending",?)')->execute([
            $job['id'], $organizationId, $jobType, $this->encode($payload),
        ]);
        return $job;
    }

    /** @return array<string,list<array<string,mixed>>> */
    private function snapshot(string $workspaceId): array
    {
        return [
            'sections' => $this->rows('specforge_sections', $workspaceId),
            'items' => array_map([$this, 'hydrateItem'], $this->rows('specforge_items', $workspaceId)),
            'links' => $this->snapshotRows('specforge_item_links', $workspaceId),
            'approvals' => $this->rows('specforge_approvals', $workspaceId),
            'distribution' => [['id' => 'distribution', 'workspace_id' => $workspaceId]],
        ];
    }

    /** @return list<array<string,mixed>> */
    private function snapshotRows(string $table, string $workspaceId): array
    {
        if ($table !== 'specforge_item_links') throw new LogicException('Unsupported snapshot table.');
        $stmt = $this->pdo->prepare("SELECT * FROM `{$table}` WHERE workspace_id=? ORDER BY created_at ASC,id ASC"); $stmt->execute([$workspaceId]); return $stmt->fetchAll();
    }

    private function nextRevision(string $revision): string
    {
        if (!preg_match('/^P(\d+)$/i', $revision, $match)) throw new SpecForgeRepositoryError(409, 'Workspace revision is invalid.');
        return 'P' . str_pad((string) ((int) $match[1] + 1), strlen($match[1]), '0', STR_PAD_LEFT);
    }

    private function audit(array $identity, string $action, string $type, string $id, ?array $before, array $after): void
    {
        $this->pdo->prepare('INSERT INTO audit_log (organization_id,actor_user_id,entity_type,entity_id,action_key,before_json,after_json) VALUES (?,?,?,?,?,?,?)')->execute([
            $identity['org'], $identity['sub'], $type, $id, $action, $before === null ? null : $this->encode($before), $this->encode($after),
        ]);
    }

    private function encode(mixed $value): string
    {
        return json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    private function decode(?string $value): mixed
    {
        return json_decode($value ?? 'null', true, 512, JSON_THROW_ON_ERROR);
    }

    private function uuid(): string
    {
        $bytes = random_bytes(16); $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40); $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
    }
}
