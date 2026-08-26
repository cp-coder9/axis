<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/specforge_repository.php';

$pdo = db();
$identity = [
    'sub' => 'user-demo-architect',
    'role' => 'architect',
    'org' => 'org-demo',
    'projects' => ['proj-camps-bay'],
    'package_names' => [],
];

$workspaceBefore = $pdo->query("SELECT id,revision FROM specforge_workspaces WHERE organization_id='org-demo' AND project_id='proj-camps-bay'")->fetch();
if (!$workspaceBefore || $workspaceBefore['revision'] !== 'P07') throw new RuntimeException('Expected the successful API issue to leave workspace at P07.');
$issueCountBefore = (int) $pdo->query("SELECT COUNT(*) FROM specforge_issues WHERE workspace_id='" . $workspaceBefore['id'] . "'")->fetchColumn();
$jobCountBefore = (int) $pdo->query("SELECT COUNT(*) FROM jobs WHERE JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$.workspace_id'))='" . $workspaceBefore['id'] . "'")->fetchColumn();

$repository = new MariaDbSpecForgeRepository($pdo, function (): void {
    throw new RuntimeException('Injected snapshot persistence failure.');
});

try {
    $repository->createIssue($identity, 'proj-camps-bay', ['title' => 'Rollback proof P07', 'audience' => 'Test'], 'rollback-proof-p07');
    throw new RuntimeException('Expected snapshot persistence failure.');
} catch (RuntimeException $error) {
    if ($error->getMessage() !== 'Injected snapshot persistence failure.') throw $error;
}

$issueCountAfter = (int) $pdo->query("SELECT COUNT(*) FROM specforge_issues WHERE workspace_id='" . $workspaceBefore['id'] . "'")->fetchColumn();
$jobCountAfter = (int) $pdo->query("SELECT COUNT(*) FROM jobs WHERE JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$.workspace_id'))='" . $workspaceBefore['id'] . "'")->fetchColumn();
$commandCount = (int) $pdo->query("SELECT COUNT(*) FROM specforge_commands WHERE idempotency_key='rollback-proof-p07'")->fetchColumn();
$revisionAfter = (string) $pdo->query("SELECT revision FROM specforge_workspaces WHERE id='" . $workspaceBefore['id'] . "'")->fetchColumn();

if ($issueCountAfter !== $issueCountBefore || $jobCountAfter !== $jobCountBefore || $commandCount !== 0 || $revisionAfter !== 'P07') {
    throw new RuntimeException('Snapshot failure did not roll back the complete issue transaction.');
}

echo "SpecForge issue rollback contract passed.\n";
