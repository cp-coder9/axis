import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migrationPath = resolve('backend/database/migrations/012_authentication_sessions.sql');
assert(existsSync(migrationPath), 'migration 012 is missing');

const sql = readFileSync(migrationPath, 'utf8');
for (const table of ['pending_registrations', 'organization_invitations', 'auth_sessions']) {
  assert.match(sql, new RegExp(`CREATE TABLE ${table}\\s*\\(`, 'i'), `missing ${table} table`);
}
assert.match(sql, /pending_verification/i, 'users must support pending verification');
assert.match(sql, /organisation_admin/i, 'organisation_admin role is missing');
assert.match(sql, /token_hash CHAR\(64\) NOT NULL UNIQUE/gi, 'opaque credentials must have unique SHA-256 hashes');
assert.equal((sql.match(/token_hash CHAR\(64\) NOT NULL UNIQUE/gi) ?? []).length, 3, 'all three credential tables require unique token hashes');
assert.equal((sql.match(/expires_at DATETIME NOT NULL/gi) ?? []).length, 3, 'all credentials require expiry');
assert.match(sql, /auth_sessions[\s\S]+revoked_at DATETIME NULL/i, 'refresh sessions require revocation');
assert.match(sql, /organization_invitations[\s\S]+accepted_at DATETIME NULL[\s\S]+revoked_at DATETIME NULL/i, 'invitations require consumption and revocation');
assert.match(sql, /pending_registrations[\s\S]+password_hash VARCHAR\(255\) NOT NULL/i, 'pending registration must retain the password hash until verification');
assert.match(sql, /auth_sessions[\s\S]+FOREIGN KEY \(user_id\) REFERENCES users\(id\) ON DELETE CASCADE/i, 'refresh sessions require cascading user ownership');
assert.match(sql, /INSERT[\s\S]+role_permissions[\s\S]+organisation_admin[\s\S]+admin/i, 'organisation_admin must receive database-backed grants');

console.log('authentication schema contract passed');
