<?php
// Smoke tests for the Architex PHP API starter.
// Run from repository root: php backend/tests/smoke.php

$root = dirname(__DIR__);
$publicIndex = $root . '/public/index.php';
$modules = $root . '/data/modules.json';
$migration = $root . '/database/migrations/001_core_schema.sql';
$calculatorRelease = $root . '/generated/calculator_release.php';

foreach ([$publicIndex, $modules, $migration, $calculatorRelease] as $file) {
    if (!is_file($file)) {
        fwrite(STDERR, "Missing required file: {$file}\n");
        exit(1);
    }
}

$moduleData = json_decode(file_get_contents($modules), true);
if (!is_array($moduleData) || count($moduleData) < 40) {
    fwrite(STDERR, "Expected at least 40 module definitions in backend/data/modules.json\n");
    exit(1);
}

$sql = file_get_contents($migration);
foreach (['organizations', 'users', 'projects', 'modules', 'project_module_records', 'audit_log', 'jobs'] as $table) {
    if (!preg_match('/CREATE TABLE\\s+' . preg_quote($table, '/') . '\\b/i', $sql)) {
        fwrite(STDERR, "Migration missing CREATE TABLE for {$table}\n");
        exit(1);
    }
}

$foundationMigration = $root . '/database/migrations/002_foundation_modules.sql';
if (!is_file($foundationMigration)) {
    fwrite(STDERR, "Missing foundation migration\n");
    exit(1);
}
$foundationSql = file_get_contents($foundationMigration);
foreach (['project_passports', 'documents', 'document_revisions', 'drawing_register', 'drawing_revisions', 'approvals', 'approval_steps', 'ai_candidates', 'drawing_intelligence_jobs', 'meeting_write_back_log'] as $table) {
    if (!preg_match('/CREATE TABLE\\s+' . preg_quote($table, '/') . '\\b/i', $foundationSql)) {
        fwrite(STDERR, "Foundation migration missing CREATE TABLE for {$table}\n");
        exit(1);
    }
}

if (count($moduleData) !== 47 || !array_filter($moduleData, fn ($module) => ($module['id'] ?? null) === 'meetings')) {
    fwrite(STDERR, "Canonical registry must contain exactly 47 modules including Meetings\n");
    exit(1);
}

if (!array_filter($moduleData, fn ($module) => ($module['id'] ?? null) === 'engineering_calc')) {
    fwrite(STDERR, "Canonical registry must contain engineering_calc (V8 Engineering Calculation Hub)\n");
    exit(1);
}

$apiSource = file_get_contents($publicIndex);
foreach (['/passport', '/documents', '/action-items', '/approvals', '/audit-log', '/drawing-intelligence', '/meetings/'] as $routeFragment) {
    if (!str_contains($apiSource, $routeFragment)) {
        fwrite(STDERR, "API source missing foundation route: {$routeFragment}\n");
        exit(1);
    }
}

$releasePolicy = require $calculatorRelease;
if (!is_array($releasePolicy) || count($releasePolicy) !== 17) {
    fwrite(STDERR, "Generated calculator release policy must contain exactly 17 entries\n");
    exit(1);
}

$repository = $root . '/lib/calculation_repository.php';
$validation = $root . '/lib/calculation_validation.php';
$hardeningMigration = $root . '/database/migrations/010_engineering_calculation_hardening.sql';
foreach ([$repository, $validation, $hardeningMigration] as $file) {
    if (!is_file($file)) {
        fwrite(STDERR, "Phase 3 engineering persistence artifact missing: {$file}\n");
        exit(1);
    }
}
$engineeringStart = strpos($apiSource, "if (\$method === 'GET' && preg_match('#^/(api/)?v1/engineering/calculations\$#'");
$engineeringEnd = strpos($apiSource, '/* ---------- User management', $engineeringStart);
$engineeringRoutes = $engineeringStart === false || $engineeringEnd === false ? '' : substr($apiSource, $engineeringStart, $engineeringEnd - $engineeringStart);
foreach (['engineering_repository()', 'validate_engineering_payload', 'project_id', 'if_match_version()', '/derivation'] as $required) {
    if (!str_contains($engineeringRoutes, $required)) {
        fwrite(STDERR, "Engineering routes missing Phase 3 repository contract: {$required}\n");
        exit(1);
    }
}
if (str_contains($engineeringRoutes, "read_json_file('foundation.json'") || str_contains($engineeringRoutes, "mutate_json_file('foundation.json'")) {
    fwrite(STDERR, "Engineering routes must not read or mutate foundation.json\n");
    exit(1);
}

echo "Architex backend smoke tests passed. Canonical modules: " . count($moduleData) . PHP_EOL;
