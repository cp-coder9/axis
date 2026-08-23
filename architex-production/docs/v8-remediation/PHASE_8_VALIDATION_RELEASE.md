# Phase 8 Validation, Documentation, and Release Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce reproducible release evidence that the remediated V8 product is functionally correct, professionally validated, MariaDB-durable, authorization-safe, accessible, visually stable, performant, registry-consistent, and accurately documented across all 47 modules.

**Architecture:** Validation is a layered, fail-closed release pipeline. Machine-readable manifests drive registry, module, documentation, and test coverage parity; isolated MariaDB integration tests verify durable behavior; Playwright validates product workflows, accessibility, responsive visuals, and performance against a production build; a generated evidence manifest records exact commands and artifacts. Documentation claims are derived from current evidence and unverified historical completion language is removed before a human go/no-go review.

**Version basis:** Node.js 20+ and PHP 8.1+ are runtime prerequisites. `package.json` declares Next.js `^15.4.9`, React/React DOM `^19.2.1`, Playwright `^1.62.1`, exact TypeScript `5.9.3`, and ESLint `9.39.1`; `package-lock.json` is installation authority. Release validation also requires MariaDB 10/11, the Phase 5 locked `@axe-core/playwright`, and Node standard-library parity/evidence scripts.

## Global Constraints

- This phase is estimated at **12-18 person-days**. The range includes authoring and owner review for 47 distinct module contracts; it is not a shell-open test estimate.
- A green source inspection, typecheck, smoke route-string check, or module-open test is not proof of workflow correctness.
- All **47 modules** must appear with matching IDs and status in the canonical registry, frontend data, React module registry, backend registry, MariaDB registry, shared E2E manifest, and documentation.
- Every one of the **17 engineering calculators** must end in exactly one release-valid outcome: **validated**, with automated golden fixtures and named independent professional approval, or **contained**, with a named owner, reason, user-visible disabled/advisory state, blocked record/review actions, and matching API enforcement. An unsigned calculator may ship only through the contained outcome.
- MariaDB is the canonical calculation-record store; JSON may be an explicit read-only offline/demo fallback but not a second writable source of truth.
- RBAC tests must cover allowed, denied, wrong-tenant, wrong-project, unauthenticated, invalid transition, and God Mode lens cases.
- Accessibility, responsive visual regression, and performance budgets are release gates, not advisory reports.
- Validation runs against a production build and isolated disposable test data; it must not mutate production or shared demo data.
- Test totals, module counts, endpoint lists, migration names, status labels, and completion claims must be generated or mechanically checked.
- A failed mandatory gate, missing artifact, unexplained skip, retry-dependent pass, unsigned fixture attached to a `validated` calculator, or unproved containment parity results in **NO-GO**.
- Phase 8 evidence maps and resolves every program ID `V8-C01`, `V8-C02`, `V8-H01` through `V8-H08`, and `V8-M01` through `V8-M06`; test metadata and the release manifest carry applicable program IDs rather than only Phase 8-local IDs.

---

## Executive Summary

Current evidence is fragmented and contradictory. The 47-module open matrix proves only that each module shell renders. Backend smoke tests inspect files and route strings rather than executing complete MariaDB/RBAC behavior. Playwright is configured only for desktop Chromium. There are no repository-wide axe, visual-regression, or performance suites. Documentation still contains 46-module counts, incomplete migration lists, transient server/process claims, and statements that God Mode and V8 validation are complete despite missing lifecycle, authorization-separation, handoff, professional calculation, and release-quality evidence.

This phase creates one release pipeline with explicit functional, calculation, persistence, security, accessibility, visual, performance, registry, and documentation gates. It validates all 47 modules using per-module contracts rather than generic rendering, reconciles every completion claim to evidence, publishes an operator-ready release runbook, and produces a signed go/no-go record. It performs no deployment; a GO decision authorizes the separately controlled release procedure.

## Phase Objectives

1. Establish a canonical 47-module validation manifest and prove registry parity across every runtime and documentation surface.
2. Validate critical workflows and one meaningful contract for every module, not merely module opening.
3. Classify all 17 calculators: execute signed golden/dimensional/invalid-input suites for each `validated` calculator and prove UI/API containment parity for each `contained` calculator.
4. Prove calculation and governed-record persistence, transactions, lifecycle, idempotency, audit, and recovery against isolated MariaDB.
5. Prove RBAC, tenancy, project scope, authentication, and God Mode non-bypass behavior with positive and negative integration tests.
6. Enforce WCAG-oriented automated and keyboard/focus checks across the shell, globals, all modules, and critical workflows.
7. Establish responsive visual baselines and production performance budgets.
8. Remove false or stale completion claims and mechanically enforce documentation parity.
9. Publish a complete release runbook, rollback procedure, evidence index, and signed go/no-go decision.

## V8 Requirement Coverage

| Source requirement | Current implementation state | Planned task | Required acceptance evidence |
|---|---|---|---|
| Original V8 Phase 7 build/lint | Historical completion text exists | Task 1 | Fresh clean install, lint, typecheck, and production build logs from the release candidate |
| Original V8 Phase 7 all-module Playwright validation | `e2e/app.spec.ts` opens 47 shells and checks for runtime-error text | Task 2 | 47 explicit module contracts plus critical workflow journeys, zero skips/retries |
| Original V8 engineering calculator validation | Structural engine exists; approved golden evidence is not represented by current E2E smoke coverage | Task 3 | Exact 17-ID outcome manifest: each ID either has signed golden/dimensional evidence or named containment reason/owner with UI/API parity |
| Original V8 backend validation | `backend/tests/smoke.php` checks files/source strings; calculation routes still read/write JSON in current evidence | Tasks 4 and 5 | Disposable MariaDB API/repository integration suite proving canonical writes, lifecycle, RBAC, tenancy, idempotency, and audit |
| Original V8 registry completion | Foundation script compares parent `tools.json` and backend JSON at 47; other surfaces and DB are not all checked together | Task 6 | One parity command reports the same ordered 47 IDs/statuses across seven surfaces |
| Approved design layered accessibility validation | No repository-wide axe suite; current Playwright project is desktop Chromium only | Task 7 | All required axe, keyboard, focus, zoom, reduced-motion, and mobile tests pass |
| Approved design visual regression | No committed visual baselines or viewport matrix | Task 8 | Reviewed desktop/tablet/mobile snapshots for shell, globals, all modules, and critical states |
| Approved design performance validation | Historical bundle number exists but no repeatable budget test | Task 9 | Production-build route, bundle, web-vital proxy, and interaction budgets pass in three consecutive runs |
| Approved design documentation parity | Multiple docs still claim 46 modules; V8/production logs overstate completion | Task 10 | Documentation parity script passes; every completion claim links to current evidence or is corrected |
| Approved design release readiness | Deployment guide is configuration-oriented and lacks full evidence/go-no-go mechanics | Tasks 11 and 12 | Rehearsed release/rollback runbook and signed GO decision with no open critical/high blockers |

## Current-State Evidence

Finding IDs are stable and must be used in validator output, evidence records, blocker routing, and `GO_NO_GO.md`.

| Finding ID | Evidence | Exact finding | Release implication |
|---|---|---|---|
| P8-F01 | `e2e/app.spec.ts:41-56` | Iterates 47 IDs, opens each shell, and checks only `Inside <tool>` plus absence of runtime-error text | This is a smoke matrix, not 47-module functional validation |
| P8-F02 | `e2e/rail.spec.ts:301-317` | God Mode has two visibility tests | Existing `production.md` full-verification claim is unsupported |
| P8-F03 | `e2e/app.spec.ts:79-99` | RBAC coverage is one approvals UI case with conditional assertions | Complete endpoint/tenant/project/state authorization remains unproved |
| P8-F04 | `backend/tests/smoke.php:10-62` | Checks file existence, SQL text, module JSON count, and route fragments in PHP source | It does not execute API requests or MariaDB transactions |
| P8-F05 | `scripts/validate-foundation.mjs:13-39` | Checks 47 IDs between parent `tools.json` and backend JSON and all-live status | Frontend registry, React registry, E2E manifest, MariaDB, and docs are outside this parity check |
| P8-F06 | `playwright.config.ts:15-20` | Only Desktop Chrome is configured | Cross-browser and responsive claims cannot be made |
| P8-F07 | `docs/E2E_TESTS.md:3-23` | Says 46 modules and 51 tests | Stale count and test inventory must be corrected |
| P8-F08 | `docs/DATABASE.md:14,37-40` | Migration list stops at 007 and says 46 modules/2 projects | Schema and seed documentation is stale |
| P8-F09 | `docs/MODULE_FUNCTIONALITY.md:3-14` | Claims all 46 modules have complete workflows and zero scaffolds | Count is stale and "complete" lacks per-module evidence |
| P8-F10 | `README.md:56` and `docs/FOUNDATION_BUILD_STATUS.md:8` | State exactly 46 modules | Canonical count parity is false in documentation |
| P8-F11 | `production.md:22-26` | Contains both a 46-module smoke statement and a 47-module foundation statement | The same evidence log contradicts itself |
| P8-F12 | `production.md:66-68` | Claims 100/100 and fully verified God Mode | Totals are transient and current God coverage is incomplete |
| P8-F13 | `docs/V8_ENGINEERING_GODMODE_INTEGRATION_PLAN.md:460` | Calls five backend routes complete, but only four route forms are listed as implemented and current routes use JSON | Completion must be decomposed into implemented, verified, partial, or deferred states |
| P8-F14 | `docs/DEPLOYMENT.md:36-38,116-117` | Describes calculation dual-write/JSON write requirements | This conflicts with the approved MariaDB canonical-store boundary and must be updated after Phase 3 evidence |
| P8-F15 | `next.config.ts:5-7` | Build ignores ESLint | Release pipeline must run lint as an independent mandatory gate before build |

## Scope

- Release-candidate clean install, static analysis, production build, and artifact inventory.
- Meaningful validation contracts for all 47 modules and all critical cross-module workflows.
- Exact 17-calculator outcome classification, signed validation evidence for validated IDs, and UI/API containment parity evidence for contained IDs.
- MariaDB repository/API integration, migration, durability, transaction, concurrency, lifecycle, idempotency, and recovery tests.
- Authentication, RBAC, tenant/project scope, and God Mode non-bypass tests.
- Accessibility checks across shell, globals, 47 modules, and critical transient states.
- Responsive visual regression at mobile, tablet, and desktop widths.
- Production performance and bundle budgets.
- Registry and documentation parity automation.
- Correction of false/stale claims in existing project documentation.
- Release runbook, rollback rehearsal, evidence index, go/no-go checklist, and sign-off.

## Explicit Non-Scope

- Implementing missing Phase 0-7 product behavior inside this validation phase; failures return to the owning phase.
- Rewriting calculator formulas or approving them without the named registered professional.
- Weakening thresholds to make a release candidate pass.
- Deploying to production, changing DNS/TLS, rotating live secrets, or operating a production migration.
- Load testing that could affect shared or production infrastructure.
- Treating visual snapshot updates as automatic acceptance.
- Adding new modules, workflows, permission grants, or a dark theme.
- Preserving historical completion language for narrative convenience when current evidence contradicts it.

## Prerequisites and Dependencies

| Dependency | Required state | Verification command | Blocking condition |
|---|---|---|---|
| Phases 0-7 | Each phase exit gate has linked evidence and no unexplained critical/high finding | `node scripts/validate-phase-gates.mjs` | Any missing/failed gate blocks release validation |
| Calculator outcomes | Each of 17 IDs is either signed `validated` or owner/reason `contained`, with client/server policy parity | `npm run test:calculations:release-status` | Missing ID, contradictory status, unsigned validated ID, or contained ID with record/review access blocks release |
| MariaDB test environment | Disposable unique schema ending `_test` can be created/dropped by test credentials only | `npm run test:api -- -Preflight` | Production/shared schema target, invalid suffix, or insufficient isolation blocks Tasks 4-5 |
| Browsers | Chromium, Firefox, WebKit and configured mobile/tablet emulations installed | `npx playwright install --dry-run` | Missing runtime blocks Tasks 2, 7, and 8 |
| Production server | Assembled `.next/standalone` includes `public` when present and `.next/static`, starts against the isolated API/database, reaches HTTP readiness, and is cleaned up by PID | `npm run release:server:verify` | Missing assets, readiness timeout, early server exit, or surviving PID blocks all browser/performance evidence |
| Documentation ownership | Product, engineering, security, accessibility, DBA, and release owners are named | Review assignment record | Missing sign-off owner blocks Task 12 |

## Architecture and Data Flow

### Layered Release Pipeline

```text
clean install
  -> static quality and production build
  -> phase-gate parity and registry validator RED inventory
  -> calculator signed-validation or containment-parity tests
  -> disposable MariaDB migrate/seed/API integration
  -> production-server functional and RBAC journeys
  -> accessibility and responsive visual suites
  -> performance budgets (three runs)
  -> documentation correction and documentation parity
  -> seven-surface registry parity GREEN assertion
  -> evidence manifest with hashes
  -> human go/no-go review
```

Every layer fails closed. Later layers do not convert an earlier failure into a warning.

### Canonical Module Manifest

`e2e/fixtures/module-contracts.ts` exports 47 explicit entries, one for each current module ID:

`meetings`, `practice`, `wingman`, `engineering_calc`, `planning`, `municipal`, `xa`, `forms`, `specforge`, `bom`, `itp`, `safety`, `feedback`, `project_passport`, `project_explorer`, `professional_directory`, `team_workspace`, `inbox_action`, `issues_rfis`, `approvals_queue`, `compliance_hub`, `environmental_heritage`, `eia_workspace`, `refuse_calculator`, `nhbrc_enrolment`, `documents_drawings`, `survey_geomatics`, `bim_ifc`, `fee_proposal`, `insurance_register`, `rfq_marketplace`, `supplier_catalog`, `market_insights`, `contract_admin`, `payments_escrow`, `dispute_resolution`, `contractor_compliance`, `site_instructions`, `ncr_manager`, `snag_manager`, `fm_bridge`, `council_navigator`, `municipal_tracker`, `remote_desktop`, `cpd_learning`, `admin_review`, and `iconography_registry`.

Each entry names the expected accessible landmark, first tab, one module-specific read assertion, one meaningful safe interaction, its expected state change, and any required role/project fixture. Generic fallback contracts are forbidden.

### MariaDB Isolation

The integration harness rejects database names without the `_test` suffix, creates `architex_os_v8_test`, runs all migrations once, seeds deterministic fixtures, executes each test in a transaction where possible, truncates/reseeds for DDL and concurrency cases, and drops the schema on completion. Tests call HTTP routes through the same API boundary as production; direct SQL is used only to verify durable state, uniqueness, audit rows, and rollback.

### Evidence Manifest

`artifacts/release-evidence/manifest.json` is generated, not hand-edited. It records source revision, timestamp, OS/runtime/browser/database versions, migration set, exact command, exit code, duration, test counts, skips/retries, artifact path, and SHA-256 hash. The directory is a CI/release artifact; only approved compact reports/baselines are committed according to repository policy.

### Release Script Ownership and Dependency Boundary

Phase 8 composes scripts already owned by earlier phases and must not redefine their command bodies:

| Script | Owning phase/path | Phase 8 rule |
|---|---|---|
| `test:unit` | Phase 0, Vitest configuration | Consume unchanged |
| `test:calculations`, `test:calculations:approvals` | Phase 2 calculation registry/fixtures/policy | Consume unchanged |
| `test:calculations:release-status` | Phase 8 `scripts/validate-calculator-release-status.mjs` | Phase 8 owns cross-policy outcome/parity validation but may not modify formulas or approvals |
| `test:api` | Phase 3 backend integration harness | Consume unchanged; filters are passed after `--` |
| `test:god-mode`, `test:god-mode:a11y` | Phase 7 God Mode suites | Consume unchanged |
| `test:e2e:functional`, `test:a11y`, `test:visual`, `test:performance` | Phase 8 Playwright specs | Phase 8 owns these focused selectors |
| `validate:phases`, `validate:registry`, `validate:docs`, `validate:release` | Phase 8 validation scripts | Phase 8 owns fail-fast orchestration and evidence output |
| `release:assemble`, `release:serve`, `release:server:verify`, `release:server:stop` | Phase 8 `scripts/release/*.mjs` | Phase 8 owns standalone assembly, readiness, PID file, and cleanup |
| `evidence:collect`, `evidence:verify` | Phase 8 `scripts/collect-release-evidence.mjs` | Phase 8 owns manifest generation and hash verification |

The Phase 8 `package.json` patch uses these exact command bodies:

| Script | Exact command body |
|---|---|
| `test:calculations:release-status` | `node scripts/validate-calculator-release-status.mjs` |
| `test:e2e:functional` | `playwright test e2e/modules-functional.spec.ts e2e/release-critical.spec.ts e2e/rbac.spec.ts` |
| `test:a11y` | `playwright test e2e/accessibility.spec.ts` |
| `test:visual` | `playwright test e2e/visual.spec.ts` |
| `test:performance` | `playwright test e2e/performance.spec.ts --project=chromium` |
| `validate:phases` | `node scripts/validate-phase-gates.mjs` |
| `validate:registry` | `node scripts/validate-registry-parity.mjs` |
| `validate:docs` | `node scripts/validate-doc-parity.mjs` |
| `validate:release` | `node scripts/validate-release.mjs` |
| `release:assemble` | `node scripts/release/assemble-standalone.mjs` |
| `release:serve` | `node scripts/release/server.mjs serve` (retained-schema lease plus PHP and Next; manual diagnostic use only) |
| `release:server:verify` | `node scripts/release/server.mjs verify` (provision, migrate, seed, start both services, run functional/a11y/visual/performance, teardown) |
| `release:server:stop` | `node scripts/release/server.mjs stop` |
| `evidence:collect` | `node scripts/collect-release-evidence.mjs` |
| `evidence:verify` | `node scripts/collect-release-evidence.mjs --verify` |

Dependency policy is lockfile-preserving: run `npm ci`, never `npm install`, and add no Phase 8 package unless an existing Phase 0-7 dependency cannot perform the required check. Vitest comes from Phase 0/2, Playwright from the existing toolchain, and `@axe-core/playwright` from Phase 7. Release/parity/evidence scripts use Node standard-library APIs. `package-lock.json` must remain byte-identical during Phase 8 unless a separately reviewed dependency decision names the package, exact version, owner, reason, and lockfile diff.

### Exact Standalone Assembly and Process Contract

`scripts/release/assemble-standalone.mjs` implements the equivalent of these exact PowerShell commands after `npm run build`:

```powershell
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath '.next/standalone/server.js')) { throw 'Missing .next/standalone/server.js' }
New-Item -ItemType Directory -Force -Path '.next/standalone/.next' | Out-Null
Remove-Item -LiteralPath '.next/standalone/.next/static' -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -LiteralPath '.next/static' -Destination '.next/standalone/.next/static' -Recurse -Force
if (Test-Path -LiteralPath 'public') {
  Remove-Item -LiteralPath '.next/standalone/public' -Recurse -Force -ErrorAction SilentlyContinue
  Copy-Item -LiteralPath 'public' -Destination '.next/standalone/public' -Recurse -Force
}
```

`scripts/release/server.mjs` is the named owner of the retained-schema lease and both required processes. `npm run release:server:verify` generates a unique name ending `_test`, invokes Phase 3 `test-api.ps1 -PrepareRetained` with a process-local lease file, starts PHP on the rewrite's required `127.0.0.1:8080`, waits for `/api/v1/health`, then starts standalone Next on `3100`. It records both PIDs, fails if either process exits early, runs every browser-dependent gate through this managed stack, and in `finally` terminates both exact children and invokes `-DropRetained` with the same lease:

```powershell
$ErrorActionPreference = 'Stop'
$env:APP_ENV = 'test'
$env:DB_NAME = "architex_v8_release_$PID`_test"
$env:JWT_SECRET = '<process-local 32+ byte test secret>'
$lease = '.next/standalone/.release-db-lease.json'
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-api.ps1 -PrepareRetained -SchemaName $env:DB_NAME -LeaseFile $lease
if (-not $?) { throw 'Disposable database prepare failed' }
$api = Start-Process -FilePath 'php' -ArgumentList '-S','127.0.0.1:8080','-t','backend/public','backend/public/index.php' -WorkingDirectory '.' -PassThru
$env:NODE_ENV = 'production'
$env:HOSTNAME = '127.0.0.1'
$env:PORT = '3100'
$server = Start-Process -FilePath 'node' -ArgumentList 'server.js' -WorkingDirectory '.next/standalone' -PassThru
try {
  Set-Content -LiteralPath '.next/standalone/.release-api.pid' -Value $api.Id -NoNewline
  Set-Content -LiteralPath '.next/standalone/.release-server.pid' -Value $server.Id -NoNewline
  $deadline = (Get-Date).AddSeconds(60)
  do {
    if ($api.HasExited) { throw "PHP API exited early with code $($api.ExitCode)" }
    if ($server.HasExited) { throw "Standalone server exited early with code $($server.ExitCode)" }
    try { $apiReady = (Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8080/api/v1/health' -TimeoutSec 2).StatusCode -eq 200 } catch { $apiReady = $false }
    try { $webReady = (Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:3100/' -TimeoutSec 2).StatusCode -eq 200 } catch { $webReady = $false }
    if (-not ($apiReady -and $webReady)) { Start-Sleep -Milliseconds 500 }
  } until (($apiReady -and $webReady) -or (Get-Date) -ge $deadline)
  if (-not ($apiReady -and $webReady)) { throw 'API or standalone readiness timed out after 60 seconds' }
  npm run test:e2e:functional
  if (-not $?) { throw 'Functional suite failed' }
  npm run test:a11y
  if (-not $?) { throw 'Accessibility suite failed' }
  npm run test:visual
  if (-not $?) { throw 'Visual suite failed' }
  npm run test:performance
  if (-not $?) { throw 'Performance suite failed' }
} finally {
  if (-not $server.HasExited) { Stop-Process -Id $server.Id -Force }
  if (-not $api.HasExited) { Stop-Process -Id $api.Id -Force }
  Wait-Process -Id $server.Id -ErrorAction SilentlyContinue
  Wait-Process -Id $api.Id -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath '.next/standalone/.release-api.pid' -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath '.next/standalone/.release-server.pid' -Force -ErrorAction SilentlyContinue
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-api.ps1 -DropRetained -LeaseFile $lease
  if (-not $?) { throw 'Disposable database cleanup failed' }
}
```

The Node implementation must preserve these semantics on CI. The retained lease is the only supported handoff between provisioning and teardown; Phase 3 `-Preflight` alone never creates or retains a schema. It may not use a dev server, assume an externally running API/database, detach either process, perform port-only cleanup, or use wildcard process termination. Functional, accessibility, visual, and performance suites receive `E2E_BASE_URL=http://127.0.0.1:3100` only after both readiness checks succeed.

## Exact File Map

| Action | Exact path | Responsibility |
|---|---|---|
| Create | `e2e/fixtures/module-contracts.ts` | Explicit functional/accessibility contract for each of 47 modules |
| Modify | `e2e/app.spec.ts` | Consume canonical contract manifest; retain shell smoke as a distinct suite |
| Create | `e2e/modules-functional.spec.ts` | Execute 47 module-specific read/interaction contracts |
| Create | `e2e/release-critical.spec.ts` | Project, document, approval, meetings, calculation, God Mode, and navigation journeys |
| Create | `e2e/rbac.spec.ts` | Allowed/denied/tenant/project/auth/state/God-lens browser/API cases |
| Create | `e2e/accessibility.spec.ts` | Axe, keyboard, focus, zoom, reduced-motion, and landmark checks |
| Create | `e2e/visual.spec.ts` | Reviewed mobile/tablet/desktop screenshot matrix |
| Create | `e2e/performance.spec.ts` | Navigation, interaction, payload, long-task, CLS, and LCP budgets |
| Create | `e2e/helpers/release-environment.ts` | Production URL, deterministic fixtures, animation/date masking, evidence annotations |
| Modify | `playwright.config.ts` | Browser/device projects, HTML/JUnit reporters, forbid-only, zero retries, production-server mode |
| Modify | `backend/tests/calculation_repository_integration.php` | Extend Phase 3-owned suite with release persistence/restart/backup/restore groups; retain `test:api` ownership |
| Modify | `backend/tests/engineering_api_integration.php` | Extend Phase 3-owned HTTP suite with release security matrix rows; do not create a competing harness |
| Modify | `backend/tests/smoke.php` | Keep structural smoke distinct; remove language implying integration proof |
| Create | `scripts/validate-registry-parity.mjs` | Compare seven 47-module surfaces and ordered/status parity using Node standard-library APIs |
| Create | `scripts/validate-calculator-release-status.mjs` | Validate exact 17-ID validated/contained outcome and client/server policy parity |
| Create | `scripts/validate-doc-parity.mjs` | Check counts, endpoints, migrations, test inventory, prohibited false claims, evidence links |
| Create | `scripts/validate-phase-gates.mjs` | Verify Phase 0-7 evidence and blocker status |
| Create | `scripts/validate-release.mjs` | Execute named mandatory scripts in order, stop on first non-zero result, and record layer result |
| Create | `scripts/collect-release-evidence.mjs` | Hash reports and write the release evidence manifest |
| Create | `scripts/release/assemble-standalone.mjs` | Copy `.next/static` and optional `public` into the standalone artifact and verify required files |
| Create | `scripts/release/server.mjs` | Lease/migrate/seed disposable DB; start PHP and standalone Next; enforce dual readiness; run all browser gates; clean both PIDs and exact schema |
| Modify | `scripts/validate-foundation.mjs` | Delegate canonical parity rather than duplicate incomplete count logic |
| Modify | `package.json` | Add only the Phase 8-owned focused, aggregate, evidence, and standalone scripts listed above; retain earlier-phase script bodies |
| Modify only by approved exception | `package-lock.json` | Remain byte-identical by default; any dependency change requires the recorded exception described above |
| Modify | `README.md` | Correct module count/status and link verified runbooks/evidence |
| Modify | `production.md` | Replace transient/contradictory completion claims with evidence-linked status |
| Modify | `docs/V8_ENGINEERING_GODMODE_INTEGRATION_PLAN.md` | Replace overstated checkmarks with verified/partial/deferred status linked to phase evidence |
| Modify | `docs/E2E_TESTS.md` | Current suites, 47 contracts, devices, commands, artifacts, and limitations |
| Modify | `docs/DATABASE.md` | Complete migrations, canonical MariaDB ownership, seed counts, integration procedure |
| Modify | `docs/MODULE_FUNCTIONALITY.md` | Accurate 47-module inventory and evidence-backed maturity language |
| Modify | `docs/FOUNDATION_BUILD_STATUS.md` | Correct count, persistence status, and validation links |
| Modify | `docs/DEPLOYMENT.md` | Remove dual-write assumptions; add release/rollback references and post-release verification |
| Modify | `docs/CONTINUATION_PLAN.md` | Reconcile completed/remaining work with Phase 0-8 gates |
| Create | `docs/v8-remediation/VALIDATION_EVIDENCE.md` | Human-readable evidence index generated from the manifest |
| Create | `docs/v8-remediation/RELEASE_RUNBOOK.md` | Preflight, backup, migration, deploy, verify, rollback, ownership, communication |
| Create | `docs/v8-remediation/GO_NO_GO.md` | Mandatory decision checklist, blockers, waivers policy, signatures |

### Patch-Level Change Matrix

Each task must land as a reviewable patch with these exact responsibilities; “add coverage,” “validate,” or “update docs” without the named data/behavior is incomplete.

| Task | Patch-level change | Focused proof |
|---|---|---|
| 1 | Add only Phase 8-owned `package.json` entries; implement `validate-phase-gates.mjs`, `release/assemble-standalone.mjs`, and `release/server.mjs` error/result schemas | Script unit tests plus standalone readiness/PID cleanup |
| 2 | Add 47 literal `ModuleContract` entries and four fixed test batches; every entry names locator, action, state/API/audit result, role, project, owner | Batch counts `12/12/12/11`, 47 review rows |
| 3 | Add `validate-calculator-release-status.mjs` for the exact 17-ID outcome and contained UI/API matrix; do not alter formulas/fixtures | Validated plus contained equals 17 |
| 4 | Add release groups to Phase 3 repository/API harness for persistence, restart, JSON immutability, backup, restore, and cleanup | `test:api -- -Group persistence` and `-Group recovery` |
| 5 | Add literal route/method/identity/org/project/permission/state/status/audit rows to the Phase 3 API and Phase 8 browser matrices | Security group reports row IDs, no wildcard assertions |
| 6 | Parse seven named surfaces and emit ordered per-surface diffs; withhold GREEN until Task 10 corrects docs | RED inventory first; final GREEN after docs |
| 7 | Add route/state axe cases plus explicit keyboard/focus/name/zoom/mobile/motion assertions keyed to module contracts | 47 initial states plus all critical transient states |
| 8 | Add deterministic screenshot cases at three exact viewports and baseline approval metadata | No automatic snapshot update in gate |
| 9 | Add metric collectors, three raw samples, median evaluator, and route/threshold failure schema | Production standalone base URL only |
| 10 | Correct each named document claim, generate evidence index, then run docs parity before final registry parity | `validate:docs` precedes registry GREEN |
| 11 | Add one runbook row per command with owner, expected output, stop, artifact, rollback; attach two-operator rehearsal record | Prior-artifact and restore-schema rehearsal |
| 12 | Generate decision inputs from one manifest hash and require domain-specific signatures | Aggregate gate and hash verification |

## Detailed Task Checklist

### Task 1: Establish Reproducible Release Commands and Environment Preflight

**Responsible role:** Release engineer  
**Dependencies:** Phase 0-7 exit evidence  
**Files:** `package.json`, `playwright.config.ts`, `e2e/helpers/release-environment.ts`, `scripts/validate-phase-gates.mjs`, `scripts/release/assemble-standalone.mjs`, `scripts/release/server.mjs`

**Interfaces:** Consume earlier-phase `test:calculations`, `test:calculations:approvals`, `test:api`, and God Mode scripts unchanged. Produce Phase 8 scripts `test:calculations:release-status`, `test:e2e:functional`, `test:a11y`, `test:visual`, `test:performance`, `validate:registry`, `validate:docs`, `validate:phases`, `validate:release`, `release:assemble`, `release:serve`, `release:server:verify`, `release:server:stop`, `evidence:collect`, and `evidence:verify`.

- [ ] Patch `package.json` with only the Phase 8-owned scripts in the ownership table; snapshot the pre-run `package-lock.json` SHA-256 and make preflight fail on drift without an approved exception.
- [ ] Patch `scripts/validate-phase-gates.mjs` to report one stable finding ID, evidence path, observed status, and owning phase for every Phase 0-7 gate; patch `e2e/helpers/release-environment.ts` to reject non-production base URLs and shared database names.
- [ ] **RED:** Run `npm run validate:phases`. Expected: non-zero with an itemized error for every absent or failed phase evidence record; no phase is inferred complete from Markdown checkmarks.
- [ ] Configure Playwright with `forbidOnly: true`, `retries: 0`, HTML and JUnit reporters, production base URL, deterministic locale/timezone, and named desktop/tablet/mobile/browser projects.
- [ ] Patch `scripts/release/assemble-standalone.mjs` and `scripts/release/server.mjs` to implement the exact assembly/readiness/PID-cleanup contract above; add Node tests for missing `server.js`, missing `.next/static`, early exit, readiness timeout, successful readiness, and cleanup after child-command failure.
- [ ] Make `validate:release` execute mandatory named layers in architecture order, record the failed layer, and stop on the first non-zero exit. Do not express the pipeline as shell `&&` chains.
- [ ] **GREEN:** Run `$ErrorActionPreference='Stop'; npm ci; if (-not $?) { exit 1 }; npm run lint; if (-not $?) { exit 1 }; npm run typecheck; if (-not $?) { exit 1 }; npm run build; if (-not $?) { exit 1 }; npm run release:assemble; if (-not $?) { exit 1 }; npm run release:server:verify; if (-not $?) { exit 1 }`. Expected: clean lockfile install, zero lint/type errors, assembled static/public assets, HTTP readiness, and no surviving PID/PID file.
- [ ] Run `npm run validate:phases`. Expected: `Phase gates: 8 checked, 8 passed, 0 unexplained blockers` before proceeding.

### Task 2: Replace Generic Module Opening with 47 Functional Contracts

**Responsible role:** QA automation engineer with module owners  
**Dependencies:** Task 1; Phase 6 migration completion  
**Files:** `e2e/fixtures/module-contracts.ts`, `e2e/app.spec.ts`, `e2e/modules-functional.spec.ts`, `e2e/release-critical.spec.ts`

**Interfaces:** Each `ModuleContract` contains `id`, `landmark`, `firstTab`, `role`, `readAssertion`, and `interaction` with target, action, and expected observable result.

- [ ] Define all 47 explicit contracts listed under Architecture; reject duplicate IDs, missing contracts, generic “page rendered” assertions, and interactions without observable results.
- [ ] Implement and review contracts in four fixed patches to keep failures attributable: Batch A `meetings` through `safety` (12); Batch B `feedback` through `refuse_calculator` (12); Batch C `nhbrc_enrolment` through `dispute_resolution` (12); Batch D `contractor_compliance` through `iconography_registry` (11). Each patch updates only `module-contracts.ts`, the relevant spec assertions, deterministic fixtures, and its evidence rows.
- [ ] For each module, budget 0.08-0.12 engineer-day to identify a safe read, perform one meaningful action, assert its exact state/API/audit effect, stabilize fixtures, and run the focused test; budget 0.03-0.04 owner-day to review domain meaning, role/project fixture, and expected effect. Record author, module owner, test title, outcome, and evidence hash in the manifest.
- [ ] Add release-critical journeys for project create/update/stage history, document revision/transmittal, sequential approval decision, meeting consent-to-publish/idempotent write-back, calculation save-review-link, God Mode stage/handoff/non-bypass, and navigation round trips.
- [ ] **RED:** Run `npm run test:e2e:functional`. Expected: FAIL until the manifest has 47 unique contracts and every module-specific assertion/action is implemented; the existing open-only matrix is insufficient.
- [ ] Keep the old module-open matrix under a clearly named `smoke` suite and make the new contract suite the functional gate.
- [ ] Execute safe interactions against deterministic disposable fixtures; no test conditionally accepts either a disabled control or vague view-only text.
- [ ] **GREEN:** Run `npm run test:e2e:functional`. Expected: `47 module contracts passed`, four batch counts `12/12/12/11`, 47 owner-review records, all critical journeys passed, zero skipped, zero retries, zero page errors, and zero unexpected console errors.

### Task 3: Resolve All 17 Calculator Release Outcomes

**Responsible role:** Calculation QA engineer plus registered professionals by discipline  
**Dependencies:** Phase 2 calculator remediation and approvals  
**Files:** Phase 2 calculation test/fixture paths, `package.json`, `docs/v8-remediation/VALIDATION_EVIDENCE.md`

**Interfaces:** Consume `CALC_REGISTRY`, the Phase 0/2 release policy, and approved fixtures for steel beam, concrete beam, timber beam, geotechnical bearing, wind load, rational stormwater, duct sizing, heat gain, travel distance, fire resistance, fire water, cable sizing, maximum demand, cold water, drainage fixture units, geyser sizing, and unit conversion. Produce one exact 17-ID release-outcome report with `state`, `owner`, `reason`, `fixtureHash`, `approvalEvidenceId`, `uiExpected`, and `apiExpected`.

- [ ] Patch the release-status validator to require exactly 17 unique registry IDs and one of two schemas: `validated` requires nominal/boundary/invalid/dimensional/rounding fixtures, professional name/registration/date/reference, and matching fixture hash; `contained` requires named owner, non-empty reason, review target/date, advisory/disabled UI copy, `recordable:false`, and API error `503 CALCULATOR_CONTAINED` for create/review.
- [ ] **RED:** Run `npm run test:calculations:release-status`. Expected: non-zero with calculator ID and stable finding ID for every missing outcome, unsigned `validated` entry, stale hash, contained-without-owner/reason entry, or client/server policy mismatch; a blanket “not all approved” failure is invalid.
- [ ] Run `npm run test:calculations` for only the IDs classified `validated`. Expected during remediation: failures identify exact calculator, fixture, input units, expected value/tolerance, actual value, and reference; contained IDs are reported as intentionally excluded, never silently skipped.
- [ ] Run Playwright and API parity cases for every contained ID. The UI must show the owner/reason advisory state and omit Save/Send to review; direct create/review requests must return `503 CALCULATOR_CONTAINED` with no record/audit mutation.
- [ ] Return formula or fixture defects to Phase 2; do not change expected values in Phase 8 without renewed professional approval and hash.
- [ ] **GREEN:** Run `$ErrorActionPreference='Stop'; npm run test:calculations:release-status; if (-not $?) { exit 1 }; npm run test:calculations; if (-not $?) { exit 1 }; npm run test:e2e:functional -- -g "calculator release outcome parity"; if (-not $?) { exit 1 }; npm run test:api -- -Group calculator-containment; if (-not $?) { exit 1 }`. Expected: `17 release outcomes resolved`; every validated ID passes signed fixtures, every contained ID passes UI/API parity, and validated plus contained counts equal 17.

### Task 4: Prove MariaDB Canonical Persistence and Recovery

**Responsible role:** Backend engineer and DBA  
**Dependencies:** Task 1; Phase 3 repository completion  
**Files:** `backend/tests/calculation_repository_integration.php`, `backend/tests/engineering_api_integration.php`, `backend/tests/smoke.php`, `package.json`

**Interfaces:** Integration tests call production API routes and verify MariaDB directly; JSON fixtures are read-only fallback and must not change during writable integration tests.

- [ ] Add named `-Group persistence`, `-Group recovery`, and `-Group security` selectors to the Phase 3-owned PowerShell harness without changing the base `test:api` command. Persistence covers empty migration/idempotent rerun/seed counts/create-read-list/restart/rollback/concurrency/idempotency/review/audit/project-delete behavior; recovery covers export, checksum, restore into a unique schema ending `_test`, row/status/audit parity, and cleanup.
- [ ] Hash `backend/data/*.json` before and after writes and assert no writable JSON source changes.
- [ ] **RED:** Run `$ErrorActionPreference='Stop'; npm run test:api -- -Group persistence; if (-not $?) { exit 1 }`. Expected: FAIL against a JSON calculation route, missing restart case, or dual-write behavior; failure names the exact read/write and stable finding ID.
- [ ] Return repository failures to Phase 3 and rerun from an empty test schema; do not patch persistence architecture inside this task.
- [ ] **GREEN:** Run `$ErrorActionPreference='Stop'; npm run test:api -- -Group persistence; if (-not $?) { exit 1 }; npm run test:api -- -Group recovery; if (-not $?) { exit 1 }`. Expected: migration, canonical write/read, restart durability, transaction, idempotency, audit, backup, restore, and cleanup cases pass; fixture hashes are unchanged.

### Task 5: Prove Authentication, RBAC, Tenancy, Project Scope, and Lifecycle Rules

**Responsible role:** Security engineer with backend engineer  
**Dependencies:** Task 4; Phase 3 security completion; Phase 7 God Mode completion  
**Files:** `backend/tests/engineering_api_integration.php`, `e2e/rbac.spec.ts`, `e2e/release-critical.spec.ts`

**Interfaces:** A table-driven matrix supplies route, method, authenticated identity, organization, project membership, permission, current state, expected HTTP status, and expected audit effect.

- [ ] Cover unauthenticated 401, malformed/expired JWT 401, missing permission 403, wrong organization 403/404, wrong project 403/404, missing required project scope 422, invalid payload 422, invalid lifecycle transition 409/422, allowed action 2xx, and platform-admin behavior.
- [ ] Cover calculations, projects, passport, documents, actions, approvals, audit, drawing intelligence, meetings, AI review, and user administration routes.
- [ ] Cover God Mode client identity with platform-admin lens and assert no permission, tenant, project, review, or approval escalation.
- [ ] **RED:** Run `$ErrorActionPreference='Stop'; npm run test:api -- -Group security; if (-not $?) { exit 1 }; npx playwright test e2e/rbac.spec.ts --workers=1; if (-not $?) { exit 1 }`. Expected: any unguarded route, wrong status, missing audit event, or lens escalation fails with the route/matrix row.
- [ ] Return authorization defects to Phase 3 or Phase 7 ownership; add no test-only bypasses.
- [ ] **GREEN:** Run `$ErrorActionPreference='Stop'; npm run test:api -- -Group security; if (-not $?) { exit 1 }; npx playwright test e2e/rbac.spec.ts --workers=1; if (-not $?) { exit 1 }`. Expected: all allow/deny matrix rows pass, denied actions produce no state mutation, allowed governed actions produce the expected audit rows, and God Mode never changes effective identity.

### Task 6: Enforce Registry Parity Across Seven Surfaces

**Responsible role:** Platform engineer  
**Dependencies:** Task 2 manifest  
**Files:** `scripts/validate-registry-parity.mjs`, `scripts/validate-foundation.mjs`, `package.json`, `E:/axis-1/tools.json`, `lib/data.ts`, `lib/module-registry.tsx`, `backend/data/modules.json`, `e2e/fixtures/module-contracts.ts`

**Interfaces:** Compare exact ordered IDs and statuses from parent canonical JSON, frontend `ALL_TOOLS`, `MODULE_REGISTRY`, backend JSON, MariaDB `modules`, E2E contracts, and documented inventory.

- [ ] Make the validator report missing, extra, duplicate, reordered, status-mismatched, and unregistered component IDs per surface.
- [ ] **RED:** Run `npm run validate:registry`. Expected: non-zero until all seven surfaces contain the same 47 IDs; current tooling does not inspect all surfaces together.
- [ ] Ensure `engineering_calc` is included once, all 47 registry entries resolve to a module component, and no `ScaffoldModule` fallback counts as a live functional implementation.
- [ ] Query MariaDB through test credentials rather than trusting seed JSON.
- [ ] Do not make the seven-surface GREEN assertion yet. Save the exact documentation-surface mismatch output for Task 10; six runtime/test surfaces may be internally green, but registry parity remains red until documentation is corrected and `validate:docs` passes.

### Task 7: Complete Accessibility Validation

**Responsible role:** Accessibility engineer  
**Dependencies:** Task 2; Phases 5-7  
**Files:** `e2e/accessibility.spec.ts`, `e2e/fixtures/module-contracts.ts`, `playwright.config.ts`

**Interfaces:** Test shell/global/module landmarks plus critical dialogs, drawers, menus, forms, tables, toasts, calculation states, approval states, meetings states, and God Mode states.

- [ ] Add axe scans for the shell, nine global destinations, all 47 module initial states, and every release-critical transient state.
- [ ] Add keyboard order, no-trap except modal, focus restoration, visible focus, accessible name, selected/expanded/pressed state, status announcement, form error association, 200% zoom/reflow, 390px viewport, and reduced-motion checks.
- [ ] **RED:** Run `npm run test:a11y`. Expected: non-zero with exact WCAG rule, selector, route/state, and impact for every serious/critical violation or semantic assertion failure.
- [ ] Return shared-component defects to Phase 5 and module defects to Phase 6/7 owners; retest the smallest owning suite first.
- [ ] **GREEN:** Run `npm run test:a11y`. Expected: zero serious/critical axe violations, zero keyboard/focus failures, all 47 module states scanned, and no unexplained exclusion.

### Task 8: Establish Responsive Visual Regression Baselines

**Responsible role:** Design-system engineer and product designer  
**Dependencies:** Task 7; Phases 5-7 visual completion  
**Files:** `e2e/visual.spec.ts`, `e2e/helpers/release-environment.ts`, committed Playwright snapshot directories

**Interfaces:** Deterministic screenshots use 1440x900 desktop, 768x1024 tablet, and 390x844 mobile; animations, timestamps, generated IDs, and network data are stabilized rather than broadly masked.

- [ ] Capture shell/global destinations, every module's primary state, flagship/foundation critical states, calculator input/result/review, and God home/Datum/handoff states at required viewports.
- [ ] **RED:** Run `npm run test:visual`. Expected on first run: missing-snapshot failures; generated “actual” images require human review and are not automatically accepted.
- [ ] Review for evolved V8 token use, typography, focus, status distinction, density, clipping, overlap, overflow, empty/error/loading states, and preserved workflows.
- [ ] Approve baselines only with design-system and module-owner sign-off; document intentional differences.
- [ ] **GREEN:** Run `npm run test:visual`. Expected: all approved snapshots match within Playwright's configured per-pixel threshold, with zero unreviewed baseline updates.

### Task 9: Enforce Production Performance Budgets

**Responsible role:** Frontend performance engineer  
**Dependencies:** Task 1 production build; stable Task 8 fixtures  
**Files:** `e2e/performance.spec.ts`, `e2e/helpers/release-environment.ts`, `package.json`

**Interfaces:** Run against `.next/standalone` with browser cache cold for navigation and warm for interaction; collect three runs and evaluate the median while retaining every raw result.

- [ ] Measure shell and representative global/module routes for transferred application bytes, DOM nodes, long tasks, CLS, LCP, navigation completion, and key interaction latency.
- [ ] Set release budgets: initial application transfer <= 1.5 MiB compressed, route JS <= 350 KiB compressed, LCP <= 2.5 s, CLS <= 0.10, no task > 200 ms, median key interaction <= 200 ms, and 47-module/God registry filtering <= 100 ms on the release machine.
- [ ] **RED:** Run `npm run test:performance`. Expected: non-zero for any exceeded budget, missing metric, dev-server run, or fewer than three samples; output identifies route, metric, threshold, and samples.
- [ ] Return regressions to the owning phase and optimize measured causes; do not raise a budget without architecture/performance-owner approval recorded in `GO_NO_GO.md`.
- [ ] **GREEN:** Run `npm run test:performance`. Expected: all budgets pass for three recorded runs with medians and raw JSON attached to evidence.

### Task 10: Remove False Claims and Enforce Documentation Parity

**Responsible role:** Technical writer with engineering owners  
**Dependencies:** Tasks 2-9 current evidence  
**Files:** `scripts/validate-doc-parity.mjs`, `README.md`, `production.md`, `docs/V8_ENGINEERING_GODMODE_INTEGRATION_PLAN.md`, `docs/E2E_TESTS.md`, `docs/DATABASE.md`, `docs/MODULE_FUNCTIONALITY.md`, `docs/FOUNDATION_BUILD_STATUS.md`, `docs/DEPLOYMENT.md`, `docs/CONTINUATION_PLAN.md`, `docs/v8-remediation/VALIDATION_EVIDENCE.md`

**Interfaces:** Documentation statuses are `implemented-unverified`, `verified`, `partial`, `disabled`, or `deferred`; `verified` requires an evidence-manifest reference.

- [ ] Add checks for module count 47, 17 calculators, migration filenames, endpoint inventory, canonical persistence wording, current suite names, prohibited unexplained pass totals, and completion claims lacking evidence links.
- [ ] **RED:** Run `npm run validate:docs`. Expected: failures for existing 46-module statements, contradictory 46/47 claims, incomplete migration list, dual-write release guidance, unsupported God Mode completion, and generic “all complete” language.
- [ ] Replace stale counts and claims with current generated facts; distinguish historical logs from current release evidence and preserve history only when clearly dated/non-authoritative.
- [ ] Reclassify every V8 checkmark against the master coverage matrix; explicitly name partial or deferred behavior and owner phase.
- [ ] Generate/update `VALIDATION_EVIDENCE.md` from the machine manifest rather than typing test totals manually.
- [ ] **GREEN:** Run `npm run validate:docs`. Expected: `Documentation parity passed: 47 modules, 17 calculators, migration/API/test inventories current, 0 unsupported completion claims`.
- [ ] **GREEN seven-surface parity, only after documentation correction:** Run `npm run validate:registry`. Expected: `Registry parity passed: 47 ordered IDs, 47 components, 47 backend rows, 47 DB rows, 47 E2E contracts, 47 documented IDs, 0 mismatches`. Evidence timestamps must show `validate:docs` completed first.

### Task 11: Write and Rehearse the Release and Rollback Runbook

**Responsible role:** Release engineer and DBA  
**Dependencies:** Tasks 1-10  
**Files:** `docs/v8-remediation/RELEASE_RUNBOOK.md`, `docs/DEPLOYMENT.md`, `scripts/collect-release-evidence.mjs`

**Interfaces:** Runbook names owner, command, expected output, stop condition, evidence artifact, and rollback action for every step.

- [ ] Document preflight, secret/config verification, database backup and restore verification, maintenance/communication, migration, API deploy, frontend deploy, cache handling, smoke/full verification, observability, rollback trigger, application rollback, database rollback/forward-fix policy, and incident handoff.
- [ ] **RED rehearsal:** Execute the runbook against an isolated release-candidate environment. Expected: any ambiguous command, missing owner, unsafe schema target, unverified backup, or non-reproducible expected result records a rehearsal failure.
- [ ] Rehearse application rollback to the previous artifact and database restore into a separate validation schema; never rehearse destructive rollback against production/shared data.
- [ ] Collect command outputs and artifact hashes with the owned command `npm run evidence:collect`.
- [ ] **GREEN rehearsal:** Repeat the runbook. Expected: two operators independently complete preflight/deploy/verify/rollback from the document, all stop conditions behave correctly, and evidence hashes verify.

### Task 12: Execute Final Validation and Go/No-Go Review

**Responsible role:** Release manager with engineering, QA, security, accessibility, DBA, product, and professional-validation signatories  
**Dependencies:** Tasks 1-11  
**Files:** `docs/v8-remediation/GO_NO_GO.md`, `docs/v8-remediation/VALIDATION_EVIDENCE.md`, generated release evidence manifest

**Interfaces:** Decision values are `GO` or `NO-GO`; waivers cannot cover critical/high security, calculation safety, data integrity, inaccessible critical workflows, failed rollback, or missing mandatory evidence.

- [ ] **RED final gate:** Run `npm run validate:release`. Expected: non-zero until every mandatory layer passes in the same release-candidate evidence set.
- [ ] Confirm zero critical/high defects, zero unexplained skips, zero retry-dependent passes, exact 17 calculator outcomes (`validated` with signed evidence or `contained` with owner/reason/UI/API parity), 47 registry/module contracts, and a successful rollback rehearsal.
- [ ] Review medium/low residual risks with owners and target releases; record permitted waivers with rationale, expiry, detection, and rollback trigger.
- [ ] Have each required signatory verify the evidence hash and sign only their domain.
- [ ] **GREEN final gate:** Run `$ErrorActionPreference='Stop'; npm run validate:release; if (-not $?) { exit 1 }; npm run evidence:verify; if (-not $?) { exit 1 }`. Expected: `RELEASE GATE PASS`, all artifact hashes verify, and the manifest reports zero mandatory failures.
- [ ] Record `GO` only after all signatures. Otherwise record `NO-GO`, identify the owning phase for each blocker, and do not authorize deployment.

## Milestones and Exit Criteria

| Milestone | Work included | Exit criteria |
|---|---|---|
| M8.1 Reproducibility | Task 1 | Clean install/build and Phase 0-7 preflight pass |
| M8.2 Product correctness | Tasks 2-3 | 47 functional contracts pass and all 17 calculators have a proven validated/contained outcome |
| M8.3 Data/security | Tasks 4-6 | MariaDB canonical persistence and the RBAC matrix pass; registry validator has a complete RED inventory |
| M8.4 Experience quality | Tasks 7-9 | Accessibility, reviewed visuals, and three-run performance budgets pass |
| M8.5 Truthful release docs | Task 10 | No stale claims remain, documentation parity passes, then seven-surface registry parity passes |
| M8.6 Operational readiness | Task 11 | Independent release/rollback rehearsal succeeds |
| M8.7 Decision | Task 12 | Evidence hashes verify and all required owners sign GO; otherwise NO-GO |

## Required Resources, Skills, Environments, and Tools

| Resource | Requirement |
|---|---|
| Release manager/engineer | Pipeline orchestration, evidence custody, runbook rehearsal |
| QA automation engineer | Per-module contracts, critical journeys, deterministic Playwright |
| Calculation QA plus professionals | Golden fixtures and approvals across structural, civil, mechanical/HVAC, fire, electrical, and wet services |
| Backend engineer and DBA | MariaDB isolation, migrations, repositories, concurrency, backup/restore |
| Security engineer | Authentication, RBAC, tenancy, project scope, lifecycle and God Mode threat review |
| Accessibility engineer | WCAG 2.2 AA, axe, keyboard, focus, zoom/reflow, reduced motion |
| Design-system/product reviewer | Responsive visual baseline approval and workflow parity |
| Performance engineer | Production measurement, budget analysis, regression ownership |
| Technical writer | Evidence-linked status and cross-document parity |
| Environment | Clean release workspace, production Next build, isolated PHP API, disposable MariaDB schema, Chromium/Firefox/WebKit, CI artifact storage |

## Person-Day Estimate by Workstream

| Workstream | Person-days |
|---|---:|
| Pipeline, standalone process, and evidence automation | 1.0-1.5 |
| 47 module-contract engineering at 0.08-0.12 day/module | 3.75-5.65 |
| 47 module-owner reviews at 0.03-0.04 day/module | 1.40-1.90 |
| Critical cross-module journeys | 0.75-1.0 |
| Calculator outcome/evidence audit | 0.75-1.25 |
| MariaDB/API/RBAC release integration | 1.25-1.75 |
| Registry and documentation parity | 0.75-1.0 |
| Accessibility and visual validation | 1.25-1.75 |
| Performance budgets | 0.4-0.6 |
| Runbook rehearsal and go/no-go | 0.7-1.1 |
| **Planned total** | **12.0-17.5** |
| **Committed estimate including review variance** | **12-18 person-days** |

The 47-module estimate is explicit: each module receives 0.08-0.12 engineer-day and 0.03-0.04 owner-day, for 5.15-7.55 person-days before cross-module journeys. Review is not sampled or absorbed into a generic QA line. A module that exposes a defect returns remediation to its owning phase; the estimate includes evidence triage and rerun, not implementation of that defect.

## Dependency Sequence

| Work item | Depends on | May run in parallel with |
|---|---|---|
| Task 1 | Phase 0-7 evidence | None |
| Task 2 | Task 1, Phase 6 | Task 3 approval audit |
| Task 3 | Phase 2 | Task 2 |
| Task 4 | Task 1, Phase 3 | Tasks 2-3 |
| Task 5 | Task 4, Phases 3 and 7 | Task 6 |
| Task 6 | Task 2 manifest | Task 5; final GREEN waits for Task 10 |
| Task 7 | Task 2, Phases 5-7 | Task 4 after environment setup |
| Task 8 | Task 7 stable UI | Task 9 after production build stabilizes |
| Task 9 | Tasks 1 and 8 fixtures | Task 10 evidence inventory |
| Task 10 | Tasks 2-9 facts and Task 6 RED inventory | Initial Task 11 drafting |
| Task 11 | Tasks 1-10, including registry GREEN after docs | None for final rehearsal |
| Task 12 | Tasks 1-11 | None |

## Acceptance Criteria

- `npm ci`, lint, typecheck, and production build pass from the locked release candidate.
- The same 47 ordered module IDs/statuses exist in all seven registry/validation surfaces, with 47 real module components and no live fallback.
- All 47 module-specific functional contracts and all release-critical journeys pass with zero skips and retries.
- Exactly 17 calculator IDs have one release outcome: validated IDs pass approved golden/dimensional/boundary/invalid/tolerance tests with valid hashes; contained IDs name owner/reason and prove disabled/advisory UI plus API create/review denial with no mutation.
- MariaDB alone receives writable calculation records; restart, transaction, idempotency, audit, backup, and restore tests pass.
- Authentication/RBAC/tenancy/project/lifecycle matrices pass for allowed and denied cases, including God Mode lens non-escalation.
- Axe has zero serious/critical findings; keyboard, focus, naming, selected-state, form-error, zoom/reflow, mobile, and reduced-motion tests pass.
- Reviewed visual baselines pass at 1440x900, 768x1024, and 390x844 without unapproved updates.
- All production performance budgets pass in three captured runs.
- Documentation says 47 modules and 17 calculators where applicable, lists current migrations/endpoints/tests, and contains no unsupported completion claim.
- Release and rollback are independently rehearsed from the runbook and evidence hashes verify.
- Required domain owners sign one evidence set and the final decision is explicit.

## Test and Evidence Plan

| Layer | Exact command | Required outcome/evidence |
|---|---|---|
| Clean/static/build | `$ErrorActionPreference='Stop'; npm ci; if (-not $?) { exit 1 }; npm run lint; if (-not $?) { exit 1 }; npm run typecheck; if (-not $?) { exit 1 }; npm run build; if (-not $?) { exit 1 }; npm run release:assemble; if (-not $?) { exit 1 }` | Exit 0; unchanged lock hash, install/build/assembly logs |
| Phase prerequisites | `npm run validate:phases` | 8/8 prior gates passed |
| Calculations | `$ErrorActionPreference='Stop'; npm run test:calculations:release-status; if (-not $?) { exit 1 }; npm run test:calculations; if (-not $?) { exit 1 }; npm run test:api -- -Group calculator-containment; if (-not $?) { exit 1 }` | Validated plus contained equals 17; signed fixtures or containment parity, no silent skips |
| MariaDB/API | `$ErrorActionPreference='Stop'; npm run test:api -- -Preflight; if (-not $?) { exit 1 }; npm run test:api; if (-not $?) { exit 1 }` | Unique isolated `_test` schema; persistence/security/recovery groups pass; fixture hashes unchanged |
| Documentation | `npm run validate:docs` | Counts/inventories/status/evidence links match; must precede registry GREEN |
| Registry | `npm run validate:registry` | Seven surfaces, exact 47 parity after documentation correction |
| Functional | `npm run test:e2e:functional` | 47 explicit module contracts and critical journeys pass |
| Accessibility | `npm run test:a11y` | Zero serious/critical axe or semantic failures |
| Visual | `npm run test:visual` | Reviewed three-viewport baselines match |
| Performance | `npm run test:performance` | Three-run raw metrics and all budgets pass |
| Aggregate | `npm run validate:release` | All mandatory gates pass in order |
| Integrity | `npm run evidence:verify` | Every artifact SHA-256 matches manifest |

The evidence set must include exact commands, start/end timestamps, exit codes, source revision, dependency lock hash, environment versions, MariaDB version/schema migrations, browser versions, test totals/skips/retries, screenshots/reports, raw performance JSON, fixture approval hashes, backup/restore transcript, reviewer identities, and final decision.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Detection |
|---|---|---:|---|---|
| Generic module tests create false confidence | High | High | 47 explicit non-fallback contracts and critical journeys | Manifest validator rejects generic/missing contracts |
| Calculator fixture is changed to match bad code | Medium | Critical | Signed hashes and renewed professional approval | Approval validator hash mismatch |
| Tests mutate production/shared data | Low | Critical | `_test` suffix enforcement, isolated credentials, hard preflight | Integration harness aborts before connection/migration |
| JSON remains a hidden writable source | Medium | Critical | Fixture hashes and durable restart test | Persistence group fails on any JSON change/read dependency |
| RBAC happy paths hide tenant leakage | Medium | Critical | Table-driven negative matrix across org/project/state | Direct DB state and HTTP denial assertions |
| Snapshot updates conceal regressions | Medium | High | Human approval and no automatic update in gate | Unreviewed baseline hash blocks evidence manifest |
| Performance result is machine-noise dependent | Medium | Medium | Production build, fixed machine, three runs, median plus raw values | Variance recorded; missing/unstable metrics fail |
| Documentation drifts immediately | High | Medium | Generated inventories and CI parity script | `validate:docs` blocks merge/release |
| Historical pass totals are mistaken for current evidence | High | High | Date/revision/hash every evidence set; remove bare totals | Unsupported-claim scanner |
| Rollback cannot restore schema safely | Medium | Critical | Backup/restore rehearsal and forward-fix policy | Task 11 rehearsal failure is NO-GO |
| Required specialist sign-off is unavailable | Medium | High | Assign owners before validation window | Missing signature/approval is NO-GO or calculator disabled |

## Rollback and Contingency Strategy

1. Validation failures are routed to the owning Phase 0-7 document; Phase 8 does not conceal product defects with test exceptions.
2. Preserve the previous application artifact, migration ledger, database backup, environment manifest, and release evidence before any release execution.
3. Application rollback redeploys the prior immutable frontend/API artifacts and verifies health, authentication, critical reads, and audit continuity.
4. Database rollback is used only for explicitly reversible migrations with DBA approval. For destructive/forward-only migrations, stop traffic and apply the rehearsed forward fix or restore into a validated replacement schema before cutover.
5. A calculator with missing/failed approval is set to `contained` through the Phase 0 mechanism, with named owner/reason and matching UI/API denial evidence; it is not waived into release.
6. A failed module contract blocks the affected release unless the module is explicitly removed from all canonical registries and product claims through a separately approved scope change; count parity cannot be falsified.
7. A visual baseline is never updated during the final gate. Intentional changes require a new candidate, review, and evidence set.
8. Any critical/high security, integrity, calculation, accessibility, or rollback defect forces NO-GO with no waiver.

## Deliverables

- Reproducible layered `validate:release` pipeline and preflight.
- Canonical 47-module functional contract manifest and test suite.
- Exact 17-calculator release-outcome evidence: signed golden validation or owner/reason containment with UI/API parity.
- Isolated MariaDB persistence, recovery, and complete RBAC integration evidence.
- Seven-surface registry parity validator.
- Product-wide accessibility suite.
- Reviewed responsive visual regression baselines.
- Three-run production performance evidence.
- Documentation parity validator and corrected project documentation.
- Generated validation evidence index and hashed manifest.
- Operator-ready release and rollback runbook with rehearsal record.
- Signed go/no-go decision record.

## Phase Exit Gate

Phase 8 and the V8 remediation program are complete only when one immutable release-candidate evidence set proves every acceptance criterion, `npm run validate:release` passes without retries or unexplained skips, all 47 module contracts and seven registry surfaces agree after documentation parity correction, all 17 calculators have a proven `validated` or `contained` outcome, MariaDB durability and authorization matrices pass, the standalone artifact includes required static/public assets and leaves no server PID, accessibility/visual/performance gates pass, rollback rehearsal succeeds, artifact hashes verify, and all required owners sign `GO_NO_GO.md`. Any missing evidence, stale count, false completion claim, dual writable calculation store, contained calculator with UI/API parity drift, unsigned active calculator, failed mandatory test, unapproved snapshot, open critical/high defect, or failed rollback rehearsal is an automatic **NO-GO**.
