<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/db.php';

$modules = json_decode((string) file_get_contents(__DIR__ . '/../data/modules.json'), true, 512, JSON_THROW_ON_ERROR);
if (!is_array($modules) || count($modules) !== 47) {
    fwrite(STDERR, "Expected 47 module definitions.\n");
    exit(1);
}
foreach ($modules as $module) {
    $id = (string) ($module['id'] ?? 'unknown');
    $version = $module['version'] ?? null;
    if (!is_string($version) || preg_match('/^\d+\.\d$/', $version) !== 1) {
        fwrite(STDERR, "Module {$id} requires a single-decimal version.\n");
        exit(1);
    }
    $expected = $id === 'specforge' ? '1.1' : '1.0';
    if ($version !== $expected) {
        fwrite(STDERR, "Module {$id} expected version {$expected}, received {$version}.\n");
        exit(1);
    }
}

$rows = db()->query('SELECT id FROM modules ORDER BY id')->fetchAll(PDO::FETCH_COLUMN);
echo json_encode($rows, JSON_THROW_ON_ERROR) . PHP_EOL;
