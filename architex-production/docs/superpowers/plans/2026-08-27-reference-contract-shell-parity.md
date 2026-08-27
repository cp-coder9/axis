# Reference Contract and Shared Shell Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate deterministic contracts from the sole integrated God Mode HTML reference and make the shared Datum OS V8 shell consume and verify those contracts before individual tool migrations.

**Architecture:** A Node extractor reads the reference's `TOOLS`, stage, role, and shell definitions and writes a checked JSON manifest plus TypeScript adapter. Existing React shell components consume that adapter while authenticated identity and authorization remain unchanged. Vitest validates extraction and registry parity; Playwright validates geometry, themes, responsive behavior, navigation, role lenses, and God Mode non-bypass behavior.

**Tech Stack:** Next.js 15, React 19, TypeScript, Node.js, Vitest 3, Playwright 1.62, CSS custom properties.

## Global Constraints

- Sole reference: `E:\Downloads\architex_datum_os_integrated_modules_v8_engineering_godmode.html`.
- No additional visual, copy, layout, role, stage, tab, or workflow reference may override the supplied HTML.
- The existing authenticated session and server authorization remain authoritative; God Mode changes presentation only.
- Generated parity files are never hand-edited.
- No prototype domain records may be imported by production components.
- Preserve unrelated working-tree changes and commit only task-owned files.
- A visual pass requires computed rectangles/styles and interaction evidence, not screenshot similarity alone.
- Each task uses red-green-refactor and ends with a scoped commit.

---

### Task 1: Deterministic reference extractor

**Files:**
- Create: `scripts/reference/extract-godmode-reference.mjs`
- Create: `scripts/reference/extract-godmode-reference.test.mjs`
- Create: `generated/godmode-reference.json`
- Modify: `package.json`

**Interfaces:**
- Consumes: absolute source path from `ARCHITEX_GODMODE_REFERENCE` or the sole-reference default.
- Produces: `extractGodModeReference(html: string): GodModeReference` and deterministic `generated/godmode-reference.json`.

- [ ] **Step 1: Write the failing extraction contract**

Create `scripts/reference/extract-godmode-reference.test.mjs` with assertions that the source contains a parseable `TOOLS` object, exactly 47 unique tool IDs, `specforge` has the exact 14 reference tabs, and the extracted source SHA-256 is stable across two runs:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extractGodModeReference, referencePath } from './extract-godmode-reference.mjs';

const html = await readFile(referencePath(), 'utf8');
const first = extractGodModeReference(html);
const second = extractGodModeReference(html);
assert.equal(Object.keys(first.tools).length, 47);
assert.equal(new Set(Object.keys(first.tools)).size, 47);
assert.deepEqual(first.tools.specforge.tabs.map(tab => tab.label), [
  'Overview','Pictorial Board','Sections','Products','Document Preview','Approvals','Budget & Risk',
  'BoM / BoQ','Planning','Procurement','Issue & Distribute','Drawing Intelligence','Closeout','Integration',
]);
assert.equal(first.sourceSha256, second.sourceSha256);
assert.deepEqual(first, second);
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node scripts/reference/extract-godmode-reference.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `extract-godmode-reference.mjs`.

- [ ] **Step 3: Implement the extractor**

Implement balanced JavaScript-literal extraction instead of evaluating the supplied HTML. Parse the `const TOOLS=` JSON literal with `JSON.parse`; extract literal object assignments for `V8_STAGE_MAP`, `V8_ROLE_ACCESS`, and `V8_STAGE_COPY` with a bounded parser that rejects executable expressions. Normalize tool records to `{ id, name, icon, tone, group, stage, summary, status, source, tabs }`, attach source SHA-256, and serialize with two-space indentation plus a terminal newline.

Expose these exact entry points; `extractAssignment` scans from the marker to the matching closing brace while respecting JSON strings, and `extractStringArrayMap` accepts only quoted keys and quoted string-array values:

```js
export const referencePath = () => process.env.ARCHITEX_GODMODE_REFERENCE
  ?? 'E:/Downloads/architex_datum_os_integrated_modules_v8_engineering_godmode.html';
export function extractGodModeReference(html) {
  const tools = JSON.parse(extractAssignment(html, 'const TOOLS='));
  const stageToolMap = extractStringArrayMap(extractAssignment(html, 'const V8_STAGE_MAP='));
  const roleToolMap = extractStringArrayMap(extractAssignment(html, 'const V8_ROLE_ACCESS='));
  assertReferenceShape(tools, stageToolMap, roleToolMap);
  return {
    schemaVersion: 1,
    sourceSha256: createHash('sha256').update(html).digest('hex'),
    tools: Object.fromEntries(Object.entries(tools).map(([id, tool]) => [id, normalizeTool(id, tool)])),
    stageToolMap,
    roleToolMap,
  };
}
export async function writeGodModeReference(outputPath = 'generated/godmode-reference.json') {
  const reference = extractGodModeReference(await readFile(referencePath(), 'utf8'));
  const bytes = `${JSON.stringify(reference, null, 2)}\n`;
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(`${outputPath}.tmp`, bytes, 'utf8');
  await rename(`${outputPath}.tmp`, outputPath);
}
```

The command supports `--check`; check mode compares the generated bytes and exits non-zero on drift without writing.

- [ ] **Step 4: Add package commands and generate the artifact**

Add:

```json
"reference:generate": "node scripts/reference/extract-godmode-reference.mjs",
"reference:check": "node scripts/reference/extract-godmode-reference.mjs --check",
"test:reference": "node scripts/reference/extract-godmode-reference.test.mjs"
```

Run: `npm run reference:generate; npm run test:reference; npm run reference:check`

Expected: all three commands exit `0`, with 47 tools and SpecForge's 14 labels encoded in the generated JSON.

- [ ] **Step 5: Commit Task 1**

```powershell
git add package.json scripts/reference/extract-godmode-reference.mjs scripts/reference/extract-godmode-reference.test.mjs generated/godmode-reference.json
git commit -m "feat: extract canonical God Mode reference"
```

### Task 2: Typed reference adapter and registry parity

**Files:**
- Create: `lib/reference/godmode-reference.ts`
- Create: `lib/reference/godmode-reference.test.ts`
- Modify: `lib/data.ts`
- Modify: `lib/types.ts`
- Modify: `components/v8/__tests__/V8ToolRegistry.test.tsx`

**Interfaces:**
- Consumes: `generated/godmode-reference.json`.
- Produces: `GODMODE_REFERENCE`, `REFERENCE_TOOLS`, `REFERENCE_STAGE_TOOL_MAP`, and `REFERENCE_ROLE_TOOL_MAP`.

- [ ] **Step 1: Write failing typed parity tests**

Assert exact ID equality between `ALL_TOOLS` and the generated 47 IDs; exact name, icon, tone, group, stage, summary, status, source, tab label, tab function, and tab argument parity; and no duplicate tab identity inside a tool.

```ts
expect(Object.keys(ALL_TOOLS).sort()).toEqual(Object.keys(REFERENCE_TOOLS).sort());
expect(ALL_TOOLS.specforge.tabs.map(tab => tab.label)).toEqual(
  REFERENCE_TOOLS.specforge.tabs.map(tab => tab.label),
);
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npx vitest run lib/reference/godmode-reference.test.ts`

Expected: FAIL because the typed adapter does not exist and current SpecForge has ten tabs.

- [ ] **Step 3: Implement the typed adapter**

Import the JSON and validate it at module load with narrow TypeScript type guards. Export readonly types for tool status (`live | scaffold`), tab kind (`top | scroll | call | hs | scaffold`), and reference tab metadata. Do not copy record fixtures or decoded module HTML into the adapter.

- [ ] **Step 4: Make the tool registry reference-derived**

Replace manually duplicated tool identity and navigation metadata in `ALL_TOOLS` with an adapter that maps every reference tool into the existing `ToolDefinition` shape. Preserve only production-owned metadata such as version and any explicit component binding outside the reference-derived fields. Use deterministic tab keys: reference `arg`, otherwise a slug of `label`, with a collision assertion.

- [ ] **Step 5: Verify registry parity**

Run: `npx vitest run lib/reference/godmode-reference.test.ts components/v8/__tests__/V8ToolRegistry.test.tsx components/ui/ToolVersionBadge.test.tsx`

Expected: PASS with exactly 47 tools and 14 SpecForge reference tabs.

- [ ] **Step 6: Commit Task 2**

```powershell
git add lib/reference/godmode-reference.ts lib/reference/godmode-reference.test.ts lib/data.ts lib/types.ts components/v8/__tests__/V8ToolRegistry.test.tsx
git commit -m "refactor: derive V8 tool registry from reference"
```

### Task 3: Canonical stage, role, and God Mode presentation maps

**Files:**
- Create: `lib/reference/reference-navigation.ts`
- Create: `lib/reference/reference-navigation.test.ts`
- Modify: `lib/data.ts`
- Modify: `app/page.tsx`
- Modify: `components/views/DatumCanvas.tsx`
- Modify: `components/layout/ContextNavigator.tsx`
- Modify: `components/views/GodModeView.tsx`

**Interfaces:**
- Consumes: generated stage and role maps plus authenticated `authorizationRole`.
- Produces: `referenceToolIdsForContext({ stage, presentationRole, godMode })` without altering authorization identity.

- [ ] **Step 1: Write failing navigation-policy tests**

Cover every reference stage and role. Assert normal mode returns role-relevant tools plus reference common tools in reference order; God Mode returns all stage-relevant tools; the authenticated authorization role is not accepted as a mutable output.

```ts
expect(referenceToolIdsForContext({ stage: 'Design', presentationRole: 'architect', godMode: true }))
  .toEqual(REFERENCE_STAGE_TOOL_MAP.Design);
expect(referenceToolIdsForContext({ stage: 'Design', presentationRole: 'client', godMode: false }))
  .toEqual(expectedClientDesignOrder);
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npx vitest run lib/reference/reference-navigation.test.ts`

Expected: FAIL because the canonical selector does not exist.

- [ ] **Step 3: Implement the pure selector**

Implement the reference's common-tool and role ordering rules as a pure function over generated maps. Reject unknown stages, roles, and tool IDs. Keep authorization outside this module.

- [ ] **Step 4: Replace duplicated presentation maps**

Make `app/page.tsx`, `DatumCanvas`, `ContextNavigator`, and `GodModeView` consume the selector. Continue passing `authorizationRole` separately to `ModuleRouter`; never derive API identity from the God Mode lens.

- [ ] **Step 5: Verify normal and God Mode behavior**

Run: `npx vitest run lib/reference/reference-navigation.test.ts lib/__tests__/navigation.test.ts lib/__tests__/navigation-shell-contract.test.ts`

Expected: PASS, including God Mode presentation-only behavior.

- [ ] **Step 6: Commit Task 3**

```powershell
git add lib/reference/reference-navigation.ts lib/reference/reference-navigation.test.ts lib/data.ts app/page.tsx components/views/DatumCanvas.tsx components/layout/ContextNavigator.tsx components/views/GodModeView.tsx
git commit -m "feat: align V8 role and stage navigation"
```

### Task 4: Shared shell geometry and theme tokens

**Files:**
- Create: `generated/godmode-shell-contract.json`
- Create: `lib/reference/godmode-shell-contract.ts`
- Modify: `scripts/reference/extract-godmode-reference.mjs`
- Modify: `app/globals.css`
- Modify: `components/layout/OsRail.tsx`
- Modify: `components/layout/ContextNavigator.tsx`
- Modify: `components/layout/TopBar.tsx`
- Modify: `components/layout/ContextInspector.tsx`
- Modify: `lib/v8-shell-contract.ts`
- Test: `lib/__tests__/v8-shell-contract.test.ts`

**Interfaces:**
- Consumes: reference CSS and shell markup/functions.
- Produces: generated CSS token/geometry contract and React shell regions with stable `data-v8-region` selectors.

- [ ] **Step 1: Extend extraction tests for shell regions and tokens**

Assert extraction of the rail, navigator, top bar, canvas, inspector, light/dark token maps, reference breakpoints, and region ordering. Reject missing or duplicate required regions.

- [ ] **Step 2: Run RED**

Run: `npm run test:reference; npx vitest run lib/__tests__/v8-shell-contract.test.ts`

Expected: FAIL because shell geometry is not part of the generated contract.

- [ ] **Step 3: Generate the shell contract**

Extend the extractor to parse reference CSS custom properties and the shell grid/region dimensions into `generated/godmode-shell-contract.json`. The TypeScript adapter exports exact tokens and required region selectors; it does not calculate substitute design values.

- [ ] **Step 4: Align shell components and CSS**

Apply the generated values through `--ax-reference-*` CSS variables at the application root. Update the five shell components so DOM hierarchy, region ownership, labels, controls, and responsive collapse match the reference. Preserve authentication behavior and existing providers.

- [ ] **Step 5: Verify unit and static contracts**

Run: `npm run reference:check; npx vitest run lib/__tests__/v8-shell-contract.test.ts lib/__tests__/useWorkspaceTheme.test.tsx`

Expected: PASS with both themes and all required regions represented.

- [ ] **Step 6: Commit Task 4**

```powershell
git add generated/godmode-shell-contract.json scripts/reference/extract-godmode-reference.mjs lib/reference/godmode-shell-contract.ts app/globals.css components/layout/OsRail.tsx components/layout/ContextNavigator.tsx components/layout/TopBar.tsx components/layout/ContextInspector.tsx lib/v8-shell-contract.ts lib/__tests__/v8-shell-contract.test.ts
git commit -m "feat: reproduce reference V8 shell geometry"
```

### Task 5: Browser geometry, theme, responsive, and God Mode certification

**Files:**
- Create: `e2e/helpers/godmode-reference.ts`
- Create: `e2e/v8-reference-shell-parity.spec.ts`
- Modify: `playwright.config.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: generated shell/reference contracts and the production-built local application.
- Produces: computed rectangle/style evidence and browser pass/fail results at fixed reference viewports.

- [ ] **Step 1: Write the failing browser contract**

Add journeys for 1600×1000, 1024×768, 700×900, and 390×844. Log in through the real session UI; assert shell region order, exact labels, theme persistence, project and standalone navigation, role lens, God Mode toggle, stage selection, tool opening, keyboard focus, reduced motion, and no body overflow. Compare rectangles and selected computed styles against generated values with only the documented subpixel tolerance.

- [ ] **Step 2: Run the browser contract and verify RED**

Run: `npx playwright test e2e/v8-reference-shell-parity.spec.ts --project=chromium --workers=1`

Expected: FAIL on at least one registry, geometry, or God Mode reference assertion before shell alignment is complete.

- [ ] **Step 3: Add reusable evidence helpers**

Implement `measureRegion`, `computedStyleSnapshot`, `expectReferenceRect`, `expectNoBodyOverflow`, and runtime error collection. A failed request, console error, page error, or `5xx` response fails the test.

- [ ] **Step 4: Add the bounded package gate**

Add:

```json
"test:e2e:reference-shell": "playwright test e2e/v8-reference-shell-parity.spec.ts --project=chromium --workers=1"
```

- [ ] **Step 5: Run GREEN verification**

Run: `npm run test:e2e:reference-shell`

Expected: PASS at every fixed viewport with no runtime errors, body overflow, or God Mode authorization bypass.

- [ ] **Step 6: Commit Task 5**

```powershell
git add e2e/helpers/godmode-reference.ts e2e/v8-reference-shell-parity.spec.ts playwright.config.ts package.json
git commit -m "test: certify reference V8 shell parity"
```

### Task 6: Release 1 aggregate verification and SpecForge handoff

**Files:**
- Create: `docs/superpowers/plans/2026-08-27-specforge-reference-parity.md`
- Modify: `docs/superpowers/specs/2026-08-27-site-wide-godmode-parity-design.md`

**Interfaces:**
- Consumes: Tasks 1-5 passing reference and shell contracts.
- Produces: a complete SpecForge implementation plan based on the exact 14 extracted views and production boundaries.

- [ ] **Step 1: Run the complete local Release 1 gate**

Run, in order:

```powershell
npm run test:reference
npm run reference:check
npx vitest run lib/reference lib/__tests__/v8-shell-contract.test.ts lib/__tests__/navigation-shell-contract.test.ts components/v8/__tests__/V8ToolRegistry.test.tsx
npm run typecheck
npm run build
npm run test:e2e:reference-shell
git diff --check
```

Expected: every command exits `0`; build and browser results remain local evidence only.

- [ ] **Step 2: Write the SpecForge release plan**

Create the next detailed plan with separate red-green tasks for candidate/library APIs, item links, section/item CRUD UI, approvals/professional responsibility, BoM/BoQ, drawing review, issue distribution, immutable document history, Planning, Procurement, Closeout, Integration, role parity, disposable API/browser fixtures, and pixel comparison for all 14 views.

- [ ] **Step 3: Record Release 1 evidence boundary**

Update the parent design status to identify Release 1 as locally implemented only. Do not claim remote deployment, remote MariaDB, or aggregate 47-tool completion.

- [ ] **Step 4: Commit Task 6**

```powershell
git add docs/superpowers/plans/2026-08-27-specforge-reference-parity.md docs/superpowers/specs/2026-08-27-site-wide-godmode-parity-design.md
git commit -m "docs: plan SpecForge reference parity release"
```
