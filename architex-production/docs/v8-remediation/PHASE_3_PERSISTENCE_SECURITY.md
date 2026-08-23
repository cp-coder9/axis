# Phase 3 MariaDB Persistence, API Security, and RBAC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make MariaDB the canonical, tenant-isolated calculation-record store and provide complete, validated, idempotent engineering API lifecycle operations.

**Architecture:** Engineering routes depend on a calculation repository contract whose production implementation uses PDO and MariaDB transactions. Every query is constrained by authenticated organization identity and, when `project_id` is non-null, project access; routes apply explicit engineering permissions and request schemas before invoking the repository. Existing JSON calculations are imported once with a checksum and retained only as a non-writable offline fixture.

**Tech Stack:** PHP 8.x strict types, PDO, MariaDB/InnoDB, guarded SQL migrations, HS256 bearer identity, TypeScript 5.9 API contracts, Vitest contract tests, and PHP HTTP/repository integration tests launched by fail-fast PowerShell scripts.

## Global Constraints

- Engineering safety and data integrity take precedence over visual work.
- MariaDB is the only writable calculation-record source of truth.
- `backend/database/migrations/009_calculation_records.sql` is treated as potentially applied and is never edited; schema remediation is additive in migration `010`.
- JSON calculation data may remain only as an explicit offline/demo fixture and is never consulted by production engineering routes.
- Calculation definitions remain pure and independent from React and persistence.
- All route identity derives from `current_identity()`; payload-supplied author, organization, role, and review actor values are rejected or ignored as specified below.
- Project calculations use an exact `project_id` contract; the legacy `project` query key is removed in the same coordinated frontend/backend release.
- Lifecycle changes, record updates, and audit rows are committed in one MariaDB transaction.
- Professional approval is a human authorization action; God Mode never changes permission evaluation.
- Phase 2's `EngineeringCalculationPayloadV1` is imported and used verbatim: inputs are `Record<string, QuantityDto>`, results are `CalculationResultDto[]`, and derivation, assumptions, limitations, references, and formula provenance retain the exact frozen types. No route, repository, import, client, or test may flatten quantities to numeric maps or presentation strings.
- A professional review decision requires a discipline-competent, independently registered reviewer whose verified registration matches the calculator ownership matrix. The author can never decide their own review. `admin`, `firm_admin`, or `platform_admin` status alone is never professional competence.
- Every requirement, implementation step, test case, and evidence item uses its stable `V8-P3-*` identifier in test names, CI output, migration/import reports, and release evidence.
- Program finding mapping is mandatory: `V8-C02` maps to repository/cutover Tasks 1-2 and 5; `V8-H02` to update/idempotency Tasks 2-4; `V8-H03` to derivation Tasks 3-4 and 6; and `V8-H04` to validation/RBAC/lifecycle Tasks 1-4 and 7-8. Tests and evidence include both local and program IDs.
- Existing unrelated JSON-backed foundation modules are not migrated in this phase.

---

## Executive Summary

The V8 backend is structurally present but not production-safe. Migration `009_calculation_records.sql` creates a table, while all implemented calculation routes still read and mutate `backend/data/foundation.json`. The route set omits derivation retrieval, accepts weakly validated payloads, has no engineering-specific permission checks, does not constrain standalone records by organization, and unconditionally changes any record to `under_review` without transition or idempotency checks.

This phase introduces an additive schema, a repository boundary, secure route handlers, deterministic lifecycle rules, one-time JSON import, and MariaDB-backed integration evidence. It also extends the client contract with update and derivation methods so Phase 4 can distinguish create, update, save, and review without duplicating records.

## Objectives

1. Make MariaDB authoritative for calculation create, update, list, read, derivation, review, and approval decisions.
2. Complete all five V8 operations: list, create, get, review, and derivation.
3. Add a supporting `PATCH` operation for controlled saved-record updates without changing the five-operation V8 parity claim.
4. Enforce authenticated identity, organization tenancy, project access, and engineering RBAC on every route.
5. Define `project_id` behavior for project-connected and standalone records.
6. Validate calculator type, inputs, results, derivation, links, lifecycle transitions, optimistic concurrency, and idempotency.
7. Import existing JSON records exactly once and remove JSON from the production read/write path.
8. Prove behavior against MariaDB through repository and HTTP integration suites.

## V8 Requirement Coverage

| Source requirement | Current implementation state | Planned task | Required acceptance evidence |
|---|---|---|---|
| `V8-P3-REQ-001` calculation table | Partial `009` schema | `V8-P3-T01`, `V8-P3-T02` | Fresh/upgrade/preflight/partial-DDL recovery and exact schema pass |
| `V8-P3-REQ-002` list operation | JSON-backed with legacy query key | `V8-P3-T03`, `V8-P3-T04` | Canonical tenant/project-scoped list passes |
| `V8-P3-REQ-003` create operation | Weak JSON write | `V8-P3-T03`, `V8-P3-T04` | Unit-bearing DTO validation and idempotent create pass |
| `V8-P3-REQ-004` get operation | Incomplete scope | `V8-P3-T03`, `V8-P3-T04` | Same-tenant get and hidden denied IDs pass |
| `V8-P3-REQ-005` review operation | Unguarded transition | `V8-P3-T03`, `V8-P3-T04` | Independent registered discipline reviewer matrix passes; author/admin-only decisions fail |
| `V8-P3-REQ-006` derivation operation | Missing | `V8-P3-T03`, `V8-P3-T04` | `string[]` derivation and immutable provenance return under get scope |
| `V8-P3-REQ-007` frontend client | Incomplete/legacy key | `V8-P3-T06` | Exact Phase 2 DTO and canonical methods typecheck |
| `V8-P3-REQ-008` persistence boundary | JSON is still writable | `V8-P3-T02`, `V8-P3-T04`, `V8-P3-T05` | No production JSON path; import manifest reconciles |
| `V8-P3-REQ-009` identity/tenancy/RBAC | Engineering grants absent | `V8-P3-T01`, `V8-P3-T03`, `V8-P3-T04` | Signed-JWT matrix, exact `ROLE_TOOL_MAP` parity, and qualification gates pass |
| `V8-P3-REQ-010` lifecycle/idempotency | Missing | `V8-P3-T01`-`V8-P3-T04` | Concurrency/replay/transition/audit assertions pass |
| `V8-P3-REQ-011` MariaDB API tests | Static smoke only | `V8-P3-T07`, `V8-P3-T08` | `npm run test:api` provisions, tests, and removes its isolated schema |

## Exact Current Evidence

| File and lines | Verified evidence | Consequence |
|---|---|---|
| `backend/database/migrations/009_calculation_records.sql:1-19` | Table has nullable `project_id`, LONGTEXT inputs/results, status enum, author, three link fields, and only project/author indexes; no `organization_id`, actor FKs, lock version, review metadata, or idempotency key | Existing table cannot independently enforce tenancy or safe concurrent lifecycle changes |
| `backend/lib/db.php:6-8` | Comment explicitly says JSON fixtures remain the API write path until the PDO repository milestone | Repository milestone is not implemented |
| `backend/public/index.php:1272-1278` | List reads `$store['calculations']` from `foundation.json` and uses query key `project` | MariaDB rows are ignored and API differs from the documented `project_id` contract |
| `backend/public/index.php:1281-1315` | Create accepts arrays without field/range checks, accepts client status, writes JSON, and records author from identity | Record structure and lifecycle can be malformed; table is unused |
| `backend/public/index.php:1318-1325` | Get scans JSON; standalone records receive no organization filter | A standalone record ID is not tenant-isolated by storage query |
| `backend/public/index.php:1328-1343` | Review changes every found record directly to `under_review` with no permission, current-state, concurrency, or replay guard | Invalid and duplicate transitions are possible |
| `backend/public/index.php:1268-1344` | No derivation route exists | Only four of five V8 operations are implemented |
| `backend/public/index.php:17-39,182-246` | General RBAC exists, but `engineering_calc` is absent from `$moduleActionMap` and no engineering permission strings exist in fallback permissions | Calculation routes cannot use data-driven engineering RBAC correctly |
| `backend/public/index.php:140-176` | Local headers are accepted only in explicit local mode; non-local mode requires a signed JWT containing subject, role, org, and projects | Existing identity primitive is reusable but must be applied consistently |
| `backend/public/index.php:282-287` | Project access checks token project claims only | Repository queries must additionally join projects to the authenticated organization |
| `backend/database/migrations/001_core_schema.sql:4-53` | Users and projects carry `organization_id`; `user_roles` can be project-scoped | Tenant and project authorization can be anchored in MariaDB |
| `backend/data/foundation.json:525-549` | One calculation fixture exists, already `under_review`, with review metadata | Import must preserve IDs, timestamps, links, and review metadata without replaying lifecycle actions |
| `lib/api.ts:257-295` | Client type exists; list uses `?project=`, and update/derivation/approval actions are absent | Client must be synchronized with the route contract |
| `backend/tests/smoke.php:54-60` | Smoke coverage only checks route fragments and does not include engineering routes | Current tests cannot detect JSON persistence, authorization, or transition failures |

## Scope

- Additive MariaDB schema hardening for calculation records and command idempotency.
- A PHP calculation repository interface and PDO/MariaDB implementation.
- Thin engineering HTTP routes for five V8 operations and one supporting update operation.
- Request/response schema validation and calculator registry validation against the 17 canonical `calc_type` values.
- Identity, organization, project, permission, ownership, review-role, and lifecycle enforcement.
- Optimistic locking via integer `lock_version` and `If-Match`.
- Idempotency via required `Idempotency-Key` on create and review commands.
- One-time JSON-to-MariaDB import with dry-run, checksum, conflict report, and archive manifest.
- Frontend API type/client parity.
- MariaDB repository and HTTP integration tests plus smoke-test assertions.

## Explicit Non-Scope

- Correcting engineering formulas or golden values; Phase 2 owns calculation correctness.
- Calculator UI workflow, inspector, link picker, and accessibility; Phase 4 owns these surfaces.
- Migrating passports, documents, meetings, RFIs, audit views, or other foundation modules from JSON.
- Replacing the existing JWT implementation or introducing an external identity provider.
- File/blob attachment storage; this phase persists record relationships only.
- Visual redesign or semantic-token migration.
- Automatic professional approval.

## Prerequisites and Dependencies

- Phase 0 containment remains active for calculators not professionally validated.
- Phase 2 publishes the canonical 17 `calc_type` identifiers and the persisted output schema before Task 3 is merged.
- MariaDB test and staging databases are available through `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASS`.
- Migrations `001` through `009` have been applied in staging; Task 1 also proves a clean install from zero.
- Seeded users referenced by imported JSON records exist, or the import fails with an explicit missing-user report.
- Phase 4 starts only after Milestone P3.3 freezes the API and workflow-state contracts.

## Architecture and Data Flow

```text
Next.js engineering client
  -> Authorization + Idempotency-Key + If-Match
  -> PHP route schema/RBAC gate
  -> CalculationRepository interface
  -> MariaDbCalculationRepository
  -> transaction: calculation_records + calculation_commands + audit_log
  -> tenant-safe DTO
  -> EngineeringCalcModule / engineering inspector

One-time migration only:
foundation.json calculations
  -> import_calculations.php --dry-run
  -> validation + SHA-256 manifest
  -> import_calculations.php --apply
  -> MariaDB rows
  -> offline fixture archive; never loaded by engineering routes
```

### Canonical Phase 2 Persisted DTO

Phase 3 imports the following Phase 2 declarations from `lib/types.ts`; this excerpt is reproduced verbatim to freeze the handoff and must not be redeclared with weaker or renamed shapes:

```ts
export type EngineeringCalculationSchemaVersion = 'engineering-calculation/v1';

export interface QuantityDto {
  value: number;
  unit: UnitCode;
}

export interface CalculationResultDto {
  key: string;
  label: string;
  quantity: QuantityDto;
  passes: boolean | null;
  criterion: string | null;
}

export interface StandardReferenceDto {
  id: string;
  title: string;
  edition: string;
  clause: string | null;
  url: string | null;
}

export interface EngineeringCalculationPayloadV1 {
  schemaVersion: 'engineering-calculation/v1';
  calculatorId: CalculatorId;
  formulaVersion: string;
  inputs: Record<string, QuantityDto>;
  results: CalculationResultDto[];
  derivation: string[];
  references: StandardReferenceDto[];
  assumptions: string[];
  limitations: string[];
}
```

The API/repository record uses those exact types:

```ts
interface ApiCalculationRecord extends EngineeringCalculationPayloadV1 {
  id: string;
  organization_id: string;
  project_id: string | null;
  calc_type: CalculatorId;
  status: 'saved' | 'under_review' | 'approved';
  author_id: string;
  linked_drawing_ref: string | null;
  linked_meeting_id: string | null;
  linked_rfi_id: string | null;
  review_requested_by: string | null;
  review_requested_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  lock_version: number;
  created_at: string;
  updated_at: string;
}
```

`organization_id` is server-owned and never accepted as a writable request field. `lock_version` is a positive integer and timestamps are RFC 3339 strings. `calc_type` equals `EngineeringCalculationPayloadV1.calculatorId`; all formula/reference provenance and quantity units round-trip unchanged. Validation rejects numeric-only inputs, stringified results, scalar derivation, missing provenance, unknown units, and calculator-ID mismatch.

The additive MariaDB mapping is exact and test-visible:

| DTO field | MariaDB storage |
|---|---|
| `calc_type` and `calculatorId` | Existing `calc_type`; repository emits both equal values and rejects unequal request values |
| `inputs: Record<string, QuantityDto>` | Existing `inputs_json` LONGTEXT containing the quantity-object map |
| `results: CalculationResultDto[]` | Existing `results_json` LONGTEXT containing the structured result array |
| `derivation: string[]` | Existing `derivation_text` upgraded to LONGTEXT and containing a JSON string array; legacy scalar text is an import conflict, never silently split |
| `assumptions: string[]` | Additive `assumptions_json` LONGTEXT |
| `limitations: string[]` | Additive `limitations_json` LONGTEXT |
| `references: StandardReferenceDto[]` | Additive `references_json` LONGTEXT |
| `formulaVersion: string` | Additive `formula_version VARCHAR(80)` |

Every JSON-backed field is validated before write and decoded with `JSON_THROW_ON_ERROR`; schema/repository tests assert the decoded DTO equals the input DTO exactly.

`draft` remains a frontend working-copy state and is not persisted by create. Existing imported `draft` rows are normalized to `saved` and reported in the import manifest. Existing imported `under_review` and `approved` rows retain their state and metadata.

### Exact `project_id` Contract

| Operation | Contract |
|---|---|
| Create | `project_id` is required and is either a non-empty existing project ID or JSON `null`. Omission is `422`. A non-null ID must belong to the identity organization and be in identity project claims. `null` creates an organization-owned standalone record. |
| List | Canonical filter is `project_id`. A non-empty value lists that accessible project. Omission lists standalone (`project_id IS NULL`) records for non-platform roles and all current-organization records for `platform_admin`. The legacy `project` key returns `400` with `Use project_id`. |
| Get/derivation/review/update | Scope derives from the stored row. Non-null projects require organization and project access. Null projects require matching organization and either authorship or an engineering review/admin permission. Unauthorized and cross-tenant IDs return `404` to avoid record enumeration. |
| Attach/detach in update | `project_id` may change only while status is `saved`. Null to project requires project access. Project to null or project to another project requires `engineering.manage`; every change is audited. |

### Endpoint and Lifecycle Contract

| Method and path | Permission | Behavior |
|---|---|---|
| `GET /api/v1/engineering/calculations?project_id={id}` | `engineering.view` | Tenant-safe list; returns `{calculations,count}` |
| `POST /api/v1/engineering/calculations` | `engineering.save` | Creates one `saved` record; requires `Idempotency-Key`; returns `201` or replayed `200` with `idempotent:true` |
| `GET /api/v1/engineering/calculations/{id}` | `engineering.view` | Returns `{calculation}` under stored-row scope |
| `POST /api/v1/engineering/calculations/{id}/review` | `engineering.review.request` for `submit`; `engineering.review.decide` plus the independent credential gate for `approve`/`return` | `submit`: saved -> under_review; qualified non-author `approve`: under_review -> approved; qualified non-author `return`: under_review -> saved. Requires `Idempotency-Key` and `If-Match`. |
| `GET /api/v1/engineering/calculations/{id}/derivation` | `engineering.view` | Returns `{id,calc_type,calculatorId,formulaVersion,results,derivation,assumptions,limitations,references,lock_version,updated_at}` with the exact Phase 2 types; no separate derivation store |
| `PATCH /api/v1/engineering/calculations/{id}` | `engineering.save` | Supporting operation: updates inputs/results/derivation/links/project while `saved`; requires `If-Match`; author or `engineering.manage` only |

Allowed replay is exact same idempotency key, actor, route, target, action, and canonical body hash. Reusing a key with different content returns `409`. A stale `If-Match` returns `412` with the current `lock_version`. Valid no-op replay returns the original command response and creates no second audit row.

### Exact Role-Permission and Professional-Decision Matrix

This is the only Phase 3 engineering grant matrix. Its role rows are exactly the roles whose `ROLE_TOOL_MAP` entry contains `engineering_calc`; seed data, fallback permissions, route tests, and frontend visibility are generated from or equality-tested against it.

| Role | view | save | review.request | review.decide | manage |
|---|---:|---:|---:|---:|---:|
| `bep` | yes | yes | yes | no | no |
| `engineer` | yes | yes | yes | yes | no |
| `energy_professional` | yes | yes | yes | yes | no |
| `fire_engineer` | yes | yes | yes | yes | no |
| `cpm` | yes | yes | no | no | no |
| `contractor` | yes | yes | no | no | no |
| `site_manager` | yes | yes | no | no | no |
| `platform_admin` | yes | yes | yes | yes | yes |

`platform_admin` inherits the union of engineering application permissions granted to all non-platform rows and additionally receives `engineering.manage`; wildcard expansion must produce those explicit effective grants in tests. Inheritance grants route capability only. For `approve` or `return`, `engineering.review.decide` is usable only when a current row in additive `engineering_reviewer_credentials` identifies the actor's council, registration number, owner-role discipline, `verified_at`, optional `expires_at`, and an independent `verified_by` actor; it must be active, discipline-compatible with `CALC_REGISTRY[calc_type].ownerRole`, and belong to a reviewer other than the calculation author. The credential verifier cannot be the credential subject. No override exists. Roles absent from the table, including `architect`, `admin`, and `firm_admin`, receive no engineering permission. An administrative title, wildcard, or unverified `users.professional_registration` string never substitutes for the verified credential gate.

## Exact File Map

| Action | File | Responsibility |
|---|---|---|
| Inspect only | `backend/database/migrations/009_calculation_records.sql` | Applied baseline; never modify |
| Create | `backend/database/migrations/010_calculation_repository_security.sql` | Add organization, exact DTO provenance, independently verified reviewer credentials, review/concurrency/idempotency, FKs, and indexes without recreating the table |
| Create | `backend/cli/preflight_calculation_migration.php` | Inspect information schema/data/FKs before DDL, classify clean/complete/known-partial/unknown-partial state, and emit a stable `V8-P3-MIG-*` report |
| Create | `backend/lib/calculation_repository.php` | Define `CalculationRepository` and `MariaDbCalculationRepository`; map rows/JSON; own transactions and tenant-safe SQL |
| Create | `backend/lib/calculation_validation.php` | Canonical calc types, payload limits, finite-number recursion, links, and lifecycle action validation |
| Create | `backend/cli/import_calculations.php` | Dry-run/apply JSON import, conflict detection, checksum, and manifest output |
| Create | `backend/data/calculation-import-mappings.json` | Source-checksum-bound, professionally approved conversion instructions for legacy flattened records |
| Create | `backend/data/offline/calculations.json` | Explicit read-only offline fixture copied from the migrated source record |
| Modify | `backend/data/foundation.json` | Remove the runtime `calculations` collection only after import evidence is accepted |
| Modify | `backend/public/index.php:4-10,17-39,140-246,478-529,1268-1344` | Derive production project claims, require repository/validation, expose headers, add engineering permissions, and replace JSON routes with repository calls |
| Modify | `backend/database/seed.php:33-35,87-95,241-284,301-304` | Seed calculation RBAC and representative tenant/project/standalone records through MariaDB |
| Modify | `backend/lib/db.php:4-9,43` | Remove obsolete JSON-write-path statement and keep calculation health count |
| Modify | `lib/api.ts:28-64,165-184,257-295` | Send idempotency/version headers and expose canonical engineering DTO/client methods |
| Create | `type-tests/engineering-api-contract.ts` | Compile-only exact usage of list/create/get/update/derivation/review DTOs and signatures |
| Create | `backend/tests/calculation_repository_integration.php` | Test SQL mapping, tenant scope, lifecycle, transactions, concurrency, and idempotency |
| Create | `backend/tests/engineering_api_integration.php` | Start an isolated PHP server and test the real five-operation HTTP contract plus update |
| Create | `scripts/test-api.ps1` | Fail-fast isolated-schema setup, migration/seed, signed-JWT test execution, server shutdown, and schema cleanup in `finally` |
| Create | `scripts/verify-phase3.ps1` | Fail-fast named lint/smoke/type/API orchestration |
| Create | `scripts/deploy-phase3.ps1` | Fail-fast staging preflight, backup-ID verification, guarded migration, import, signed-JWT probe, and evidence capture |
| Modify | `package.json` | Add exact `test:api` entry point: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-api.ps1` |
| Modify | `backend/tests/smoke.php:7-10,54-60` | Assert migration/repository/import files and all engineering route fragments exist |
| Create | `docs/v8-remediation/evidence/PHASE_3_RELEASE_EVIDENCE.md` | Record actual migration IDs, checksums, commands, outputs, RBAC results, staging probes, and rollback decision |

## Detailed Task Checklist

### Task 1 (`V8-P3-T01`): Lock the Additive Schema and Upgrade Contract

**Owner:** Backend engineer with MariaDB migration experience  
**Dependencies:** Migrations `001-009`; isolated unique database name ending `_test`  
**Produces:** Upgrade-safe schema for repository, tenancy, review, and idempotency

- [ ] **`V8-P3-T01-RED-01`: Add schema assertions before the migration.** Create `backend/tests/calculation_repository_integration.php` assertions that `calculation_records` has `organization_id`, `lock_version`, review actor/timestamps/note, and a unique `(organization_id, create_idempotency_key)` index; assert `calculation_commands` exists with unique `(organization_id, idempotency_key)`.

Run: `npm run test:api -- -Group migration-schema-red`  
Expected: exit `1` with `Missing column calculation_records.organization_id` against migration `009` only.

- [ ] **`V8-P3-T01-RED-02`: Add migration preflight and partial-state fixtures before DDL.** Test `009` clean state, fully applied `010`, each supported partial prefix, an unknown extra/mismatched column, unresolved organization backfill, and missing FK targets. Preflight must make zero schema/data writes and return non-zero for unknown partial or unsafe data.

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-api.ps1 -Group migration-preflight`  
Expected: named `V8-P3-MIG-*` cases fail until the preflight exists.

- [ ] **`V8-P3-T01-GREEN-03`: Implement preflight before any autocommit DDL.** `backend/cli/preflight_calculation_migration.php` inspects `information_schema`, migration history, duplicate/idempotency data, backfill resolvability, and FK targets. It emits exactly one classification: `clean-009`, `complete-010`, `recoverable-partial-010`, or `unsafe-unknown`; migration execution is blocked unless classification is clean, complete, or a tested recoverable partial state. The deployment script captures this report and backup ID before invoking `migrate.php`.

- [ ] **`V8-P3-T01-GREEN-04`: Create guarded migration `010_calculation_repository_security.sql`.** Add `organization_id`, `lock_version`, `assumptions_json`, `limitations_json`, `references_json`, `formula_version`, review metadata, indexes/FKs, commands, import manifests, and `engineering_reviewer_credentials(user_id,council,registration_number,owner_role,status,verified_at,expires_at,verified_by)` with unique active registration identity and user/verifier FKs; application validation requires `verified_by !== user_id`. Upgrade `derivation_text` to LONGTEXT for its JSON `string[]`. Preserve `inputs_json` for `QuantityDto` objects and `results_json` for `CalculationResultDto[]`. Because MariaDB DDL autocommits, every operation checks information schema and either creates the exact missing object or verifies its exact definition; it never blindly replays `ALTER TABLE`. Supported partial prefixes converge, and unknown/mismatched objects abort before further DDL.

Run: `npm run test:api -- -Group migration-apply`  
Expected: `apply 010_calculation_repository_security.sql` followed by `Done. Applied 1 migration(s).`

- [ ] **`V8-P3-T01-GREEN-05`: Prove clean-install, replay, and partial-DDL recovery.** Run empty-schema and `009 -> 010` upgrades, rerun completed `010`, then inject each documented partial prefix and verify guarded recovery converges to byte-equivalent `SHOW CREATE TABLE` output.

Run: `npm run test:api -- -Group migration-replay-recovery`  
Expected: first run applies `001-010`; second run prints `skip` for every migration and `Done. Applied 0 migration(s).`

- [ ] **`V8-P3-T01-GREEN-06`: Backfill organization deterministically.** Migration `010` derives `organization_id` from the linked project for project rows; standalone legacy rows are assigned only when their author resolves to exactly one organization. Preflight fails before DDL on unresolved or conflicting rows instead of assigning `org-demo` silently, then guarded DDL changes `organization_id` to `NOT NULL`.

Run: `npm run test:api -- -Group migration-schema-complete`  
Expected: exit `0` and `Schema compatibility: PASS (fresh=1 upgrade=1 tenant_backfill=1).`

- [ ] **`V8-P3-T01-COMMIT-07`: Commit the schema contract.**

Run: `git add backend/database/migrations/010_calculation_repository_security.sql backend/tests/calculation_repository_integration.php; if ($?) { git commit -m "feat: harden calculation record schema" }`  
Expected: one commit containing only the additive migration and schema assertions.

### Task 2 (`V8-P3-T02`): Implement the MariaDB Calculation Repository

**Owner:** Backend engineer  
**Dependencies:** Task 1  
**Produces:** `CalculationRepository` methods `list`, `create`, `find`, `updateSaved`, `transitionReview`, and `derivation`

- [ ] **`V8-P3-T02-RED-01`: Write repository contract tests.** Cover byte-equivalent Phase 2 quantity/output DTO round-trip, project/standalone scope, cross-tenant invisibility, author restriction, update locking, transitions, replay/conflict, and rollback when audit insertion fails.

Run: `npm run test:api -- -Group repository-red`  
Expected: exit `1` with `Class MariaDbCalculationRepository not found`.

- [ ] **`V8-P3-T02-GREEN-02`: Define exact repository signatures.** In `backend/lib/calculation_repository.php`, define methods equivalent to `list(array $identity, ?string $projectId, bool $allForPlatform): array`, `create(array $identity, array $record, string $idempotencyKey): array`, `find(array $identity, string $id): ?array`, `updateSaved(array $identity, string $id, array $patch, int $expectedVersion): array`, `transitionReview(array $identity, string $id, string $action, ?string $note, int $expectedVersion, string $idempotencyKey): array`, and `derivation(array $identity, string $id): ?array`.

Run: `php -l backend/lib/calculation_repository.php`  
Expected: `No syntax errors detected in backend/lib/calculation_repository.php`.

- [ ] **`V8-P3-T02-GREEN-03`: Implement tenant-safe prepared SQL and exact DTO mapping.** Every predicate includes organization scope; project rows verify project organization; standalone access applies author/reviewer/manage rules. Decode the complete `EngineeringCalculationPayloadV1` and command responses with `JSON_THROW_ON_ERROR`; never flatten, rename, or synthesize payload fields.

Run: `npm run test:api -- -Group repository-scope`  
Expected: `Repository scope: PASS (same_tenant=8 cross_tenant_hidden=8 project_denied=4).`

- [ ] **`V8-P3-T02-GREEN-04`: Implement transactional commands.** Create and review lock their idempotency key through `calculation_commands`; update/review use `SELECT ... FOR UPDATE`, compare `lock_version`, write the record and MariaDB `audit_log`, increment version once, and commit. Exact command replays return the stored response; hash conflicts return repository conflict status.

Run: `npm run test:api -- -Group repository-commands`  
Expected: `Repository commands: PASS (create_replay=1 review_replay=1 conflicts=2 rollback=1 stale=1).`

- [ ] **`V8-P3-T02-COMMIT-05`: Commit the repository.**

Run: `git add backend/lib/calculation_repository.php backend/tests/calculation_repository_integration.php; if ($?) { git commit -m "feat: add MariaDB calculation repository" }`  
Expected: one commit containing the repository and passing repository tests.

### Task 3 (`V8-P3-T03`): Add Validation, RBAC, and Lifecycle Policy

**Owner:** Backend/security engineer  
**Dependencies:** Phase 2 registry contract; Task 1  
**Produces:** A single validation and authorization policy used by routes and import

- [ ] **`V8-P3-T03-RED-01`: Add invalid-request cases.** Cover unknown/mismatched `calc_type`; omitted `project_id`; numeric-only or wrong-unit input leaves; NaN/Infinity values; malformed `CalcResult`; missing `formulaVersion`, references, assumptions, or limitations; non-array/oversized derivation; unexpected fields; invalid links; payload actor fields; missing command headers; and all invalid transitions.

Run: `npm run test:api -- -Group validation`  
Expected: exit `1` because current create accepts malformed arrays and client status.

- [ ] **`V8-P3-T03-GREEN-02`: Implement exact Phase 2 schema limits.** `schemaVersion` equals `engineering-calculation/v1`; `calc_type` is one of the 17 registry IDs. `inputs` contains 1-100 `QuantityDto` values validated against that definition's field dimension/unit catalogue and is at most 64 KiB. `results` is a non-empty `CalculationResultDto[]`; `derivation`, `assumptions`, and `limitations` are `string[]`; `references` is `StandardReferenceDto[]`; `formulaVersion` is required; and `calculatorId === calc_type`. The complete output is at most 256 KiB and each string array at most 64 KiB encoded. Unknown fields return `422` with `field_errors`.

Run: `php -l backend/lib/calculation_validation.php`  
Expected: `No syntax errors detected in backend/lib/calculation_validation.php`.

- [ ] **`V8-P3-T03-GREEN-03`: Implement the one exact permission matrix.** Add `engineering_calc => engineering` to `$moduleActionMap`; seed and fallback data implement only the table above. Add a parity test that derives engineering-capable roles from `ROLE_TOOL_MAP` and fails on a missing/extra role or grant. Expand `platform_admin` inheritance to explicit effective grants plus `manage`; do not use wildcard as professional evidence.

Run: `npm run test:api -- -Group rbac`  
Expected: `V8-P3-RBAC: PASS` with exact role/grant parity, absent-role denials, and platform inheritance assertions.

- [ ] **`V8-P3-T03-GREEN-04`: Derive production project claims from MariaDB.** Add `projects_for_user(userId, organizationId, role)`: `platform_admin` receives `['*']`; organization-admin roles receive every project in their organization but gain no engineering route grant from that fact; all other roles receive assigned project IDs. Login and refresh call this function. Security matrices use `APP_ENV=test` and signed JWTs with explicit `sub`, `role`, `org`, and `projects` claims so local wildcard cannot mask denial.

Run: `npm run test:api -- -Group project-claims`  
Expected: `Project claims: PASS (member=2 nonmember_denied=2 admin_org_scope=2 cross_org_denied=2).`

- [ ] **`V8-P3-T03-RED-05`: Add professional-decision matrix tests.** For every calculator owner discipline, test matching active independent registration, wrong discipline, expired/unverified registration, author-as-reviewer, `admin`, and unqualified `platform_admin`; both `approve` and `return` use the same gate.

- [ ] **`V8-P3-T03-GREEN-06`: Enforce lifecycle and professional separation.** Create yields `saved`; patch applies only to `saved`; submit is `saved -> under_review`; approve/return require both route permission and verified discipline competence; `reviewer_id !== author_id` without exception. Approved rows are immutable. Replays are idempotent; invalid state returns `409`, permission failure `403`, and professional qualification failure a non-enumerating `403` reason code.

Run: `npm run test:api -- -Group lifecycle-professional-decision`  
Expected: `Lifecycle: PASS (valid=4 invalid=9 immutable=3 idempotent=3).`

- [ ] **`V8-P3-T03-COMMIT-07`: Commit validation and authorization policy.**

Run: `git add backend/lib/calculation_validation.php backend/public/index.php backend/database/seed.php backend/tests/engineering_api_integration.php; if ($?) { git commit -m "feat: secure calculation lifecycle" }`  
Expected: one commit containing schema validation, permission data, and lifecycle tests.

### Task 4 (`V8-P3-T04`): Replace JSON Routes with the Repository and Complete Five-Operation Parity

**Owner:** Backend engineer  
**Dependencies:** Tasks 2 and 3  
**Produces:** Secure HTTP contract with no engineering JSON path

- [ ] **`V8-P3-T04-RED-01`: Add real signed-JWT HTTP tests for all operations.** The `test:api` harness starts the PHP server with `APP_ENV=test`, signs role/org/project JWTs, and asserts status/body/header behavior for list, create, get, review submit/qualified decisions, derivation, and patch. Local identity headers are forbidden in this group.

Run: `npm run test:api -- -Group endpoints`  
Expected: exit `1` with missing derivation `404` or JSON/MariaDB persistence mismatch.

- [ ] **`V8-P3-T04-GREEN-02`: Wire repository dependencies.** Require the two new backend libraries at startup. Add command/version headers, validate the exact Phase 2 DTO, call permission and professional-decision gates, invoke the repository, and map domain errors without exposing SQL messages.

Run: `php -l backend/public/index.php`  
Expected: `No syntax errors detected in backend/public/index.php`.

- [ ] **`V8-P3-T04-GREEN-03`: Implement exact response semantics.** Create returns `Location`, ETag, and `201`; get/update/review return ETag; replay returns `X-Idempotent-Replay`; derivation returns `string[]` plus formula/reference provenance; cross-tenant lookup returns `404`; database outage returns `503` with no JSON fallback.

Run: `npm run test:api -- -Group endpoints`  
Expected: `Endpoints: PASS (v8_operations=5 supporting_patch=1 assertions=46).`

- [ ] **`V8-P3-T04-GREEN-04`: Prove JSON route removal.** Remove the engineering JSON calls and use repository construction once per request.

Run: `rg -n "foundation\.json|read_json_file|mutate_json_file" backend/public/index.php`  
Expected: matches remain for unrelated foundation modules, but no match occurs between the `Engineering Calculation Hub` marker and `User management` marker.

- [ ] **`V8-P3-T04-RED-05`: Preserve local-header compatibility separately.** Add one `local-headers-compatibility` group that runs only with `APP_ENV=local` and proves the documented demo headers still work and are rejected under `APP_ENV=test`. It is not part of any RBAC, tenancy, project-claim, or professional-decision matrix.

Run: `npm run test:api -- -Group local-headers-compatibility`  
Expected: compatibility cases pass without wildcard identity appearing in security-matrix logs.

- [ ] **`V8-P3-T04-COMMIT-06`: Commit endpoint parity.**

Run: `git add backend/public/index.php backend/tests/engineering_api_integration.php; if ($?) { git commit -m "feat: serve calculations from MariaDB" }`  
Expected: one commit containing five V8 operations, supporting patch, and HTTP tests.

### Task 5 (`V8-P3-T05`): Migrate Existing JSON Calculations Once

**Owner:** Backend/data engineer  
**Dependencies:** Tasks 1-3; staging backup  
**Produces:** Repeatable import evidence and non-runtime offline fixture

- [ ] **`V8-P3-T05-RED-01`: Exercise dry-run before importer exists.** Invoke the CLI and require deterministic count/checksum and exact Phase 2 DTO validation.

Run: `npm run test:api -- -Group import-dry-run-red`  
Expected: exit non-zero because the importer does not yet exist.

- [ ] **`V8-P3-T05-GREEN-02`: Implement dry-run and conflict rules.** Validate exact unit-bearing DTOs; legacy flattened records are conflicts requiring an explicit, professionally reviewed conversion map rather than guessed units. Resolve scope, preserve metadata, normalize draft status, and write nothing. The first run against the audited fixture reports `0 valid, 1 conflict, 0 writes`.

Run: `npm run test:api -- -Group import-dry-run`  
Expected before mapping approval: `Dry run: 0 valid, 1 conflict, 0 writes` and a stable SHA-256 source checksum.

- [ ] **`V8-P3-T05-GREEN-03`: Approve the legacy conversion map.** A registered discipline-competent professional and data owner identify every input unit and structured result/provenance field, bind the mapping to the source SHA-256 and record ID, and sign `calculation-import-mappings.json`. Unknown values remain conflicts; the mapping cannot synthesize approval.

Run: `npm run test:api -- -Group import-mapping-approved`  
Expected: `Mapping approvals: PASS (records=1 signatures=2 checksum_match=1)` and dry-run `1 valid, 0 conflicts, 0 writes`.

- [ ] **`V8-P3-T05-GREEN-04`: Implement apply and replay.** `--apply` imports in one transaction and records source checksum, mapping checksum, row count, actor, and timestamp; replay writes zero rows and collision fails before writing.

Run: `npm run test:api -- -Group import-apply-replay`  
Expected: first run `Imported: 1`; second run `Already imported: 1; writes: 0`.

- [ ] **`V8-P3-T05-GREEN-05`: Separate the offline fixture.** Copy the source calculation array to the explicit offline fixture, remove only the runtime key, and prove no production route imports it.

Run: `rg -n "offline/calculations|\['calculations'\]|\"calculations\"" backend --glob "*.php" --glob "*.json"`  
Expected: the offline fixture and importer are the only calculation JSON references; engineering routes have none.

- [ ] **`V8-P3-T05-COMMIT-05`: Commit the one-time importer and fixture separation.**

Run: `git add backend/cli/import_calculations.php backend/data/offline/calculations.json backend/data/foundation.json; if ($?) { git commit -m "feat: migrate calculation JSON records" }`  
Expected: one commit containing importer logic and the explicit offline fixture move.

### Task 6 (`V8-P3-T06`): Synchronize the TypeScript API Contract

**Owner:** Frontend platform engineer  
**Dependencies:** Milestone P3.2 endpoint contract  
**Produces:** Phase 4-ready typed client

- [ ] **`V8-P3-T06-RED-01`: Add compile-time client usage coverage.** Import `QuantityDto`, `CalculationResultDto`, `StandardReferenceDto`, `EngineeringCalculationPayloadV1`, `architexApiEngineering`, `ApiCalculationRecord`, and `CreateCalculationPayload`; construct every exact payload field, exercise all methods, and assert no numeric-map, scalar derivation, renamed field, or presentation-string assignment typechecks.

Run: `npm run typecheck`  
Expected: TypeScript errors report missing client methods and fields before implementation.

- [ ] **`V8-P3-T06-GREEN-02`: Add request metadata support.** Extend API helpers for command/version headers without weakening existing calls; retain one key per logical command retry.

Run: `npm run typecheck`  
Expected: exit `0` with no TypeScript errors.

- [ ] **`V8-P3-T06-GREEN-03`: Implement the exact engineering client.** List uses `project_id`; create/update/get/derivation/review use the imported Phase 2 types verbatim and preserve units, `string[]` derivation, results, references, and formula provenance.

Run: `npx eslint lib/api.ts`  
Expected: exit `0` and no lint findings in `lib/api.ts`.

- [ ] **`V8-P3-T06-COMMIT-04`: Commit the client contract.**

Run: `git add lib/api.ts type-tests/engineering-api-contract.ts; if ($?) { git commit -m "feat: complete engineering API client" }`  
Expected: one commit containing only typed engineering API changes.

### Task 7 (`V8-P3-T07`): Complete MariaDB Integration and Security Evidence

**Owner:** Backend QA/security engineer  
**Dependencies:** Tasks 1-6  
**Produces:** Automated release evidence

- [ ] **`V8-P3-T07-RED-01`: Add isolated fixtures and concurrency workers.** Seed two organizations/projects, authors, independently registered discipline-matched and mismatched reviewers, explicit project claims, project/standalone records, and concurrent transition workers.

Run: `npm run test:api -- -Group all`  
Expected: the suite fails until all matrix cases are asserted and implemented.

- [ ] **`V8-P3-T07-GREEN-02`: Create the exact `test:api` harness.** Add `"test:api": "powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-api.ps1"`. The script accepts `-Group <name>` and `-Preflight`; sets `$ErrorActionPreference='Stop'`; validates required executables and a non-production DB host; creates `architex_v8_api_<process>_<nonce>_test`; sets `APP_ENV=test`, a process-local 32+ byte `JWT_SECRET`, and that `DB_NAME`; runs preflight/migrations/seed; starts PHP as a tracked child; waits for health; runs requested groups with signed JWTs; and in `finally` stops the exact child and drops the exact schema. Setup, test, cleanup, leaked-process, or leaked-schema failure returns non-zero. It never truncates or reuses a shared schema.

- [ ] **`V8-P3-T07-GREEN-03`: Expose a retained-schema lease for Phase 8 only.** Add mutually exclusive `-PrepareRetained -SchemaName <unique_name_ending_test> -LeaseFile <path>` and `-DropRetained -LeaseFile <path>` modes. Prepare validates the suffix/host, creates the exact schema, migrates, seeds, writes a random lease token plus schema/host to the owner-only lease file, and exits without starting a server or dropping the schema. Drop requires the matching lease token, drops only that exact schema, deletes the lease file, and fails on mismatch. Normal `test:api` behavior remains self-cleaning. Unit/integration tests prove arbitrary schema names, missing leases, reused leases, and production hosts fail closed.

- [ ] **`V8-P3-T07-GREEN-03`: Pass the repository suite.** Verify exact DTO round-trip, row counts, audit contents, no duplicate commands, no cross-tenant leakage, and no partial writes inside the harness-created schema.

Run: `npm run test:api -- -Group repository`  
Expected: `Calculation repository integration: PASS` with `0 leaked rows`, `0 duplicate audits`, and exit `0`.

- [ ] **`V8-P3-T07-GREEN-04`: Pass the signed-JWT HTTP suite.** With `APP_ENV=test`, test missing/malformed/expired JWT, every matrix row, explicit project denial, tenant mismatch, Phase 2 DTO validation, operations, transitions, professional registration/discipline/independence, stale version, and idempotency conflict. Local headers are tested only by the separate compatibility group.

Run: `npm run test:api -- -Group security,lifecycle,endpoints`  
Expected: `Engineering API integration: PASS` with at least `90 assertions` and exit `0`.

- [ ] **`V8-P3-T07-GREEN-05`: Preserve fast baseline checks.** Extend smoke tests with exact migration, repository, importer, and five route fragments.

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-phase3.ps1 -Fast`  
Expected: `Architex backend smoke tests passed. Canonical modules: 47` and TypeScript exits `0`.

- [ ] **`V8-P3-T07-COMMIT-06`: Commit integration coverage.**

Run: `git add backend/tests/calculation_repository_integration.php backend/tests/engineering_api_integration.php backend/tests/smoke.php; if ($?) { git commit -m "test: cover engineering persistence security" }`  
Expected: one commit containing only completed backend test coverage.

### Task 8 (`V8-P3-T08`): Stage, Observe, and Freeze the Contract

**Owner:** Backend lead and release engineer  
**Dependencies:** Tasks 1-7  
**Produces:** Staging migration evidence and Phase 4 handoff

- [ ] **`V8-P3-T08-RED-01`: Prove staging has not already claimed the remediated contract.** Run the signed-JWT source probe before deployment; reject legacy JSON, flattened DTO, scalar derivation, or missing ETag behavior.

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy-phase3.ps1 -Database architex_staging -ProbeOnly -ExpectLegacyFailure`  
Expected: exit `1` with at least one pre-deployment mismatch such as `Derivation endpoint missing`, `ETag missing`, or `MariaDB source assertion failed`.

- [ ] **`V8-P3-T08-GREEN-02`: Capture preflight and backup evidence before DDL.** Run preflight before `migrate.php`; record its classification/object manifest, verified backup identifier, migration list, source checksum, row/status totals, and backfill/FK results. `unsafe-unknown` blocks DDL.

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy-phase3.ps1 -Database architex_staging -PreflightOnly -Source backend/data/foundation.json`  
Expected: zero conflicts and a recorded source checksum/count matching the deployment ticket.

- [ ] **`V8-P3-T08-GREEN-03`: Apply guarded migration and import in maintenance mode.** A named fail-fast deployment script reruns preflight, verifies the captured backup ID, applies guarded `010`, reruns preflight expecting `complete-010`, imports once, deploys routes/client, and executes signed-JWT probes. Known partial DDL reruns guarded recovery; unknown state stops for DBA reconciliation.

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy-phase3.ps1 -Database architex_staging -Source backend/data/foundation.json`  
Expected: migration/import exit `0`; MariaDB count equals source valid count plus pre-existing MariaDB rows with no ID conflicts.

- [ ] **`V8-P3-T08-GREEN-04`: Freeze and publish evidence.** Record exact DTO round-trip, role/professional matrix, migration preflight/recovery IDs, manifest ID, test output, and rollback window. Freeze the Phase 2 DTO and lifecycle table for Phase 4.

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy-phase3.ps1 -Database architex_staging -ProbeOnly -RequireRemediated`  
Expected: authenticated staging smoke passes all five V8 operations without fixture fallback.

- [ ] **`V8-P3-T08-COMMIT-05`: Commit completed release evidence.** Populate every field with observed output keyed by `V8-P3-*`; never record expected output as observed output.

Run: `git add docs/v8-remediation/evidence/PHASE_3_RELEASE_EVIDENCE.md; if ($?) { git commit -m "docs: record phase 3 release evidence" }`  
Expected: one commit containing checksums, migration manifest ID, test output, staging probe results, sign-offs, and rollback decision.

## Milestones and Exit Criteria

| Milestone | Estimate | Exit criteria |
|---|---:|---|
| P3.1 Schema and repository contract | 3-4 person-days | Additive migration passes fresh/upgrade runs; repository scope and transaction tests pass |
| P3.2 Secure endpoint parity | 4-5 person-days | Five V8 operations plus patch pass schema, RBAC, tenancy, lifecycle, and idempotency tests |
| P3.3 JSON cutover and client freeze | 2-3 person-days | Import manifest accepted; engineering JSON route references are zero; TypeScript contract passes |
| P3.4 Staging security evidence | 3-6 person-days | Cross-tenant, concurrency, rollback, and staging probes pass; Phase 4 handoff is signed |

## Staffing and Resources

| Role | Allocation | Responsibilities |
|---|---:|---|
| Backend lead | 0.6 FTE | Repository design, route contract, review |
| Backend engineer | 1.0 FTE | Migration, repository, routes, importer |
| Security engineer | 0.3 FTE | RBAC/tenancy threat review and negative tests |
| Frontend platform engineer | 0.25 FTE | TypeScript API parity |
| QA automation engineer | 0.5 FTE | MariaDB and HTTP integration suites |
| DBA/release engineer | 0.25 FTE | Backup, upgrade rehearsal, staging cutover, rollback readiness |

Required resources: isolated and staging MariaDB databases, PHP CLI with PDO MySQL, permission to create/drop unique test schemas, two tenant fixtures, signed test-JWT fixtures with explicit project claims, one separate local-header compatibility fixture, and CI secret injection for database credentials.

## Person-Day Estimate

| Workstream | Person-days |
|---|---:|
| Additive schema and compatibility rehearsal | 2-3 |
| Repository and transaction/idempotency implementation | 3-4 |
| Validation, identity, tenancy, and RBAC | 2-3 |
| Route parity and TypeScript client | 2-3 |
| JSON import/cutover | 1-2 |
| Integration, security, staging, and evidence | 2-3 |
| **Total** | **12-18** |

## Dependencies

| Dependency | Direction | Constraint |
|---|---|---|
| Phase 0 containment | Incoming | Unsafe calculators remain non-controlled regardless of persistence status |
| Phase 2 output contract | Incoming | Persisted calculator IDs and result shape must be frozen before validation is final |
| Phase 4 workflow | Outgoing | Consumes `lock_version`, review actions, links, derivation, and exact save/update semantics |
| Phase 8 release validation | Outgoing | Consumes migration manifest, RBAC matrix, integration output, and rollback evidence |

## Acceptance Criteria

- MariaDB is the only production read/write path for calculation records.
- All five V8 operations exist and are integration-tested, including derivation.
- Supporting patch updates a saved record with optimistic locking and cannot modify under-review or approved records.
- Every route requires authenticated identity and an explicit engineering permission.
- Every repository query constrains `organization_id`; project records additionally require project organization and project claim access.
- `project_id` create/list/attach semantics match the exact contract in this plan.
- Cross-tenant or inaccessible record IDs return tenant-safe `404` and leak no metadata.
- Create and review command retries are idempotent; key reuse with changed content is rejected.
- Invalid lifecycle transitions return `409`; stale versions return `412`; approved records are immutable.
- Existing JSON calculations import once with checksum, row-count, conflict, and timestamp evidence.
- JSON fixtures are offline-only and no engineering production route reads or writes them.
- Repository, signed-JWT HTTP integration, smoke, lint, and typecheck commands pass.
- `npm run test:api` always uses `APP_ENV=test`, signed JWTs with explicit project claims, an isolated schema, and fail-fast cleanup; local headers appear only in the named compatibility test.
- Every professional decision is made by a discipline-competent independently registered non-author; administrative roles alone are insufficient.
- All release artifacts and named tests contain their stable `V8-P3-*` IDs.

## Test and Evidence Plan

| Layer | Evidence | Retention |
|---|---|---|
| `V8-P3-EVID-MIG` Migration | Preflight before DDL, fresh/upgrade, guarded partial recovery, replay no-op, schema assertions | CI artifact and deployment ticket |
| `V8-P3-EVID-REPO` Repository | Exact Phase 2 DTO round-trip, scope, transaction, rollback, locking, idempotency | CI artifact |
| `V8-P3-EVID-HTTP` HTTP | Five operations, patch, response headers/statuses, validation | CI artifact |
| `V8-P3-EVID-SEC` Security | Exact role matrix, signed JWT/project claims, tenant-safe 404, discipline/registration/independence denials | Security review attachment |
| `V8-P3-EVID-DATA` Migration data | Source SHA-256, valid/conflict counts, manifest row, before/after totals | Deployment ticket and database manifest |
| `V8-P3-EVID-STATIC` Static | PHP lint, Vitest/typecheck, smoke, JSON-path and flattening scans | CI log |
| `V8-P3-EVID-STAGE` Staging | Qualified allowed reviewer, denied admin/unqualified reviewer, project/standalone records, derivation/replay | Release evidence bundle |

## Risk Register and Mitigations

| Risk | Likelihood/impact | Mitigation |
|---|---|---|
| Applied migration `009` differs across environments | Medium/high | Never edit `009`; rehearse clean and upgrade paths; inspect information schema before cutover |
| Standalone records leak across organizations | Medium/critical | Mandatory organization column and organization predicate in every repository method; cross-tenant tests |
| JWT project claims use wildcard too broadly | Medium/high | Repository still validates project organization; production role/project assignment review is an exit-gate item |
| DB permissions missing causes permissive fallback | Medium/high | Seed matrix and fallback matrix are tested for equality; production database outage makes engineering writes return `503` rather than falling back |
| Duplicate save/review on retry | High/high | Idempotency command table, canonical request hash, unique keys, and transaction tests |
| Concurrent reviewer decisions overwrite each other | Medium/high | `SELECT FOR UPDATE`, `If-Match`, lock version, and stale-write `412` |
| JSON import silently changes controlled evidence | Low/critical | Dry-run, exact IDs/timestamps, checksum manifest, conflict fail-closed, before/after totals |
| LONGTEXT contains malformed JSON | Medium/high | Validate on write, decode with exceptions on read, corruption test, no partial DTO |
| Administrative wildcard is mistaken for professional competence | Medium/critical | Exact role matrix plus independent registration/discipline gate; author self-decision has no override |

## Rollback and Contingency Strategy

1. Take a verified database backup and JSON checksum before applying `010` or importing.
2. Keep application maintenance mode active during schema/import cutover so no calculation writes race the migration.
3. If preflight reports unknown state, perform no DDL. If DDL stops at a documented partial prefix, rerun preflight and the guarded idempotent migration to converge; otherwise reconcile against the backup in a separate database before any restore decision.
4. If post-deploy API probes fail before any new controlled records are created, roll back application code and restore the pre-cutover database backup plus original `foundation.json` from the deployment artifact.
5. If new MariaDB records exist, do not re-enable JSON writes. Disable engineering write/review routes with the Phase 0 feature gate, keep MariaDB read-only access for evidence recovery, fix forward, and retain audit/command rows.
6. Never down-migrate by dropping calculation/audit/command data in place. A destructive schema rollback requires a restored backup in a separate database and reconciliation approval from the backend lead and DBA.
7. Import replay is safe by source checksum; a failed transaction makes zero rows and can be rerun after the conflict is corrected.

## Deliverables

- Additive migration `010_calculation_repository_security.sql` and compatibility evidence.
- Calculation repository and validation modules.
- Secure five-operation V8 API plus supporting update operation.
- Exact TypeScript engineering API contract.
- JSON dry-run/apply importer, manifest, and offline fixture separation.
- Seeded engineering RBAC matrix.
- Repository and HTTP MariaDB integration suites.
- Security, migration, staging, and rollback evidence bundle.
- Frozen Phase 3 handoff contract for Phase 4.

## Phase Exit Gate

Phase 3 is complete only when the backend lead, security reviewer, QA owner, and DBA jointly confirm all of the following:

- [ ] **`V8-P3-EXIT-001`:** Fresh, upgrade, replay, preflight-before-DDL, and guarded partial-DDL recovery pass; backup restore is exercised.
- [ ] **`V8-P3-EXIT-002`:** `npm run test:api` proves isolated setup/cleanup and signed-JWT tenancy/RBAC/lifecycle/concurrency/idempotency with no skips.
- [ ] **`V8-P3-EXIT-003`:** Five operations, exact Phase 2 DTO, and `string[]` derivation pass staging probes.
- [ ] **`V8-P3-EXIT-004`:** Production routes contain no engineering JSON path and fail closed on MariaDB outage.
- [ ] **`V8-P3-EXIT-005`:** Import checksum/count/status evidence reconciles and offline fixtures are not runtime-loaded.
- [ ] **`V8-P3-EXIT-006`:** Exact `ROLE_TOOL_MAP` permission parity and independent registered discipline-reviewer controls receive security sign-off; self-decision has no override.
- [ ] **`V8-P3-EXIT-007`:** DTO, project rules, transitions, ETag/version, and idempotency are frozen for Phase 4.
- [ ] **`V8-P3-EXIT-008`:** Phase 0 labeling remains until Phase 2 professional validation permits controlled use.
