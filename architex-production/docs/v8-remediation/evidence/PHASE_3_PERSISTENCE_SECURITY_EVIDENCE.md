# Phase 3 Persistence and Security Evidence

Status: `BLOCKED — isolated MariaDB persistence, recovery, and independent security evidence are not recorded`

## Local technical record

- `npm run test:api:preflight` validates PHP/PDO availability and rejects non-loopback database hosts unless explicitly allowlisted; it performs no database mutation.
- The retained-schema harness rejects schemas without the `_test` suffix and requires an explicit lease file for retained operation.
- Production authentication-boundary and calculator-containment checks exist, but they do not prove canonical MariaDB durability, restore, tenancy, lifecycle, or full authorization matrices.

## Required before certification

1. Provision an isolated MariaDB schema target with test-only credentials and record host/schema classification.
2. Run migration, seed, repository, HTTP/RBAC, concurrency, backup/restore, and cleanup evidence against that target.
3. Have DBA, QA, and independent security reviewers verify the same evidence set.

No shared or production schema may be used to obtain this evidence.
