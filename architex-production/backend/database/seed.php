<?php
/**
 * Architex OS — database seeder.
 *
 * Loads the local JSON fixture stores (backend/data/*.json) plus the
 * hard-coded demo project list and seeds the MariaDB schema created by
 * migrate.php. Idempotent: clears seeded tables in FK-safe order inside a
 * transaction, then re-inserts.
 *
 * Usage:  php backend/database/seed.php
 */
declare(strict_types=1);

$config = require __DIR__ . '/../config.php';
require_once dirname(__DIR__) . '/lib/environment_policy.php';
architex_require_demo_seed_allowed($config);
$db = $config['database'];

try {
    $pdo = new PDO(
        sprintf('mysql:host=%s;dbname=%s;charset=%s', $db['host'], $db['name'], $db['charset']),
        $db['user'],
        $db['pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    fwrite(STDERR, "Seed failed: cannot connect: {$e->getMessage()}\n");
    exit(1);
}

$dataDir = __DIR__ . '/../data';
$modules = json_decode(file_get_contents($dataDir . '/modules.json'), true);
$foundation = json_decode(file_get_contents($dataDir . '/foundation.json'), true);

const ORG_ID = 'org-demo';

$roles = [
    'client' => 'Client', 'architect' => 'Architect', 'bep' => 'Built Environment Professional',
    'engineer' => 'Engineer', 'quantity_surveyor' => 'Quantity Surveyor', 'town_planner' => 'Town Planner',
    'land_surveyor' => 'Land Surveyor', 'energy_professional' => 'Energy Professional', 'fire_engineer' => 'Fire Engineer',
    'cpm' => 'Construction Project Manager', 'contractor' => 'Contractor', 'subcontractor' => 'Subcontractor',
    'supplier' => 'Supplier', 'site_manager' => 'Site Manager', 'health_safety' => 'Health & Safety Officer',
    'developer' => 'Developer', 'freelancer' => 'Freelancer', 'firm_admin' => 'Firm Administrator',
    'admin' => 'Administrator', 'platform_admin' => 'Platform Administrator',
];

$users = [
    'user-demo-architect' => ['Justin Kruger', 'justin@architex-os.local', 'architect'],
    'user-demo-bep' => ['BEP Coordinator', 'bep@architex-os.local', 'bep'],
    'user-demo-client' => ['Evergreen Holdings Rep', 'client@architex-os.local', 'client'],
    'user-demo-town-planner' => ['Town Planner', 'planner@architex-os.local', 'town_planner'],
    'user-demo-energy-professional' => ['Energy Professional', 'energy@architex-os.local', 'energy_professional'],
];

$projects = [
    ['proj-faerie-glen', 'FGR-2026', 'Faerie Glen Residential', 'Pretoria, Gauteng', 'Design', 46, 'Evergreen Property Holdings', 'Justin Kruger · PrArch', 'City of Tshwane', 'P03', 47500000],
    ['proj-camps-bay', 'CBR-2026', 'Camps Bay Residence', 'Cape Town, Western Cape', 'Procure', 72, 'Atlantic Coastline Properties', 'Sarah van der Merwe · PrArch', 'City of Cape Town', 'C02', 32800000],
    ['proj-waterfall-office', 'WFP-2026', 'Waterfall Business Park Tower B', 'Midrand, Gauteng', 'Build', 58, 'Redefine Capital Fund', 'Michael Patel · PrArch', 'City of Johannesburg', 'P02', 85000000],
    ['proj-sandton-tower', 'SMC-2026', 'Sandton Mixed-Use Complex', 'Sandton, Johannesburg', 'Comply', 35, 'Greenfield Developments (Pty) Ltd', 'Justin Kruger · PrArch', 'City of Johannesburg', 'Rev B', 140000000],
];

$ownerUserMap = [
    'Architect' => 'user-demo-architect',
    'Town Planner' => 'user-demo-town-planner',
    'Energy Professional' => 'user-demo-energy-professional',
];
$requesterUserMap = [
    'BEP Coordinator' => 'user-demo-bep',
    'Architex Meetings' => 'user-demo-architect',
];

// Meeting fixture status -> schema enum
$meetingStatusMap = [
    'draft' => 'draft', 'scheduled' => 'scheduled', 'live' => 'live',
    'review_required' => 'review', 'review' => 'review',
    'published' => 'published', 'cancelled' => 'cancelled',
];

$pdo->beginTransaction();
$section = 'init';
try {
    $section = 'clear';
    // Clear in FK-safe order (children first)
    foreach ([
        'jobs', 'meeting_write_back_log', 'issued_minutes', 'meeting_outcomes', 'meeting_minute_items',
        'meeting_transcript_segments', 'meeting_recordings', 'meeting_agenda_items', 'meeting_attendees',
        'drawing_intelligence_jobs', 'ai_candidates',
        'approval_steps', 'approvals', 'document_revisions', 'documents',
        'drawing_revisions', 'drawing_register', 'project_passports',
        'feedback_submissions', 'project_team_members', 'action_items', 'meetings', 'audit_log',
        'project_module_records', 'role_permissions', 'project_stage_history', 'modules', 'user_roles',
        'calculation_records', 'projects', 'users', 'roles', 'organizations',
    ] as $table) {
        $pdo->exec("DELETE FROM `$table`");
    }

    $section = 'organizations';
    // Organization
    $pdo->prepare('INSERT INTO organizations (id, name, slug) VALUES (?, ?, ?)')
        ->execute([ORG_ID, 'Architex OS Demo Practice', 'architex-os-demo']);

    $section = 'roles';
    // Roles
    $insRole = $pdo->prepare('INSERT INTO roles (role_key, label) VALUES (?, ?)');
    foreach ($roles as $key => $label) {
        $insRole->execute([$key, $label]);
    }

    $section = 'users';
    // Users
    $insUser = $pdo->prepare('INSERT INTO users (id, organization_id, name, email, password_hash, status) VALUES (?, ?, ?, ?, ?, ?)');
    foreach ($users as $id => [$name, $email, $roleKey]) {
        $insUser->execute([$id, ORG_ID, $name, $email, password_hash('demo-' . $id, PASSWORD_DEFAULT), 'active']);
    }

    $section = 'user_roles';
    // User-role grants
    $insUserRole = $pdo->prepare('INSERT INTO user_roles (user_id, role_key, project_id) VALUES (?, ?, ?)');
    foreach ($users as $id => [$name, $email, $roleKey]) {
        $insUserRole->execute([$id, $roleKey, null]);
    }

    $section = 'projects';
    // Projects
    $insProject = $pdo->prepare('INSERT INTO projects (id, organization_id, code, name, location, lifecycle_stage, progress_percent, client_name, professional_lead, municipality, revision, budget_cents) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    foreach ($projects as [$id, $code, $name, $location, $stage, $progress, $client, $lead, $muni, $rev, $budget]) {
        $insProject->execute([$id, ORG_ID, $code, $name, $location, $stage, $progress, $client, $lead, $muni, $rev, $budget]);
    }

    $section = 'modules';
    // Modules (47)
    $insModule = $pdo->prepare('INSERT INTO modules (id, name, icon, tone, module_group, lifecycle_stage, status, implementation_status, governance_json, summary, tabs_json, source_file) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    foreach ($modules as $module) {
        $status = ($module['status'] ?? 'scaffold') === 'live' ? 'live' : 'scaffold';
        $impl = $module['implementation_status'] ?? 'sample';
        $gov = $module['governance'] ?? null;
        $insModule->execute([
            $module['id'], $module['name'], $module['icon'] ?? null, $module['tone'] ?? null,
            $module['group'] ?? 'General', $module['stage'] ?? 'All stages', $status,
            $impl,
            $gov === null ? null : json_encode($gov, JSON_UNESCAPED_SLASHES),
            $module['summary'] ?? '', json_encode($module['tabs'] ?? [], JSON_UNESCAPED_SLASHES),
            $module['source'] ?? null,
        ]);
    }

    // Project passports
    $section = 'project_passports';
    $insPassport = $pdo->prepare('INSERT INTO project_passports (project_id, brief_summary, project_type, site_description, statutory_route, constraints_json, required_professionals_json, approval_requirements_json, version, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    foreach ($foundation['passports'] as $passport) {
        $insPassport->execute([
            $passport['project_id'], $passport['brief_summary'], $passport['project_type'],
            $passport['site_description'] ?? null, $passport['statutory_route'] ?? null,
            json_encode($passport['constraints'] ?? [], JSON_UNESCAPED_SLASHES),
            json_encode($passport['required_professionals'] ?? [], JSON_UNESCAPED_SLASHES),
            json_encode($passport['approval_requirements'] ?? [], JSON_UNESCAPED_SLASHES),
            $passport['version'] ?? 1,
            $passport['updated_by'] ?? 'user-demo-architect',
        ]);
    }

    // Documents
    $section = 'documents';
    $insDocument = $pdo->prepare('INSERT INTO documents (id, project_id, document_number, title, document_type, discipline, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    foreach ($foundation['documents'] as $doc) {
        $insDocument->execute([
            $doc['id'], $doc['project_id'], $doc['number'], $doc['title'],
            $doc['type'], $doc['discipline'] ?? null, $doc['status'], 'user-demo-architect',
        ]);
    }

    // Approvals + sequential steps
    $section = 'approvals';
    $insApproval = $pdo->prepare('INSERT INTO approvals (id, project_id, entity_type, entity_id, title, requested_by, status, current_step) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $insStep = $pdo->prepare('INSERT INTO approval_steps (id, approval_id, step_order, required_role_key, decision) VALUES (?, ?, ?, ?, ?)');
    foreach ($foundation['approvals'] as $approval) {
        $requestedBy = $requesterUserMap[$approval['requested_by']] ?? 'user-demo-architect';
        $insApproval->execute([
            $approval['id'], $approval['project_id'], $approval['entity_type'], $approval['entity_id'],
            $approval['title'], $requestedBy, $approval['status'], $approval['current_step'] ?? 1,
        ]);
        foreach ($approval['steps'] ?? [] as $i => $step) {
            $insStep->execute([
                $approval['id'] . '-step-' . ($i + 1), $approval['id'], $i + 1,
                $step['role'], $step['status'] ?? 'pending',
            ]);
        }
    }

    // AI candidates (governed)
    $section = 'ai_candidates';
    $insCandidate = $pdo->prepare('INSERT INTO ai_candidates (id, organization_id, project_id, source_module_id, candidate_type, payload_json, provenance_json, confidence, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    foreach ($foundation['ai_candidates'] as $candidate) {
        // source_module must reference a real module row; the shared
        // drawing-intelligence service surfaces through its consumer module.
        $sourceModule = $candidate['consumer'] ?? 'xa';
        $insCandidate->execute([
            $candidate['id'], ORG_ID, $candidate['project_id'], $sourceModule,
            $candidate['candidate_type'],
            json_encode(['summary' => $candidate['summary'], 'consumer' => $candidate['consumer'], 'service' => $candidate['source_module']], JSON_UNESCAPED_SLASHES),
            json_encode($candidate['provenance'] ?? [], JSON_UNESCAPED_SLASHES),
            $candidate['confidence'] ?? null, $candidate['status'],
        ]);
    }

    // Meetings
    $section = 'meetings';
    $insMeeting = $pdo->prepare('INSERT INTO meetings (id, project_id, title, meeting_type, scheduled_at, chair_user_id, status, policy_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    foreach ($foundation['meetings'] as $meeting) {
        $status = $meetingStatusMap[$meeting['status']] ?? 'draft';
        $insMeeting->execute([
            $meeting['id'], $meeting['project_id'], $meeting['title'], 'Design coordination',
            '2026-08-20 09:00:00', $meeting['chair'], $status,
            json_encode(['policy' => $meeting['policy'] ?? null, 'consent' => $meeting['consent'] ?? null, 'outcomes' => $meeting['outcomes'] ?? []], JSON_UNESCAPED_SLASHES),
        ]);
    }

    // Action items
    $section = 'action_items';
    $insAction = $pdo->prepare('INSERT INTO action_items (id, project_id, source_module_id, title, owner_user_id, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $sourceModuleMap = ['Meetings' => 'meetings', 'Project Passport' => 'project_passport', 'Drawing Intelligence' => 'xa'];
    foreach ($foundation['actions'] as $action) {
        $insAction->execute([
            $action['id'], $action['project_id'], $sourceModuleMap[$action['source']] ?? null,
            $action['title'], $ownerUserMap[$action['owner']] ?? null,
            $action['due'] ?? null, $action['status'],
        ]);
    }

    $section = 'audit_log';
    // Audit log
    $insAudit = $pdo->prepare('INSERT INTO audit_log (organization_id, actor_user_id, entity_type, entity_id, action_key, after_json) VALUES (?, ?, ?, ?, ?, ?)');
    foreach ($foundation['audit'] as $entry) {
        $insAudit->execute([
            ORG_ID, $entry['actor'] ?? null, $entry['entity_type'], $entry['entity_id'],
            $entry['action'], json_encode($entry['details'] ?? new stdClass(), JSON_UNESCAPED_SLASHES),
        ]);
    }

    $section = 'role_permissions';
    // RBAC permission matrix (PRD §10.3) — mirrors the API PERMISSIONS constant,
    // stored as data so permission changes are content, not code deploys.
    // Action strings are "<module>.<action>"; map the module prefix to a module id.
    $actionModuleMap = [
        'passport' => 'project_passport',
        'projects' => 'practice',
        'documents' => 'documents_drawings',
        'actions' => 'inbox_action',
        'approvals' => 'approvals_queue',
        'ai' => 'wingman',
        'drawing' => 'documents_drawings',
        'meetings' => 'meetings',
        'audit' => 'admin_review',
        'engineering' => 'engineering_calc',
    ];
    $permissions = [
        'client' => ['passport.view', 'documents.view', 'actions.view', 'approvals.view'],
        'architect' => ['passport.view', 'passport.edit', 'passport.publish', 'projects.edit', 'documents.view', 'documents.edit', 'actions.view', 'actions.edit', 'approvals.view', 'approvals.decide', 'ai.review', 'drawing.request', 'meetings.publish', 'audit.view'],
        'bep' => ['passport.view', 'passport.edit', 'documents.view', 'documents.edit', 'actions.view', 'actions.edit', 'approvals.view', 'ai.review', 'drawing.request', 'audit.view', 'engineering.view', 'engineering.save', 'engineering.review.request'],
        'engineer' => ['passport.view', 'documents.view', 'documents.edit', 'actions.view', 'actions.edit', 'approvals.view', 'approvals.decide', 'ai.review', 'drawing.request', 'audit.view', 'engineering.view', 'engineering.save', 'engineering.review.request', 'engineering.review.decide'],
        'quantity_surveyor' => ['passport.view', 'documents.view', 'actions.view', 'actions.edit', 'approvals.view', 'approvals.decide', 'ai.review', 'drawing.request', 'audit.view'],
        'town_planner' => ['passport.view', 'passport.edit', 'documents.view', 'documents.edit', 'actions.view', 'actions.edit', 'approvals.view', 'ai.review', 'audit.view'],
        'energy_professional' => ['passport.view', 'documents.view', 'actions.view', 'actions.edit', 'approvals.view', 'approvals.decide', 'ai.review', 'drawing.request', 'audit.view', 'engineering.view', 'engineering.save', 'engineering.review.request', 'engineering.review.decide'],
        'fire_engineer' => ['passport.view', 'documents.view', 'actions.view', 'actions.edit', 'approvals.view', 'approvals.decide', 'ai.review', 'drawing.request', 'audit.view', 'engineering.view', 'engineering.save', 'engineering.review.request', 'engineering.review.decide'],
        'cpm' => ['passport.view', 'passport.edit', 'passport.publish', 'projects.edit', 'documents.view', 'documents.edit', 'actions.view', 'actions.edit', 'approvals.view', 'approvals.decide', 'ai.review', 'drawing.request', 'meetings.publish', 'audit.view', 'engineering.view', 'engineering.save', 'engineering.review.request'],
        'contractor' => ['passport.view', 'documents.view', 'documents.edit', 'actions.view', 'actions.edit', 'approvals.view', 'audit.view', 'engineering.view', 'engineering.save'],
        'site_manager' => ['engineering.view', 'engineering.save', 'engineering.review.request'],
        'firm_admin' => ['passport.view', 'projects.edit', 'documents.view', 'actions.view', 'actions.edit', 'approvals.view', 'audit.view'],
        'developer' => ['passport.view', 'projects.edit', 'documents.view', 'actions.view', 'approvals.view', 'audit.view'],
        'admin' => ['passport.view', 'passport.edit', 'passport.publish', 'projects.edit', 'documents.view', 'documents.edit', 'actions.view', 'actions.edit', 'approvals.view', 'approvals.decide', 'ai.review', 'drawing.request', 'meetings.publish', 'audit.view'],
        'platform_admin' => ['*'],
    ];
    $allModuleIds = array_column($modules, 'id');
    $insPerm = $pdo->prepare('INSERT INTO role_permissions (role_key, module_id, action_key, allowed) VALUES (?, ?, ?, 1)');
    foreach ($permissions as $roleKey => $actions) {
        if ($actions === ['*']) {
            // platform_admin: grant every module with a wildcard action
            foreach ($allModuleIds as $moduleId) {
                $insPerm->execute([$roleKey, $moduleId, '*']);
            }
            continue;
        }
        foreach ($actions as $action) {
            [$modulePrefix, $actionKey] = explode('.', $action, 2);
            $moduleId = $actionModuleMap[$modulePrefix] ?? null;
            if ($moduleId === null) {
                continue;
            }
            $insPerm->execute([$roleKey, $moduleId, $actionKey]);
        }
    }

    $pdo->commit();
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fwrite(STDERR, "Seed failed in section [$section]: {$e->getMessage()}\n");
    exit(1);
}

// Report counts
$report = [];
foreach (['organizations', 'roles', 'users', 'projects', 'modules', 'project_passports', 'documents', 'approvals', 'approval_steps', 'ai_candidates', 'meetings', 'action_items', 'audit_log'] as $table) {
    $report[$table] = (int)$pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
}
echo "Seed complete.\n";
foreach ($report as $table => $count) {
    echo str_pad($table, 22) . $count . "\n";
}
