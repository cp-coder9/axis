<?php
declare(strict_types=1);

$config = require dirname(__DIR__) . '/config.php';
require_once dirname(__DIR__) . '/lib/db.php';
$calculatorReleasePolicy = require dirname(__DIR__) . '/generated/calculator_release.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . $config['cors_origin']);
header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Architex-Role, X-Architex-User');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

const ALLOWED_ROLES = [
    'client', 'architect', 'bep', 'engineer', 'quantity_surveyor', 'town_planner',
    'land_surveyor', 'energy_professional', 'fire_engineer', 'cpm', 'contractor',
    'subcontractor', 'supplier', 'site_manager', 'health_safety', 'developer',
    'freelancer', 'firm_admin', 'admin', 'platform_admin'
];

const PERMISSIONS = [
    'client' => ['passport.view', 'documents.view', 'actions.view', 'approvals.view'],
    'architect' => ['passport.view', 'passport.edit', 'passport.publish', 'projects.edit', 'documents.view', 'documents.edit', 'actions.view', 'actions.edit', 'approvals.view', 'approvals.decide', 'ai.review', 'drawing.request', 'meetings.publish', 'audit.view'],
    'bep' => ['passport.view', 'passport.edit', 'documents.view', 'documents.edit', 'actions.view', 'actions.edit', 'approvals.view', 'ai.review', 'drawing.request', 'audit.view'],
    'engineer' => ['passport.view', 'documents.view', 'documents.edit', 'actions.view', 'actions.edit', 'approvals.view', 'approvals.decide', 'ai.review', 'drawing.request', 'audit.view'],
    'quantity_surveyor' => ['passport.view', 'documents.view', 'actions.view', 'actions.edit', 'approvals.view', 'approvals.decide', 'ai.review', 'drawing.request', 'audit.view'],
    'town_planner' => ['passport.view', 'passport.edit', 'documents.view', 'documents.edit', 'actions.view', 'actions.edit', 'approvals.view', 'ai.review', 'audit.view'],
    'energy_professional' => ['passport.view', 'documents.view', 'actions.view', 'actions.edit', 'approvals.view', 'approvals.decide', 'ai.review', 'drawing.request', 'audit.view'],
    'fire_engineer' => ['passport.view', 'documents.view', 'actions.view', 'actions.edit', 'approvals.view', 'approvals.decide', 'ai.review', 'drawing.request', 'audit.view'],
    'cpm' => ['passport.view', 'passport.edit', 'passport.publish', 'projects.edit', 'documents.view', 'documents.edit', 'actions.view', 'actions.edit', 'approvals.view', 'approvals.decide', 'ai.review', 'drawing.request', 'meetings.publish', 'audit.view'],
    'contractor' => ['passport.view', 'documents.view', 'documents.edit', 'actions.view', 'actions.edit', 'approvals.view', 'audit.view'],
    'firm_admin' => ['passport.view', 'projects.edit', 'documents.view', 'actions.view', 'actions.edit', 'approvals.view', 'audit.view'],
    'developer' => ['passport.view', 'projects.edit', 'documents.view', 'actions.view', 'approvals.view', 'audit.view'],
    'admin' => ['passport.view', 'passport.edit', 'passport.publish', 'projects.edit', 'documents.view', 'documents.edit', 'actions.view', 'actions.edit', 'approvals.view', 'approvals.decide', 'ai.review', 'drawing.request', 'meetings.publish', 'audit.view', 'users.view', 'users.manage'],
    'platform_admin' => ['*']
];

const DOCUMENT_STATUSES = ['draft', 'review', 'approved', 'superseded', 'archived'];
const ACTION_STATUSES = ['open', 'blocked', 'done', 'cancelled'];
const ACTION_PRIORITIES = ['high', 'medium', 'low'];
const PASSPORT_STATUSES = ['draft', 'published'];
const AI_CANDIDATE_STATUSES = ['draft', 'accepted', 'rejected'];

function json_response(array $payload, int $status = 200): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function route_path(): string {
    $uri = $_SERVER['REQUEST_URI'] ?? '/';
    return '/' . trim((string)(parse_url($uri, PHP_URL_PATH) ?: '/'), '/');
}

function json_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') return [];
    $data = json_decode($raw, true);
    if (!is_array($data)) json_response(['error' => 'Request body must be valid JSON'], 400);
    return $data;
}

function data_file(string $name): string {
    return dirname(__DIR__) . '/data/' . $name;
}

function read_json_file(string $name): array {
    $data = json_decode((string) file_get_contents(data_file($name)), true);
    return is_array($data) ? $data : [];
}

/**
 * Read-modify-write entirely inside one exclusive lock so concurrent requests
 * cannot overwrite each other's changes or observe a half-written file.
 * Returns the mutator's return value.
 */
function mutate_json_file(string $name, callable $mutator): mixed {
    $file = data_file($name);
    $handle = fopen($file, 'c+');
    if ($handle === false) json_response(['error' => 'Data store unavailable'], 503);
    if (!flock($handle, LOCK_EX)) {
        fclose($handle);
        json_response(['error' => 'Data store busy'], 503);
    }
    $data = json_decode((string) stream_get_contents($handle), true);
    if (!is_array($data)) $data = [];
    $result = $mutator($data);
    $encoded = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if ($encoded === false) {
        flock($handle, LOCK_UN);
        fclose($handle);
        json_response(['error' => 'Could not encode data'], 500);
    }
    ftruncate($handle, 0);
    rewind($handle);
    $written = fwrite($handle, $encoded . PHP_EOL);
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    if ($written === false) json_response(['error' => 'Could not persist data'], 500);
    return $result;
}

function base64url_decode_str(string $value): string|false {
    $padding = strlen($value) % 4;
    if ($padding) $value .= str_repeat('=', 4 - $padding);
    return base64_decode(strtr($value, '-_', '+/'), true);
}

function base64url_encode_str(string $value): string {
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

/**
 * Resolve the JWT signing secret. Production requires an explicitly-set
 * secret; local demo mode falls back to a stable dev secret so the login
 * flow works out of the box.
 */
function jwt_secret(): string {
    global $config;
    $secret = (string)($config['jwt_secret'] ?? '');
    if ($secret !== '' && $secret !== 'change-this-before-production') return $secret;
    if (($config['environment'] ?? '') === 'local') return 'local-dev-secret-not-for-production';
    return '';
}

/** Issue a signed HS256 JWT. $type is 'access' or 'refresh'. */
function issue_jwt(array $claims, int $ttlSeconds, string $type): string {
    $secret = jwt_secret();
    if ($secret === '') json_response(['error' => 'JWT secret is not configured'], 503);
    $header = base64url_encode_str(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64url_encode_str(json_encode($claims + ['iat' => time(), 'exp' => time() + $ttlSeconds, 'type' => $type]));
    $signature = base64url_encode_str(hash_hmac('sha256', $header . '.' . $payload, $secret, true));
    return $header . '.' . $payload . '.' . $signature;
}

function current_identity(): array {
    static $identity = null;
    if ($identity !== null) return $identity;

    global $config;
    // Fail closed: header-based demo identity is ONLY accepted when APP_ENV=local
    // is set explicitly. Any other or unset environment requires a signed JWT.
    if (($config['environment'] ?? '') === 'local') {
        $user = trim($_SERVER['HTTP_X_ARCHITEX_USER'] ?? '');
        $role = strtolower(trim($_SERVER['HTTP_X_ARCHITEX_ROLE'] ?? ''));
        if ($user === '' || $role === '') {
            json_response(['error' => 'X-Architex-User and X-Architex-Role headers are required in local demo mode'], 401);
        }
        if (!in_array($role, ALLOWED_ROLES, true)) json_response(['error' => 'Unknown role'], 401);
        return $identity = ['sub' => $user, 'role' => $role, 'org' => 'org-demo', 'projects' => ['*'], 'auth_mode' => 'local_demo'];
    }

    $secret = (string)($config['jwt_secret'] ?? '');
    if ($secret === '' || $secret === 'change-this-before-production') {
        json_response(['error' => 'Production JWT secret is not configured'], 503);
    }
    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $authorization, $match)) json_response(['error' => 'Bearer token required'], 401);
    $parts = explode('.', $match[1]);
    if (count($parts) !== 3) json_response(['error' => 'Malformed bearer token'], 401);
    [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
    $header = json_decode((string) base64url_decode_str($encodedHeader), true);
    $payload = json_decode((string) base64url_decode_str($encodedPayload), true);
    $signature = base64url_decode_str($encodedSignature);
    $expected = hash_hmac('sha256', $encodedHeader . '.' . $encodedPayload, $secret, true);
    if (!is_array($header) || ($header['alg'] ?? null) !== 'HS256' || !is_array($payload) || $signature === false || !hash_equals($expected, $signature)) {
        json_response(['error' => 'Invalid bearer token'], 401);
    }
    if (!isset($payload['exp'], $payload['sub'], $payload['role'], $payload['org'], $payload['projects']) || (int)$payload['exp'] < time() || !is_array($payload['projects'])) json_response(['error' => 'Expired or incomplete bearer token'], 401);
    $role = strtolower((string)$payload['role']);
    if (!in_array($role, ALLOWED_ROLES, true)) json_response(['error' => 'Unknown token role'], 401);
    return $identity = ['sub' => (string)$payload['sub'], 'role' => $role, 'org' => (string)$payload['org'], 'projects' => array_map('strval', $payload['projects']), 'auth_mode' => 'jwt'];
}

function current_role(): string { return current_identity()['role']; }
function current_user(): string { return current_identity()['sub']; }

/**
 * RBAC check (PRD §10.3). The role_permissions table in MariaDB is the
 * source of truth; the PERMISSIONS constant is a fallback for when the
 * database is unreachable (local demo resilience).
 */
function require_permission(string $permission): void {
    $role = current_role();
    $granted = permissions_for_role($role);
    if (!in_array('*', $granted, true) && !in_array($permission, $granted, true)) {
        json_response(['error' => 'Forbidden', 'required_permission' => $permission, 'role' => $role], 403);
    }
}

/** Resolve a role's granted permission strings from the DB (cached per request). */
function permissions_for_role(string $role): array {
    static $cache = [];
    if (isset($cache[$role])) return $cache[$role];

    // Map module_id back to the permission prefix used by the API.
    static $moduleActionMap = [
        'project_passport' => 'passport',
        'practice' => 'projects',
        'documents_drawings' => 'documents',
        'inbox_action' => 'actions',
        'approvals_queue' => 'approvals',
        'wingman' => 'ai',
        'meetings' => 'meetings',
        'admin_review' => 'audit',
    ];

    $health = db_health();
    if ($health === null) {
        // DB unreachable — fall back to the compiled constant.
        return $cache[$role] = PERMISSIONS[$role] ?? [];
    }
    try {
        $pdo = db();
        $stmt = $pdo->prepare('SELECT module_id, action_key FROM role_permissions WHERE role_key = ? AND allowed = 1');
        $stmt->execute([$role]);
        $rows = $stmt->fetchAll();
    } catch (PDOException) {
        return $cache[$role] = PERMISSIONS[$role] ?? [];
    }
    if (!$rows) {
        // No DB grants recorded for this role — fall back to the constant
        // rather than silently denying everything.
        return $cache[$role] = PERMISSIONS[$role] ?? [];
    }
    $granted = [];
    foreach ($rows as $row) {
        if ($row['action_key'] === '*') {
            $granted[] = '*';
            continue;
        }
        $prefix = $moduleActionMap[$row['module_id']] ?? null;
        if ($prefix !== null) {
            $granted[] = $prefix . '.' . $row['action_key'];
        }
    }
    // 'drawing.request' is stored under documents_drawings as 'request';
    // re-add the drawing alias so existing call sites keep working.
    if (in_array('documents.request', $granted, true)) {
        $granted[] = 'drawing.request';
    }
    return $cache[$role] = array_values(array_unique($granted));
}

/**
 * Enqueue an async AI job into the MariaDB jobs table (PRD §10.3/§10.5B).
 * Returns the job id; worker.php processes it on the next cron tick.
 * Falls back to null when MariaDB is unreachable (caller decides response).
 */
function enqueue_ai_job(string $jobType, array $payload, string $auditAction): ?string {
    try {
        $pdo = db();
        $jobId = 'job-' . bin2hex(random_bytes(6));
        $pdo->prepare('INSERT INTO jobs (id, organization_id, job_type, status, payload_json) VALUES (?, ?, ?, ?, ?)')
            ->execute([$jobId, current_identity()['org'], $jobType, 'pending', json_encode($payload, JSON_UNESCAPED_SLASHES)]);
        // Record usage against the visible quota (PRD §7.2)
        mutate_json_file('foundation.json', function (array &$store) use ($jobId, $jobType, $auditAction) {
            $store['ai_usage'][] = ['job_id'=>$jobId, 'type'=>$jobType, 'by'=>current_user(), 'at'=>date(DATE_ATOM)];
            audit($store, $auditAction, 'job', $jobId, ['job_type'=>$jobType]);
        });
        return $jobId;
    } catch (PDOException) {
        return null;
    }
}

function project_exists(string $projectId): bool {
    foreach (projects() as $project) {
        if ($project['id'] === $projectId) return true;
    }
    return false;
}

function require_project(string $projectId): void {
    if (!project_exists($projectId)) json_response(['error' => 'Project not found', 'project_id' => $projectId], 404);
}

function require_project_access(string $projectId): void {
    $projects = current_identity()['projects'] ?? [];
    if (!in_array('*', $projects, true) && !in_array($projectId, $projects, true)) {
        json_response(['error' => 'Project access denied', 'project_id' => $projectId], 403);
    }
}

function audit(array &$store, string $action, string $entityType, string $entityId, array $details = []): void {
    $store['audit'][] = [
        'id' => 'audit-' . bin2hex(random_bytes(6)),
        'actor' => current_user(),
        'organization' => current_identity()['org'],
        'role' => current_role(),
        'action' => $action,
        'entity_type' => $entityType,
        'entity_id' => $entityId,
        'at' => date(DATE_ATOM),
        'details' => $details,
    ];
}

/**
 * Canonical module registry, DB-driven (PRD §12).
 *
 * MariaDB `modules` is the source of truth for the registry. This reads rows
 * and reproduces the exact API contract shape the frontend consumes:
 * id, name, icon, tone, group, stage, summary, tabs, source, status,
 * governance, implementation_status. Falls back to the JSON fixture store
 * (backend/data/modules.json) when MariaDB is unreachable, so shared-hosting
 * / local-dev without a DB still serves the registry.
 */
function modules(): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }
    $health = db_health();
    if ($health !== null) {
        try {
            $rows = db()->query('SELECT id, name, icon, tone, module_group, lifecycle_stage, status, implementation_status, governance_json, summary, tabs_json, source_file FROM modules ORDER BY id')->fetchAll();
            $cache = array_map(function (array $r): array {
                return [
                    'id' => $r['id'],
                    'name' => $r['name'],
                    'icon' => $r['icon'],
                    'tone' => $r['tone'],
                    'group' => $r['module_group'],
                    'stage' => $r['lifecycle_stage'],
                    'summary' => $r['summary'],
                    'tabs' => json_decode($r['tabs_json'], true) ?? [],
                    'source' => $r['source_file'],
                    'status' => $r['status'],
                    'governance' => $r['governance_json'] !== null ? json_decode($r['governance_json'], true) : null,
                    'implementation_status' => $r['implementation_status'],
                ];
            }, $rows);
            if (count($cache) === 0) {
                // DB reachable but not seeded — fall through to fixture.
                $cache = null;
            } else {
                return $cache;
            }
        } catch (PDOException) {
            // fall through to fixture fallback
        }
    }
    $cache = read_json_file('modules.json');
    return $cache;
}

const PROJECT_STAGES = ['Brief', 'Appoint', 'Design', 'Comply', 'Procure', 'Build', 'Pay', 'Close-out'];

/** Fallback demo projects when MariaDB is unreachable (shared-hosting resilience). */
const FALLBACK_PROJECTS = [
    ['id'=>'proj-faerie-glen','name'=>'Faerie Glen Residential','code'=>'FGR-2026','location'=>'Pretoria, Gauteng','stage'=>'Design','progress'=>46,'client'=>'Evergreen Property Holdings','professional'=>'Justin Kruger · PrArch','municipality'=>'City of Tshwane','revision'=>'P03','budget'=>47500000],
    ['id'=>'proj-waterfall-office','name'=>'Waterfall Business Park Tower B','code'=>'WFP-2026','location'=>'Midrand, Gauteng','stage'=>'Build','progress'=>58,'client'=>'Redefine Capital Fund','professional'=>'Michael Patel · PrArch','municipality'=>'City of Johannesburg','revision'=>'P02','budget'=>85000000],
];

/**
 * Project registry, DB-driven (PRD §3.3 / Datum contract).
 *
 * MariaDB `projects` is the source of truth so POST/PATCH /projects writes are
 * live and durable. Maps schema columns to the API contract shape
 * (stage/progress/client/professional/budget). Falls back to the demo fixture
 * list when MariaDB is unreachable so the API keeps serving. Call
 * projects_reset() after any project mutation so subsequent reads in the same
 * request see fresh rows.
 */
function projects(): array {
    if (ProjectsCache::has()) return ProjectsCache::get();
    if (db_health() !== null) {
        try {
            $rows = db()->query('SELECT id, code, name, location, lifecycle_stage, progress_percent, client_name, professional_lead, municipality, revision, budget_cents FROM projects ORDER BY created_at ASC, code ASC')->fetchAll();
            if (count($rows) > 0) {
                $mapped = array_map('project_row_to_api', $rows);
                ProjectsCache::set($mapped);
                return $mapped;
            }
        } catch (PDOException) {
            // fall through to fixture fallback
        }
    }
    ProjectsCache::set(FALLBACK_PROJECTS);
    return FALLBACK_PROJECTS;
}

/** Invalidate the per-request project cache (call after project mutations). */
function projects_reset(): void {
    ProjectsCache::reset();
}

/** Per-request project registry cache (static storage, resettable). */
final class ProjectsCache {
    private static ?array $rows = null;
    public static function has(): bool { return self::$rows !== null; }
    public static function get(): array { return self::$rows ?? []; }
    public static function set(array $rows): void { self::$rows = $rows; }
    public static function reset(): void { self::$rows = null; }
}

function project_row_to_api(array $row): array {
    return [
        'id' => $row['id'],
        'code' => $row['code'],
        'name' => $row['name'],
        'location' => (string)($row['location'] ?? ''),
        'stage' => $row['lifecycle_stage'],
        'progress' => (int)$row['progress_percent'],
        'client' => (string)($row['client_name'] ?? ''),
        'professional' => (string)($row['professional_lead'] ?? ''),
        'municipality' => (string)($row['municipality'] ?? ''),
        'revision' => (string)($row['revision'] ?? ''),
        'budget' => $row['budget_cents'] !== null ? (int)$row['budget_cents'] : null,
    ];
}

/** Whether a user id exists in the seeded users table (FK-safe audit linkage). */
function known_user(string $userId): bool {
    static $cache = [];
    if (isset($cache[$userId])) return $cache[$userId];
    try {
        $stmt = db()->prepare('SELECT 1 FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        return $cache[$userId] = (bool)$stmt->fetchColumn();
    } catch (PDOException) {
        return $cache[$userId] = false;
    }
}

function query_param(string $name, ?string $default = null): ?string {
    return isset($_GET[$name]) ? trim((string)$_GET[$name]) : $default;
}

function by_project(array $items, string $projectId): array {
    return array_values(array_filter($items, fn ($item) => ($item['project_id'] ?? null) === $projectId));
}

/** Collections are project-scoped for every role except platform_admin. */
function require_collection_scope(?string $projectId): void {
    if ($projectId === null && current_role() !== 'platform_admin') {
        json_response(['error' => 'project query parameter is required for this role'], 422);
    }
    if ($projectId !== null) require_project_access($projectId);
}

function datum_for_project(string $projectId): array {
    $project = current(array_filter(projects(), fn ($candidate) => $candidate['id'] === $projectId));
    if (!$project) json_response(['error'=>'Project not found','project_id'=>$projectId], 404);
    $stage = $project['stage'];
    $cards = array_values(array_filter(modules(), function ($module) use ($stage) {
        $stageText = strtolower((string)($module['stage'] ?? ''));
        return $stageText === 'all stages' || str_contains($stageText, strtolower($stage));
    }));
    return ['project'=>$project,'stage'=>$stage,'module_cards'=>array_slice($cards,0,10),'governance'=>['ai_drafts_require_human_publish'=>true,'audit_log_required'=>true,'orientation'=>'project']];
}

$path = route_path();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET' && preg_match('#^/(api/)?v1/health$#', $path)) {
    json_response(['status'=>'ok','service'=>'Architex OS API','version'=>'0.3.0','canonical_modules'=>count(modules())]);
}
if ($method === 'GET' && preg_match('#^/(api/)?v1/db-health$#', $path)) {
    $health = db_health();
    if ($health === null) {
        json_response(['connected'=>false,'error'=>'MariaDB unreachable — JSON fixture stores remain the active write path'], 503);
    }
    json_response($health);
}
if ($method === 'GET' && preg_match('#^/(api/)?v1/platform-policy$#', $path)) {
    json_response(read_json_file('platform-policy.json'));
}

/* ---------- Auth (PRD §12): login + refresh against seeded users ---------- */

if ($method === 'POST' && preg_match('#^/(api/)?v1/auth/login$#', $path)) {
    $body = json_body();
    $email = strtolower(trim((string)($body['email'] ?? '')));
    $password = (string)($body['password'] ?? '');
    if ($email === '' || $password === '') json_response(['error' => 'email and password are required'], 422);
    $health = db_health();
    if ($health === null) json_response(['error' => 'User store unavailable (MariaDB unreachable)'], 503);
    $pdo = db();
    $stmt = $pdo->prepare('SELECT id, organization_id, name, email, password_hash, status FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user || $user['status'] !== 'active' || !password_verify($password, $user['password_hash'])) {
        json_response(['error' => 'Invalid credentials'], 401);
    }
    $roleStmt = $pdo->prepare('SELECT role_key FROM user_roles WHERE user_id = ? ORDER BY role_key LIMIT 1');
    $roleStmt->execute([$user['id']]);
    $role = $roleStmt->fetchColumn();
    if (!$role) json_response(['error' => 'User has no assigned role'], 403);
    $claims = ['sub' => $user['id'], 'role' => $role, 'org' => $user['organization_id'], 'projects' => ['*']];
    json_response([
        'access_token' => issue_jwt($claims, 3600, 'access'),
        'refresh_token' => issue_jwt(['sub' => $user['id']], 7 * 86400, 'refresh'),
        'token_type' => 'Bearer',
        'expires_in' => 3600,
        'user' => ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email'], 'role' => $role],
    ]);
}
if ($method === 'POST' && preg_match('#^/(api/)?v1/auth/refresh$#', $path)) {
    $body = json_body();
    $token = (string)($body['refresh_token'] ?? '');
    if ($token === '') json_response(['error' => 'refresh_token is required'], 422);
    $parts = explode('.', $token);
    if (count($parts) !== 3) json_response(['error' => 'Malformed refresh token'], 401);
    [$h, $p, $s] = $parts;
    $secret = jwt_secret();
    if ($secret === '') json_response(['error' => 'JWT secret is not configured'], 503);
    $expected = hash_hmac('sha256', $h . '.' . $p, $secret, true);
    $signature = base64url_decode_str($s);
    $payload = json_decode((string) base64url_decode_str($p), true);
    if ($signature === false || !hash_equals($expected, $signature) || !is_array($payload)) json_response(['error' => 'Invalid refresh token'], 401);
    if (($payload['type'] ?? '') !== 'refresh' || (int)($payload['exp'] ?? 0) < time()) json_response(['error' => 'Expired or wrong-type refresh token'], 401);
    $pdo = db();
    $stmt = $pdo->prepare('SELECT id, organization_id, status FROM users WHERE id = ?');
    $stmt->execute([(string)$payload['sub']]);
    $user = $stmt->fetch();
    if (!$user || $user['status'] !== 'active') json_response(['error' => 'User no longer active'], 401);
    $roleStmt = $pdo->prepare('SELECT role_key FROM user_roles WHERE user_id = ? ORDER BY role_key LIMIT 1');
    $roleStmt->execute([$user['id']]);
    $role = $roleStmt->fetchColumn();
    if (!$role) json_response(['error' => 'User has no assigned role'], 403);
    json_response([
        'access_token' => issue_jwt(['sub' => $user['id'], 'role' => $role, 'org' => $user['organization_id'], 'projects' => ['*']], 3600, 'access'),
        'token_type' => 'Bearer',
        'expires_in' => 3600,
    ]);
}
if ($method === 'GET' && preg_match('#^/(api/)?v1/me$#', $path)) {
    json_response(['user'=>['id'=>current_user(),'name'=>'Demo User','email'=>'demo@architex.local'],'organization'=>['id'=>current_identity()['org'],'name'=>'Architex Demo Practice'],'roles'=>[current_role()],'permissions'=>PERMISSIONS[current_role()] ?? []]);
}
if ($method === 'GET' && preg_match('#^/(api/)?v1/modules-registry$#', $path)) {
    json_response(['modules'=>modules(),'count'=>count(modules()),'canonical'=>true]);
}

/* ---------- Feedback pipeline (PRD §6.3 / §7.11) — MariaDB write path ---------- */

if ($method === 'POST' && preg_match('#^/(api/)?v1/feedback$#', $path)) {
    $body = json_body();
    $category = $body['category'] ?? '';
    $text = trim((string)($body['body'] ?? ''));
    if (!in_array($category, ['bug', 'feature_request', 'usability', 'praise'], true)) {
        json_response(['error' => 'Invalid category'], 422);
    }
    if (mb_strlen($text) < 10) {
        json_response(['error' => 'Feedback body must be at least 10 characters'], 422);
    }
    if (mb_strlen($text) > 2000) {
        json_response(['error' => 'Feedback body must be at most 2000 characters'], 422);
    }
    $id = 'fb-' . bin2hex(random_bytes(6));
    $health = db_health();
    if ($health === null) {
        json_response(['error' => 'Feedback store unavailable (MariaDB unreachable)'], 503);
    }
    $pdo = db();
    $pdo->prepare('INSERT INTO feedback_submissions (id, organization_id, user_id, category, body, context_project_id, context_module, context_tab) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        ->execute([
            $id,
            current_identity()['org'],
            current_user(),
            $category,
            $text,
            $body['context_project_id'] ?? null,
            $body['context_module'] ?? null,
            $body['context_tab'] ?? null,
        ]);
    json_response(['id' => $id, 'status' => 'new', 'message' => 'Feedback captured and queued for clustering'], 201);
}
if ($method === 'GET' && preg_match('#^/(api/)?v1/feedback$#', $path)) {
    $health = db_health();
    if ($health === null) {
        json_response(['error' => 'Feedback store unavailable (MariaDB unreachable)'], 503);
    }
    $pdo = db();
    $rows = $pdo->query('SELECT id, category, body, context_project_id, context_module, context_tab, status, created_at FROM feedback_submissions ORDER BY created_at DESC LIMIT 100')->fetchAll();
    $counts = $pdo->query('SELECT category, COUNT(*) AS n FROM feedback_submissions GROUP BY category')->fetchAll();
    json_response(['submissions' => $rows, 'count' => count($rows), 'by_category' => array_column($counts, 'n', 'category')]);
}
if ($method === 'GET' && preg_match('#^/(api/)?v1/projects$#', $path)) {
    $allowedProjects = current_identity()['projects'] ?? [];
    $visibleProjects = in_array('*', $allowedProjects, true)
        ? projects()
        : array_values(array_filter(projects(), fn ($project) => in_array($project['id'], $allowedProjects, true)));
    json_response(['projects'=>$visibleProjects,'count'=>count($visibleProjects)]);
}

if ($method === 'POST' && preg_match('#^/(api/)?v1/projects$#', $path)) {
    // Project creation is a practice-management action (PRD §3.3): gated by the
    // projects.edit grant plus project-space access. Writes through to MariaDB.
    require_permission('projects.edit');
    $body = json_body();
    $name = trim((string)($body['name'] ?? ''));
    $code = trim((string)($body['code'] ?? ''));
    if ($name === '' || mb_strlen($name) > 220) json_response(['error' => 'Project name is required (max 220 characters)'], 422);
    if ($code === '' || mb_strlen($code) > 64) json_response(['error' => 'Project code is required (max 64 characters)'], 422);
    $stage = (string)($body['stage'] ?? 'Brief');
    if (!in_array($stage, PROJECT_STAGES, true)) json_response(['error' => 'Invalid lifecycle stage', 'allowed' => PROJECT_STAGES], 422);
    $progress = isset($body['progress']) ? (int)$body['progress'] : 0;
    if ($progress < 0 || $progress > 100) json_response(['error' => 'progress must be between 0 and 100'], 422);
    $location = isset($body['location']) ? trim((string)$body['location']) : '';
    $client = isset($body['client']) ? trim((string)$body['client']) : '';
    $professional = isset($body['professional']) ? trim((string)$body['professional']) : '';
    $municipality = isset($body['municipality']) ? trim((string)$body['municipality']) : '';
    $revision = isset($body['revision']) ? trim((string)$body['revision']) : '';
    $budget = isset($body['budget']) ? (int)$body['budget'] : null;

    try {
        $pdo = db();
    } catch (PDOException) {
        json_response(['error' => 'Database unavailable — project creation requires MariaDB'], 503);
    }
    $orgId = current_identity()['org'] === 'org-demo' ? 'org-demo' : current_identity()['org'];
    try {
        $dup = $pdo->prepare('SELECT id FROM projects WHERE organization_id = ? AND code = ?');
        $dup->execute([$orgId, $code]);
        if ($dup->fetchColumn()) json_response(['error' => 'A project with this code already exists in the organisation', 'code' => $code], 409);
        $id = 'proj-' . bin2hex(random_bytes(6));
        $ins = $pdo->prepare('INSERT INTO projects (id, organization_id, code, name, location, lifecycle_stage, progress_percent, client_name, professional_lead, municipality, revision, budget_cents) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $ins->execute([$id, $orgId, $code, $name, $location, $stage, $progress, $client, $professional, $municipality, $revision, $budget]);
        if (known_user(current_user())) {
            $pdo->prepare('INSERT INTO project_stage_history (project_id, from_stage, to_stage, changed_by, reason) VALUES (?, NULL, ?, ?, ?)')
                ->execute([$id, $stage, current_user(), 'Project created']);
        }
        projects_reset();
        $project = current(array_filter(projects(), fn ($p) => $p['id'] === $id));
    } catch (PDOException $e) {
        json_response(['error' => 'Could not create project', 'detail' => $e->getMessage()], 500);
    }
    mutate_json_file('foundation.json', function (array &$store) use ($id, $name, $code, $stage) {
        audit($store, 'project.created', 'project', $id, ['name' => $name, 'code' => $code, 'stage' => $stage]);
    });
    json_response(['project' => $project, 'message' => 'Project created and recorded in the MariaDB project register.'], 201);
}

if ($method === 'GET' && preg_match('#^/(api/)?v1/projects/([^/]+)$#', $path, $m)) {
    require_project_access($m[2]);
    require_project($m[2]);
    $project = current(array_filter(projects(), fn ($p) => $p['id'] === $m[2]));
    json_response(['project' => $project]);
}

if ($method === 'PATCH' && preg_match('#^/(api/)?v1/projects/([^/]+)$#', $path, $m)) {
    require_permission('projects.edit');
    require_project_access($m[2]);
    require_project($m[2]);
    $body = json_body();
    $current = current(array_filter(projects(), fn ($p) => $p['id'] === $m[2]));

    $sets = [];
    $params = [];
    $allowed = [
        'name' => ['column' => 'name', 'type' => 'string', 'max' => 220],
        'code' => ['column' => 'code', 'type' => 'string', 'max' => 64],
        'location' => ['column' => 'location', 'type' => 'string', 'max' => 220],
        'stage' => ['column' => 'lifecycle_stage', 'type' => 'stage'],
        'progress' => ['column' => 'progress_percent', 'type' => 'int', 'max' => 100],
        'client' => ['column' => 'client_name', 'type' => 'string', 'max' => 220],
        'professional' => ['column' => 'professional_lead', 'type' => 'string', 'max' => 220],
        'municipality' => ['column' => 'municipality', 'type' => 'string', 'max' => 220],
        'revision' => ['column' => 'revision', 'type' => 'string', 'max' => 40],
        'budget' => ['column' => 'budget_cents', 'type' => 'int|max'],
    ];
    foreach ($allowed as $field => $spec) {
        if (!array_key_exists($field, $body)) continue;
        $value = $body[$field];
        if ($spec['type'] === 'stage') {
            if (!is_string($value) || !in_array($value, PROJECT_STAGES, true)) json_response(['error' => "Invalid lifecycle stage for field {$field}", 'allowed' => PROJECT_STAGES], 422);
        } elseif (str_starts_with($spec['type'], 'int')) {
            if (!is_numeric($value) || (int)$value < 0 || (isset($spec['max']) && (int)$value > $spec['max'])) json_response(['error' => "Field {$field} must be a non-negative integer" . (isset($spec['max']) ? " ≤ {$spec['max']}" : '')], 422);
            $value = (int)$value;
            if ($field === 'budget') $value = $value === 0 ? null : $value;
        } else {
            if (!is_string($value) || mb_strlen(trim($value)) === 0 || mb_strlen(trim($value)) > $spec['max']) json_response(['error' => "Field {$field} must be a string (max {$spec['max']} chars)"], 422);
            $value = trim($value);
        }
        $sets[] = "`{$spec['column']}` = ?";
        $params[] = $value;
    }
    if (!$sets) json_response(['error' => 'No recognised project fields supplied', 'allowed_fields' => array_keys($allowed)], 422);

    try {
        $pdo = db();
        if ($current['code'] !== ($body['code'] ?? $current['code'])) {
            $dup = $pdo->prepare('SELECT id FROM projects WHERE organization_id = ? AND code = ? AND id <> ?');
            $dup->execute(['org-demo', $body['code'], $m[2]]);
            if ($dup->fetchColumn()) json_response(['error' => 'A project with this code already exists in the organisation', 'code' => $body['code']], 409);
        }
        $params[] = $m[2];
        $pdo->prepare('UPDATE projects SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($params);
        if (isset($body['stage']) && $body['stage'] !== $current['stage'] && known_user(current_user())) {
            $pdo->prepare('INSERT INTO project_stage_history (project_id, from_stage, to_stage, changed_by, reason) VALUES (?, ?, ?, ?, ?)')
                ->execute([$m[2], $current['stage'], $body['stage'], current_user(), 'Project updated']);
        }
        projects_reset();
        $project = current(array_filter(projects(), fn ($p) => $p['id'] === $m[2]));
    } catch (PDOException $e) {
        json_response(['error' => 'Could not update project', 'detail' => $e->getMessage()], 500);
    }
    mutate_json_file('foundation.json', function (array &$store) use ($m, $body) {
        audit($store, 'project.updated', 'project', $m[2], ['fields' => array_keys($body)]);
    });
    json_response(['project' => $project, 'message' => 'Project updated in the MariaDB project register.']);
}
if ($method === 'GET' && preg_match('#^/(api/)?v1/projects/([^/]+)/datum$#', $path, $m)) {
    require_project_access($m[2]);
    json_response(datum_for_project($m[2]));
}

/* ---------- Project Passport (draft → human publish gate) ---------- */

if ($method === 'GET' && preg_match('#^/(api/)?v1/projects/([^/]+)/passport$#', $path, $m)) {
    require_permission('passport.view');
    require_project_access($m[2]);
    $passport = mutate_json_file('foundation.json', function (array &$store) use ($m) {
        $passport = $store['passports'][$m[2]] ?? null;
        if (!$passport) json_response(['error'=>'Project passport not found'], 404);
        audit($store, 'passport.viewed', 'project_passport', $m[2], ['version'=>$passport['version'],'status'=>$passport['status']]);
        return $passport;
    });
    json_response(['passport'=>$passport]);
}

if ($method === 'PATCH' && preg_match('#^/(api/)?v1/projects/([^/]+)/passport$#', $path, $m)) {
    require_permission('passport.edit');
    require_project_access($m[2]);
    require_project($m[2]);
    $body = json_body();
    $allowed = ['brief_summary','project_type','site_description','statutory_route','constraints','required_professionals','approval_requirements'];
    $passport = mutate_json_file('foundation.json', function (array &$store) use ($m, $body, $allowed) {
        $passport = $store['passports'][$m[2]] ?? ['project_id'=>$m[2],'version'=>0,'status'=>'draft'];
        $changed = [];
        foreach ($allowed as $field) {
            if (!array_key_exists($field, $body)) continue;
            $value = $body[$field];
            if (in_array($field, ['constraints','required_professionals','approval_requirements'], true)) {
                if (!is_array($value)) json_response(['error'=>"{$field} must be an array"], 422);
                $value = array_values(array_filter($value, 'is_string'));
            } else {
                if (!is_string($value)) json_response(['error'=>"{$field} must be a string"], 422);
            }
            $passport[$field] = $value;
            $changed[] = $field;
        }
        $passport['status'] = 'draft'; // changes never publish directly
        $passport['updated_by'] = current_user();
        $passport['updated_at'] = date(DATE_ATOM);
        $store['passports'][$m[2]] = $passport;
        audit($store, 'passport.drafted', 'project_passport', $m[2], ['version'=>$passport['version'],'fields'=>$changed]);
        return $passport;
    });
    json_response(['passport'=>$passport,'published'=>false,'message'=>'Passport changes are draft until an authorised professional publishes the version.']);
}

if ($method === 'POST' && preg_match('#^/(api/)?v1/projects/([^/]+)/passport/publish$#', $path, $m)) {
    require_permission('passport.publish');
    require_project_access($m[2]);
    require_project($m[2]);
    $passport = mutate_json_file('foundation.json', function (array &$store) use ($m) {
        $passport = $store['passports'][$m[2]] ?? null;
        if (!$passport) json_response(['error'=>'Project passport not found'], 404);
        $passport['status'] = 'published';
        $passport['version'] = ((int)($passport['version'] ?? 0)) + 1;
        $passport['published_by'] = current_user();
        $passport['published_at'] = date(DATE_ATOM);
        $store['passports'][$m[2]] = $passport;
        audit($store, 'passport.published', 'project_passport', $m[2], ['version'=>$passport['version']]);
        return $passport;
    });
    json_response(['passport'=>$passport,'published'=>true]);
}

/* ---------- Documents & Drawings ---------- */

if ($method === 'GET' && preg_match('#^/(api/)?v1/documents$#', $path)) {
    require_permission('documents.view');
    $projectId = query_param('project');
    require_collection_scope($projectId);
    json_response(['documents'=>$projectId ? by_project(read_json_file('foundation.json')['documents'] ?? [], $projectId) : (read_json_file('foundation.json')['documents'] ?? [])]);
}

if ($method === 'POST' && preg_match('#^/(api/)?v1/documents$#', $path)) {
    require_permission('documents.edit');
    $body = json_body();
    foreach (['project_id','number','title','type','discipline','revision'] as $required) {
        if (empty($body[$required]) || !is_string($body[$required])) json_response(['error'=>"Missing or invalid {$required}"], 422);
    }
    require_project((string)$body['project_id']);
    require_project_access((string)$body['project_id']);
    $status = (string)($body['status'] ?? 'draft');
    if (!in_array($status, DOCUMENT_STATUSES, true)) json_response(['error'=>'Invalid document status'], 422);
    $issuePurpose = isset($body['issue_purpose']) && is_string($body['issue_purpose']) ? $body['issue_purpose'] : null;
    $document = mutate_json_file('foundation.json', function (array &$store) use ($body, $status, $issuePurpose) {
        $document = [
            'id' => 'doc-' . bin2hex(random_bytes(5)),
            'project_id' => $body['project_id'],
            'number' => $body['number'],
            'title' => $body['title'],
            'type' => $body['type'],
            'discipline' => $body['discipline'],
            'revision' => $body['revision'],
            'status' => $status,
            'issue_purpose' => $issuePurpose,
            'updated_at' => date(DATE_ATOM),
        ];
        $store['documents'][] = $document;
        audit($store, 'document.created', 'document', $document['id'], ['revision'=>$document['revision'],'status'=>$status]);
        return $document;
    });
    json_response(['document'=>$document], 201);
}

if ($method === 'PATCH' && preg_match('#^/(api/)?v1/documents/([^/]+)$#', $path, $m)) {
    require_permission('documents.edit');
    $body = json_body();
    $status = isset($body['status']) && is_string($body['status']) ? $body['status'] : null;
    if ($status !== null && !in_array($status, DOCUMENT_STATUSES, true)) json_response(['error'=>'Invalid document status'], 422);
    $document = mutate_json_file('foundation.json', function (array &$store) use ($m, $body, $status) {
        foreach ($store['documents'] as &$doc) {
            if ($doc['id'] !== $m[2]) continue;
            require_project_access((string)$doc['project_id']);
            if ($status !== null) $doc['status'] = $status;
            foreach (['title','revision','issue_purpose','discipline'] as $field) {
                if (isset($body[$field]) && is_string($body[$field])) $doc[$field] = $body[$field];
            }
            $doc['updated_at'] = date(DATE_ATOM);
            audit($store, 'document.updated', 'document', $doc['id'], ['status'=>$doc['status'],'revision'=>$doc['revision']]);
            return $doc;
        }
        unset($doc);
        json_response(['error'=>'Document not found'], 404);
    });
    json_response(['document'=>$document]);
}

/* ---------- Action Centre ---------- */

if ($method === 'GET' && preg_match('#^/(api/)?v1/action-items$#', $path)) {
    require_permission('actions.view');
    $projectId = query_param('project');
    require_collection_scope($projectId);
    json_response(['actions'=>$projectId ? by_project(read_json_file('foundation.json')['actions'] ?? [], $projectId) : (read_json_file('foundation.json')['actions'] ?? [])]);
}

if ($method === 'PATCH' && preg_match('#^/(api/)?v1/action-items/([^/]+)$#', $path, $m)) {
    require_permission('actions.edit');
    $body = json_body();
    $status = isset($body['status']) ? (string)$body['status'] : null;
    $priority = isset($body['priority']) ? (string)$body['priority'] : null;
    if ($status !== null && !in_array($status, ACTION_STATUSES, true)) json_response(['error'=>'Invalid action status'], 422);
    if ($priority !== null && !in_array($priority, ACTION_PRIORITIES, true)) json_response(['error'=>'Invalid action priority'], 422);
    $updated = mutate_json_file('foundation.json', function (array &$store) use ($m, $body, $status, $priority) {
        foreach ($store['actions'] as &$action) {
            if ($action['id'] !== $m[2]) continue;
            require_project_access((string)$action['project_id']);
            if ($status !== null) $action['status'] = $status;
            if ($priority !== null) $action['priority'] = $priority;
            if (array_key_exists('owner', $body) && is_string($body['owner'])) $action['owner'] = $body['owner'];
            if (array_key_exists('due', $body) && is_string($body['due'])) $action['due'] = $body['due'];
            audit($store, 'action.updated', 'action_item', $m[2], ['status'=>$status,'priority'=>$priority]);
            return $action;
        }
        unset($action);
        json_response(['error'=>'Action item not found'], 404);
    });
    json_response(['action'=>$updated]);
}

/* ---------- Approvals (sequential steps) ---------- */

if ($method === 'GET' && preg_match('#^/(api/)?v1/approvals$#', $path)) {
    require_permission('approvals.view');
    $projectId = query_param('project');
    require_collection_scope($projectId);
    json_response(['approvals'=>$projectId ? by_project(read_json_file('foundation.json')['approvals'] ?? [], $projectId) : (read_json_file('foundation.json')['approvals'] ?? [])]);
}

if ($method === 'POST' && preg_match('#^/(api/)?v1/approvals/([^/]+)/(approve|reject)$#', $path, $m)) {
    require_permission('approvals.decide');
    $decision = $m[3] === 'approve' ? 'approved' : 'rejected';
    $note = isset(json_body()['note']) && is_string(json_body()['note']) ? json_body()['note'] : null;
    $updated = mutate_json_file('foundation.json', function (array &$store) use ($m, $decision, $note) {
        foreach ($store['approvals'] as &$approval) {
            if ($approval['id'] !== $m[2]) continue;
            require_project_access((string)$approval['project_id']);
            if ($approval['status'] !== 'pending') json_response(['error'=>'Approval already decided'], 409);
            $role = current_role();
            $isPlatform = $role === 'platform_admin';

            if (isset($approval['steps']) && is_array($approval['steps'])) {
                // Sequential workflow: decide the active step, advance, complete when done.
                $stepIndex = max(0, ((int)($approval['current_step'] ?? 1)) - 1);
                $steps = $approval['steps'];
                if (!isset($steps[$stepIndex])) json_response(['error'=>'Approval has no active step'], 409);
                $activeStep = $steps[$stepIndex];
                if (($activeStep['status'] ?? 'pending') !== 'pending') json_response(['error'=>'Active step already decided'], 409);
                $stepRole = strtolower((string)($activeStep['role'] ?? ''));
                if (!$isPlatform && $stepRole !== $role) json_response(['error'=>'This role cannot decide the active approval step'], 403);
                $steps[$stepIndex]['status'] = $decision;
                $steps[$stepIndex]['decided_by'] = current_user();
                $steps[$stepIndex]['decided_at'] = date(DATE_ATOM);
                if ($note !== null) $steps[$stepIndex]['note'] = $note;
                $approval['steps'] = $steps;
                $allDecided = !array_filter($steps, fn ($step) => ($step['status'] ?? 'pending') === 'pending');
                if ($allDecided) {
                    $approval['status'] = $decision; // final decision mirrors last step
                    $approval['completed_at'] = date(DATE_ATOM);
                } else {
                    $approval['current_step'] = $stepIndex + 2;
                }
                $approval['decided_by'] = current_user();
                $approval['decided_at'] = date(DATE_ATOM);
                if ($note !== null) $approval['decision_note'] = $note;
                audit($store, 'approval.step.' . $decision, 'approval', $m[2], ['step'=>$stepIndex + 1,'entity_type'=>$approval['entity_type'] ?? null,'entity_id'=>$approval['entity_id'] ?? null,'final'=>$allDecided]);
            } else {
                // Legacy single-role approval
                if (!$isPlatform && ($approval['required_role'] ?? '') !== $role) json_response(['error'=>'This role cannot decide this approval'], 403);
                $approval['status'] = $decision;
                $approval['decided_by'] = current_user();
                $approval['decided_at'] = date(DATE_ATOM);
                $approval['completed_at'] = date(DATE_ATOM);
                if ($note !== null) $approval['decision_note'] = $note;
                audit($store, 'approval.' . $decision, 'approval', $m[2], ['entity_type'=>$approval['entity_type'] ?? null,'entity_id'=>$approval['entity_id'] ?? null]);
            }
            return $approval;
        }
        unset($approval);
        json_response(['error'=>'Approval not found'], 404);
    });
    json_response(['approval'=>$updated]);
}

/* ---------- Audit log ---------- */

if ($method === 'GET' && preg_match('#^/(api/)?v1/audit-log$#', $path)) {
    require_permission('audit.view');
    $entityType = query_param('entity_type');
    $store = read_json_file('foundation.json');
    $entries = array_values(array_filter($store['audit'] ?? [], fn ($entry) => ($entry['organization'] ?? 'org-demo') === current_identity()['org']));
    if ($entityType) $entries = array_values(array_filter($entries, fn ($entry) => ($entry['entity_type'] ?? null) === $entityType));
    json_response(['audit'=>$entries,'count'=>count($entries)]);
}

/* ---------- Shared drawing intelligence ---------- */

if ($method === 'POST' && preg_match('#^/(api/)?v1/drawing-intelligence/jobs$#', $path)) {
    require_permission('drawing.request');
    $body = json_body();
    foreach (['project_id','source_revision_id','consumer'] as $required) {
        if (empty($body[$required]) || !is_string($body[$required])) json_response(['error'=>"Missing or invalid {$required}"], 422);
    }
    require_project((string)$body['project_id']);
    require_project_access((string)$body['project_id']);
    $allowedConsumers = ['specforge','bom','municipal','bim_ifc','xa'];
    if (!in_array($body['consumer'], $allowedConsumers, true)) json_response(['error'=>'Unsupported drawing-intelligence consumer'], 422);
    $job = mutate_json_file('foundation.json', function (array &$store) use ($body) {
        $job = ['id'=>'drawjob-' . bin2hex(random_bytes(5)),'project_id'=>$body['project_id'],'source_revision_id'=>$body['source_revision_id'],'consumer'=>$body['consumer'],'status'=>'pending','human_review_required'=>true,'requested_by'=>current_user(),'created_at'=>date(DATE_ATOM)];
        $store['drawing_jobs'][] = $job;
        audit($store, 'drawing_intelligence.requested', 'drawing_intelligence_job', $job['id'], ['consumer'=>$job['consumer']]);
        return $job;
    });
    json_response(['job'=>$job], 202);
}

/* ---------- Governed AI candidates ---------- */

if ($method === 'POST' && preg_match('#^/(api/)?v1/ai-candidates/([^/]+)/(accept|reject)$#', $path, $m)) {
    require_permission('ai.review');
    $decision = $m[3] === 'accept' ? 'accepted' : 'rejected';
    $result = mutate_json_file('foundation.json', function (array &$store) use ($m, $decision) {
        foreach ($store['ai_candidates'] as &$candidate) {
            if ($candidate['id'] !== $m[2]) continue;
            if (!empty($candidate['project_id'])) require_project_access((string)$candidate['project_id']);
            if (($candidate['status'] ?? 'draft') !== 'draft') json_response(['error'=>'AI candidate already reviewed'], 409);
            $candidate['status'] = $decision;
            $candidate['reviewed_by'] = current_user();
            $candidate['reviewed_at'] = date(DATE_ATOM);
            audit($store, 'ai_candidate.' . $decision, 'ai_candidate', $m[2], ['source_module'=>$candidate['source_module'] ?? null,'provenance'=>$candidate['provenance'] ?? null]);
            $approvalId = null;
            if ($decision === 'accepted') {
                // Accepted candidates never publish directly: create a governed approval gate.
                $approvalId = 'apr-' . bin2hex(random_bytes(5));
                $store['approvals'][] = [
                    'id' => $approvalId,
                    'project_id' => $candidate['project_id'] ?? null,
                    'entity_type' => 'ai_candidate',
                    'entity_id' => $candidate['id'],
                    'title' => 'Publish AI candidate: ' . ($candidate['candidate_type'] ?? 'candidate'),
                    'requested_by' => current_user(),
                    'status' => 'pending',
                    'current_step' => 1,
                    'steps' => [['role' => 'architect', 'status' => 'pending']],
                    'created_at' => date(DATE_ATOM),
                ];
                audit($store, 'approval.created', 'approval', $approvalId, ['entity_type'=>'ai_candidate','entity_id'=>$candidate['id']]);
            }
            return ['candidate'=>$candidate,'approval_id'=>$approvalId];
        }
        unset($candidate);
        json_response(['error'=>'AI candidate not found'], 404);
    });
    json_response(['candidate'=>$result['candidate'],'published'=>false,'approval_id'=>$result['approval_id'],'message'=>'Human decision recorded. Publication requires a separate governed approval.']);
}

/* ---------- Meetings (chair-governed outcomes and write-backs) ---------- */

function require_meeting_chair(array $meeting): void {
    $chair = (string)($meeting['chair'] ?? '');
    if ($chair === '') json_response(['error'=>'Meeting has no chair assigned'], 409);
    if (current_user() !== $chair && current_role() !== 'platform_admin') {
        json_response(['error'=>'Only the meeting chair may take this action','chair'=>$chair], 403);
    }
}

/** User management is restricted to org admins and platform super-admins. */
function require_user_management(string $action = 'view'): void {
    $role = current_role();
    if ($role !== 'admin' && $role !== 'platform_admin') {
        json_response(['error'=>'User management requires an admin or platform_admin role','required'=>'users.'.$action,'role'=>$role], 403);
    }
    // The role check above is the gate; 'users.*' is a derived permission that
    // cannot be represented as a module row, so no extra require_permission call.
}

function is_allowed_role_key(string $roleKey): bool {
    return in_array($roleKey, ALLOWED_ROLES, true);
}

if ($method === 'GET' && preg_match('#^/(api/)?v1/meetings/([^/]+)$#', $path, $m)) {
    $store = read_json_file('foundation.json');
    $meeting = $store['meetings'][$m[2]] ?? null;
    if (!$meeting) json_response(['error' => 'Meeting not found'], 404);
    require_project_access((string)$meeting['project_id']);
    json_response(['meeting' => $meeting]);
}

if ($method === 'POST' && preg_match('#^/(api/)?v1/meetings/([^/]+)/outcomes/([^/]+)/(accept|reject)$#', $path, $m)) {
    require_permission('meetings.publish');
    $decision = $m[4] === 'accept' ? 'accepted' : 'rejected';
    $outcome = mutate_json_file('foundation.json', function (array &$store) use ($m, $decision) {
        $meeting = $store['meetings'][$m[2]] ?? null;
        if (!$meeting) json_response(['error'=>'Meeting not found'], 404);
        require_project_access((string)$meeting['project_id']);
        require_meeting_chair($meeting);
        foreach ($meeting['outcomes'] as &$candidate) {
            if ($candidate['id'] !== $m[3]) continue;
            if (($candidate['status'] ?? 'pending') !== 'pending') json_response(['error'=>'Meeting outcome already decided'], 409);
            $candidate['status'] = $decision;
            $candidate['reviewed_by'] = current_user();
            $candidate['reviewed_at'] = date(DATE_ATOM);
            $store['meetings'][$m[2]] = $meeting;
            audit($store, 'meeting_outcome.' . $decision, 'meeting_outcome', $m[3], ['meeting_id'=>$m[2],'destination'=>$candidate['destination'] ?? null]);
            return $candidate;
        }
        unset($candidate);
        json_response(['error'=>'Meeting outcome not found'], 404);
    });
    json_response(['outcome'=>$outcome,'published'=>false,'message'=>'Human decision recorded. Publish remains a separate governed action.']);
}

if ($method === 'POST' && preg_match('#^/(api/)?v1/meetings/([^/]+)/publish$#', $path, $m)) {
    require_permission('meetings.publish');
    $result = mutate_json_file('foundation.json', function (array &$store) use ($m) {
        $meeting = $store['meetings'][$m[2]] ?? null;
        if (!$meeting) json_response(['error'=>'Meeting not found'], 404);
        require_project_access((string)$meeting['project_id']);
        require_meeting_chair($meeting);
        $policy = $meeting['policy'] ?? ['recording_enabled'=>true, 'transcription_enabled'=>true];
        if ((!empty($policy['recording_enabled']) && empty($meeting['consent']['recording']))
            || (!empty($policy['transcription_enabled']) && empty($meeting['consent']['transcription']))) {
            json_response(['error'=>'Required consent is incomplete'], 409);
        }
        $pending = array_filter($meeting['outcomes'] ?? [], fn ($outcome) => ($outcome['status'] ?? 'pending') === 'pending');
        if ($pending) json_response(['error'=>'All meeting outcomes require explicit human decisions before publish','pending_outcome_ids'=>array_column($pending,'id')], 409);
        if (!empty($meeting['published_revision'])) {
            return ['meeting'=>$meeting,'idempotent'=>true,'write_backs'=>0];
        }
        $revision = 'M01';
        $meeting['status'] = 'published';
        $meeting['published_revision'] = $revision;
        $meeting['published_by'] = current_user();
        $meeting['published_at'] = date(DATE_ATOM);
        $store['meetings'][$m[2]] = $meeting;

        // Governed write-backs: one action + one ledger row per accepted outcome.
        $store['write_backs'] = $store['write_backs'] ?? [];
        $written = 0;
        foreach ($meeting['outcomes'] as $outcome) {
            if (($outcome['status'] ?? 'pending') !== 'accepted') continue;
            $idempotencyKey = 'wb-' . $m[2] . '-' . $outcome['id'] . '-' . $revision;
            $existing = array_filter($store['write_backs'] ?? [], fn ($entry) => ($entry['idempotency_key'] ?? null) === $idempotencyKey);
            if ($existing) continue;
            $store['actions'][] = [
                'id' => 'act-' . bin2hex(random_bytes(5)),
                'project_id' => $meeting['project_id'],
                'title' => $outcome['title'],
                'owner' => $outcome['owner'] ?? 'Unassigned',
                'due' => $outcome['due'] ?? null,
                'priority' => 'medium',
                'status' => 'open',
                'source' => 'Meetings',
            ];
            $store['write_backs'][] = [
                'id' => 'wb-' . bin2hex(random_bytes(5)),
                'meeting_id' => $m[2],
                'outcome_id' => $outcome['id'],
                'destination_type' => $outcome['destination'] ?? 'action_centre',
                'idempotency_key' => $idempotencyKey,
                'written_by' => current_user(),
                'written_at' => date(DATE_ATOM),
            ];
            $written++;
        }
        audit($store, 'meeting.published', 'meeting', $m[2], ['revision'=>$revision,'outcomes'=>array_column($meeting['outcomes'],'id'),'write_backs'=>$written]);
        return ['meeting'=>$meeting,'idempotent'=>false,'write_backs'=>$written];
    });
    json_response(['meeting'=>$result['meeting'],'idempotent'=>$result['idempotent'],'write_backs'=>$result['write_backs']]);
}

/* ---------- Meetings lifecycle: consent + correction (PRD §7.12) ---------- */

if ($method === 'POST' && preg_match('#^/(api/)?v1/meetings/([^/]+)/consent$#', $path, $m)) {
    require_permission('meetings.publish');
    $body = json_body();
    $consent = mutate_json_file('foundation.json', function (array &$store) use ($m, $body) {
        $meeting = $store['meetings'][$m[2]] ?? null;
        if (!$meeting) json_response(['error'=>'Meeting not found'], 404);
        require_project_access((string)$meeting['project_id']);
        // PRD §7.12.4: recording/transcription require explicit, informed consent
        // before activation; consent is recorded per channel with actor + time.
        $current = $meeting['consent'] ?? [];
        foreach (['recording', 'transcription'] as $channel) {
            if (!empty($body[$channel])) {
                $current[$channel] = true;
                $current[$channel . '_by'] = current_user();
                $current[$channel . '_at'] = date(DATE_ATOM);
            }
        }
        if ($current === ($meeting['consent'] ?? [])) {
            json_response(['error'=>'No consent channels granted (recording, transcription)'], 422);
        }
        $meeting['consent'] = $current;
        $store['meetings'][$m[2]] = $meeting;
        audit($store, 'meeting.consent_recorded', 'meeting', $m[2], ['channels'=>array_keys(array_diff_key($current, $meeting['consent'] ?? []))]);
        return $meeting['consent'];
    });
    json_response(['consent'=>$consent,'message'=>'Consent recorded; publish gate updated.']);
}

if ($method === 'POST' && preg_match('#^/(api/)?v1/meetings/([^/]+)/request-correction$#', $path, $m)) {
    require_permission('meetings.publish');
    $result = mutate_json_file('foundation.json', function (array &$store) use ($m) {
        $meeting = $store['meetings'][$m[2]] ?? null;
        if (!$meeting) json_response(['error'=>'Meeting not found'], 404);
        require_project_access((string)$meeting['project_id']);
        require_meeting_chair($meeting);
        if (empty($meeting['published_revision'])) {
            json_response(['error'=>'Minutes are not published yet — nothing to correct'], 409);
        }
        // PRD §6.5 step 6: corrections NEVER overwrite the published record;
        // they create a new, separately numbered revision.
        $prev = (int)filter_var($meeting['published_revision'], FILTER_SANITIZE_NUMBER_INT);
        $revision = 'M' . str_pad((string)($prev + 1), 2, '0', STR_PAD_LEFT);
        $meeting['status'] = 'review_required';
        $meeting['correction_of_revision'] = $meeting['published_revision'];
        $meeting['pending_correction_revision'] = $revision;
        $store['meetings'][$m[2]] = $meeting;
        audit($store, 'meeting.correction_requested', 'meeting', $m[2], ['supersedes'=>$meeting['published_revision'],'next_revision'=>$revision]);
        return ['meeting'=>$meeting,'next_revision'=>$revision];
    });
    json_response([
        'meeting'=>$result['meeting'],
        'next_revision'=>$result['next_revision'],
        'message'=>"Correction cycle opened: revision {$result['next_revision']} will supersede the issued minutes after chair review and re-publish.",
    ]);
}

/* ---------- Wingman AI workspace (PRD §7.2 / §12) ---------- */

if ($method === 'GET' && preg_match('#^/(api/)?v1/ai/conversations$#', $path)) {
    require_permission('passport.view');
    $store = read_json_file('foundation.json');
    $projectId = query_param('project');
    require_collection_scope($projectId);
    $conversations = $store['ai_conversations'] ?? [];
    if ($projectId) $conversations = by_project($conversations, $projectId);
    json_response(['conversations'=>$conversations,'count'=>count($conversations)]);
}

if ($method === 'POST' && preg_match('#^/(api/)?v1/ai/capabilities/draft-rfi$#', $path)) {
    require_permission('ai.review');
    $body = json_body();
    foreach (['project_id','subject','question'] as $required) {
        if (empty($body[$required]) || !is_string($body[$required])) json_response(["error"=>"Missing or invalid {$required}"], 422);
    }
    require_project_access((string)$body['project_id']);
    // Governed pattern: the draft is an AI candidate — never auto-published.
    $draft = mutate_json_file('foundation.json', function (array &$store) use ($body) {
        $rfiNumber = 'RFI-' . str_pad((string)(count($store['rfi_drafts'] ?? []) + 1), 3, '0', STR_PAD_LEFT);
        $draft = [
            'id' => 'rfi-' . bin2hex(random_bytes(5)),
            'project_id' => $body['project_id'],
            'number' => $rfiNumber,
            'subject' => $body['subject'],
            'question' => $body['question'],
            'drawing_refs' => is_array($body['drawing_refs'] ?? null) ? $body['drawing_refs'] : [],
            'addressee' => $body['addressee'] ?? 'Project team',
            'status' => 'draft',
            'ai_generated' => true,
            'generated_by' => current_user(),
            'capability' => 'draft_rfi',
            'created_at' => date(DATE_ATOM),
        ];
        $store['rfi_drafts'][] = $draft;
        audit($store, 'wingman.rfi_drafted', 'ai_candidate', $draft['id'], ['capability'=>'draft_rfi','number'=>$rfiNumber]);
        return $draft;
    });
    json_response(['draft'=>$draft,'message'=>'AI-drafted RFI created as a governed candidate for human review.'], 201);
}

if ($method === 'GET' && preg_match('#^/(api/)?v1/ai/usage$#', $path)) {
    // PRD §7.2: session budget indicator ("47/60 requests remaining").
    $quotaTotal = 60;
    $used = count(read_json_file('foundation.json')['ai_usage'] ?? []);
    json_response([
        'period' => date('Y-m'),
        'requests_used' => $used,
        'requests_total' => $quotaTotal,
        'remaining' => max(0, $quotaTotal - $used),
        'policy' => 'Usage limits are user-visible governance, not a silent throttle.',
    ]);
}

/* ---------- Shared drawing intelligence: SpecForge scan + BoM takeoff (PRD §7.7/§7.8/§10.5B) ---------- */

if ($method === 'POST' && preg_match('#^/(api/)?v1/specforge/([^/]+)/drawing-scan$#', $path, $m)) {
    require_permission('drawing.request');
    require_project_access($m[2]);
    $body = json_body();
    $jobId = enqueue_ai_job('ai_drawing_scan', [
        'consumer' => 'specforge',
        'project_id' => $m[2],
        'source_revision_id' => $body['source_revision_id'] ?? null,
    ], 'specforge.drawing_scan_requested');
    if ($jobId === null) json_response(['error' => 'Job queue unavailable (MariaDB unreachable)'], 503);
    json_response(['job_id'=>$jobId,'status'=>'pending','poll'=>'GET /api/v1/drawing-intelligence/jobs?project=' . $m[2]], 202);
}

if ($method === 'POST' && preg_match('#^/(api/)?v1/bom/([^/]+)/takeoff$#', $path, $m)) {
    require_permission('drawing.request');
    require_project_access($m[2]);
    $body = json_body();
    $jobId = enqueue_ai_job('ai_drawing_scan', [
        'consumer' => 'bom',
        'project_id' => $m[2],
        'source_revision_id' => $body['source_revision_id'] ?? null,
        'formats' => is_array($body['formats'] ?? null) ? $body['formats'] : ['pdf_vector'],
    ], 'bom.takeoff_requested');
    if ($jobId === null) json_response(['error' => 'Job queue unavailable (MariaDB unreachable)'], 503);
    json_response(['job_id'=>$jobId,'status'=>'pending','poll'=>'GET /api/v1/drawing-intelligence/jobs?project=' . $m[2]], 202);
}

/* ---------- Engineering Calculation Hub (v8) ---------- */

const CALC_STATUSES = ['draft', 'saved', 'under_review', 'approved'];

function calculator_release_policy(string $calculatorId): array {
    global $calculatorReleasePolicy;
    return $calculatorReleasePolicy[$calculatorId] ?? [
        'id' => $calculatorId,
        'releaseState' => 'contained',
        'recordable' => false,
        'message' => 'Unvalidated advisory calculation — this calculator is unknown and controlled record actions are unavailable.',
        'formulaVersion' => null,
        'professionalOwner' => 'Unassigned',
        'minimumGoldenCases' => 0,
        'approvalEvidenceIds' => [],
    ];
}

function annotate_unverified_calculation(array $calculation): array {
    $release = calculator_release_policy((string)($calculation['calc_type'] ?? ''));
    if (($release['releaseState'] ?? 'contained') !== 'validated' || ($release['recordable'] ?? false) !== true) {
        $calculation['evidence_state'] = 'unverified';
        $calculation['safety_message'] = $release['message'];
    }
    return $calculation;
}

function reject_contained_calculator(string $calculatorId): void {
    $release = calculator_release_policy($calculatorId);
    if (($release['releaseState'] ?? 'contained') !== 'validated' || ($release['recordable'] ?? false) !== true) {
        json_response([
            'error' => 'Calculator is contained',
            'code' => 'CALCULATOR_CONTAINED',
            'calc_type' => $calculatorId,
            'safety_message' => $release['message'],
        ], 503);
    }
}

if ($method === 'GET' && preg_match('#^/(api/)?v1/engineering/calculations$#', $path)) {
    $projectId = query_param('project');
    require_collection_scope($projectId);
    $store = read_json_file('foundation.json');
    $records = $store['calculations'] ?? [];
    if ($projectId) $records = by_project($records, $projectId);
    $records = array_map('annotate_unverified_calculation', $records);
    json_response(['calculations'=>$records,'count'=>count($records)]);
}

if ($method === 'POST' && preg_match('#^/(api/)?v1/engineering/calculations$#', $path)) {
    $body = json_body();
    if (empty($body['calc_type']) || !is_string($body['calc_type'])) {
        json_response(['error'=>'Missing or invalid calc_type'], 422);
    }
    // engineering-create-containment-gate
    reject_contained_calculator($body['calc_type']);
    $projectId = isset($body['project_id']) && is_string($body['project_id']) ? $body['project_id'] : null;
    if ($projectId !== null) {
        require_project($projectId);
        require_project_access($projectId);
    }
    $inputs = is_array($body['inputs'] ?? null) ? $body['inputs'] : [];
    $results = is_array($body['results'] ?? null) ? $body['results'] : [];
    $status = (string)($body['status'] ?? 'saved');
    if (!in_array($status, CALC_STATUSES, true)) json_response(['error'=>'Invalid calculation status'], 422);
    $calculation = mutate_json_file('foundation.json', function (array &$store) use ($body, $projectId, $inputs, $results, $status) {
        $calculation = [
            'id' => 'calc-' . bin2hex(random_bytes(5)),
            'project_id' => $projectId,
            'calc_type' => $body['calc_type'],
            'inputs' => $inputs,
            'results' => $results,
            'derivation' => is_string($body['derivation'] ?? null) ? $body['derivation'] : null,
            'status' => $status,
            'author_id' => current_user(),
            'linked_drawing_ref' => isset($body['linked_drawing_ref']) && is_string($body['linked_drawing_ref']) ? $body['linked_drawing_ref'] : null,
            'linked_meeting_id' => isset($body['linked_meeting_id']) && is_string($body['linked_meeting_id']) ? $body['linked_meeting_id'] : null,
            'linked_rfi_id' => isset($body['linked_rfi_id']) && is_string($body['linked_rfi_id']) ? $body['linked_rfi_id'] : null,
            'created_at' => date(DATE_ATOM),
            'updated_at' => date(DATE_ATOM),
        ];
        $store['calculations'][] = $calculation;
        audit($store, 'calculation.saved', 'calculation', $calculation['id'], ['calc_type'=>$calculation['calc_type'],'status'=>$status,'project_id'=>$projectId]);
        return $calculation;
    });
    json_response(['calculation'=>$calculation,'message'=>'Calculation saved as a controlled working record.'], 201);
}

if ($method === 'GET' && preg_match('#^/(api/)?v1/engineering/calculations/([^/]+)$#', $path, $m)) {
    $store = read_json_file('foundation.json');
    foreach ($store['calculations'] ?? [] as $calculation) {
        if ($calculation['id'] !== $m[2]) continue;
        if (!empty($calculation['project_id'])) require_project_access((string)$calculation['project_id']);
        json_response(['calculation'=>annotate_unverified_calculation($calculation)]);
    }
    json_response(['error'=>'Calculation not found'], 404);
}

if ($method === 'POST' && preg_match('#^/(api/)?v1/engineering/calculations/([^/]+)/review$#', $path, $m)) {
    $store = read_json_file('foundation.json');
    $reviewCandidate = null;
    foreach ($store['calculations'] ?? [] as $calculation) {
        if ($calculation['id'] !== $m[2]) continue;
        if (!empty($calculation['project_id'])) require_project_access((string)$calculation['project_id']);
        $reviewCandidate = $calculation;
        break;
    }
    if ($reviewCandidate === null) json_response(['error'=>'Calculation not found'], 404);
    // engineering-review-containment-gate
    reject_contained_calculator((string)($reviewCandidate['calc_type'] ?? ''));
    $updated = mutate_json_file('foundation.json', function (array &$store) use ($m) {
        foreach ($store['calculations'] as &$calculation) {
            if ($calculation['id'] !== $m[2]) continue;
            if (!empty($calculation['project_id'])) require_project_access((string)$calculation['project_id']);
            $calculation['status'] = 'under_review';
            $calculation['review_requested_by'] = current_user();
            $calculation['review_requested_at'] = date(DATE_ATOM);
            $calculation['updated_at'] = date(DATE_ATOM);
            audit($store, 'calculation.review_requested', 'calculation', $m[2], ['calc_type'=>$calculation['calc_type']]);
            return $calculation;
        }
        unset($calculation);
        json_response(['error'=>'Calculation not found'], 404);
    });
    json_response(['calculation'=>$updated,'message'=>'Calculation record sent to professional review.']);
}

/* ---------- User management (admin & platform_admin) ---------- */

if ($method === 'GET' && preg_match('#^/(api/)?v1/users$#', $path)) {
    require_user_management('view');
    $orgId = current_identity()['org'];
    $health = db_health();
    if ($health === null) {
        json_response(['error' => 'User store unavailable (MariaDB unreachable)'], 503);
    }
    try {
        $stmt = db()->prepare('
            SELECT u.id, u.name, u.email, u.status, u.created_at,
                   GROUP_CONCAT(DISTINCT ur.role_key ORDER BY ur.role_key SEPARATOR \',\') AS roles
            FROM users u
            LEFT JOIN user_roles ur ON ur.user_id = u.id
            WHERE u.organization_id = ?
            GROUP BY u.id
            ORDER BY u.created_at DESC
        ');
        $stmt->execute([$orgId]);
        $rows = $stmt->fetchAll();
        $users = array_map(function (array $row): array {
            $roles = $row['roles'] !== null ? array_filter(explode(',', $row['roles'])) : [];
            return [
                'id' => $row['id'],
                'name' => $row['name'],
                'email' => $row['email'],
                'status' => $row['status'],
                'roles' => array_values($roles),
                'created_at' => $row['created_at'],
            ];
        }, $rows);
        json_response(['users' => $users, 'count' => count($users)]);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error', 'detail' => $e->getMessage()], 500);
    }
}

if ($method === 'POST' && preg_match('#^/(api/)?v1/users$#', $path)) {
    require_user_management('manage');
    $body = json_body();
    foreach (['name', 'email'] as $required) {
        if (empty($body[$required]) || !is_string($body[$required])) {
            json_response(['error' => "Missing or invalid {$required}"], 422);
        }
    }
    $roleKey = isset($body['role_key']) && is_string($body['role_key']) ? $body['role_key'] : 'client';
    if (!is_allowed_role_key($roleKey)) {
        json_response(['error' => 'Invalid role_key'], 422);
    }
    $orgId = current_identity()['org'];
    $health = db_health();
    if ($health === null) {
        json_response(['error' => 'User store unavailable (MariaDB unreachable)'], 503);
    }
    try {
        $pdo = db();
        $userId = 'user-' . bin2hex(random_bytes(6));
        $placeholderHash = password_hash('change-me-' . $userId, PASSWORD_DEFAULT);
        $pdo->prepare('INSERT INTO users (id, organization_id, name, email, password_hash, status) VALUES (?, ?, ?, ?, ?, ?)')
            ->execute([$userId, $orgId, $body['name'], $body['email'], $placeholderHash, 'invited']);
        $rowStmt = $pdo->prepare('SELECT id, name, email, status, created_at FROM users WHERE id = ?');
        $rowStmt->execute([$userId]);
        $row = $rowStmt->fetch();
        if ($row) {
            $pdo->prepare('INSERT INTO user_roles (user_id, role_key, project_id) VALUES (?, ?, NULL)')
                ->execute([$userId, $roleKey]);
            json_response([
                'user' => [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'status' => $row['status'],
                    'roles' => [$roleKey],
                    'created_at' => $row['created_at'],
                ],
                'message' => "User {$body['name']} invited with {$roleKey} role.",
            ], 201);
        }
        json_response(['error' => 'User could not be created'], 500);
    } catch (PDOException $e) {
        $code = (int)$e->getCode();
        if ($code === 23000 || $code === 1062) {
            json_response(['error' => 'A user with this email already exists'], 409);
        }
        json_response(['error' => 'Database error', 'detail' => $e->getMessage()], 500);
    }
}

if ($method === 'PATCH' && preg_match('#^/(api/)?v1/users/([^/]+)$#', $path, $m)) {
    require_user_management('manage');
    $body = json_body();
    $userId = $m[2];
    $health = db_health();
    if ($health === null) {
        json_response(['error' => 'User store unavailable (MariaDB unreachable)'], 503);
    }
    try {
        $pdo = db();
        // Self-protection: cannot disable your own account
        if (!empty($body['status']) && $body['status'] === 'disabled' && $userId === current_user()) {
            json_response(['error' => 'You cannot disable your own account'], 409);
        }
        $fields = [];
        $params = [];
        foreach (['name', 'email', 'status'] as $col) {
            if (isset($body[$col]) && is_string($body[$col])) {
                if ($col === 'status' && !in_array($body['status'], ['active', 'invited', 'disabled'], true)) {
                    json_response(['error' => 'Invalid status value'], 422);
                }
                $fields[] = "{$col} = ?";
                $params[] = $body[$col];
            }
        }
        if (empty($fields)) {
            json_response(['error' => 'No valid fields to update (name, email, status)'], 422);
        }
        $params[] = $userId;
        $pdo->prepare('UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
        $rowStmt = $pdo->prepare('SELECT id, name, email, status, created_at FROM users WHERE id = ?');
        $rowStmt->execute([$userId]);
        $row = $rowStmt->fetch();
        if (!$row) json_response(['error' => 'User not found'], 404);
        $rolesStmt = $pdo->prepare('SELECT role_key FROM user_roles WHERE user_id = ?');
        $rolesStmt->execute([$userId]);
        $roles = array_column($rolesStmt->fetchAll(), 'role_key');
        json_response(['user' => ['id' => $row['id'], 'name' => $row['name'], 'email' => $row['email'], 'status' => $row['status'], 'roles' => $roles, 'created_at' => $row['created_at']]]);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error', 'detail' => $e->getMessage()], 500);
    }
}

if ($method === 'POST' && preg_match('#^/(api/)?v1/users/([^/]+)/roles$#', $path, $m)) {
    require_user_management('manage');
    $body = json_body();
    $roleKey = $body['role_key'] ?? '';
    if (!is_string($roleKey) || !is_allowed_role_key($roleKey)) {
        json_response(['error' => 'Invalid or missing role_key'], 422);
    }
    $userId = $m[2];
    $health = db_health();
    if ($health === null) {
        json_response(['error' => 'User store unavailable (MariaDB unreachable)'], 503);
    }
    try {
        $pdo = db();
        $check = $pdo->prepare('SELECT id FROM users WHERE id = ?');
        $check->execute([$userId]);
        if (!$check->fetch()) json_response(['error' => 'User not found'], 404);
        $pdo->prepare('INSERT IGNORE INTO user_roles (user_id, role_key, project_id) VALUES (?, ?, NULL)')
            ->execute([$userId, $roleKey]);
        $rolesStmt = $pdo->prepare('SELECT role_key FROM user_roles WHERE user_id = ?');
        $rolesStmt->execute([$userId]);
        $roles = array_column($rolesStmt->fetchAll(), 'role_key');
        json_response(['user' => ['id' => $userId, 'roles' => $roles], 'message' => "Role {$roleKey} assigned."]);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error', 'detail' => $e->getMessage()], 500);
    }
}

if ($method === 'POST' && preg_match('#^/(api/)?v1/users/([^/]+)/roles/([^/]+)/remove$#', $path, $m)) {
    require_user_management('manage');
    $userId = $m[2];
    $roleKey = $m[3];
    if (!is_allowed_role_key($roleKey)) {
        json_response(['error' => 'Invalid role_key'], 422);
    }
    // Self-protection: cannot remove your own last role
    if ($userId === current_user()) {
        json_response(['error' => 'You cannot remove roles from your own account via this endpoint'], 409);
    }
    $health = db_health();
    if ($health === null) {
        json_response(['error' => 'User store unavailable (MariaDB unreachable)'], 503);
    }
    try {
        $pdo = db();
        // Ensure the user exists and has at least one role remaining
        $countStmt = $pdo->prepare('SELECT COUNT(*) FROM user_roles WHERE user_id = ?');
        $countStmt->execute([$userId]);
        $count = (int)$countStmt->fetchColumn();
        if ($count === 0) json_response(['error' => 'User not found or has no roles'], 404);
        $pdo->prepare('DELETE FROM user_roles WHERE user_id = ? AND role_key = ?')->execute([$userId, $roleKey]);
        $rolesStmt = $pdo->prepare('SELECT role_key FROM user_roles WHERE user_id = ?');
        $rolesStmt->execute([$userId]);
        $roles = array_column($rolesStmt->fetchAll(), 'role_key');
        json_response(['user' => ['id' => $userId, 'roles' => $roles], 'message' => "Role {$roleKey} removed."]);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error', 'detail' => $e->getMessage()], 500);
    }
}

json_response(['error'=>'Not found','path'=>$path], 404);
