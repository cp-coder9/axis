<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/specforge_validation.php';

function expect_allowed(array $identity, string $capability, ?array $record = null): void
{
    specforge_require_capability($identity, $capability, $record);
}

function expect_forbidden(array $identity, string $capability, ?array $record = null): void
{
    try {
        specforge_require_capability($identity, $capability, $record);
    } catch (SpecForgeRepositoryError $error) {
        if ($error->httpStatus !== 403) throw $error;
        return;
    }
    throw new RuntimeException("Expected {$identity['role']} to be denied {$capability}.");
}

$base = ['sub' => 'user-1', 'org' => 'org-1', 'projects' => ['project-1']];

expect_allowed($base + ['role' => 'architect'], 'issue');
expect_allowed($base + ['role' => 'quantity_surveyor'], 'review_budget');
expect_forbidden($base + ['role' => 'quantity_surveyor'], 'issue');

$client = $base + ['role' => 'client'];
expect_allowed($client, 'decide', ['project_id' => 'project-1', 'client_decision' => true]);
expect_forbidden($client, 'decide', ['project_id' => 'project-1', 'client_decision' => false]);

$supplier = $base + ['role' => 'supplier', 'package_names' => ['Tiling']];
expect_allowed($supplier, 'view', ['project_id' => 'project-1', 'package_name' => 'Tiling', 'status' => 'issued']);
expect_forbidden($supplier, 'view', ['project_id' => 'project-1', 'package_name' => 'Roofing', 'status' => 'issued']);
expect_forbidden($supplier, 'view', ['project_id' => 'project-1', 'package_name' => 'Tiling', 'status' => 'draft']);

expect_forbidden($base + ['role' => 'quantity_surveyor', 'god_mode' => true], 'issue');
expect_forbidden(array_replace($base, ['role' => 'architect', 'projects' => ['other-project']]), 'view', ['project_id' => 'project-1']);

$errors = specforge_validate_item_payload([
    'code' => '',
    'title' => str_repeat('x', 221),
    'budget_allowance' => -1,
    'estimated_cost' => -2,
    'lead_time_days' => -3,
    'status' => 'invented',
    'source_revision' => 'draft',
]);
foreach (['code', 'title', 'budget_allowance', 'estimated_cost', 'lead_time_days', 'status', 'source_revision'] as $field) {
    if (!isset($errors[$field])) throw new RuntimeException("Expected validation error for {$field}.");
}

echo "SpecForge policy contract passed.\n";
