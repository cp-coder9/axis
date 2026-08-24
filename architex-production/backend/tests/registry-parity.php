<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/db.php';

$rows = db()->query('SELECT id FROM modules ORDER BY id')->fetchAll(PDO::FETCH_COLUMN);
echo json_encode($rows, JSON_THROW_ON_ERROR) . PHP_EOL;
