# Environment Data Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mechanically separate prototype demonstration data from production and make production reject seed execution and fixture fallback behavior.

**Architecture:** A small PHP environment-policy module converts process configuration into a strict `prototype`, `production`, or `local` data mode. Database seeding and API fallback decisions call this module so production fails closed even if a caller invokes the wrong script or MariaDB is unavailable.

**Tech Stack:** PHP 8.3, MariaDB, Node smoke harness.

## Global Constraints

- `test.architex.co.za` uses `ARCHITEX_DATA_MODE=prototype` and may run the explicit V8 demonstration seeder.
- `architex.co.za` uses `ARCHITEX_DATA_MODE=production` and must reject all demo seed and fixture fallback paths.
- `APP_ENV=local` may use `ARCHITEX_DATA_MODE=local`; every other environment requires an explicit data mode.
- Production permission resolution fails closed when MariaDB is unreachable or grants are absent.
- Production collection routes return errors or truthful empty collections and never fixture records.

---

### Task 1: Central environment policy and seed guard

**Files:**

- Create: `backend/lib/environment_policy.php`
- Create: `backend/tests/environment-policy.php`
- Modify: `backend/config.php`
- Modify: `backend/database/seed.php`
- Modify: `backend/.env.example`

**Interfaces:**

- Produces `architex_data_mode(array $config): string`.
- Produces `architex_demo_data_allowed(array $config): bool`.
- Produces `architex_require_demo_seed_allowed(array $config): void`.
- `backend/config.php` exposes `data_mode`.

- [ ] **Step 1: Write the failing policy test**

Create `backend/tests/environment-policy.php`:

```php
<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/lib/environment_policy.php';

function policy_assert(bool $condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
}

policy_assert(architex_data_mode(['environment' => 'local', 'data_mode' => '']) === 'local', 'local defaults to local data mode');
policy_assert(architex_data_mode(['environment' => 'production', 'data_mode' => 'prototype']) === 'prototype', 'prototype mode is explicit');
policy_assert(architex_demo_data_allowed(['environment' => 'production', 'data_mode' => 'prototype']), 'prototype permits demo data');
policy_assert(!architex_demo_data_allowed(['environment' => 'production', 'data_mode' => 'production']), 'production rejects demo data');

$failedClosed = false;
try {
    architex_data_mode(['environment' => 'production', 'data_mode' => '']);
} catch (RuntimeException) {
    $failedClosed = true;
}
policy_assert($failedClosed, 'non-local environment requires explicit data mode');

echo "environment policy passed\n";
```

- [ ] **Step 2: Run the policy test and verify RED**

Run: `php backend/tests/environment-policy.php`

Expected: FAIL because `backend/lib/environment_policy.php` does not exist.

- [ ] **Step 3: Implement the policy module**

Create `backend/lib/environment_policy.php`:

```php
<?php
declare(strict_types=1);

function architex_data_mode(array $config): string {
    $environment = strtolower(trim((string)($config['environment'] ?? '')));
    $configured = strtolower(trim((string)($config['data_mode'] ?? '')));
    if ($configured === '' && $environment === 'local') return 'local';
    if (!in_array($configured, ['local', 'prototype', 'production'], true)) {
        throw new RuntimeException('ARCHITEX_DATA_MODE must be local, prototype, or production');
    }
    if ($environment !== 'local' && $configured === 'local') {
        throw new RuntimeException('Local data mode is not permitted outside APP_ENV=local');
    }
    return $configured;
}

function architex_demo_data_allowed(array $config): bool {
    return in_array(architex_data_mode($config), ['local', 'prototype'], true);
}

function architex_require_demo_seed_allowed(array $config): void {
    if (!architex_demo_data_allowed($config)) {
        throw new RuntimeException('Demo seed execution is disabled in production data mode');
    }
}
```

Add to the returned array in `backend/config.php`:

```php
'data_mode' => getenv('ARCHITEX_DATA_MODE') ?: '',
```

At the start of `backend/database/seed.php`, after loading configuration, add:

```php
require_once dirname(__DIR__) . '/lib/environment_policy.php';
architex_require_demo_seed_allowed($config);
```

Document `ARCHITEX_DATA_MODE="local"` in `backend/.env.example` with prototype and production hostname examples.

- [ ] **Step 4: Verify GREEN alongside smoke coverage**

Run: `php backend/tests/environment-policy.php`

Expected: `environment policy passed`.

Run:

```powershell
php backend/tests/environment-policy.php
php backend/tests/smoke.php
```

Expected: both commands exit 0. Keeping the policy test as a separate process avoids shared global test helpers and output coupling.

- [ ] **Step 5: Commit**

```powershell
git add backend/lib/environment_policy.php backend/tests/environment-policy.php backend/config.php backend/database/seed.php backend/.env.example
git commit -m "feat: enforce environment data policy"
```

### Task 2: Make API permissions and projects fail closed in production

**Files:**

- Modify: `backend/public/index.php`
- Modify: `backend/tests/auth-boundary-api.mjs`

**Interfaces:**

- Consumes `architex_data_mode()` and `architex_demo_data_allowed()`.
- Production `permissions_for_role()` returns grants only from MariaDB.
- Production `projects()` never returns `fallback_projects()`.

- [ ] **Step 1: Add failing source-contract assertions**

In `backend/tests/auth-boundary-api.mjs`, load `backend/public/index.php` and assert the required source contracts without depending on whitespace or branch formatting:

```js
assert(source.includes("require_once dirname(__DIR__) . '/lib/environment_policy.php';"), 'API must load the environment policy');
assert(source.includes('architex_demo_data_allowed($config)'), 'API fallbacks must be guarded by the environment policy');
assert(source.includes("json_response(['error' => 'Permission store unavailable'], 503)"), 'permissions must fail closed');
assert(source.includes("json_response(['error' => 'Project store unavailable'], 503)"), 'projects must fail closed');
assert(!/ProjectsCache::set\(FALLBACK_PROJECTS\);\s*return FALLBACK_PROJECTS;/.test(source), 'projects cannot use an unconditional fixture fallback');
```

- [ ] **Step 2: Verify RED**

Run: `node backend/tests/auth-boundary-api.mjs`

Expected: FAIL because the API still uses unconditional compiled/fixture fallbacks.

- [ ] **Step 3: Implement fail-closed production behavior**

At the top of `backend/public/index.php` add:

```php
require_once dirname(__DIR__) . '/lib/environment_policy.php';
```

Update the API-process test environment to set `ARCHITEX_DATA_MODE=production`; non-local processes must never rely on an implicit mode.

In `permissions_for_role()`, declare `global $config;`. Replace every database-unavailable or empty-grant fallback with:

```php
if (architex_demo_data_allowed($config)) {
    return $cache[$role] = PERMISSIONS[$role] ?? [];
}
json_response(['error' => 'Permission store unavailable'], 503);
```

In `projects()`, declare `global $config;`. Replace database-unavailable fallback with:

```php
if (architex_demo_data_allowed($config)) return fallback_projects();
json_response(['error' => 'Project store unavailable'], 503);
```

When MariaDB is connected but contains zero visible projects, return `[]`; do not use fixtures.

- [ ] **Step 4: Verify GREEN and regression coverage**

Run:

```powershell
node backend/tests/auth-boundary-api.mjs
php backend/tests/smoke.php
node backend/tests/containment-api.mjs
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit**

```powershell
git add backend/public/index.php backend/tests/auth-boundary-api.mjs
git commit -m "fix: fail closed without production data stores"
```

### Task 3: Verify production rejection and prototype allowance

**Files:**

- Create: `backend/tests/data-mode-process.mjs`
- Modify: `package.json`

**Interfaces:**

- Produces `npm run test:data-policy`.

- [ ] **Step 1: Write the process-level test**

Create `backend/tests/data-mode-process.mjs` that spawns PHP with explicit environment values:

```js
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

const guardCode = `require 'backend/lib/environment_policy.php'; $c=['environment'=>getenv('APP_ENV'),'data_mode'=>getenv('ARCHITEX_DATA_MODE')]; architex_require_demo_seed_allowed($c); echo 'allowed';`;
const production = php(guardCode, { APP_ENV: 'production', ARCHITEX_DATA_MODE: 'production' });
assert.notEqual(production.status, 0);
assert.match(production.stderr, /Demo seed execution is disabled/);
assert.equal(php(guardCode, { APP_ENV: 'production', ARCHITEX_DATA_MODE: 'prototype' }).stdout, 'allowed');
console.log('data mode process checks passed');
```

- [ ] **Step 2: Verify the test passes against Tasks 1 and 2**

Run: `node backend/tests/data-mode-process.mjs`

Expected: `data mode process checks passed`.

- [ ] **Step 3: Add the package script**

Add to `package.json`:

```json
"test:data-policy": "php backend/tests/environment-policy.php && node backend/tests/data-mode-process.mjs && node backend/tests/auth-boundary-api.mjs"
```

- [ ] **Step 4: Run the complete slice gate**

Run:

```powershell
npm run test:data-policy
npm run typecheck
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit**

```powershell
git add backend/tests/data-mode-process.mjs package.json
git commit -m "test: certify prototype and production data modes"
```
