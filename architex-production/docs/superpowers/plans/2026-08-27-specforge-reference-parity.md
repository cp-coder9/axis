# SpecForge Reference-Parity Implementation Plan

**Date:** 2026-08-27  
**Status:** Approved for autonomous execution  
**Goal:** Reproduce all fourteen SpecForge views from the supplied integrated God Mode HTML while replacing prototype state and simulated success with authenticated, organization-scoped, audited persistence or explicit `integration_required` results.

**Sole visual/workflow authority:** `E:\Downloads\architex_datum_os_integrated_modules_v8_engineering_godmode.html`

## Production boundaries

- The reference controls visible hierarchy, geometry, copy, controls, view order, responsive behavior, and workflow outcomes.
- The authenticated session alone supplies identity, organization, membership, and authorization context.
- PHP policy is authoritative. TypeScript capability data is a presentation projection checked for parity with PHP.
- Every tenant-owned statement includes `organization_id`; project and record identifiers are additional predicates, never substitutes.
- Issued snapshots are immutable. Later edits create a draft successor revision.
- Mutations are validated, audited, and idempotent wherever retries are possible.
- Prototype timeouts, generated sample results, and success toasts are not production implementations. Missing connectors return a persisted or returned `integration_required` state.
- Automated database tests provision uniquely named disposable schemas and drop them in `finally`; browser-created records are deleted or isolated with an expiry-tagged fixture.
- Local verification, test-environment deployment, remote migration, and release certification are separate evidence gates.

## Fourteen-view delivery contract

| Order | View | Required reference surface | Real data and mutation boundary | Missing-integration behavior |
|---:|---|---|---|---|
| 1 | Overview | Project metadata, budget cards, readiness findings, quick statistics | Read model aggregates workspace, items, approvals, costs, risks, and issue readiness | Name the unavailable aggregate; never substitute sample counts |
| 2 | Pictorial Board | Role-visible product cards, images, risk flags, deltas, lead times, detail drawer | Persisted items, media links, comments, substitutions, and role-filtered actions | Image/source card shows `integration_required` |
| 3 | Sections | Reference accordion and item rows | Persisted section ordering and item membership with optimistic concurrency | Not applicable to local records |
| 4 | Products | Search/filter register and exact product columns | Organization-scoped product register and item detail commands | External provenance remains visibly unavailable |
| 5 | Document Preview | Structured specification document and revision metadata | Deterministic server projection of the selected revision | Export connector reports `integration_required` when absent |
| 6 | Approvals | Approval register, role filters, approve/reject, professional responsibility | Audited approval decisions and responsibility confirmations | Missing assignee is a blocking validation state |
| 7 | Budget & Risk | Budget metrics, stale prices, long-lead and risk findings | Cost/risk projections from item quantities, rates, provenance, and freshness | Unpriced sources remain explicit, never zero-filled |
| 8 | BoM / BoQ | Item, quantity, unit, rate, total, source, single-source warning | Quantity and rate records plus deterministic totals | Unavailable rates are `integration_required`/unpriced |
| 9 | Planning | Reference kanban derived from specification items | Persisted/spec-derived planning state and audited transitions | Downstream programme handoff reports connector status |
| 10 | Procurement | Seven exact pipeline columns and permitted transitions | Audited procurement state machine and external command idempotency | Unconfigured procurement connector stays `integration_required` |
| 11 | Issue & Distribute | Readiness checks, recipient grid, issue action, downstream actions | Immutable snapshot/hash, recipients, audit event, and idempotent downstream jobs | Per-job `integration_required`/failed status is visible after reload |
| 12 | Drawing Intelligence | Drawing list, scans, linked suggestions, action controls | Drawing metadata, candidate links, accept/reject decisions, and audit | Scanner/AI connector reports `integration_required` |
| 13 | Closeout | Readiness summary and outstanding evidence | Evidence register and deterministic completion rules | External archive/export remains explicit |
| 14 | Integration | Passport, AI, messaging, escrow, procurement, programme, BoM, drawings, audit cards | Server-reported connector configuration and last event/job state | Each card names `integration_required`, configured, degraded, or failed |

## Execution tasks

### Task 0 — Freeze and verify the inherited remediation baseline

**Files:** existing `lib/specforge/*`, `components/modules/specforge/*`, `backend/lib/specforge_*`, `backend/tests/specforge-*`, `e2e/v8-specforge-contract.spec.ts`, `styles/specforge-v8.css`.

1. Run the focused TypeScript, PHP policy, API, schema, and browser tests before editing.
2. Prove session-only client authentication, PHP/TypeScript capability parity, organization predicates, issued-successor behavior, denial auditing, disposable database teardown, browser cleanup, and the `700px` collapse independently.
3. Record failures as RED evidence. Do not treat existing dirty changes as accepted implementation.
4. Commit only isolated fixes whose tests pass.

### Task 1 — Generate the executable SpecForge reference contract

**Files:** modify `scripts/reference/extract-godmode-reference.mjs`; create `generated/specforge-reference-contract.json`, `lib/reference/specforge-reference-contract.ts`, and extractor/parity tests.

1. Add a failing test for the exact fourteen IDs, order, labels, renderer ownership, major controls, and decoded-source hash.
2. Decode `SOURCES.specforge` from the sole integrated HTML during extraction; never read a detached decoded copy as authority.
3. Extract deterministic view, control, state-transition, and responsive contracts.
4. Extend `reference:generate` and `reference:check`; require a clean drift check.

### Task 2 — Complete the organization-scoped persistence model

**Files:** new forward-only migration; `backend/lib/specforge_repository.php`; schema/API tests.

1. Write RED tests for cross-organization denial and every new repository helper.
2. Add candidate/library provenance, item links, comments, responsibility confirmations, quantity/rate data, procurement events, closeout evidence, connector states, and integration-job records only where absent.
3. Require organization IDs in repository interfaces and SQL predicates. Add concurrency versions and unique idempotency constraints.
4. Prove migrations on a disposable schema and automatic teardown.

### Task 3 — Deepen authorization, validation, and audit

**Files:** `backend/lib/specforge_validation.php`, route handlers, policy/parity tests.

1. RED: denial paths lack an audit record, presentation policies differ, or technical authors cannot author.
2. Centralize authoritative capabilities and auditable denial helpers.
3. Validate organization, project, assignment, capability, record state, and transition in that order.
4. Prove denied and permitted outcomes without accepting caller-supplied identity headers.

### Task 4 — Build candidates, libraries, links, and all Smart Add methods

**Files:** repository/routes; `lib/specforge/types.ts`, `api.ts`; hook; `SpecForgeSmartAdd.tsx`; tests.

1. Define one candidate contract with source, provenance, confidence, connector state, and accept/reject status.
2. Implement personal library, platform library, supplier URL, image, drawing, AI/web, and manual methods against real adapters.
3. When an adapter is unavailable, return `integration_required`; do not generate products, images, analyses, or prices.
4. Accepting a candidate creates/links a real draft item and is idempotent.

### Task 5 — Rebuild the shared SpecForge workspace frame

**Files:** `SpecForgeModule.tsx`, shared SpecForge components, `styles/specforge-v8.css`, component tests.

1. RED against the generated contract for exact tab order, labels, active states, filters, actions, empty/loading/error states, and keyboard behavior.
2. Implement the reference frame without duplicating global shell chrome.
3. Collapse cards and metrics at exactly `700px`; forbid body overflow at all certification widths.
4. Preserve the production dark-theme extension without claiming it exists in the light-only reference.

### Task 6 — Overview and Pictorial Board

1. RED visual/interaction component tests from contract fixtures.
2. Add organization-scoped overview aggregate endpoint and role-visible pictorial projection.
3. Implement real detail, comment, substitution, media, risk, price-delta, and lead-time states.
4. Browser-test reload persistence and role filtering.

### Task 7 — Sections and Products

1. RED for accordion geometry, ordering, filters, row actions, and detail flow.
2. Implement section and product commands with optimistic concurrency and audit.
3. Prove create/update/link/comment/substitute operations after reload and across denied roles.

### Task 8 — Document Preview and Approvals

1. RED for deterministic revision rendering and the reference approval register.
2. Build document projection from stored workspace/revision data.
3. Implement approve/reject and professional-responsibility confirmations with audited decisions.
4. Prove decisions alter readiness and cannot mutate issued snapshots.

### Task 9 — Budget & Risk, BoM / BoQ, and Planning

1. RED for calculations, stale/long-lead flags, single-source warnings, units, and planning columns.
2. Implement server projections using persisted quantities, rates, provenance, and item state.
3. Never coerce missing rates to zero; surface unpriced/integration states.
4. Prove deterministic totals and audited planning transitions.

### Task 10 — Procurement state machine

1. RED for the exact seven columns and invalid transition denial.
2. Implement `RFQ Pending -> Quoted -> PO Raised -> Ordered -> In Transit -> Delivered -> Installed` as server-authoritative transitions.
3. Persist transition events, actor, version, connector result, and idempotency key.
4. Browser-test valid transitions, invalid denials, reload, and connector-unavailable state.

### Task 11 — Immutable Issue & Distribute

1. RED for readiness validation, recipient selection, immutable issue snapshot/hash, successor drafts, reload, and downstream job states.
2. Issue in one transaction; store snapshot, hash, recipients, audit, and idempotent jobs.
3. Reject in-place updates to issued data and return/create the draft successor.
4. Prove validate, issue, reload, downstream statuses, replay safety, and browser-fixture cleanup.

### Task 12 — Drawing Intelligence, Closeout, and Integration

1. RED for reference layouts and each visible control/outcome.
2. Implement drawing candidates and accepted links, closeout evidence/readiness, and connector status cards.
3. Expose real last-job/error/configuration state without leaking secrets.
4. Prove unavailable connectors never emit success.

### Task 13 — Disposable end-to-end fixtures

**Files:** API/schema harnesses, Playwright fixtures, cleanup utilities.

1. Provision a unique approved `_test` schema per run and apply migrations/fixtures.
2. Drop it in `finally`, including failure and interrupt handling where practical.
3. Give browser records a unique run ID and delete them through an authenticated cleanup endpoint/fixture.
4. Fail the suite if cleanup cannot be proven; never clear a shared demo schema.

### Task 14 — Pixel and functional certification

1. Certify all fourteen views at `1600x1000`, `1024x768`, `700x900`, and `390x844`.
2. Compare region geometry, computed styles, overflow, visible copy, controls, focus, reduced motion, and screenshots to the extracted reference contracts.
3. Run each authorized mutation through browser -> authenticated API -> MariaDB -> reload; test representative denials and integration-required paths.
4. Run reference drift checks, focused suites, PHP tests, API/schema harnesses, typecheck, production build, and full Playwright suite.
5. Record local evidence separately. Deploy to `test.architex.co.za` only after local gates pass, then repeat authenticated browser/API/persistence checks against the deployed artifact without mutating unapproved remote data.

## Required completion evidence

- Generated SpecForge contract matches the sole HTML and passes drift checking.
- Fourteen views are present in exact reference order and certified at four widths.
- Every enabled control has a tested real outcome; every unavailable connector is explicit.
- Session-only authentication, tenant isolation, authoritative policy, denial audit, immutable issue snapshots, successor drafts, idempotency, and cleanup are executable tests.
- Typecheck and production build pass.
- Local, test deployment, remote database, and release claims remain separately labelled.
