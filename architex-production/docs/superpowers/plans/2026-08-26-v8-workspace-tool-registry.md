# V8 Workspace Tool Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic tool-card registry with the supplied V8 grouped compact registry and certify it locally and on `test.architex.co.za`.

**Architecture:** Keep `ToolRegistryView` as the route-facing boundary and extract a focused `V8ToolRegistry` presentation component. The component consumes canonical `ToolDefinition` records and emits existing navigation callbacks; no mock catalogue or second state model is introduced.

**Tech Stack:** React 19, TypeScript, Next.js 15, CSS, Vitest, Testing Library, Playwright, explicit FTPS.

## Global Constraints

- The authoritative visual source is `E:\Downloads\architex_datum_os_integrated_modules_v8_engineering_godmode.html` after `openStandalone()`.
- `ALL_TOOLS` remains the only catalogue source and must still expose all 47 tools.
- Preserve tool-open and project-orientation actions, keyboard focus, dark theme and mobile overflow behavior.
- Do not deploy to `architex.co.za`; deploy only to `test.architex.co.za` with a sibling rollback.
- Certify the registry page only; do not claim the 47 destination tools are page-parity complete.

---

### Task 1: Registry component contract

**Files:**
- Create: `components/v8/__tests__/V8ToolRegistry.test.tsx`
- Create: `components/v8/V8ToolRegistry.tsx`

**Interfaces:**
- Consumes: `tools: ToolDefinition[]`, `onOpenTool(toolId: string)`, `onOpenProjectOrientation()`.
- Produces: `V8ToolRegistry` with `data-testid="v8-tool-registry"`, group regions and `data-v8-registry-tool` buttons.

- [ ] **Step 1: Write the failing component tests**

Assert the exact page copy, `47` tool buttons, canonical group order/counts, `Live sample` and `Scaffold` labels, and both callback forms.

- [ ] **Step 2: Verify the test fails because `V8ToolRegistry` is missing**

Run: `npx vitest run components/v8/__tests__/V8ToolRegistry.test.tsx`

Expected: import resolution failure for `V8ToolRegistry`.

- [ ] **Step 3: Implement the minimal grouped registry**

Group tools with insertion-order `Map<string, ToolDefinition[]>`, render the V8 header/notice/registry intro, and render each tool as:

```tsx
<button data-v8-registry-tool onClick={() => onOpenTool(tool.id)}>
  <OrigamiIcon name={tool.icon} size={23} />
  <span><b>{tool.name}</b><small>{tool.stage}</small></span>
  <span>{tool.status === 'live' ? 'Live sample' : 'Scaffold'}</span>
</button>
```

- [ ] **Step 4: Verify component and canonical navigation tests pass**

Run: `npx vitest run components/v8/__tests__/V8ToolRegistry.test.tsx lib/__tests__/navigation.test.ts`

Expected: all tests pass.

- [ ] **Step 5: Commit the contract and component**

Commit message: `feat: match V8 workspace tool registry`

### Task 2: Route integration and measured styling

**Files:**
- Modify: `components/views/ToolRegistryView.tsx`
- Create: `styles/v8-tool-registry.css`
- Modify: `app/globals.css`
- Modify: `e2e/v8-shell-visual.spec.ts`

**Interfaces:**
- Consumes: `V8ToolRegistry` from Task 1 and existing route callbacks.
- Produces: reference-aligned default registry without a parallel catalogue state.

- [ ] **Step 1: Write the failing browser contract**

Create `e2e/v8-tool-registry-contract.spec.ts` to assert the exact header/notice/intro, 47 tool rows, group counts, 220px minimum auto-fill columns, 10px gaps, 12px row padding, 13px radius, dashed scaffold borders, keyboard focus, one tool-open transition, project-orientation transition, mobile overflow and Axe.

- [ ] **Step 2: Verify the browser contract fails against the current card registry**

Run against the current production build and expect failure on `data-v8-registry-tool` or exact grouped headings.

- [ ] **Step 3: Integrate and style the component**

Replace the local search/filter/card state in `ToolRegistryView` with `V8ToolRegistry`. Import `styles/v8-tool-registry.css` from `app/globals.css`. Use the measured reference declarations:

```css
.v8-registry-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:10px; }
.v8-registry-tool { display:flex; align-items:center; gap:11px; padding:12px; border-radius:13px; }
```

- [ ] **Step 4: Run type, unit and browser regression gates**

Run:

```text
npm run typecheck
npx vitest run components/v8/__tests__/V8ToolRegistry.test.tsx lib/__tests__/navigation.test.ts
E2E_PRODUCTION_BUILD=true npx playwright test e2e/v8-tool-registry-contract.spec.ts e2e/v8-shell-visual.spec.ts --project=chromium --workers=1
```

Expected: all gates pass.

- [ ] **Step 5: Commit route integration**

Commit message: `feat: integrate V8 grouped tool registry`

### Task 3: Side-by-side evidence

**Files:**
- Create: `scripts/capture-v8-tool-registry.mjs`
- Create: `release/evidence/v8-tool-registry/reference.png`
- Create: `release/evidence/v8-tool-registry/implementation.png`
- Create: `release/evidence/v8-tool-registry/computed-styles.json`
- Create: `release/evidence/v8-tool-registry/README.md`

**Interfaces:**
- Consumes: reference `openStandalone()` and authenticated local production build.
- Produces: same-viewport screenshots and machine-readable rectangles/styles.

- [ ] **Step 1: Capture both pages at 1600 x 1000**

The script must call `window.openStandalone()` on the reference and select `Workspace Tools` through the implementation OS rail.

- [ ] **Step 2: Compare page head, notice, intro, first group and representative live/scaffold rows**

Record rectangles, copy and computed typography/border/padding values in `computed-styles.json`.

- [ ] **Step 3: Correct visible or computed mismatches and recapture**

Repeat production build and capture until the measured contract is within one CSS pixel for structural rectangles.

- [ ] **Step 4: Commit evidence**

Commit message: `test: certify V8 tool registry parity`

### Task 4: Atomic deployment and live certification

**Files:**
- Modify: `scripts/certify-live-v8.mjs`
- Modify: `release/evidence/v8-project-datum/live-certification.json`
- Modify: `docs/v8-remediation/evidence/V8_REFERENCE_VS_LIVE_SIDE_BY_SIDE_AUDIT_2026-08-26.md`

**Interfaces:**
- Consumes: static `out` export and existing FTPS candidate/rollback deployer.
- Produces: deployed test artifact, rollback path, exact hash and unmocked browser proof.

- [ ] **Step 1: Build the prototype static export**

Set `ARCHITEX_STATIC_EXPORT=1`, `NEXT_PUBLIC_API_BASE_URL=https://api.architex.co.za/api/v1`, `NEXT_PUBLIC_ARCHITEX_DATA_MODE=prototype`, and `NEXT_PUBLIC_GOD_MODE_ENABLED=true` before `npm run build`.

- [ ] **Step 2: Deploy using `scripts/deploy-static-ftps.py out`**

Require 45 files, `.htaccess`, `index.html`, `preview3.html`, `_next`, candidate verification and a timestamped sibling rollback.

- [ ] **Step 3: Run unmocked live Chromium certification**

Verify real login, `/me`, `/projects`, Workspace Tool Registry, 47 rows, one representative tool-open action, project-orientation return, session reload, theme, God Mode and logout. Require zero failed requests and zero HTTP 5xx.

- [ ] **Step 4: Seal evidence and commit**

Update only the existing audit and certification records. Commit message: `deploy: certify V8 tool registry live`.
