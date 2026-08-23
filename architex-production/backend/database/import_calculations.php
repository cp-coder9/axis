<?php
/** One-time calculation importer. Dry-run is the default; it never guesses flattened units. */
declare(strict_types=1);
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/calculation_validation.php';

$apply = in_array('--apply', $argv, true);
$source = __DIR__ . '/../data/offline/calculations.json';
$records = json_decode((string)file_get_contents($source), true, 512, JSON_THROW_ON_ERROR);
$report = ['source'=>$source, 'sha256'=>hash_file('sha256',$source), 'total'=>count($records), 'valid'=>0, 'conflicts'=>[], 'writes'=>0];
foreach ($records as $record) {
    $errors = validate_engineering_payload($record);
    if ($errors) { $report['conflicts'][] = ['id'=>$record['id'] ?? null, 'reason'=>'Legacy flattened calculation requires an explicit professionally reviewed quantity conversion map.', 'field_errors'=>$errors]; continue; }
    $report['valid']++;
}
if ($apply && $report['conflicts']) { fwrite(STDERR, json_encode($report, JSON_PRETTY_PRINT) . PHP_EOL); exit(2); }
if ($apply && $report['valid'] > 0) { fwrite(STDERR, "Apply is intentionally unavailable until a reviewed conversion map exists.\n"); exit(2); }
echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
