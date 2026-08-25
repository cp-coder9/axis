import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const php = (code, env) => spawnSync('php', ['-r', code], {
  cwd: process.cwd(),
  env: { ...process.env, ...env },
  encoding: 'utf8',
});

const policyCode = `require 'backend/lib/environment_policy.php'; $c=['environment'=>getenv('APP_ENV'),'data_mode'=>getenv('ARCHITEX_DATA_MODE')]; echo architex_data_mode($c);`;
assert.equal(php(policyCode, { APP_ENV: 'production', ARCHITEX_DATA_MODE: 'production' }).stdout, 'production');
assert.equal(php(policyCode, { APP_ENV: 'production', ARCHITEX_DATA_MODE: 'prototype' }).stdout, 'prototype');

const missingMode = php(policyCode, { APP_ENV: 'production', ARCHITEX_DATA_MODE: '' });
assert.notEqual(missingMode.status, 0);
assert.match(`${missingMode.stdout}\n${missingMode.stderr}`, /ARCHITEX_DATA_MODE must be local, prototype, or production/);

const guardCode = `require 'backend/lib/environment_policy.php'; $c=['environment'=>getenv('APP_ENV'),'data_mode'=>getenv('ARCHITEX_DATA_MODE')]; architex_require_demo_seed_allowed($c); echo 'allowed';`;
const production = php(guardCode, { APP_ENV: 'production', ARCHITEX_DATA_MODE: 'production' });
assert.notEqual(production.status, 0);
assert.match(`${production.stdout}\n${production.stderr}`, /Demo seed execution is disabled/);
assert.equal(php(guardCode, { APP_ENV: 'production', ARCHITEX_DATA_MODE: 'prototype' }).stdout, 'allowed');

console.log('data mode process checks passed');
