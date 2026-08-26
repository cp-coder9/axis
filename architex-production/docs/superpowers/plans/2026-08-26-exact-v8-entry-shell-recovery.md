# Exact V8 Entry and Shared Shell Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This repository's user-directed execution mode is inline; do not dispatch subagents.

**Goal:** Restore the normal public authentication journey and certify an exact, reusable V8 shared shell against the supplied reference before migrating any individual tool page.

**Architecture:** A stable Shadow DOM bridge mounts the canonical public homepage without relying on `document.currentScript`. After real authentication, a reference-derived shell contract controls rail, navigator, top bar, canvas, inspector, theme, and responsive geometry while existing modules continue to obtain data and permissions from the authenticated `/api/v1` backend.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.9, Vitest 3, Playwright 1.62, PHP API, MariaDB, PowerShell deployment tooling.

## Global Constraints

- Public homepage authority is `E:\axis-1\preview(3).html`.
- Authenticated interface authority is `E:\Downloads\architex_datum_os_integrated_modules_v8_engineering_godmode.html`.
- Runtime data comes only from authenticated `/api/v1` responses backed by MariaDB.
- God Mode changes structural discoverability only; record-level RBAC remains enforced by the API.
- The normal parity catalogue remains 45 tools; non-reference capabilities belong in `Extensions`.
- No surface passes on a build, static health response, direct API login, or historical screenshot alone.
- Work inline and one surface at a time.
- Preserve unrelated working-tree changes and stage only explicitly owned files.
- Every production-code change must be preceded by a focused test observed failing for the intended reason.

## File Map

- `components/access/landing-runtime.ts`: pure transformation that binds Preview 3 runtime code to an explicit ShadowRoot bridge.
- `components/access/landing-runtime.test.ts`: regression tests for the `document.currentScript` failure and bridge cleanup contract.
- `components/access/PublicLandingPage.tsx`: fetches the canonical asset, mounts its Shadow DOM, installs/removes the runtime bridge, and routes public authentication controls.
- `components/access/PublicLandingPage.test.tsx`: canonical asset and source-boundary tests.
- `components/access/AccessGateway.tsx`: unauthenticated landing/access state and real sign-in/registration forms.
- `components/providers/AuthProvider.tsx`: real login, profile restoration, registration, refresh, and revocation state.
- `components/providers/AuthProvider.test.tsx`: reducer and real session-boundary contracts.
- `e2e/access.spec.ts`: normal browser entry, sign-in, registration, reload, and logout coverage.
- `scripts/extract-v8-shell-contract.mjs`: extracts deterministic shell tokens and labels from the supplied reference.
- `fixtures/v8-shell-contract.json`: committed reference measurements and presentation inventory.
- `lib/v8-shell-contract.ts`: typed access to the generated reference contract.
- `lib/__tests__/v8-shell-contract.test.ts`: rejects missing or drifted reference contract fields.
- `lib/useWorkspaceTheme.ts`: canonical `architex-theme` persistence and document theme application.
- `lib/__tests__/useWorkspaceTheme.test.tsx`: theme parsing and source contract tests.
- `components/layout/TopBar.tsx`: reference control order, text-plus-icon theme action, role lens, and God Mode action.
- `components/layout/OsRail.tsx`: reference rail dimensions, naming, iconography, and collapsed state.
- `components/layout/ContextNavigator.tsx`: reference navigator dimensions and grouping.
- `components/layout/ContextInspector.tsx`: reference inspector dimensions and tabs.
- `app/page.tsx`: composes the single shared shell and exposes stable region test IDs.
- `app/globals.css`: reference shell tokens, geometry, colours, typography, surfaces, responsive states, and dark theme.
- `e2e/v8-shell-contract.spec.ts`: rectangle, style, control-order, theme, and responsive assertions.
- `e2e/v8-shell-visual.spec.ts`: existing interaction and accessibility regression suite updated only where the new canonical contract intentionally changes visible labels.
- `docs/v8-remediation/evidence/V8_REFERENCE_VS_LIVE_SIDE_BY_SIDE_AUDIT_2026-08-26.md`: existing evidence ledger updated with executed results.

---

### Task 1: Make the landing runtime host explicit

**Files:**
- Create: `components/access/landing-runtime.ts`
- Create: `components/access/landing-runtime.test.ts`
- Modify: `components/access/PublicLandingPage.tsx`
- Modify: `components/access/PublicLandingPage.test.tsx`

**Interfaces:**
- Produces: `installLandingRuntime(root: ShadowRoot, runtime: string): () => void`
- Consumes: the already parsed Preview 3 runtime text and the mounted landing ShadowRoot.

- [ ] **Step 1: Write the failing runtime-bridge test**

```ts
import { describe, expect, it } from 'vitest';
import { bindLandingRuntime } from './landing-runtime';

describe('Preview 3 landing runtime bridge', () => {
  it('uses the supplied bridge instead of document.currentScript discovery', () => {
    const bound = bindLandingRuntime('(() => { const root = document; root.getElementById("hero"); })();');
    expect(bound).toContain('window.__architexLandingBridge.root');
    expect(bound).not.toContain('document.currentScript');
    expect(bound).toContain('root.getElementById("hero")');
  });
});
```

- [ ] **Step 2: Run the test and observe RED**

Run: `npx vitest run components/access/landing-runtime.test.ts`

Expected: FAIL because `./landing-runtime` does not exist.

- [ ] **Step 3: Implement the pure bridge and lifecycle installer**

```ts
declare global {
  interface Window {
    __architexLandingBridge?: { root: ShadowRoot };
  }
}

export function bindLandingRuntime(runtime: string): string {
  return runtime
    .replace('(() => {', '(() => { const root = window.__architexLandingBridge.root;')
    .replaceAll('root = document', 'root = window.__architexLandingBridge.root')
    .replaceAll('document.getElementById', 'root.getElementById')
    .replaceAll('document.body.contains(canvas)', 'root.contains(canvas)');
}

export function installLandingRuntime(root: ShadowRoot, runtime: string): () => void {
  window.__architexLandingBridge = { root };
  const script = document.createElement('script');
  script.dataset.preview3Runtime = 'true';
  script.textContent = bindLandingRuntime(runtime);
  root.appendChild(script);
  return () => {
    script.remove();
    if (window.__architexLandingBridge?.root === root) delete window.__architexLandingBridge;
  };
}
```

Update `PublicLandingPage.tsx` to call `installLandingRuntime(landingRoot, page.runtime)` and invoke its cleanup before clearing `landingRoot`. Remove the component-owned `__architexLandingHost` global and inline string replacement.

- [ ] **Step 4: Run focused tests and observe GREEN**

Run: `npx vitest run components/access/landing-runtime.test.ts components/access/PublicLandingPage.test.tsx`

Expected: both files PASS and the source contains no `document.currentScript` or `__architexLandingHost`.

- [ ] **Step 5: Commit only the owned landing files**

```powershell
git add -- components/access/landing-runtime.ts components/access/landing-runtime.test.ts components/access/PublicLandingPage.tsx components/access/PublicLandingPage.test.tsx
git commit -m "fix: stabilise Preview 3 landing runtime mount"
```

### Task 2: Certify real browser authentication lifecycle

**Files:**
- Modify: `components/access/AccessGateway.tsx`
- Modify: `components/providers/AuthProvider.tsx`
- Modify: `components/providers/AuthProvider.test.tsx`
- Modify: `e2e/access.spec.ts`

**Interfaces:**
- Consumes: `login`, `register`, `restore`, and `logout` from `AuthProvider`.
- Produces: reachable Sign in/Register forms and stable authenticated/unauthenticated browser states.

- [ ] **Step 1: Replace the demo-login E2E assertion with a real routed lifecycle test**

Add a Playwright test that intercepts only the real `/api/v1/auth/login`, `/api/v1/me`, `/api/v1/auth/refresh`, and `/api/v1/auth/logout` protocol responses, clicks the visible Preview 3 Sign in control, submits the access form, reloads, and logs out. It must assert request paths and must not set storage, cookies, identity headers, or page JavaScript directly.

```ts
test('signs in, restores, and revokes through the real auth protocol', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(new URL(request.url()).pathname));
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign in' }).first().click();
  await page.getByLabel('Email address').fill(process.env.E2E_AUTH_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_AUTH_PASSWORD!);
  await page.getByRole('button', { name: 'Enter workspace' }).click();
  await expect(page.getByTestId('role-switcher')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('role-switcher')).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('heading', { name: 'The Operating System for the Built Environment' })).toBeVisible();
  expect(requests).toEqual(expect.arrayContaining(['/api/v1/auth/login', '/api/v1/me', '/api/v1/auth/refresh', '/api/v1/auth/logout']));
});
```

- [ ] **Step 2: Run the focused browser test and observe RED**

Run: `$env:E2E_BASE_URL='http://127.0.0.1:3000'; npx playwright test e2e/access.spec.ts --project=chromium --workers=1`

Expected: FAIL on the first missing/rebroken user-visible lifecycle step; the test must not use the obsolete demo credentials currently embedded in `e2e/access.spec.ts`.

- [ ] **Step 3: Make the smallest access/auth changes needed**

Ensure `AccessGateway` exposes Sign out from the authenticated shell, disables submit controls while requests are pending, and renders server failures in `role="alert"`. Keep `AuthProvider` access tokens in memory and refresh/revocation in `lib/auth-session.ts`; do not add browser-storage identity state.

- [ ] **Step 4: Run unit and browser authentication tests**

Run: `npm run test:auth`

Run: `npx playwright test e2e/access.spec.ts --project=chromium --workers=1`

Expected: PASS with login, `/me`, refresh after reload, logout revocation, and return to landing all observed through the normal UI.

- [ ] **Step 5: Commit only authentication files**

```powershell
git add -- components/access/AccessGateway.tsx components/providers/AuthProvider.tsx components/providers/AuthProvider.test.tsx e2e/access.spec.ts
git commit -m "fix: certify normal authentication lifecycle"
```

### Task 3: Generate a typed V8 shell contract from the reference

**Files:**
- Create: `scripts/extract-v8-shell-contract.mjs`
- Create: `fixtures/v8-shell-contract.json`
- Create: `lib/v8-shell-contract.ts`
- Create: `lib/__tests__/v8-shell-contract.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `V8_SHELL_CONTRACT` with `regions`, `controls`, `labels`, `colours`, and `viewports`.
- Consumes: the immutable supplied V8 HTML.

- [ ] **Step 1: Write the failing contract test**

```ts
import { describe, expect, it } from 'vitest';
import { V8_SHELL_CONTRACT } from '@/lib/v8-shell-contract';

describe('V8 shared shell contract', () => {
  it('defines the five desktop regions and canonical top-bar actions', () => {
    expect(V8_SHELL_CONTRACT.regions).toMatchObject({ rail: { width: 74 }, navigator: { width: 306 }, topbar: { height: 66 }, inspector: { width: 344 } });
    expect(V8_SHELL_CONTRACT.controls).toEqual(expect.arrayContaining(['theme', 'god-mode', 'role']));
    expect(V8_SHELL_CONTRACT.referenceToolCount).toBe(45);
  });
});
```

- [ ] **Step 2: Run the test and observe RED**

Run: `npx vitest run lib/__tests__/v8-shell-contract.test.ts`

Expected: FAIL because the contract module does not exist.

- [ ] **Step 3: Add the extractor, fixture, and typed reader**

The extractor must require `V8_REFERENCE_HTML`, fail if the file is absent, parse reference CSS/custom properties and visible navigation labels, and write stable sorted JSON. Add:

```json
"extract:v8-shell": "node scripts/extract-v8-shell-contract.mjs"
```

The checked-in fixture must include the measured desktop/tablet/mobile viewports, region rectangles, top-bar control order, theme labels, canonical navigation labels, reference colours, font stack, and `referenceToolCount: 45`.

- [ ] **Step 4: Verify extraction is deterministic and GREEN**

Run: `$env:V8_REFERENCE_HTML='E:\Downloads\architex_datum_os_integrated_modules_v8_engineering_godmode.html'; npm run extract:v8-shell; git diff --exit-code -- fixtures/v8-shell-contract.json`

Run: `npx vitest run lib/__tests__/v8-shell-contract.test.ts`

Expected: the second extraction produces no diff and the test PASSes.

- [ ] **Step 5: Commit the contract boundary**

```powershell
git add -- scripts/extract-v8-shell-contract.mjs fixtures/v8-shell-contract.json lib/v8-shell-contract.ts lib/__tests__/v8-shell-contract.test.ts package.json
git commit -m "test: codify supplied V8 shell contract"
```

### Task 4: Correct the canonical theme control

**Files:**
- Modify: `lib/useWorkspaceTheme.ts`
- Modify: `lib/__tests__/useWorkspaceTheme.test.tsx`
- Modify: `components/layout/TopBar.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `WORKSPACE_THEME_STORAGE_KEY = 'architex-theme'`, document `data-theme`, and the reference text-plus-icon theme action.
- Consumes: `WorkspaceTheme` and `V8_SHELL_CONTRACT` presentation values.

- [ ] **Step 1: Write failing canonical theme assertions**

```ts
it('uses the canonical persisted theme key', () => {
  expect(WORKSPACE_THEME_STORAGE_KEY).toBe('architex-theme');
});
```

Extend the shell E2E assertion to require `aria-label="Switch colour theme"`, visible text `Dark` in light mode, `Light` in dark mode, and persistence after reload.

- [ ] **Step 2: Run focused tests and observe RED**

Run: `npx vitest run lib/__tests__/useWorkspaceTheme.test.tsx`

Run: `npx playwright test e2e/v8-shell-visual.spec.ts --project=chromium --workers=1 -g "workspace theme"`

Expected: FAIL on the old `architex.workspace-theme` key and icon-only control.

- [ ] **Step 3: Implement the reference theme contract**

Set the storage key to `architex-theme`, apply/remove `data-theme` on `document.documentElement`, and render the top-bar button with constant accessible name plus icon and destination label:

```tsx
<button data-testid="workspace-theme-toggle" aria-pressed={theme === 'dark'} aria-label="Switch colour theme" onClick={onToggleTheme}>
  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
  <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
</button>
```

Replace hard-coded light shell colours touched by this control with existing `--ax-*` theme tokens.

- [ ] **Step 4: Run theme tests and observe GREEN**

Run: `npx vitest run lib/__tests__/useWorkspaceTheme.test.tsx`

Run: `npx playwright test e2e/v8-shell-visual.spec.ts --project=chromium --workers=1 -g "workspace theme"`

Expected: PASS before and after reload in both theme states.

- [ ] **Step 5: Commit the theme slice**

```powershell
git add -- lib/useWorkspaceTheme.ts lib/__tests__/useWorkspaceTheme.test.tsx components/layout/TopBar.tsx app/globals.css e2e/v8-shell-visual.spec.ts
git commit -m "fix: match canonical V8 theme action"
```

### Task 5: Match the five-region shared shell

**Files:**
- Create: `e2e/v8-shell-contract.spec.ts`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `components/layout/OsRail.tsx`
- Modify: `components/layout/ContextNavigator.tsx`
- Modify: `components/layout/ContextInspector.tsx`
- Modify: `components/layout/TopBar.tsx`
- Modify: `e2e/v8-shell-visual.spec.ts`

**Interfaces:**
- Consumes: `V8_SHELL_CONTRACT` fixtures and current navigation state.
- Produces: one instance each of `[data-v8-region="rail|navigator|topbar|canvas|inspector"]`.

- [ ] **Step 1: Write the failing desktop geometry and control-order test**

```ts
test('matches the reference desktop shell contract', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/');
  const expected = V8_SHELL_CONTRACT.viewports.desktop.regions;
  for (const [name, rectangle] of Object.entries(expected)) {
    await expect.poll(() => page.locator(`[data-v8-region="${name}"]`).boundingBox()).toMatchObject(rectangle);
  }
  const controls = await page.locator('[data-v8-region="topbar"] [data-v8-control]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-v8-control')));
  expect(controls).toEqual(V8_SHELL_CONTRACT.viewports.desktop.controlOrder);
});
```

Use the authenticated fixture supported by the local test environment; do not resurrect `?workspace=v8` or session-storage bypasses.

- [ ] **Step 2: Run the new contract test and observe RED**

Run: `npx playwright test e2e/v8-shell-contract.spec.ts --project=chromium --workers=1`

Expected: FAIL because stable region attributes and exact contract geometry are absent.

- [ ] **Step 3: Implement the shell tokens and region ownership**

Add stable region attributes, remove duplicate chrome, and drive steady-state sizes from CSS tokens:

```css
:root {
  --v8-rail-width: 74px;
  --v8-navigator-width: 306px;
  --v8-topbar-height: 66px;
  --v8-inspector-width: 344px;
}
.v8-shell { display:grid; grid-template-columns:var(--v8-rail-width) var(--v8-navigator-width) minmax(0,1fr) var(--v8-inspector-width); grid-template-rows:var(--v8-topbar-height) minmax(0,1fr); min-height:100dvh; }
@media (prefers-reduced-motion: reduce) { .v8-shell-region { animation:none !important; transition:none !important; } }
```

Match the fixture's exact fonts, palette, border, radius, shadow, padding, icons, labels, and control order. Responsive breakpoints must use the reference contract: drawers remain closed until invoked, trap focus, close on Escape, and restore focus.

- [ ] **Step 4: Run geometry, interaction, and accessibility gates**

Run: `npx playwright test e2e/v8-shell-contract.spec.ts e2e/v8-shell-visual.spec.ts --project=chromium --workers=1`

Run: `npm run typecheck`

Expected: shell contract and existing shell behaviour PASS; typecheck exits 0. If broad typecheck fails outside owned files, record exact unrelated failures and run a focused TypeScript compilation for owned files rather than reporting a pass.

- [ ] **Step 5: Capture identical-viewport reference and implementation evidence**

Save current captures under `release/evidence/v8-entry-shell/` with paired names for desktop light, desktop dark, tablet, and mobile. Generate a JSON comparison containing rectangles, computed font properties, colours, borders, radii, shadows, and icon dimensions. Any unexplained mismatch keeps the task open.

- [ ] **Step 6: Commit the exact shared shell**

```powershell
git add -- app/page.tsx app/globals.css components/layout/OsRail.tsx components/layout/ContextNavigator.tsx components/layout/ContextInspector.tsx components/layout/TopBar.tsx e2e/v8-shell-contract.spec.ts e2e/v8-shell-visual.spec.ts release/evidence/v8-entry-shell
git commit -m "feat: match exact V8 shared shell"
```

### Task 6: Build, deploy, and certify the prototype slice

**Files:**
- Modify: `docs/v8-remediation/evidence/V8_REFERENCE_VS_LIVE_SIDE_BY_SIDE_AUDIT_2026-08-26.md`
- Create: `release/evidence/v8-entry-shell/live-certification.json`
- Create: `release/evidence/v8-entry-shell/deployment-manifest.json`

**Interfaces:**
- Consumes: tested production build, existing safe deployment tooling, configured test API, and prototype MariaDB.
- Produces: rollback-capable test deployment and current live browser evidence.

- [ ] **Step 1: Run the local release gate**

Run: `npm run test:auth`

Run: `npx playwright test e2e/access.spec.ts e2e/v8-shell-contract.spec.ts e2e/v8-shell-visual.spec.ts --project=chromium --workers=1`

Run: `npm run build`

Expected: all focused suites PASS and the production build exits 0. Warnings or unrelated failures are recorded verbatim and are not converted into green evidence.

- [ ] **Step 2: Assemble and verify the immutable artifact**

Run: `npm run release:assemble`

Run: `npm run release:standalone:verify`

Expected: verification exits 0 and the deployment manifest records artifact path, SHA-256, build commit, API base `/api/v1`, destination, and rollback destination without credentials.

- [ ] **Step 3: Verify destination and create rollback before upload**

Resolve the exact test-site FTP directory using the existing deployment configuration, list its current contents, and create a timestamped sibling rollback copy before replacing files. Do not infer a destination from an empty FTP directory and do not print credentials.

- [ ] **Step 4: Deploy only to `test.architex.co.za` and purge LiteSpeed cache**

Upload the verified artifact, preserve server-owned configuration, invoke the existing bounded cache-purge mechanism, and verify that HTML and `_next` assets resolve from the new artifact hash. Production remains untouched.

- [ ] **Step 5: Run live normal-user certification**

Run the access and shell suites with `E2E_BASE_URL=https://test.architex.co.za` and valid prototype credentials supplied through environment variables. Verify fresh landing, Sign in, `/me`, reload/refresh, shell, theme persistence, God Mode presentation, logout/revocation, `/api/v1/db-health`, and a representative MariaDB-backed read after reload.

Expected: all journeys PASS without direct API injection, storage bypass, CORS errors, console exceptions, JSON fallback persistence, or mock identity headers.

- [ ] **Step 6: Update the existing evidence ledger conservatively**

Record commands, timestamps, artifact hash, deployment/rollback paths, API/DB status, browser results, paired screenshots, computed-style comparison, and remaining unimplemented pages. Mark only entry/authentication and shared shell as certified; Command Centre, Datum, God Mode content, and tools remain pending their own plans.

- [ ] **Step 7: Commit certification evidence**

```powershell
git add -- docs/v8-remediation/evidence/V8_REFERENCE_VS_LIVE_SIDE_BY_SIDE_AUDIT_2026-08-26.md release/evidence/v8-entry-shell/live-certification.json release/evidence/v8-entry-shell/deployment-manifest.json
git commit -m "docs: certify V8 entry and shared shell"
```

## Plan Self-Review

- Spec coverage: Slice 1 and Slice 2 are fully mapped; later tool/page slices are intentionally excluded.
- Placeholder scan: no deferred implementation placeholders are permitted.
- Type consistency: the runtime bridge, shell contract, theme key, and region attributes have one canonical spelling throughout.
- Safety: test deployment is separated from production and requires an identified rollback before upload.
- Evidence: normal browser auth, MariaDB-backed reload, computed styles, geometry, interactions, and screenshots remain separate gates.
