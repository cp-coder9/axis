import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL('../database/migrations/014_specforge_core.sql', import.meta.url);
const sql = await readFile(migrationUrl, 'utf8');

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

console.log('SpecForge migration contract passed.');
