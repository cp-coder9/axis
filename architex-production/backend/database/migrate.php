<?php
/**
 * Architex OS — migration runner.
 *
 * Applies backend/database/migrations/*.sql in filename order against the
 * configured MariaDB database, tracking applied files in `schema_migrations`.
 * Idempotent: already-applied migrations are skipped.
 *
 * Usage:  php backend/database/migrate.php
 * Config: backend/config.php (DB_HOST/DB_NAME/DB_USER/DB_PASS env overrides)
 */
declare(strict_types=1);

$config = require __DIR__ . '/../config.php';
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
    fwrite(STDERR, "Migration failed: cannot connect to database: {$e->getMessage()}\n");
    exit(1);
}

$pdo->exec('CREATE TABLE IF NOT EXISTS schema_migrations (
    filename VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');

$applied = $pdo->query('SELECT filename FROM schema_migrations')->fetchAll(PDO::FETCH_COLUMN);
$applied = array_flip($applied);

$dir = __DIR__ . '/migrations';
$files = glob($dir . '/*.sql');
sort($files);

/** Split a .sql file into individual statements (strips -- comments). */
function split_statements(string $sql): array
{
    $lines = preg_split('/\r\n|\r|\n/', $sql);
    $clean = [];
    foreach ($lines as $line) {
        $trimmed = ltrim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '--')) {
            continue;
        }
        $clean[] = $line;
    }
    $statements = array_filter(
        array_map('trim', explode(';', implode("\n", $clean))),
        fn ($s) => $s !== ''
    );
    return array_values($statements);
}

$count = 0;
foreach ($files as $file) {
    $name = basename($file);
    if (isset($applied[$name])) {
        echo "skip  $name (already applied)\n";
        continue;
    }
    $sql = file_get_contents($file);
    $statements = split_statements($sql);
    // NOTE: MySQL/MariaDB DDL triggers implicit commits, so migrations run in
    // autocommit mode (DDL is not transactional on this platform anyway).
    try {
        foreach ($statements as $statement) {
            $pdo->exec($statement);
        }
        $pdo->prepare('INSERT INTO schema_migrations (filename) VALUES (?)')->execute([$name]);
        $count++;
        echo "apply $name (" . count($statements) . " statements)\n";
    } catch (PDOException $e) {
        fwrite(STDERR, "Migration failed in $name: {$e->getMessage()}\n");
        exit(1);
    }
}

$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
echo "Done. Applied $count migration(s). Tables: " . count($tables) . "\n";
