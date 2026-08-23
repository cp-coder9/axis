<?php
declare(strict_types=1);

final class CalculationRepositoryError extends RuntimeException
{
    public function __construct(public readonly int $httpStatus, string $message) { parent::__construct($message); }
}

final class MariaDbCalculationRepository
{
    public function __construct(private readonly PDO $pdo) {}

    /** @return list<array<string,mixed>> */
    public function list(array $identity, ?string $projectId, bool $allForPlatform): array
    {
        $sql = 'SELECT * FROM calculation_records WHERE organization_id = :org';
        $params = [':org' => $identity['org']];
        if ($projectId !== null) { $sql .= ' AND project_id = :project'; $params[':project'] = $projectId; }
        elseif (!$allForPlatform) { $sql .= ' AND project_id IS NULL'; }
        $sql .= ' ORDER BY updated_at DESC, id DESC';
        $stmt = $this->pdo->prepare($sql); $stmt->execute($params);
        return array_map([$this, 'hydrate'], $stmt->fetchAll());
    }

    /** @return array<string,mixed>|null */
    public function find(array $identity, string $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM calculation_records WHERE id = ? AND organization_id = ?');
        $stmt->execute([$id, $identity['org']]); $row = $stmt->fetch();
        if (!$row || !$this->canAccess($identity, $row)) return null;
        return $this->hydrate($row);
    }

    /** @return array{record:array<string,mixed>,idempotent:bool} */
    public function create(array $identity, array $record, string $idempotencyKey): array
    {
        return $this->command($identity, 'create', null, $idempotencyKey, $record, function () use ($identity, $record): array {
            $id = $this->uuid(); $now = gmdate('Y-m-d H:i:s');
            $this->pdo->prepare('INSERT INTO calculation_records (id, organization_id, project_id, calc_type, formula_version, inputs_json, results_json, derivation_text, assumptions_json, limitations_json, references_json, status, author_user_id, linked_drawing_ref, linked_meeting_id, linked_rfi_id, lock_version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "saved", ?, ?, ?, ?, 1, ?, ?)')->execute([
                $id, $identity['org'], $record['project_id'], $record['calc_type'], $record['formulaVersion'], $this->encode($record['inputs']), $this->encode($record['results']), $this->encode($record['derivation']), $this->encode($record['assumptions']), $this->encode($record['limitations']), $this->encode($record['references']), $identity['sub'], $record['linked_drawing_ref'] ?? null, $record['linked_meeting_id'] ?? null, $record['linked_rfi_id'] ?? null, $now, $now,
            ]);
            $created = $this->findRaw($identity['org'], $id, true); $this->audit($identity, 'calculation.saved', $id, null, $created);
            return $this->hydrate($created);
        });
    }

    /** @return array<string,mixed> */
    public function updateSaved(array $identity, string $id, array $patch, int $expectedVersion): array
    {
        $this->pdo->beginTransaction();
        try {
            $row = $this->findRaw($identity['org'], $id, true); $this->assertMutable($identity, $row, $expectedVersion);
            $merged = array_replace($this->hydrate($row), $patch); $now = gmdate('Y-m-d H:i:s');
            $this->pdo->prepare('UPDATE calculation_records SET project_id=?, calc_type=?, formula_version=?, inputs_json=?, results_json=?, derivation_text=?, assumptions_json=?, limitations_json=?, references_json=?, linked_drawing_ref=?, linked_meeting_id=?, linked_rfi_id=?, lock_version=lock_version+1, updated_at=? WHERE id=? AND organization_id=? AND lock_version=?')->execute([
                $merged['project_id'], $merged['calc_type'], $merged['formulaVersion'], $this->encode($merged['inputs']), $this->encode($merged['results']), $this->encode($merged['derivation']), $this->encode($merged['assumptions']), $this->encode($merged['limitations']), $this->encode($merged['references']), $merged['linked_drawing_ref'] ?? null, $merged['linked_meeting_id'] ?? null, $merged['linked_rfi_id'] ?? null, $now, $id, $identity['org'], $expectedVersion,
            ]);
            if ($this->pdo->rowCount() !== 1) throw new CalculationRepositoryError(412, 'Stale calculation version.');
            $updated = $this->findRaw($identity['org'], $id, true); $this->audit($identity, 'calculation.updated', $id, $row, $updated); $this->pdo->commit();
            return $this->hydrate($updated);
        } catch (Throwable $error) { if ($this->pdo->inTransaction()) $this->pdo->rollBack(); throw $error; }
    }

    /** @return array{record:array<string,mixed>,idempotent:bool} */
    public function transitionReview(array $identity, string $id, string $action, ?string $note, int $expectedVersion, string $idempotencyKey): array
    {
        return $this->command($identity, 'review:' . $action, $id, $idempotencyKey, ['action' => $action, 'note' => $note, 'version' => $expectedVersion], function () use ($identity, $id, $action, $note, $expectedVersion): array {
            $row = $this->findRaw($identity['org'], $id, true);
            if ((int)$row['lock_version'] !== $expectedVersion) throw new CalculationRepositoryError(412, 'Stale calculation version.');
            $transitions = ['submit' => ['saved','under_review'], 'approve' => ['under_review','approved'], 'return' => ['under_review','saved']];
            if (!isset($transitions[$action]) || $row['status'] !== $transitions[$action][0]) throw new CalculationRepositoryError(409, 'Invalid calculation lifecycle transition.');
            if (($action === 'approve' || $action === 'return') && $row['author_user_id'] === $identity['sub']) throw new CalculationRepositoryError(403, 'Calculation author cannot decide review.');
            $now = gmdate('Y-m-d H:i:s'); $next = $transitions[$action][1];
            $this->pdo->prepare('UPDATE calculation_records SET status=?, review_requested_by=CASE WHEN ?="submit" THEN ? ELSE review_requested_by END, review_requested_at=CASE WHEN ?="submit" THEN ? ELSE review_requested_at END, reviewed_by=CASE WHEN ? IN ("approve","return") THEN ? ELSE reviewed_by END, reviewed_at=CASE WHEN ? IN ("approve","return") THEN ? ELSE reviewed_at END, review_note=?, lock_version=lock_version+1, updated_at=? WHERE id=? AND organization_id=? AND lock_version=?')->execute([$next, $action, $identity['sub'], $action, $now, $action, $identity['sub'], $action, $now, $note, $now, $id, $identity['org'], $expectedVersion]);
            if ($this->pdo->rowCount() !== 1) throw new CalculationRepositoryError(412, 'Stale calculation version.');
            $updated = $this->findRaw($identity['org'], $id, true); $this->audit($identity, 'calculation.review.' . $action, $id, $row, $updated); return $this->hydrate($updated);
        });
    }

    /** @return array<string,mixed>|null */
    public function derivation(array $identity, string $id): ?array
    {
        $record = $this->find($identity, $id); if ($record === null) return null;
        return array_intersect_key($record, array_flip(['id','calc_type','calculatorId','formulaVersion','results','derivation','assumptions','limitations','references','lock_version','updated_at']));
    }

    /** @return array{record:array<string,mixed>,idempotent:bool} */
    private function command(array $identity, string $route, ?string $target, string $key, array $body, callable $operation): array
    {
        if ($key === '') throw new CalculationRepositoryError(400, 'Idempotency-Key is required.'); $hash = hash('sha256', $this->encode($body)); $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare('SELECT body_hash,response_json FROM calculation_commands WHERE organization_id=? AND actor_user_id=? AND route_key=? AND idempotency_key=? FOR UPDATE'); $stmt->execute([$identity['org'], $identity['sub'], $route, $key]); $existing = $stmt->fetch();
            if ($existing) { if (!hash_equals($existing['body_hash'], $hash)) throw new CalculationRepositoryError(409, 'Idempotency key conflicts with a different request.'); $this->pdo->commit(); return ['record' => json_decode($existing['response_json'], true, 512, JSON_THROW_ON_ERROR), 'idempotent' => true]; }
            $record = $operation(); $this->pdo->prepare('INSERT INTO calculation_commands (organization_id,actor_user_id,route_key,target_id,idempotency_key,body_hash,response_status,response_json) VALUES (?,?,?,?,?,?,?,?)')->execute([$identity['org'], $identity['sub'], $route, $target, $key, $hash, 200, $this->encode($record)]); $this->pdo->commit(); return ['record' => $record, 'idempotent' => false];
        } catch (Throwable $error) { if ($this->pdo->inTransaction()) $this->pdo->rollBack(); throw $error; }
    }

    private function findRaw(string $org, string $id, bool $lock = false): array { $stmt = $this->pdo->prepare('SELECT * FROM calculation_records WHERE id=? AND organization_id=?' . ($lock ? ' FOR UPDATE' : '')); $stmt->execute([$id,$org]); $row=$stmt->fetch(); if (!$row) throw new CalculationRepositoryError(404,'Calculation not found.'); return $row; }
    private function canAccess(array $identity, array $row): bool { return $row['project_id'] === null || in_array('*', $identity['projects'] ?? [], true) || in_array($row['project_id'], $identity['projects'] ?? [], true); }
    private function assertMutable(array $identity, array $row, int $version): void { if (!$this->canAccess($identity,$row)) throw new CalculationRepositoryError(404,'Calculation not found.'); if ($row['status'] !== 'saved') throw new CalculationRepositoryError(409,'Only saved calculations may be updated.'); if ($row['author_user_id'] !== $identity['sub'] && !in_array('engineering.manage',$identity['permissions'] ?? [],true)) throw new CalculationRepositoryError(403,'Only author or manager may update.'); if ((int)$row['lock_version'] !== $version) throw new CalculationRepositoryError(412,'Stale calculation version.'); }
    private function hydrate(array $row): array { return ['id'=>$row['id'],'organization_id'=>$row['organization_id'],'project_id'=>$row['project_id'],'calc_type'=>$row['calc_type'],'schemaVersion'=>'engineering-calculation/v1','calculatorId'=>$row['calc_type'],'formulaVersion'=>$row['formula_version'],'inputs'=>$this->decode($row['inputs_json']),'results'=>$this->decode($row['results_json']),'derivation'=>$this->decode($row['derivation_text']),'assumptions'=>$this->decode($row['assumptions_json']),'limitations'=>$this->decode($row['limitations_json']),'references'=>$this->decode($row['references_json']),'status'=>$row['status'],'author_id'=>$row['author_user_id'],'linked_drawing_ref'=>$row['linked_drawing_ref'],'linked_meeting_id'=>$row['linked_meeting_id'],'linked_rfi_id'=>$row['linked_rfi_id'],'lock_version'=>(int)$row['lock_version'],'created_at'=>$row['created_at'],'updated_at'=>$row['updated_at']]; }
    private function audit(array $identity, string $action, string $id, ?array $before, array $after): void { $this->pdo->prepare('INSERT INTO audit_log (organization_id,actor_user_id,entity_type,entity_id,action_key,before_json,after_json) VALUES (?,?,"calculation",?,?,?,?)')->execute([$identity['org'],$identity['sub'],$id,$action,$before === null ? null : $this->encode($before),$this->encode($after)]); }
    private function encode(mixed $value): string { return json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); }
    private function decode(?string $value): mixed { return json_decode($value ?? 'null', true, 512, JSON_THROW_ON_ERROR); }
    private function uuid(): string { $bytes=random_bytes(16); $bytes[6]=chr((ord($bytes[6])&0x0f)|0x40); $bytes[8]=chr((ord($bytes[8])&0x3f)|0x80); return vsprintf('%s%s-%s-%s-%s-%s%s%s',str_split(bin2hex($bytes),4)); }
}
