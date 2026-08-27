# SpecForge Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make SpecForge authentication, RBAC, tenant isolation, issued revisions, test fixtures, Smart Add, and browser certification conform to the approved remediation design.

**Architecture:** Keep the existing V8 module and MariaDB repository, but deepen their boundaries: the browser client delegates identity entirely to `authenticatedFetch`; one TypeScript capability module owns presentation policy and is checked against authoritative PHP policy; repository helpers require organization scope; issued edits create draft successors; and verification uses disposable schemas and clean browser fixtures. Missing source connectors return explicit `integration_required` candidates instead of fabricated records.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, PHP 8, PDO/MariaDB, Node.js API harness, Playwright.

## Global Constraints

- `authenticatedFetch` is the only SpecForge client mechanism allowed to attach authentication or authorization information.
- Every tenant-owned SpecForge query includes `organization_id`.
- Issued snapshot JSON and snapshot hashes are immutable.
- Server-side PHP authorization remains authoritative; UI checks are presentation only.
- Test schemas have unique names ending in `_test`, use approved hosts, and are always dropped.
- Missing integrations report `integration_required`; no supplier, library, drawing, or AI result is fabricated.
- Single-column collapse occurs at exactly `700px` and body-level horizontal overflow is forbidden.
- Local proof remains distinct from remote migration, deployment, and release certification.

---

### Task 1: Remove Caller Identity and Centralize UI Capabilities

**Files:**
- Create: `lib/specforge/capabilities.ts`
- Create: `lib/specforge/capabilities.test.ts`
- Modify: `lib/specforge/api.ts`
- Modify: `lib/specforge/api.test.ts`
- Modify: `components/modules/specforge/useSpecForgeWorkspace.ts`
- Modify: `components/modules/specforge/useSpecForgeWorkspace.test.tsx`
- Modify: `components/modules/SpecForgeModule.tsx`
- Modify: `components/modules/specforge/SpecForgeModule.test.tsx`
- Test: `backend/tests/specforge-policy.php`

**Interfaces:**
- Produces: `SpecForgeCapability = 'view' | 'author' | 'create_workspace' | 'issue' | 'review_budget' | 'drawing_request'`.
- Produces: `canUseSpecForge(role: RoleKey, capability: SpecForgeCapability): boolean`.
- Produces: identity-free `specForgeApi` methods and `useSpecForgeWorkspace(projectId, enabled)`.
- Consumes: authoritative PHP `specforge_capabilities()` matrix.

- [ ] **Step 1: Write failing client and capability tests**

```ts
it('delegates identity exclusively to authenticatedFetch', async () => {
  authenticatedFetch.mockResolvedValue(response({ workspace: null }));
  await specForgeApi.get('project-1');
  const headers = new Headers(authenticatedFetch.mock.calls[0][1]?.headers);
  expect(headers.has('X-Architex-Role')).toBe(false);
  expect(headers.has('X-Architex-User')).toBe(false);
});

it.each(['engineer', 'energy_professional', 'fire_engineer'] as const)(
  'allows assigned technical author %s to use Smart Add',
  role => expect(canUseSpecForge(role, 'author')).toBe(true),
);
```

- [ ] **Step 2: Run RED**

Run: `npx vitest run lib/specforge/api.test.ts lib/specforge/capabilities.test.ts components/modules/specforge/useSpecForgeWorkspace.test.tsx components/modules/specforge/SpecForgeModule.test.tsx`

Expected: FAIL because API/hook methods still require identity and technical authors do not receive the Add action.

- [ ] **Step 3: Implement the canonical presentation contract**

```ts
const CAPABILITIES: Record<SpecForgeCapability, ReadonlySet<RoleKey>> = {
  view: new Set(['architect','bep','engineer','energy_professional','fire_engineer','quantity_surveyor','client','developer','contractor','subcontractor','supplier','site_manager','organisation_admin','admin','platform_admin']),
  author: new Set(['architect','bep','engineer','energy_professional','fire_engineer','contractor','subcontractor','supplier','platform_admin']),
  create_workspace: new Set(['architect','bep','organisation_admin','admin','platform_admin']),
  issue: new Set(['architect','bep','platform_admin']),
  review_budget: new Set(['architect','bep','quantity_surveyor','platform_admin']),
  drawing_request: new Set(['architect','bep','engineer','energy_professional','fire_engineer','platform_admin']),
};

export const canUseSpecForge = (role: RoleKey, capability: SpecForgeCapability): boolean =>
  CAPABILITIES[capability].has(role);

export const specForgeCapabilitySnapshot = (): Record<SpecForgeCapability, RoleKey[]> =>
  Object.fromEntries(Object.entries(CAPABILITIES).map(([key, roles]) => [key, [...roles].sort()])) as Record<SpecForgeCapability, RoleKey[]>;
```

Change `request<T>` to `request<T>(path: string, init: RequestInit = {})`, remove `SpecForgeIdentity`, remove `localIdentityHeaders`, and remove identity parameters from every exported API method. Change the hook signature to:

```ts
export function useSpecForgeWorkspace(projectId: string | null, enabled = true)
```

Use `canUseSpecForge(effectiveAuthorizationRole, 'author')` for Smart Add and remove `demoIdentity` from `SpecForgeModule`.

- [ ] **Step 4: Add PHP/TypeScript parity coverage**

Extend `backend/tests/specforge-policy.php` to compare the role lists emitted by a small Node invocation of `specForgeCapabilitySnapshot()` with `specforge_capabilities()` for matching presentation capabilities. Fail with the capability name and differing roles.

- [ ] **Step 5: Run GREEN and commit**

Run: `npx vitest run lib/specforge/api.test.ts lib/specforge/capabilities.test.ts components/modules/specforge/useSpecForgeWorkspace.test.tsx components/modules/specforge/SpecForgeModule.test.tsx`

Run: `php backend/tests/specforge-policy.php`

Expected: all tests pass and no SpecForge runtime import references `demoIdentity` or `localIdentityHeaders`.

```powershell
git add lib/specforge components/modules/SpecForgeModule.tsx components/modules/specforge backend/tests/specforge-policy.php
git commit -m "fix: enforce SpecForge auth and capability boundaries"
```

---

### Task 2: Enforce Organization Scope in Every Repository Query

**Files:**
- Modify: `backend/lib/specforge_repository.php`
- Modify: `backend/tests/specforge-api.mjs`
- Modify: `backend/tests/specforge-schema.mjs`

**Interfaces:**
- Produces: `rows(string $table, string $organizationId, string $workspaceId, ?string $order = null): array`.
- Produces: `issueReadiness(string $organizationId, string $workspaceId): array`.
- Produces: `snapshot(string $organizationId, string $workspaceId): array`.
- Consumes: authenticated `identity['org']`.

- [ ] **Step 1: Write failing cross-tenant and SQL-shape tests**

Add an API fixture with a second organization whose workspace, section, item, approval, finding, issue, and command reuse predictable workspace relationships. Assert the first organization cannot load, validate, snapshot, mutate, or list any second-organization record. Extend the schema contract to reject repository SQL over tenant-owned tables unless it contains `organization_id`.

```js
assert.equal(crossTenantLoad.status, 404);
assert.equal(crossTenantUpdate.status, 404);
assert.equal(await countRows(db, 'specforge_issue_items', 'organization_id = ?', [foreignOrgId]), foreignIssueItemCount);
```

- [ ] **Step 2: Run RED**

Run: `node backend/tests/specforge-schema.mjs`

Run under the disposable harness: `node backend/tests/specforge-api.mjs`

Expected: FAIL on `rows`, readiness, and snapshot queries that currently scope only by workspace ID.

- [ ] **Step 3: Require organization scope in helpers**

```php
private function rows(string $table, string $organizationId, string $workspaceId, ?string $order = null): array
{
    $allowed = ['specforge_sections','specforge_items','specforge_approvals','specforge_drawing_findings','specforge_issues','specforge_commands'];
    if (!in_array($table, $allowed, true)) throw new LogicException('Unsupported SpecForge table.');
    $order ??= $table === 'specforge_approvals' ? 'requested_at ASC, id ASC' : 'created_at ASC, id ASC';
    $stmt = $this->pdo->prepare("SELECT * FROM `{$table}` WHERE organization_id=? AND workspace_id=? ORDER BY {$order}");
    $stmt->execute([$organizationId, $workspaceId]);
    return $stmt->fetchAll();
}
```

Thread `$identity['org']` through aggregate hydration, readiness, snapshot construction, item-link snapshots, and every scalar query. Bind `organization_id=? AND workspace_id=?` together.

- [ ] **Step 4: Run GREEN and commit**

Run: `node backend/tests/specforge-schema.mjs`

Run: `php -l backend/lib/specforge_repository.php`

Run: `node backend/tests/specforge-api.mjs`

Expected: schema and cross-tenant API contracts pass.

```powershell
git add backend/lib/specforge_repository.php backend/tests/specforge-api.mjs backend/tests/specforge-schema.mjs
git commit -m "fix: scope SpecForge persistence by organization"
```

---

### Task 3: Create Draft Successors for Issued Items

**Files:**
- Modify: `backend/lib/specforge_repository.php`
- Modify: `backend/tests/specforge-api.mjs`
- Modify: `lib/specforge/types.ts`
- Modify: `lib/specforge/api.ts`
- Modify: `lib/specforge/api.test.ts`

**Interfaces:**
- Produces: update response `{ item, successorCreated, sourceItemId }`.
- Produces: immutable issued source row and new draft successor row.
- Consumes: issued snapshot membership, workspace revision, `If-Match` source lock version.

- [ ] **Step 1: Write failing immutability tests**

After creating an issue, capture the source item, issue snapshot JSON, and snapshot hash. PATCH the source item with its current lock version and assert:

```js
assert.equal(update.status, 200);
assert.equal(update.body.successor_created, true);
assert.notEqual(update.body.item.id, issuedItemId);
assert.equal(update.body.item.status, 'draft');
assert.equal(update.body.item.source_revision, nextDraftRevision);
assert.equal((await loadItem(issuedItemId)).title, issuedTitle);
assert.equal((await loadItem(issuedItemId)).superseded_by, update.body.item.id);
assert.deepEqual(await loadIssueSnapshots(issueId), snapshotsBefore);
assert.equal((await loadIssue(issueId)).snapshot_hash, hashBefore);
```

Also assert a stale `If-Match` returns `409` and creates no successor.

- [ ] **Step 2: Run RED**

Run: `node backend/tests/specforge-api.mjs`

Expected: FAIL because the issued item is modified in place.

- [ ] **Step 3: Implement successor creation in one transaction**

Add `itemWasIssued($organizationId, $workspaceId, $itemId)` using an organization-scoped `specforge_issue_items` query. When true, lock the source, verify the version, insert a copied row with a new UUID, applied patch, `status='draft'`, the workspace's next draft revision, and `superseded_by=NULL`; then update only the source `superseded_by` and lock version. Audit `specforge.item.successor_created` with both IDs. Otherwise retain the current in-place draft update path.

Return:

```php
return ['item' => $updated, 'successor_created' => $successorCreated, 'source_item_id' => $itemId];
```

- [ ] **Step 4: Map the response and run GREEN**

Map `successor_created` and `source_item_id` in the client without changing aggregate item mapping. Run:

`node backend/tests/specforge-api.mjs`

`npx vitest run lib/specforge/api.test.ts`

Expected: issued immutability, hash stability, stale-write, and client mapping tests pass.

- [ ] **Step 5: Commit**

```powershell
git add backend/lib/specforge_repository.php backend/tests/specforge-api.mjs lib/specforge/types.ts lib/specforge/api.ts lib/specforge/api.test.ts
git commit -m "fix: preserve issued SpecForge revisions"
```

---

### Task 4: Audit Authorization Denials Without Disclosure

**Files:**
- Modify: `backend/lib/specforge_validation.php`
- Modify: `backend/lib/specforge_repository.php`
- Modify: `backend/public/index.php`
- Modify: `backend/tests/specforge-policy.php`
- Modify: `backend/tests/specforge-api.mjs`

**Interfaces:**
- Produces: `SpecForgeAuthorizationError` with `reason` and `capability`.
- Produces: `recordDenial(identity, projectId, capability, reason)` audit helper.
- Consumes: authenticated actor/org and non-sensitive request scope.

- [ ] **Step 1: Write failing denial-audit tests**

Exercise organization, membership, capability, assignment, and issued-state denials. Assert the response remains non-disclosing and one audit row exists:

```js
assert.equal(denial.status, 403);
assert.equal(JSON.stringify(denial.body).includes(foreignRecordId), false);
assert.deepEqual(await latestDenialAudit(actorId), {
  action_key: 'specforge.authorization.denied',
  reason: 'capability',
  capability: 'issue',
  project_id: projectId,
});
```

- [ ] **Step 2: Run RED**

Run: `php backend/tests/specforge-policy.php`

Run: `node backend/tests/specforge-api.mjs`

Expected: denials return correctly but no audit row is written.

- [ ] **Step 3: Add structured authorization errors and repository audit wrapper**

```php
final class SpecForgeAuthorizationError extends RuntimeException
{
    public function __construct(public readonly string $reason, public readonly string $capability)
    {
        parent::__construct('SpecForge access is not available for this project scope.', 403);
    }
}
```

Make policy checks throw this error. Catch it at the repository/public route boundary, insert `specforge.authorization.denied` using only actor org/user, requested project, capability, and reason, then rethrow. Ensure audit failure does not convert the original denial into access.

- [ ] **Step 4: Run GREEN and commit**

Run: `php backend/tests/specforge-policy.php`

Run: `node backend/tests/specforge-api.mjs`

Run: `php -l backend/lib/specforge_validation.php; php -l backend/lib/specforge_repository.php; php -l backend/public/index.php`

Expected: every denial class is audited once and responses reveal no foreign identifiers.

```powershell
git add backend/lib/specforge_validation.php backend/lib/specforge_repository.php backend/public/index.php backend/tests/specforge-policy.php backend/tests/specforge-api.mjs
git commit -m "fix: audit SpecForge authorization denials"
```

---

### Task 5: Provision Disposable API and Browser Fixtures

**Files:**
- Create: `scripts/specforge-test-db.ps1`
- Modify: `scripts/test-api.ps1`
- Modify: `backend/tests/specforge-api.mjs`
- Modify: `e2e/v8-specforge-contract.spec.ts`
- Modify: `playwright.config.ts`

**Interfaces:**
- Produces: unique `SPECFORGE_TEST_DB` lease ending in `_test`.
- Produces: guaranteed database drop and browser fixture cleanup.
- Consumes: existing loopback/allowlist safeguards in `scripts/test-api.ps1`.

- [ ] **Step 1: Write failing harness safety tests**

Add a preflight mode that asserts generated names match `^architex_specforge_[0-9]+_[a-f0-9]{12}_test$`, rejects non-test names, rejects unapproved hosts, and reports cleanup in a marker file. Add an E2E fixture test that fails deliberately after record creation and verifies teardown removed the record.

- [ ] **Step 2: Run RED**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/specforge-test-db.ps1 -Preflight`

Expected: FAIL because the wrapper does not exist and the API test still defaults to a fixed schema.

- [ ] **Step 3: Implement the disposable wrapper**

Reuse the existing `scripts/test-api.ps1` database creation/drop functions. The wrapper must create the schema, set `SPECFORGE_TEST_DB`, run migration and seed commands, invoke `node backend/tests/specforge-api.mjs`, and drop the schema in `finally`.

Remove the fixed fallback from the Node test:

```js
const database = process.env.SPECFORGE_TEST_DB;
assert.ok(database, 'SPECFORGE_TEST_DB must be supplied by the disposable test harness');
assert.match(database, /^architex_specforge_[0-9]+_[a-f0-9]{12}_test$/);
```

Use Playwright `test.afterEach` with an authenticated test-only cleanup fixture guarded by prototype/test mode and the unique test-run prefix. Never expose cleanup in production mode.

- [ ] **Step 4: Run GREEN and commit**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/specforge-test-db.ps1 -Preflight`

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/specforge-test-db.ps1`

Expected: unique schema created, API suite passed, and schema dropped even when a controlled child command fails.

```powershell
git add scripts/specforge-test-db.ps1 scripts/test-api.ps1 backend/tests/specforge-api.mjs e2e/v8-specforge-contract.spec.ts playwright.config.ts
git commit -m "test: isolate SpecForge verification data"
```

---

### Task 6: Make Every Smart Add Source Honest and Interactive

**Files:**
- Modify: `lib/specforge/types.ts`
- Modify: `lib/specforge/api.ts`
- Modify: `lib/specforge/api.test.ts`
- Modify: `components/modules/specforge/SpecForgeSmartAdd.tsx`
- Modify: `components/modules/specforge/SpecForgeModule.test.tsx`
- Modify: `styles/specforge-v8.css`

**Interfaces:**
- Produces: `SpecForgeCandidateState = review | integration_required | requesting | error`.
- Produces: source methods `manual`, `supplier_url`, `image`, `practice_library`, `drawing`.
- Consumes: existing `requestDrawingScan`; no new fabricated intelligence endpoint.

- [ ] **Step 1: Write failing source-state tests**

```ts
it.each([
  ['Paste supplier URL', 'Supplier catalogue integration is required'],
  ['Upload product image', 'Product image intelligence integration is required'],
  ['Search practice library', 'Practice library integration is required'],
] as const)('reports an honest unavailable source for %s', (button, message) => {
  renderSmartAdd();
  fireEvent.click(screen.getByRole('button', { name: button }));
  expect(screen.getByRole('status')).toHaveTextContent(message);
  expect(actions.createItem).not.toHaveBeenCalled();
});

it('submits a real drawing scan request', async () => {
  renderSmartAdd();
  fireEvent.click(screen.getByRole('button', { name: 'Read project drawings' }));
  fireEvent.change(screen.getByLabelText('Drawing revision'), { target: { value: 'drawing-rev-42' } });
  fireEvent.click(screen.getByRole('button', { name: 'Request drawing scan' }));
  await waitFor(() => expect(actions.requestDrawingScan).toHaveBeenCalledWith('drawing-rev-42'));
});
```

- [ ] **Step 2: Run RED**

Run: `npx vitest run lib/specforge/api.test.ts components/modules/specforge/SpecForgeModule.test.tsx`

Expected: FAIL because source buttons are disabled.

- [ ] **Step 3: Implement explicit source modes**

Replace disabled buttons with accessible buttons that set `sourceMethod`. Supplier URL, image, and library render a `role="status"` candidate with `integration_required`, exact missing integration copy, and no Confirm action. Drawing renders a revision field and calls `onRequestDrawingScan`. Manual mode retains review/confirm persistence. Every state displays `sourceType` and provenance/reason.

- [ ] **Step 4: Run GREEN and commit**

Run: `npx vitest run lib/specforge/api.test.ts components/modules/specforge/SpecForgeModule.test.tsx`

Run: `npx eslint lib/specforge components/modules/specforge/SpecForgeSmartAdd.tsx`

Expected: all source methods are keyboard-reachable, unavailable sources are honest, drawing uses the real API, and only confirmed manual candidates persist.

```powershell
git add lib/specforge components/modules/specforge/SpecForgeSmartAdd.tsx components/modules/specforge/SpecForgeModule.test.tsx styles/specforge-v8.css
git commit -m "feat: complete honest SpecForge Smart Add sources"
```

---

### Task 7: Certify Issue Flow and 700px Responsive Behavior

**Files:**
- Modify: `e2e/v8-specforge-contract.spec.ts`
- Modify: `components/modules/specforge/SpecForgeIssue.tsx`
- Modify: `components/modules/specforge/SpecForgeModule.test.tsx`
- Modify: `styles/specforge-v8.css`
- Modify: `release/evidence/v8-specforge/README.md`
- Modify: `release/evidence/v8-specforge/computed-styles.json`

**Interfaces:**
- Produces: browser proof for validate → issue → reload → jobs → idempotent replay → cleanup.
- Produces: computed overflow and one-column evidence at `700px` and `390px`.
- Consumes: disposable browser fixture from Task 5.

- [ ] **Step 1: Write failing browser and responsive contracts**

Assert the browser observes the validation response, creates one issue, reloads the same issue/hash, renders persisted downstream states, replays the same idempotency key without creating a second issue, and removes the fixture. At 700px assert:

```ts
expect(await page.locator('.specforge-metrics').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(1);
expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
```

- [ ] **Step 2: Run RED**

Run: `npx playwright test e2e/v8-specforge-contract.spec.ts --project=chromium --workers=1`

Expected: FAIL because the current ready test does not issue/reload and CSS collapses only at 640px.

- [ ] **Step 3: Complete issue UI state and responsive CSS**

Ensure `SpecForgeIssue` calls `validateIssue` before `issue`, keeps and reuses the idempotency key for retry, reloads after success, then calls `listJobs(issue.id)`. Change:

```css
@media (max-width:700px) {
  .specforge-metrics,
  .specforge-pictorial,
  .specforge-sections,
  .specforge-approval-grid,
  .specforge-recent-items { grid-template-columns:1fr; }
}
```

Keep table scrolling inside `.specforge-table-scroll` and add `min-width:0` to grid children that otherwise create body overflow.

- [ ] **Step 4: Run focused browser and local gates**

Run: `npx playwright test e2e/v8-specforge-contract.spec.ts --project=chromium --workers=1`

Run: `npx vitest run lib/specforge components/modules/specforge components/ui/ToolVersionBadge.test.tsx components/v8/__tests__/V8ToolRegistry.test.tsx`

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/specforge-test-db.ps1`

Run: `php backend/tests/specforge-policy.php`

Run: `npm run typecheck`

Run: `npx eslint lib/specforge components/modules/SpecForgeModule.tsx components/modules/specforge e2e/v8-specforge-contract.spec.ts`

Run: `npm run build`

Expected: all gates pass with no failed requests, unexpected console errors, `5xx`, body overflow, fixed-schema mutation, or identity headers.

- [ ] **Step 5: Refresh honest local evidence and commit**

Update `release/evidence/v8-specforge/README.md` with exact commands, timestamps, results, and the explicit statement that remote migration/deployment/live MariaDB certification was not performed. Update computed styles from the executed browser capture only.

```powershell
git add e2e/v8-specforge-contract.spec.ts components/modules/specforge/SpecForgeIssue.tsx components/modules/specforge/SpecForgeModule.test.tsx styles/specforge-v8.css release/evidence/v8-specforge
git commit -m "test: certify remediated SpecForge locally"
```

## Completion Gate

- All seven tasks are committed independently.
- `git diff --check` passes.
- Focused unit/component, PHP policy, disposable API, browser, typecheck, targeted lint, and production build gates pass.
- Any unavailable integration is visibly `integration_required` and creates no record.
- No claim of remote or release certification is made without separate live evidence.
