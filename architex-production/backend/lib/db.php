<?php
/**
 * Architex OS — PDO connection factory.
 *
 * Shared-hosting compatible: one lazy singleton PDO per request, configured
 * from backend/config.php (env-overridable). JSON fixture stores remain the
 * API's write path until the PDO repository milestone; this layer is the
 * verified bridge to MariaDB.
 */
declare(strict_types=1);

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $config = require __DIR__ . '/../config.php';
    $db = $config['database'];
    $pdo = new PDO(
        sprintf('mysql:host=%s;dbname=%s;charset=%s', $db['host'], $db['name'], $db['charset']),
        $db['user'],
        $db['pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
    return $pdo;
}

/**
 * Database health summary: connectivity, version, and row counts for the
 * seeded core tables. Returns null when the database is unreachable.
 */
function db_health(): ?array
{
    try {
        $pdo = db();
        $version = (string)$pdo->query('SELECT VERSION()')->fetchColumn();
        $counts = [];
        foreach (['organizations', 'roles', 'users', 'projects', 'modules', 'project_passports', 'documents', 'approvals', 'ai_candidates', 'meetings', 'action_items', 'audit_log', 'feedback_submissions', 'drawing_register', 'jobs', 'calculation_records'] as $table) {
            $counts[$table] = (int)$pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
        }
        $migrations = $pdo->query('SELECT COUNT(*) FROM schema_migrations')->fetchColumn();
        return [
            'connected' => true,
            'server_version' => $version,
            'migrations_applied' => (int)$migrations,
            'row_counts' => $counts,
        ];
    } catch (PDOException) {
        return null;
    }
}
