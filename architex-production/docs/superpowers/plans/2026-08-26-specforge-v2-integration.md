# SpecForge V2 Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mock-only SpecForge module with a V8-native, versioned, authenticated, MariaDB-persistent and record-level RBAC-protected SpecForge V2 workspace derived from `E:\arc-1\specforge-pack`.

**Architecture:** A shared tool-version contract feeds the registry and active tool identity. SpecForge uses pure TypeScript domain functions mirrored by a focused PHP MariaDB repository and `/api/v1` route boundary; the React workspace consumes only authenticated API aggregates and renders within the existing V8 shell. Issuing is transactional and creates immutable snapshots, audit rows and idempotent downstream job commands.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, Testing Library, Playwright, PHP 8.2+, PDO MariaDB, SQL migrations, existing Architex JWT/session and FTPS release tooling.

## Global Constraints

- Source pack: `E:\arc-1\specforge-pack` defines SpecForge concepts and workflows; do not iframe its demo shell.
- Datum OS V8 remains the sole owner of rail, navigator, top bar, theme switcher, inspector, role selector and orientation.
- Every registered tool carries a `^\d+\.\d$` version; unchanged tools are `1.0` and this SpecForge release is `1.1`.
- Future material tool updates increment exactly `0.1`; unrelated tool versions do not change.
- The version badge is compact, very light green, theme-safe and displayed in the Workspace Tool Registry and active tool identity.
- Production runtime records come only from authenticated `/api/v1` responses backed by MariaDB; frontend constants never become fallback records.
- Prototype records are inserted only by the explicit idempotent server seed path and use the same API/database path afterward.
- God Mode preserves organization, project, assignment and record-state authorization.
- AI results are source-attributed candidates requiring human acceptance; they never directly publish clauses or compliance claims.
- Local tests/build, local MariaDB proof and live release certification are reported separately.
- Preserve unrelated dirty files and stage only exact task-owned paths.

---

## File map

### Shared versioning

- Modify `lib/types.ts` — adds the `ToolVersion` type and required `ToolDefinition.version`.
- Modify `lib/data.ts` — sets all 47 tool versions; SpecForge becomes `1.1`.
- Modify `backend/data/modules.json` — mirrors versions in the API registry.
- Create `components/ui/ToolVersionBadge.tsx` — shared accessible pale-green badge.
- Modify `components/v8/V8ToolRegistry.tsx` — renders the badge beside every tool name.
- Modify `components/layout/ContextNavigator.tsx` and `components/layout/TopBar.tsx` — render active-tool version without duplicate identity chrome.
- Modify `styles/v8-tool-registry.css` and `app/globals.css` — V8 semantic badge treatment.

### SpecForge domain and API

- Create `lib/specforge/types.ts` — client/domain DTO contracts.
- Create `lib/specforge/domain.ts` — pure role visibility, budget, readiness and revision functions.
- Create `backend/database/migrations/014_specforge_core.sql` — additive schema and permissions.
- Create `backend/lib/specforge_validation.php` — payload validation and capability policy.
- Create `backend/lib/specforge_repository.php` — organization/project-scoped MariaDB aggregate repository.
- Modify `backend/public/index.php` — SpecForge route dispatch only; business logic remains in the repository/validation files.
- Modify `backend/database/seed.php` — idempotent prototype seed guarded by environment policy.
- Modify `backend/worker.php` — records downstream SpecForge job outcomes without fake completion.

### SpecForge client and V8 UI

- Create `lib/specforge/api.ts` — authenticated requests and typed errors.
- Create `components/modules/specforge/useSpecForgeWorkspace.ts` — explicit loading/empty/ready/forbidden/conflict/error state machine.
- Create `components/modules/specforge/SpecForgeSmartAdd.tsx` — candidate search/review/confirm flow.
- Create `components/modules/specforge/SpecForgeOverview.tsx` — readiness and next-action summary.
- Create `components/modules/specforge/SpecForgeRecords.tsx` — sections, pictorial items, products, approvals, budget, BoM and drawing views.
- Create `components/modules/specforge/SpecForgeIssue.tsx` — readiness validation, immutable issue and downstream statuses.
- Replace `components/modules/SpecForgeModule.tsx` — thin V8 composition root using controlled tabs.
- Create `styles/specforge-v8.css` and import from `app/globals.css` — token-only tool styling.

### Tests and evidence

- Modify `components/v8/__tests__/V8ToolRegistry.test.tsx`.
- Create `components/ui/ToolVersionBadge.test.tsx`.
- Create `lib/specforge/domain.test.ts`.
- Create `backend/tests/specforge-schema.mjs`.
- Create `backend/tests/specforge-policy.php`.
- Create `backend/tests/specforge-api.mjs`.
- Create `components/modules/specforge/SpecForgeModule.test.tsx`.
- Create `e2e/v8-specforge-contract.spec.ts`.
- Create `scripts/capture-v8-specforge.mjs`.
- Modify `scripts/certify-live-v8.mjs`.

---

### Task 1: Add the shared tool-version contract and V8 badge

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/data.ts`
- Modify: `backend/data/modules.json`
- Create: `components/ui/ToolVersionBadge.tsx`
- Create: `components/ui/ToolVersionBadge.test.tsx`
- Modify: `components/v8/V8ToolRegistry.tsx`
- Modify: `components/v8/__tests__/V8ToolRegistry.test.tsx`
- Modify: `components/layout/ContextNavigator.tsx`
- Modify: `components/layout/TopBar.tsx`
- Modify: `styles/v8-tool-registry.css`
- Modify: `app/globals.css`
- Modify: `backend/tests/registry-parity.php`

**Interfaces:**
- Produces: `type ToolVersion = `${number}.${number}`` and required `ToolDefinition.version: ToolVersion`.
- Produces: `<ToolVersionBadge version="1.0" />` rendering visible text `v1.0`.
- Consumes: existing `ToolDefinition` instances and V8 theme variables.

- [ ] **Step 1: Write failing version metadata and badge tests**

```tsx
expect(Object.values(ALL_TOOLS)).toHaveLength(47);
expect(Object.values(ALL_TOOLS).every(tool => /^\d+\.\d$/.test(tool.version))).toBe(true);
expect(ALL_TOOLS.specforge.version).toBe('1.1');
render(<ToolVersionBadge version="1.1" />);
expect(screen.getByText('v1.1')).toHaveAttribute('data-tool-version', '1.1');
```

Extend the registry test to assert every `[data-v8-registry-tool]` contains its matching `v{version}` and the SpecForge row contains `v1.1`.

- [ ] **Step 2: Run the tests and verify RED**

Run:

```powershell
npx vitest run components/ui/ToolVersionBadge.test.tsx components/v8/__tests__/V8ToolRegistry.test.tsx
```

Expected: FAIL because `ToolDefinition.version` and `ToolVersionBadge` do not exist.

- [ ] **Step 3: Add required versions and the shared badge**

Add to `lib/types.ts`:

```ts
export type ToolVersion = `${number}.${number}`;

export interface ToolDefinition {
  id: string;
  version: ToolVersion;
  // existing fields remain unchanged
}
```

Set `version: '1.0'` on every existing definition in `lib/data.ts`, then set only `ALL_TOOLS.specforge.version` to `1.1`. Mirror the same values as a `version` property for all 47 records in `backend/data/modules.json`.

Create the badge:

```tsx
import type { ToolVersion } from '@/lib/types';

export function ToolVersionBadge({ version }: { version: ToolVersion }) {
  return <span className="ax-tool-version" data-tool-version={version} aria-label={`Tool version ${version}`}>v{version}</span>;
}
```

Use this semantic style in `app/globals.css`:

```css
.ax-tool-version {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  padding: 2px 6px;
  border: 1px solid color-mix(in srgb, #28a86b 16%, transparent);
  border-radius: 999px;
  color: color-mix(in srgb, #28a86b 78%, var(--ax-text));
  background: color-mix(in srgb, #28a86b 8%, var(--ax-surface-1));
  font-size: 10px;
  font-weight: 700;
  line-height: 1.2;
}
```

Render it beside the name in `V8ToolRegistry`, the expanded active identity in `ContextNavigator`, and the active-tool breadcrumb/title in `TopBar`. Do not render text inside the compact icon-only navigator.

- [ ] **Step 4: Enforce frontend/backend registry parity**

Update `backend/tests/registry-parity.php` so each API module requires a valid `version`, the tool count remains 47, and SpecForge equals `1.1`.

- [ ] **Step 5: Verify GREEN and commit**

Run:

```powershell
npx vitest run components/ui/ToolVersionBadge.test.tsx components/v8/__tests__/V8ToolRegistry.test.tsx
php backend/tests/registry-parity.php
npm run typecheck
```

Expected: all focused tests and typecheck pass.

Commit exact paths with:

```powershell
git commit -m "feat: version Datum workspace tools"
```

---

### Task 2: Port the SpecForge domain model and deterministic policy functions

**Files:**
- Create: `lib/specforge/types.ts`
- Create: `lib/specforge/domain.ts`
- Create: `lib/specforge/domain.test.ts`

**Interfaces:**
- Produces: `SpecForgeAggregate`, `SpecForgeSection`, `SpecForgeItem`, `SpecForgeApproval`, `SpecForgeIssue`, `SpecForgeCandidate`.
- Produces: `visibleSpecItems`, `summarizeSpecBudget`, `validateIssueReadiness`, `nextDraftRevision`.
- Consumes: `RoleKey` and project identifiers; has no React, network or storage dependency.

- [ ] **Step 1: Write failing domain tests**

Cover these exact behaviors:

```ts
expect(visibleSpecItems(workspace, { role: 'client', userId: 'client-1' }).map(item => item.id)).toEqual(['client-decision', 'issued-item']);
expect(visibleSpecItems(workspace, { role: 'supplier', userId: 'supplier-1', packageNames: ['Tiling'] }).every(item => item.packageName === 'Tiling')).toBe(true);
expect(summarizeSpecBudget(workspace.items)).toMatchObject({ allowance: 100000, estimate: 112000, delta: 12000 });
expect(validateIssueReadiness(blockedWorkspace).codes).toEqual(['APPROVALS_PENDING', 'BUDGET_REVIEW_PENDING', 'CRITICAL_DRAWING_FINDING']);
expect(nextDraftRevision('P06')).toBe('P07');
```

- [ ] **Step 2: Run and verify RED**

```powershell
npx vitest run lib/specforge/domain.test.ts
```

Expected: FAIL because the domain module does not exist.

- [ ] **Step 3: Implement the pure domain contract**

Adapt the pack's `specforgeTypes.ts` and `specforgeService.ts`. Use camelCase DTOs on the client and these exact readiness codes:

```ts
export type IssueBlockerCode =
  | 'SECTIONS_UNAPPROVED'
  | 'APPROVALS_PENDING'
  | 'BUDGET_REVIEW_PENDING'
  | 'STALE_SOURCE'
  | 'CRITICAL_DRAWING_FINDING';

export function validateIssueReadiness(workspace: SpecForgeAggregate): { ready: boolean; codes: IssueBlockerCode[] } {
  const codes = new Set<IssueBlockerCode>();
  if (workspace.sections.some(section => !['approved', 'issued'].includes(section.status))) codes.add('SECTIONS_UNAPPROVED');
  if (workspace.approvals.some(approval => approval.status === 'pending')) codes.add('APPROVALS_PENDING');
  if (!workspace.budgetReviewedAt) codes.add('BUDGET_REVIEW_PENDING');
  if (workspace.items.some(item => item.supersededBy !== null)) codes.add('STALE_SOURCE');
  if (workspace.drawingFindings.some(finding => finding.severity === 'critical' && finding.status !== 'resolved')) codes.add('CRITICAL_DRAWING_FINDING');
  return { ready: codes.size === 0, codes: [...codes] };
}
```

- [ ] **Step 4: Verify GREEN and commit**

```powershell
npx vitest run lib/specforge/domain.test.ts
npm run typecheck
git commit -m "feat: add SpecForge domain policies"
```

Expected: domain tests and typecheck pass.

---

### Task 3: Add the additive MariaDB schema and server-side policy contract

**Files:**
- Create: `backend/database/migrations/014_specforge_core.sql`
- Create: `backend/lib/specforge_validation.php`
- Create: `backend/tests/specforge-schema.mjs`
- Create: `backend/tests/specforge-policy.php`
- Modify: `backend/public/index.php`

**Interfaces:**
- Produces: the eight SpecForge tables described in the approved design plus `specforge_commands` for idempotency.
- Produces: `specforge_require_capability(array $identity, string $capability, ?array $record = null): void`.
- Consumes: existing organizations, projects, users, audit_log, jobs and role_permissions.

- [ ] **Step 1: Write failing schema and policy tests**

The schema test must parse the migration and assert these table names:

```js
const required = [
  'specforge_workspaces', 'specforge_sections', 'specforge_items', 'specforge_item_links',
  'specforge_approvals', 'specforge_drawing_findings', 'specforge_issues',
  'specforge_issue_items', 'specforge_commands',
];
for (const table of required) assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`, 'i'));
```

The PHP policy test must prove architect issue access, QS budget access without issue access, client-decision scoping, supplier package scoping, and God Mode having no policy bypass.

- [ ] **Step 2: Run and verify RED**

```powershell
node backend/tests/specforge-schema.mjs
php backend/tests/specforge-policy.php
```

Expected: FAIL because migration 014 and the policy functions do not exist.

- [ ] **Step 3: Create migration 014**

Use InnoDB, `utf8mb4_unicode_ci`, organization/project indexes, foreign keys, `lock_version INT NOT NULL DEFAULT 1`, UTC timestamps, and JSON/LONGTEXT fields consistent with the installed MariaDB version. Add `specforge` permission rows for `view`, `edit`, `review_budget`, `decide`, `issue`, `drawing_request`, `site_update`, and `govern` using idempotent `INSERT ... ON DUPLICATE KEY UPDATE` statements.

The issue tables must prevent duplicate revisions with:

```sql
UNIQUE KEY uq_specforge_issue_revision (workspace_id, revision)
```

The command table must prevent replay with different bodies using:

```sql
UNIQUE KEY uq_specforge_command (organization_id, actor_user_id, route_key, idempotency_key)
```

- [ ] **Step 4: Implement capability and payload validation**

Define a role-to-capability matrix matching the design. `specforge_require_capability` throws a `SpecForgeRepositoryError(403, ...)`; record filters use project membership and package/item assignment before role capabilities. Add strict field lengths, enum sets, non-negative money/lead-time checks and required revision tokens.

- [ ] **Step 5: Verify GREEN without mutating the remote target and commit**

```powershell
node backend/tests/specforge-schema.mjs
php backend/tests/specforge-policy.php
php -l backend/lib/specforge_validation.php
php -l backend/public/index.php
git commit -m "feat: add SpecForge schema and policy"
```

Expected: static schema/policy tests and PHP lint pass. Do not run migration 014 against the configured remote database in this task.

---

### Task 4: Implement the MariaDB repository and authenticated API routes

**Files:**
- Create: `backend/lib/specforge_repository.php`
- Create: `backend/tests/specforge-api.mjs`
- Modify: `backend/public/index.php`

**Interfaces:**
- Produces: `MariaDbSpecForgeRepository` with `getProjectAggregate`, `createWorkspace`, `createSection`, `updateSection`, `createItem`, `updateItem`, `duplicateItem`, `requestApproval`, `decideApproval`, `validateIssue`, `createIssue`, and `audit`.
- Produces: the approved `/api/v1/projects/:projectId/specforge` route family.
- Consumes: `current_identity`, `require_project_access`, `db`, `audit_log`, `jobs`, `If-Match`, and `Idempotency-Key` helpers.

- [ ] **Step 1: Write failing API boundary tests**

Start the local PHP API against a disposable/local MariaDB schema and assert:

```js
assert.equal((await request('GET', `/projects/${projectId}/specforge`, architect)).status, 200);
assert.equal((await request('POST', `/projects/${projectId}/specforge/items`, architect, validItem)).status, 201);
assert.equal((await request('PATCH', `/projects/${projectId}/specforge/items/${itemId}`, architect, patch, { 'If-Match': '1' })).status, 200);
assert.equal((await request('PATCH', `/projects/${projectId}/specforge/items/${itemId}`, architect, patch, { 'If-Match': '1' })).status, 409);
assert.equal((await request('GET', `/projects/${projectId}/specforge`, otherOrganization)).status, 404);
assert.equal((await request('POST', `/projects/${projectId}/specforge/issues`, quantitySurveyor, issueBody)).status, 403);
```

Also prove create/reload persistence, client/supplier filtered reads, audit rows, idempotent issue replay and complete transaction rollback when a snapshot insert fails.

- [ ] **Step 2: Run and verify RED**

```powershell
node backend/tests/specforge-api.mjs
```

Expected: FAIL with the first SpecForge endpoint returning 404.

- [ ] **Step 3: Implement repository transactions and hydration**

Follow `MariaDbCalculationRepository` conventions: organization predicate on every query, project access before fetch, prepared statements, `lock_version`, JSON encoding with `JSON_THROW_ON_ERROR`, and typed `SpecForgeRepositoryError` status mapping.

Issue creation must execute in one transaction:

```php
$this->pdo->beginTransaction();
try {
    $workspace = $this->lockWorkspace($identity, $projectId, $expectedVersion);
    $blockers = $this->validateIssue($identity, $workspace['id']);
    if ($blockers !== []) throw new SpecForgeRepositoryError(409, 'SpecForge issue is not ready.', ['blockers' => $blockers]);
    $issue = $this->insertIssueSnapshot($identity, $workspace, $body);
    $this->insertDownstreamCommands($identity, $issue);
    $this->audit($identity, 'specforge.issue.created', 'specforge_issue', $issue['id'], null, $issue);
    $this->pdo->commit();
    return $issue;
} catch (Throwable $error) {
    if ($this->pdo->inTransaction()) $this->pdo->rollBack();
    throw $error;
}
```

- [ ] **Step 4: Register routes in `backend/public/index.php`**

Require validation/repository files near the existing calculation requires. Route patterns must live before the final 404 and return camelCase response DTOs. All mutations require `If-Match` where a record exists and `Idempotency-Key` for create/decision/issue commands.

- [ ] **Step 5: Verify GREEN and commit**

```powershell
node backend/tests/specforge-api.mjs
php -l backend/lib/specforge_repository.php
php -l backend/public/index.php
git commit -m "feat: add persistent SpecForge API"
```

Expected: API persistence, isolation, RBAC, concurrency, idempotency and issue transaction tests pass.

---

### Task 5: Add the authenticated SpecForge client and explicit state hook

**Files:**
- Create: `lib/specforge/api.ts`
- Create: `lib/specforge/api.test.ts`
- Create: `components/modules/specforge/useSpecForgeWorkspace.ts`
- Create: `components/modules/specforge/useSpecForgeWorkspace.test.tsx`

**Interfaces:**
- Produces: `specForgeApi.get`, `createWorkspace`, `createItem`, `updateItem`, `duplicateItem`, `requestApproval`, `decideApproval`, `validateIssue`, `issue`, and `requestDrawingScan`.
- Produces: `SpecForgeViewState = loading | empty | ready | forbidden | conflict | error`.
- Consumes: `authenticatedFetch`, `API_BASE_URL`, `localIdentityHeaders`, active project, role and orientation.

- [ ] **Step 1: Write failing client/state tests**

Assert authorization headers come only from `authenticatedFetch`, mutation calls include idempotency/version headers, `404` with `code: SPECFORGE_WORKSPACE_EMPTY` maps to `empty`, `403` to `forbidden`, `409` to `conflict`, and `503` to a retryable `error` without local records.

- [ ] **Step 2: Run and verify RED**

```powershell
npx vitest run lib/specforge/api.test.ts components/modules/specforge/useSpecForgeWorkspace.test.tsx
```

Expected: FAIL because the client and hook do not exist.

- [ ] **Step 3: Implement typed requests and state transitions**

Use one request helper:

```ts
export class SpecForgeApiError extends Error {
  constructor(readonly status: number, readonly body: Record<string, unknown>) {
    super(typeof body.error === 'string' ? body.error : `SpecForge API ${status}`);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await authenticatedFetch(`${API_BASE_URL}${path}`, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new SpecForgeApiError(response.status, body);
  return body as T;
}
```

The hook must never import seed constants. It reloads the aggregate after successful mutations and preserves draft form input on conflict.

- [ ] **Step 4: Verify GREEN and commit**

```powershell
npx vitest run lib/specforge/api.test.ts components/modules/specforge/useSpecForgeWorkspace.test.tsx
npm run typecheck
git commit -m "feat: add SpecForge client state"
```

---

### Task 6: Replace the mock module with the V8-native core workspace

**Files:**
- Create: `components/modules/specforge/SpecForgeSmartAdd.tsx`
- Create: `components/modules/specforge/SpecForgeOverview.tsx`
- Create: `components/modules/specforge/SpecForgeRecords.tsx`
- Create: `components/modules/specforge/SpecForgeModule.test.tsx`
- Replace: `components/modules/SpecForgeModule.tsx`
- Create: `styles/specforge-v8.css`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: V8 tabs for overview, pictorial, sections, products, document preview, approvals, budget, BoM, drawings and issue.
- Consumes: controlled tab props, `useSpecForgeWorkspace`, domain summaries, `PageHeader`, `ToolVersionBadge`, `OrigamiIcon`, and V8 semantic tokens.

- [ ] **Step 1: Write failing component contracts**

Test loading, production empty state, authorized workspace creation, populated aggregate rendering, smart-add candidate confirmation, role-hidden actions, tab control, 409 recovery, and version `v1.1` in the active identity. Assert no runtime record comes from the former `SPEC_ITEMS`, `SECTIONS`, `APPROVALS`, `DRAWING_FINDINGS` or `ISSUE_PACKAGES` constants.

- [ ] **Step 2: Run and verify RED**

```powershell
npx vitest run components/modules/specforge/SpecForgeModule.test.tsx
```

Expected: FAIL because the current module renders hard-coded records and has no API state contract.

- [ ] **Step 3: Implement the thin composition root**

`SpecForgeModule.tsx` must remain under 220 lines and compose focused children:

```tsx
export function SpecForgeModule(props: SpecForgeModuleProps) {
  const [tab, setTab] = useControlledToolTab(props.activeTabKey, TABS, 'overview', props.onTabChange);
  const state = useSpecForgeWorkspace({ projectId: props.activeProject.id, role: props.currentRole, projectMode: props.isProjectMode !== false });
  return (
    <section className="sf-workspace" data-testid="specforge-workspace" data-state={state.kind}>
      <PageHeader title="SpecForge V2" origami={<OrigamiIcon name="specification" size={26} />} metadata={<ToolVersionBadge version="1.1" />} actions={<SpecForgeActions state={state} onTabChange={setTab} />} />
      <SpecForgeStateBoundary state={state}>
        <SpecForgeSmartAdd state={state} />
        <SpecForgeTabs activeTab={tab} onTabChange={setTab} />
        <SpecForgeTabContent activeTab={tab} state={state} />
      </SpecForgeStateBoundary>
    </section>
  );
}
```

- [ ] **Step 4: Implement V8 semantic styling**

Use only `--ax-*` surfaces/text/borders plus the approved cobalt domain accent. Add responsive one-column collapse at 700px, contained table overflow, visible focus, and reduced-motion rules. Search the new SpecForge files and reject `bg-white`, `text-[#102033]`, legacy shell markup and application-level fixed positioning.

- [ ] **Step 5: Verify GREEN and commit**

```powershell
npx vitest run components/modules/specforge/SpecForgeModule.test.tsx components/modules/specforge/useSpecForgeWorkspace.test.tsx
npm run typecheck
git commit -m "feat: rebuild SpecForge in Datum V8"
```

---

### Task 7: Complete issue, intelligence and downstream workflow behavior

**Files:**
- Create: `components/modules/specforge/SpecForgeIssue.tsx`
- Modify: `components/modules/specforge/SpecForgeRecords.tsx`
- Modify: `components/modules/specforge/SpecForgeModule.test.tsx`
- Modify: `backend/worker.php`
- Modify: `backend/database/seed.php`
- Modify: `backend/tests/specforge-api.mjs`

**Interfaces:**
- Produces: readiness validation, immutable issue command, real downstream status list and prototype seed.
- Consumes: issue API, jobs table, existing worker environment policy and design-approved readiness codes.

- [ ] **Step 1: Write failing workflow tests**

Prove a blocked issue lists exact blockers, a ready issue creates one immutable revision, replay with the same idempotency key returns the same issue, a changed body with the same key returns `409`, jobs show real statuses, and the prototype seed is idempotent. Prove the production environment never invokes or exposes seed creation.

- [ ] **Step 2: Run and verify RED**

```powershell
node backend/tests/specforge-api.mjs
npx vitest run components/modules/specforge/SpecForgeModule.test.tsx
```

Expected: FAIL at issue/downstream/seed assertions.

- [ ] **Step 3: Implement downstream job processing and prototype seed**

Create job types `specforge.action-centre`, `specforge.messaging`, `specforge.programme`, `specforge.bom-sync`, `specforge.rfq`, `specforge.document`, and `specforge.escrow`. The worker marks a job `integration_required` when its owning integration is unconfigured and records a useful `last_error`; it must not mark it completed.

Guard seed execution with `architex_demo_data_allowed($config)` and an explicit seed flag. Use stable IDs plus upserts so a second run creates no duplicates.

- [ ] **Step 4: Verify GREEN and commit**

```powershell
node backend/tests/specforge-api.mjs
npx vitest run components/modules/specforge/SpecForgeModule.test.tsx
php -l backend/worker.php
php -l backend/database/seed.php
git commit -m "feat: complete SpecForge issue workflow"
```

---

### Task 8: Browser, visual and production-build certification

**Files:**
- Create: `e2e/v8-specforge-contract.spec.ts`
- Create: `scripts/capture-v8-specforge.mjs`
- Create: `release/evidence/v8-specforge/reference.png`
- Create: `release/evidence/v8-specforge/implementation.png`
- Create: `release/evidence/v8-specforge/computed-styles.json`
- Create: `release/evidence/v8-specforge/README.md`

**Interfaces:**
- Produces: executable browser and computed-style evidence.
- Consumes: supplied V8 reference HTML, SpecForge pack prototype, local API and current production build.

- [ ] **Step 1: Write the browser contract before final UI adjustment**

Cover authenticated project load, `v1.1`, persisted create/reload, client/supplier filtering, God Mode record-policy retention, all ten tabs, smart-add confirmation, blocked/ready issue states, light/dark reload, keyboard focus, 390px overflow, axe violations, console errors, failed requests and 5xx responses.

- [ ] **Step 2: Run and verify RED where parity or behavior remains**

```powershell
$env:E2E_PRODUCTION_BUILD='true'
npx playwright test e2e/v8-specforge-contract.spec.ts --project=chromium --workers=1
```

Expected: any remaining behavior/parity gap fails with a focused locator or computed-style assertion.

- [ ] **Step 3: Capture and compare reference/implementation evidence**

At 1600x1000 capture page header, version badge, command bar, tab strip, first summary panel, first product row, issue gate and mobile layout. Store rectangles plus font, color, background, border, radius, padding and gap values in `computed-styles.json`. Adjust only SpecForge-owned CSS until the intended V8 shell geometry and semantic styles match within one pixel where the reference defines them.

- [ ] **Step 4: Run the full local gate**

```powershell
npx vitest run lib/specforge components/modules/specforge components/ui/ToolVersionBadge.test.tsx components/v8/__tests__/V8ToolRegistry.test.tsx
node backend/tests/specforge-schema.mjs
php backend/tests/specforge-policy.php
node backend/tests/specforge-api.mjs
npm run typecheck
npm run build
$env:ARCHITEX_STATIC_EXPORT='1'
$env:NEXT_PUBLIC_API_BASE_URL='https://api.architex.co.za/api/v1'
$env:NEXT_PUBLIC_PROTOTYPE_MODE='true'
npm run build
```

Expected: all focused suites, PHP checks, typecheck, standalone build and fresh static export pass.

- [ ] **Step 5: Commit local certification**

```powershell
git commit -m "test: certify SpecForge V8 parity"
```

---

### Task 9: Migrate, deploy and live-certify the test release

**Files:**
- Modify: `scripts/certify-live-v8.mjs`
- Create: `release/evidence/v8-specforge/live/browser-certification.json`
- Create: `release/evidence/v8-specforge/live/specforge.png`
- Create: `release/evidence/v8-specforge/live/specforge-dark.png`
- Create: `release/evidence/v8-specforge/live/specforge-mobile.png`
- Modify: `docs/v8-remediation/evidence/V8_REFERENCE_VS_LIVE_SIDE_BY_SIDE_AUDIT_2026-08-26.md`

**Interfaces:**
- Produces: current remote migration proof, atomic test-host deployment, exact asset hash and live browser/API/MariaDB evidence.
- Consumes: migration 014, static `out`, `deploy-static-ftps.py`, test credentials and configured MariaDB target.

- [ ] **Step 1: Back up and apply migration 014 to the authorized test API database**

Capture pre-migration `schema_migrations`, table list and SpecForge row counts. Run:

```powershell
php backend/database/migrate.php
```

Expected: `apply 014_specforge_core.sql`, then a second run reports it as skipped. Verify all SpecForge tables and permission rows exist before any frontend deployment.

- [ ] **Step 2: Run authenticated API smoke proof**

Using the real architect session, create or load the designated prototype workspace, create a unique item, reload it, update with the current version, verify stale update conflict, validate issue readiness, and confirm cross-role filtering. Record request IDs/statuses without storing passwords or bearer tokens.

- [ ] **Step 3: Deploy the fresh static export atomically to test only**

```powershell
python scripts/deploy-static-ftps.py out
```

Run only after `ARCHITEX_FTP_USER` and `ARCHITEX_FTP_PASSWORD` have been populated from the approved session secret source; never write their values into the plan or evidence. Expected: a candidate upload, timestamped rollback directory and swap of only `/public_html/architex.co.za/ai/public_html/test.architex.co.za`. Never mutate the apex production docroot.

- [ ] **Step 4: Extend and run live browser certification**

Add SpecForge checks to `certify-live-v8.mjs`: registry `v1.1`, open from Project Datum, real API aggregate, create/reload persistence, dark/light persistence, role-filtered read, issue blocker behavior, mobile overflow, logout and relogin. Require zero failed requests and zero 5xx responses; an initial unauthenticated refresh `401` may be recorded separately as expected session discovery.

- [ ] **Step 5: Verify exact deployed asset hash and commit evidence**

Hash the current local `out/_next/static/chunks/app/page-*.js`, download the matching cache-busted live asset, and require identical SHA-256 values. Update the audit with distinct local and live results.

```powershell
git commit -m "deploy: certify SpecForge V8 live"
```

Expected: live SpecForge `v1.1` passes real authentication, MariaDB persistence/reload, RBAC, V8 theme, issue gating and asset-hash proof on `test.architex.co.za`.

---

## Execution order and stop conditions

- Execute tasks sequentially because schema, API, client, UI and live evidence depend on the preceding contract.
- Stop before remote migration if the database target cannot be confirmed as the authorized test API database or if the pre-migration backup/readback fails.
- Stop deployment if the fresh static export lacks `.htaccess`, `index.html`, `preview3.html` or `_next`.
- Stop release certification if the live asset hash differs, MariaDB persistence cannot be proven, any unauthorized record is visible, a request fails, or a 5xx response occurs.
- Do not mark SpecForge complete from screenshots, static health, a build, or frontend-only mocked browser routes.
