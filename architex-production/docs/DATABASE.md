# MariaDB Persistence Layer

Portable MariaDB 11.4 under `E:\Hermes\mariadb` (binaries, data, config — no
system service dependency), plus the migration/seed tooling that moves the
Architex OS JSON fixtures into a real relational schema.

## Layout

| Path | Purpose |
| --- | --- |
| `E:\Hermes\mariadb\bin`, `share` | Portable MariaDB 11.4.3 runtime (copied from Program Files) |
| `E:\Hermes\mariadb\data` | Database files (initialized with `mariadb-install-db`) |
| `E:\Hermes\mariadb\my-architex.ini` | Server config: port 3306, 127.0.0.1 only, utf8mb4 |
| `backend/database/migrations/*.sql` | Ordered schema migrations, including the Phase 3 calculation hardening and engineering permission grants (`010`, `011`) |
| `backend/database/migrate.php` | Migration runner (tracks `schema_migrations`, idempotent) |
| `backend/database/seed.php` | Idempotent seeder: JSON fixtures → relational tables + RBAC permission matrix |
| `backend/lib/db.php` | PDO singleton + `db_health()` |
| `backend/worker.php` | Cron-polled background job runner (PRD §10.3) |

## Start / stop the database

```bash
# Start (background)
"E:/Hermes/mariadb/bin/mysqld.exe" --defaults-file="E:\Hermes\mariadb\my-architex.ini" --console

# Stop
"E:/Hermes/mariadb/bin/mysqladmin.exe" -u root shutdown
```

## Migrate and seed

```bash
php backend/database/migrate.php   # applies unapplied migrations in order
ARCHITEX_DATA_MODE=prototype ARCHITEX_ENABLE_DEMO_SEED=1 php backend/database/seed.php
# Explicit prototype/local operation only; clears + reseeds all fixture data.
```

Seed counts (from `backend/data/*.json` fixtures): 1 org, 20 roles, 5 users,
2 projects, 47 modules, 1 passport, 3 documents, 2 approvals + 2 steps,
1 AI candidate, 1 meeting, 3 action items, 3 audit entries, 158 role-permission
grants (RBAC matrix, PRD §10.3).

## API integration

- `GET /api/v1/db-health` — live connectivity check: server version,
  migrations applied, and row counts. Returns 503 with a clear message when
  MariaDB is unreachable.
- **MariaDB-backed endpoints (live write path):**
  - `POST /api/v1/auth/login` + `POST /api/v1/auth/refresh` — verifies seeded
    users' `password_hash`, issues HS256 access (1h) + refresh (7d) JWTs.
  - `POST /api/v1/feedback` + `GET /api/v1/feedback` — the feedback FAB's
    submissions land in `feedback_submissions` (PRD §6.3).
- **DB-driven RBAC (PRD §10.3):** `require_permission()` now resolves grants
  from the `role_permissions` table (158 seeded rows); the compiled
  `PERMISSIONS` constant is only a fallback when MariaDB is unreachable.
  Verified: client denied `passport.edit`/`approvals.decide` (403), architect
  allowed (200).
- The remaining API write paths still use the JSON fixture stores
  (`mutate_json_file`) — the PDO repository switchover for those endpoints is
  the next milestone.

## Background jobs (PRD §10.3)

`backend/worker.php` is the shared-hosting-compatible async runner: claim
pending `jobs` rows, run the registered handler, mark done/failed with
`last_error`. Handlers for `transcribe_meeting`, `draft_minutes`,
`ai_drawing_scan`, `ai_feature_brief`, `cluster_feedback` are stubs until
external providers are wired. Cron entry:

```cron
*/2 * * * *  php /path/to/backend/worker.php >> /path/to/worker.log 2>&1
```

Verified: success path (job → done + result_json), failure path (unknown
job_type → failed + last_error + exit code 2), empty run (claimed=0).

## Schema notes / fixes applied

- **003**: `user_roles` originally had `project_id CHAR(36) NULL` *inside* its
  PRIMARY KEY — MariaDB coerces PK columns to NOT NULL, so global role grants
  were impossible. Replaced with a surrogate `id` PK + unique key.
- **004**: the coerced NOT NULL survived migration 003; `MODIFY COLUMN`
  restores nullability for portfolio-wide role grants.
- DDL in MySQL/MariaDB triggers implicit commits, so `migrate.php` runs in
  autocommit mode (no transaction wrapping).
- Fixture cleanup: removed a `user-prod-test` audit entry leaked into
  `foundation.json` by earlier curl verification (FK-invalid actor).

## Connection config

`backend/config.php` reads env overrides: `DB_HOST` (default `localhost`),
`DB_NAME` (`architex_os`), `DB_USER` (`architex_user`), `DB_PASS` (empty —
local dev only; set a real password for any non-local deployment).
