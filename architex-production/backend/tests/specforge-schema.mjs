import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL('../database/migrations/014_specforge_core.sql', import.meta.url);
const sql = await readFile(migrationUrl, 'utf8');
const repositoryUrl = new URL('../lib/specforge_repository.php', import.meta.url);
const repository = await readFile(repositoryUrl, 'utf8');
const boqMigration = await readFile(new URL('../database/migrations/018_specforge_boq_provenance.sql', import.meta.url), 'utf8');

const requiredTables = [
  'specforge_workspaces',
  'specforge_sections',
  'specforge_items',
  'specforge_item_links',
  'specforge_approvals',
  'specforge_drawing_findings',
  'specforge_issues',
  'specforge_issue_items',
  'specforge_commands',
];

for (const table of requiredTables) {
  assert.match(sql, new RegExp('CREATE TABLE IF NOT EXISTS `?' + table + '`?\\b', 'i'));
}

assert.match(sql, /UNIQUE KEY\s+`?uq_specforge_issue_revision`?\s*\(\s*`?workspace_id`?\s*,\s*`?revision`?\s*\)/i);
assert.match(sql, /UNIQUE KEY\s+`?uq_specforge_command`?\s*\(\s*`?organization_id`?\s*,\s*`?actor_user_id`?\s*,\s*`?route_key`?\s*,\s*`?idempotency_key`?\s*\)/i);
assert.match(sql, /INSERT[\s\S]+INTO\s+role_permissions[\s\S]+ON DUPLICATE KEY UPDATE/i);

for (const capability of ['view', 'edit', 'review_budget', 'decide', 'issue', 'drawing_request', 'site_update', 'govern']) {
  assert.match(sql, new RegExp(`'specforge'\\s*,\\s*'${capability}'`, 'i'));
}

assert.match(repository, /private function rows\(string \$table, string \$organizationId, string \$workspaceId/);
assert.match(repository, /WHERE organization_id=\? AND workspace_id=\? ORDER BY \{\$order\}/);
assert.match(repository, /private function issueReadiness\(string \$organizationId, string \$workspaceId\)/);
assert.match(repository, /private function snapshot\(string \$organizationId, string \$workspaceId\)/);
assert.match(repository, /private function snapshotRows\(string \$table, string \$organizationId, string \$workspaceId\)/);
for (const column of ['quantity', 'unit', 'unit_rate', 'quantity_source_type', 'quantity_source_ref', 'rate_source_type', 'rate_source_ref']) {
  assert.match(boqMigration, new RegExp(`ADD COLUMN ${column}\\b`, 'i'));
}
assert.match(boqMigration, /CHECK\s*\([\s\S]*quantity[\s\S]*unit_rate[\s\S]*quantity_source_ref[\s\S]*rate_source_ref/i);
assert.match(boqMigration, /review_budget[\s\S]*role_key\s+IN\s*\(\s*'architect'\s*,\s*'bep'\s*\)/i);
assert.match(repository, /public function updateBoqLine\([\s\S]*'review_budget'/);

console.log('SpecForge migration contract passed.');
