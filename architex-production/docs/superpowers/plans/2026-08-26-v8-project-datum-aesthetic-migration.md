# V8 Project Datum Aesthetic Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the authenticated Project Datum surface from shared V8 presentation primitives so its page head, role banner, project hero, eight-stage timeline, Datum world, icons, typography, spacing, and responsive states match the supplied V8 reference while continuing to use authenticated API data and existing navigation events.

**Architecture:** A deterministic extractor records the reference Project Datum geometry and computed styles. Small React primitives own page identity, role context, stage navigation, and the spatial Datum world; `DatumCanvas` composes them and retains its current domain callbacks and role/stage filtering. CSS is scoped through named `data-v8-*` contracts so browser tests can compare same-state reference and implementation without brittle Tailwind-class assertions.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.9, Tailwind CSS 4, Vitest 3, Playwright, PHP/MariaDB API unchanged.

## Global Constraints

- Authenticated V8 authority: `E:\Downloads\architex_datum_os_integrated_modules_v8_engineering_godmode.html`.
- Datum teal is `#19B7B0`; deep teal is `#167E79`; ink is `#102033`; muted ink is `#657287`; aqua is `#DFF5F2`; mint is `#BFE9E2`; canvas is `#F5FAF9`.
- Interface and content use `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`.
- System metadata uses `JetBrains Mono, ui-monospace, monospace` only.
- The desktop shell remains 74 px rail, 306 px navigator, 66 px top bar, 344 px inspector, and the remaining centre canvas.
- Origami icons remain the product icon language; no emoji or generic substitute is permitted when a reference icon exists.
- All displayed runtime records originate from authenticated API responses; production never falls back to frontend fixtures.
- God Mode changes presentation only and never changes identity, tenant, memberships, permissions, query scope, mutation scope, or audit actor.
- One surface is certified before the next surface enters implementation.
- Every implementation task follows red, green, refactor, browser evidence, and an independently reviewable commit.

---

## File map

| File | Responsibility |
|---|---|
| `scripts/extract-v8-project-datum-contract.mjs` | Render the supplied reference and extract Project Datum rectangles, styles, labels, and control order. |
| `fixtures/v8-project-datum-contract.json` | Deterministic reference fixture generated only by the extractor. |
| `lib/v8-project-datum-contract.ts` | Typed read-only contract imported by tests. |
| `lib/__tests__/v8-project-datum-contract.test.ts` | Fixture integrity and binding-source checks. |
| `components/v8/V8PageHead.tsx` | Reference page identity and action cluster. |
| `components/v8/V8RoleBanner.tsx` | Role identity, description, tags, and God Mode lens copy. |
| `components/v8/V8ProjectHero.tsx` | Project metadata, progress, stage timeline, and stage guidance. |
| `components/v8/V8StageTimeline.tsx` | Accessible eight-stage reference timeline. |
| `components/v8/V8DatumWorld.tsx` | Desktop Datum origin, line, nodes, cards, connectors, stage badge, zoom, and fit controls. |
| `components/v8/V8DatumCard.tsx` | One connected live/scaffold tool card. |
| `components/v8/V8DatumSequence.tsx` | Mobile reading-order representation of the same tools. |
| `components/views/DatumCanvas.tsx` | Domain composition, stage/role selection, and callback wiring. |
| `styles/v8-project-datum.css` | Scoped reference styling and responsive behaviour. |
| `app/globals.css` | Imports the Project Datum stylesheet. |
| `e2e/v8-project-datum-contract.spec.ts` | Exact desktop/tablet/mobile contract and interaction tests. |
| `scripts/capture-v8-project-datum.mjs` | Same-state reference and implementation evidence capture. |

---

### Task 1: Extract the authoritative Project Datum contract

**Files:**
- Create: `scripts/extract-v8-project-datum-contract.mjs`
- Create: `fixtures/v8-project-datum-contract.json`
- Create: `lib/v8-project-datum-contract.ts`
- Create: `lib/__tests__/v8-project-datum-contract.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `V8_REFERENCE_HTML` or the default supplied HTML path.
- Produces: `V8_PROJECT_DATUM_CONTRACT` with `source`, `viewport`, `regions`, `controlOrder`, `labels`, and `computedStyles`.

- [ ] **Step 1: Write the failing fixture-integrity test**

```ts
import { describe, expect, it } from 'vitest';
import { V8_PROJECT_DATUM_CONTRACT } from '@/lib/v8-project-datum-contract';

describe('V8 Project Datum contract', () => {
  it('binds the supplied reference and complete Datum inventory', () => {
    expect(V8_PROJECT_DATUM_CONTRACT.source).toBe('E:/Downloads/architex_datum_os_integrated_modules_v8_engineering_godmode.html');
    expect(V8_PROJECT_DATUM_CONTRACT.labels.stages).toEqual(['Brief', 'Appoint', 'Design', 'Comply', 'Procure', 'Build', 'Pay', 'Close-out']);
    expect(V8_PROJECT_DATUM_CONTRACT.controlOrder).toEqual(['plan-project', 'engineering', 'meetings', 'give-feedback']);
    expect(Object.keys(V8_PROJECT_DATUM_CONTRACT.regions)).toEqual(['pageHead', 'roleBanner', 'projectHero', 'datumViewport']);
    expect(V8_PROJECT_DATUM_CONTRACT.computedStyles.datumLine.backgroundImage).toContain('linear-gradient');
  });
});
```

- [ ] **Step 2: Run the test and verify the missing contract fails**

Run: `npx vitest run lib/__tests__/v8-project-datum-contract.test.ts`

Expected: FAIL because `lib/v8-project-datum-contract.ts` does not exist.

- [ ] **Step 3: Implement the extractor using stable reference selectors**

```js
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const source = process.env.V8_REFERENCE_HTML || 'E:/Downloads/architex_datum_os_integrated_modules_v8_engineering_godmode.html';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto(pathToFileURL(source).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

const contract = await page.evaluate(() => {
  const rect = (selector) => {
    const box = document.querySelector(selector).getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width, height: box.height };
  };
  const style = (selector) => {
    const value = getComputedStyle(document.querySelector(selector));
    return {
      fontFamily: value.fontFamily,
      fontSize: value.fontSize,
      fontWeight: value.fontWeight,
      lineHeight: value.lineHeight,
      color: value.color,
      backgroundColor: value.backgroundColor,
      backgroundImage: value.backgroundImage,
      borderRadius: value.borderRadius,
      borderColor: value.borderColor,
      boxShadow: value.boxShadow,
    };
  };
  return {
    source: 'E:/Downloads/architex_datum_os_integrated_modules_v8_engineering_godmode.html',
    viewport: { width: 1600, height: 1000 },
    regions: {
      pageHead: rect('.main .page-head'),
      roleBanner: rect('.main .role-banner'),
      projectHero: rect('.main .project-hero'),
      datumViewport: rect('.main .datum-viewport'),
    },
    controlOrder: [...document.querySelectorAll('.main .page-head .btn')].map((node) => node.textContent.trim().toLowerCase().replace(/\s+/g, '-')),
    labels: { stages: [...document.querySelectorAll('.main .stage span')].map((node) => node.textContent.trim()) },
    computedStyles: {
      pageTitle: style('.main .page-head h1'),
      roleBanner: style('.main .role-banner'),
      projectHero: style('.main .project-hero'),
      stage: style('.main .stage'),
      activeStage: style('.main .stage.active i'),
      datumViewport: style('.main .datum-viewport'),
      datumLine: style('.main .datum-line'),
      datumCard: style('.main .datum-card'),
    },
  };
});
await writeFile('fixtures/v8-project-datum-contract.json', `${JSON.stringify(contract, null, 2)}\n`);
await browser.close();
```

- [ ] **Step 4: Generate the fixture and typed export**

Run: `node scripts/extract-v8-project-datum-contract.mjs`

Create `lib/v8-project-datum-contract.ts`:

```ts
import contract from '@/fixtures/v8-project-datum-contract.json';

export const V8_PROJECT_DATUM_CONTRACT = contract as Readonly<typeof contract>;
```

Add to `package.json`:

```json
"extract:v8-project-datum": "node scripts/extract-v8-project-datum-contract.mjs"
```

- [ ] **Step 5: Run the focused test and commit**

Run: `npx vitest run lib/__tests__/v8-project-datum-contract.test.ts`

Expected: 1 test passes.

```powershell
git add scripts/extract-v8-project-datum-contract.mjs fixtures/v8-project-datum-contract.json lib/v8-project-datum-contract.ts lib/__tests__/v8-project-datum-contract.test.ts package.json
git commit -m "test: codify V8 Project Datum contract"
```

---

### Task 2: Build the page-head and role-banner primitives

**Files:**
- Create: `components/v8/V8PageHead.tsx`
- Create: `components/v8/V8RoleBanner.tsx`
- Create: `components/v8/__tests__/V8ProjectDatumIdentity.test.tsx`
- Modify: `components/views/DatumCanvas.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `RoleProfile`, `ReactNode`, and the existing Project Datum callbacks.
- Produces: `V8PageHead` and `V8RoleBanner` with stable `data-v8-datum-region` attributes.

- [ ] **Step 1: Install the repository-standard DOM component-test dependencies**

Run: `npm install --save-dev @testing-library/react @testing-library/user-event jsdom`

Expected: `package.json` and `package-lock.json` record all three development dependencies without changing runtime dependencies.

- [ ] **Step 2: Write the failing component contract**

```tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { V8PageHead } from '@/components/v8/V8PageHead';
import { V8RoleBanner } from '@/components/v8/V8RoleBanner';

it('renders the reference identity hierarchy and action order', () => {
  render(<V8PageHead title="Faerie Glen Residential" description="A stage-driven project workflow navigation centre." actions={[
    { id: 'plan-project', label: 'Plan project', icon: 'practice_management', onClick: vi.fn() },
    { id: 'engineering', label: 'Engineering', icon: 'engineering_hub', onClick: vi.fn() },
    { id: 'meetings', label: 'Meetings', icon: 'meetings', onClick: vi.fn() },
    { id: 'feedback', label: 'Give feedback', icon: 'feedback', onClick: vi.fn(), primary: true },
  ]} />);
  expect(screen.getByRole('heading', { name: 'Faerie Glen Residential' })).toBeVisible();
  expect(screen.getAllByRole('button').map((button) => button.textContent?.trim())).toEqual(['Plan project', 'Engineering', 'Meetings', 'Give feedback']);
});

it('describes normal and God Mode role lenses without changing identity', () => {
  const { rerender } = render(<V8RoleBanner code="A" label="Architect" description="Design leadership" godMode={false} />);
  expect(screen.getByText('Architect experience')).toBeVisible();
  rerender(<V8RoleBanner code="A" label="Architect" description="Design leadership" godMode />);
  expect(screen.getByText('God Mode with Architect lens')).toBeVisible();
});
```

- [ ] **Step 3: Verify RED**

Run: `npx vitest run components/v8/__tests__/V8ProjectDatumIdentity.test.tsx`

Expected: FAIL because both components are missing.

- [ ] **Step 4: Implement the typed page head**

```tsx
import { OrigamiIcon } from '@/lib/origami-icons';

type V8PageAction = { id: string; label: string; icon: string; onClick(): void; primary?: boolean };
export function V8PageHead({ title, description, actions }: { title: string; description: string; actions: V8PageAction[] }) {
  return <header data-v8-datum-region="page-head" className="v8-datum-page-head">
    <div className="v8-datum-page-title">
      <span className="v8-datum-page-icon"><OrigamiIcon name="projects" size={28} /></span>
      <span><h1>{title}</h1><p>{description}</p></span>
    </div>
    <div className="v8-datum-page-actions">{actions.map((action) => <button key={action.id} data-v8-datum-action={action.id} className={action.primary ? 'is-primary' : ''} onClick={action.onClick}><OrigamiIcon name={action.icon} size={16} />{action.label}</button>)}</div>
  </header>;
}
```

- [ ] **Step 5: Implement the role banner and replace the existing identity blocks in `DatumCanvas`**

```tsx
export function V8RoleBanner({ code, label, description, godMode }: { code: string; label: string; description: string; godMode: boolean }) {
  return <section data-v8-datum-region="role-banner" className="v8-role-banner">
    <span className="v8-role-avatar">{code}</span>
    <span className="v8-role-copy"><b>{godMode ? `God Mode with ${label} lens` : `${label} experience`}</b><span>{godMode ? 'Full-system exploration is unlocked while the selected role remains a learning lens.' : `${description}. Project navigation is filtered to the role while shared collaboration tools remain visible.`}</span></span>
    <span className="v8-role-tags"><i>{godMode ? 'Full ecosystem' : 'Role relevant'}</i><i>Project-aware</i><i>Audited</i></span>
  </section>;
}
```

Pass `godMode={presentationStage !== null}` and keep the existing `onOpenTool`, `onOpenWingman`, and `onOpenFeedback` callbacks.

- [ ] **Step 6: Verify GREEN and commit**

Run: `npx vitest run components/v8/__tests__/V8ProjectDatumIdentity.test.tsx`

Expected: 2 tests pass.

```powershell
git add components/v8/V8PageHead.tsx components/v8/V8RoleBanner.tsx components/v8/__tests__/V8ProjectDatumIdentity.test.tsx components/views/DatumCanvas.tsx package.json package-lock.json
git commit -m "feat: add V8 Project Datum identity primitives"
```

---

### Task 3: Replace segmented stages with the reference timeline

**Files:**
- Create: `components/v8/V8StageTimeline.tsx`
- Create: `components/v8/V8ProjectHero.tsx`
- Create: `components/v8/__tests__/V8StageTimeline.test.tsx`
- Modify: `components/views/DatumCanvas.tsx`

**Interfaces:**
- Consumes: `stages: readonly StageKey[]`, `activeStage: StageKey`, and `onSelect(stage: StageKey): void`.
- Produces: an accessible stage group with `data-v8-stage`, fine connector line, active node, and project guidance.

- [ ] **Step 1: Write the failing interaction test**

```tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { STAGES } from '@/lib/data';
import { V8StageTimeline } from '@/components/v8/V8StageTimeline';

it('renders eight ordered stages and selects without mutating copy itself', async () => {
  const onSelect = vi.fn();
  render(<V8StageTimeline stages={STAGES} activeStage="Design" onSelect={onSelect} />);
  expect(screen.getAllByRole('button')).toHaveLength(8);
  expect(screen.getByRole('button', { name: 'Design' })).toHaveAttribute('aria-current', 'step');
  await userEvent.click(screen.getByRole('button', { name: 'Comply' }));
  expect(onSelect).toHaveBeenCalledWith('Comply');
});
```

- [ ] **Step 2: Verify RED**

Run: `npx vitest run components/v8/__tests__/V8StageTimeline.test.tsx`

Expected: FAIL because `V8StageTimeline` is missing.

- [ ] **Step 3: Implement the stage timeline**

```tsx
import type { StageKey } from '@/lib/types';

type V8StageTimelineProps = { stages: readonly StageKey[]; activeStage: StageKey; onSelect(stage: StageKey): void };

export function V8StageTimeline({ stages, activeStage, onSelect }: V8StageTimelineProps) {
  return <div className="v8-stages" role="group" aria-label="Project lifecycle stages">
    {stages.map((stage, index) => <button key={stage} type="button" data-v8-stage={stage} className={stage === activeStage ? 'v8-stage is-active' : 'v8-stage'} aria-current={stage === activeStage ? 'step' : undefined} onClick={() => onSelect(stage)}><i>{index + 1}</i><span>{stage}</span></button>)}
  </div>;
}
```

- [ ] **Step 4: Implement `V8ProjectHero` and replace the existing Project Hero block**

```tsx
import type { ProjectEntity, StageKey } from '@/lib/types';

type V8ProjectHeroProps = { project: ProjectEntity; activeStage: StageKey; onSelectStage(stage: StageKey): void };

export function V8ProjectHero({ project, activeStage, onSelectStage }: V8ProjectHeroProps) {
  return <section data-v8-datum-region="project-hero" className="v8-project-hero">
    <div className="v8-project-top"><span><h2>{project.name}</h2><p>{project.location} · {project.client} · {project.professional}</p></span><span className="v8-project-status">● In progress · {project.progress}%</span></div>
    <V8StageTimeline stages={STAGES} activeStage={activeStage} onSelect={onSelectStage} />
    <div className="v8-stage-help"><b>{activeStage} stage:</b> {STAGE_COPY[activeStage]}</div>
  </section>;
}
```

- [ ] **Step 5: Verify GREEN and commit**

Run: `npx vitest run components/v8/__tests__/V8StageTimeline.test.tsx components/v8/__tests__/V8ProjectDatumIdentity.test.tsx`

Expected: all tests pass.

```powershell
git add components/v8/V8StageTimeline.tsx components/v8/V8ProjectHero.tsx components/v8/__tests__/V8StageTimeline.test.tsx components/views/DatumCanvas.tsx
git commit -m "feat: match V8 project stage timeline"
```

---

### Task 4: Rebuild the spatial Datum world

**Files:**
- Create: `components/v8/V8DatumCard.tsx`
- Create: `components/v8/V8DatumWorld.tsx`
- Create: `components/v8/V8DatumSequence.tsx`
- Create: `components/v8/__tests__/V8DatumWorld.test.tsx`
- Modify: `components/views/DatumCanvas.tsx`

**Interfaces:**
- Consumes: `tools: readonly ToolDefinition[]`, `metrics: Record<string, readonly [string, string]>`, `stage`, `roleLabel`, and `onOpenTool(id: string): void`.
- Produces: one ordered data collection rendered as a desktop world and mobile sequence.

- [ ] **Step 1: Write the failing shared-order contract**

```tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { V8DatumSequence } from '@/components/v8/V8DatumSequence';
import { V8DatumWorld } from '@/components/v8/V8DatumWorld';
import type { ToolDefinition } from '@/lib/types';

const tools = [
  { id: 'practice', name: 'Practice Management', icon: 'practice_management', summary: 'Project command centre', status: 'live' },
  { id: 'specforge', name: 'SpecForge', icon: 'specification', summary: 'Specifications', status: 'live' },
] as ToolDefinition[];
const metrics: Record<string, readonly [string, string]> = {
  practice: ['68% overall progress', '14 open actions'],
  specforge: ['64 sections active', '12 clauses flagged'],
};

it('uses one tool order for the spatial world and mobile sequence', () => {
  render(<><V8DatumWorld tools={tools} metrics={metrics} stage="Design" roleLabel="Architect" onOpenTool={vi.fn()} /><V8DatumSequence tools={tools} metrics={metrics} onOpenTool={vi.fn()} /></>);
  expect(screen.getAllByTestId('v8-datum-card').map((node) => node.getAttribute('data-tool-id'))).toEqual(tools.map((tool) => tool.id));
  expect(screen.getAllByTestId('v8-datum-sequence-item').map((node) => node.getAttribute('data-tool-id'))).toEqual(tools.map((tool) => tool.id));
});
```

- [ ] **Step 2: Verify RED**

Run: `npx vitest run components/v8/__tests__/V8DatumWorld.test.tsx`

Expected: FAIL because the three Datum components are missing.

- [ ] **Step 3: Implement the card primitive**

```tsx
import type { ToolDefinition } from '@/lib/types';

type V8DatumCardProps = { tool: ToolDefinition; metric: readonly [string, string]; orientation: 'above' | 'below'; onOpen(id: string): void };

export function V8DatumCard({ tool, metric, orientation, onOpen }: V8DatumCardProps) {
  return <button type="button" data-testid="v8-datum-card" data-tool-id={tool.id} className={`v8-datum-card is-${orientation}`} onClick={() => onOpen(tool.id)}>
    <span className="v8-datum-card-head"><i><OrigamiIcon name={tool.icon} size={22} /></i><strong>{tool.name}</strong></span>
    <p>{tool.summary}</p>
    <span className="v8-datum-card-meta"><b>{metric[0]}</b><i>{tool.status === 'live' ? 'Live' : 'Scaffold'}</i></span>
  </button>;
}
```

- [ ] **Step 4: Implement a deterministic spatial world**

```tsx
import { useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import type { StageKey, ToolDefinition } from '@/lib/types';

const position = (index: number, count: number) => `${12 + ((index + 1) * 82) / (count + 1)}%`;
type V8DatumWorldProps = { tools: readonly ToolDefinition[]; metrics: Record<string, readonly [string, string]>; stage: StageKey; roleLabel: string; onOpenTool(id: string): void };

export function V8DatumWorld({ tools, metrics, stage, roleLabel, onOpenTool }: V8DatumWorldProps) {
  const [zoom, setZoom] = useState(1);
  return <section data-v8-datum-region="datum-viewport" className="v8-datum-viewport">
    <div className="v8-datum-world" style={{ transform: `scale(${zoom})` }}>
      <div className="v8-datum-line" />
      <div className="v8-datum-origin"><img src="/logo.png" alt="Architex bird" /></div>
      <div className="v8-datum-label">DATUM<span>single line of truth</span></div>
      <div className="v8-datum-stage-badge"><b>{stage} · {roleLabel}</b>{tools.length} connected workspaces are active here.</div>
      {tools.map((tool, index) => <div key={tool.id} className={`v8-datum-slot ${index % 2 === 0 ? 'is-above' : 'is-below'}`} style={{ left: position(index, tools.length) }}><V8DatumCard tool={tool} metric={metrics[tool.id]} orientation={index % 2 === 0 ? 'above' : 'below'} onOpen={onOpenTool} /><i className="v8-datum-node" /></div>)}
    </div>
    <div className="v8-datum-controls"><button onClick={() => setZoom(Math.max(.65, zoom - .1))}>−</button><input aria-label="Datum canvas zoom" type="range" min=".65" max="1.35" step=".05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /><output>{Math.round(zoom * 100)}%</output><button onClick={() => setZoom(Math.min(1.35, zoom + .1))}>+</button><button aria-label="Fit datum to view" onClick={() => setZoom(1)}><OrigamiIcon name="expand" size={17} /></button></div>
  </section>;
}
```

- [ ] **Step 5: Implement the mobile sequence and simplify `DatumCanvas` to composition**

```tsx
import { OrigamiIcon } from '@/lib/origami-icons';
import type { ToolDefinition } from '@/lib/types';

type V8DatumSequenceProps = { tools: readonly ToolDefinition[]; metrics: Record<string, readonly [string, string]>; onOpenTool(id: string): void };

export function V8DatumSequence({ tools, metrics, onOpenTool }: V8DatumSequenceProps) {
  return <section className="v8-datum-sequence" aria-label="Datum-connected tools">{tools.map((tool, index) => <button key={tool.id} data-testid="v8-datum-sequence-item" data-tool-id={tool.id} onClick={() => onOpenTool(tool.id)}><OrigamiIcon name={tool.icon} size={20} /><span><b>{index + 1}. {tool.name}</b><small>{metrics[tool.id][0]}</small></span><i>{tool.status === 'live' ? 'Live' : 'Scaffold'}</i></button>)}</section>;
}
```

`DatumCanvas` retains only active-tool derivation, metric derivation, and composition of the five V8 primitives.

- [ ] **Step 6: Verify GREEN and commit**

Run: `npx vitest run components/v8/__tests__/V8DatumWorld.test.tsx components/v8/__tests__/V8StageTimeline.test.tsx components/v8/__tests__/V8ProjectDatumIdentity.test.tsx`

Expected: all tests pass.

```powershell
git add components/v8/V8DatumCard.tsx components/v8/V8DatumWorld.tsx components/v8/V8DatumSequence.tsx components/v8/__tests__/V8DatumWorld.test.tsx components/views/DatumCanvas.tsx
git commit -m "feat: rebuild V8 spatial Datum world"
```

---

### Task 5: Apply the measured V8 Project Datum styles

**Files:**
- Create: `styles/v8-project-datum.css`
- Modify: `app/globals.css`
- Modify: `styles/tokens.css`
- Test: `e2e/v8-project-datum-contract.spec.ts`

**Interfaces:**
- Consumes: stable `data-v8-datum-region`, `data-v8-stage`, and `v8-*` class contracts from Tasks 2–4.
- Produces: exact light-theme desktop styling plus token-based dark and responsive translations.

- [ ] **Step 1: Write the failing computed-style browser test**

```ts
test('matches Project Datum reference regions and computed styles', async ({ page }) => {
  await restoreAuthenticatedShell(page);
  await page.setViewportSize(V8_PROJECT_DATUM_CONTRACT.viewport);
  await page.goto('/');
  await expect(page.getByTestId('datum-canvas')).toBeVisible();
  for (const [name, expected] of Object.entries(V8_PROJECT_DATUM_CONTRACT.regions)) {
    const actual = await page.locator(`[data-v8-datum-region="${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}"]`).boundingBox();
    expect(actual).not.toBeNull();
    for (const key of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(actual![key] - expected[key])).toBeLessThanOrEqual(1);
  }
  await expect(page.locator('.v8-datum-line')).toHaveCSS('height', '2px');
  await expect(page.locator('.v8-project-hero')).toHaveCSS('border-radius', V8_PROJECT_DATUM_CONTRACT.computedStyles.projectHero.borderRadius);
});
```

- [ ] **Step 2: Verify RED**

Run: `npx playwright test e2e/v8-project-datum-contract.spec.ts --reporter=line`

Expected: FAIL on the first mismatched rectangle or computed style.

- [ ] **Step 3: Implement the scoped light-theme CSS from reference values**

```css
.v8-datum-page-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
.v8-datum-page-title{display:flex;align-items:flex-start;gap:10px;min-width:0}.v8-datum-page-title h1{margin:0;font-size:21px;line-height:1.2;font-weight:760;letter-spacing:-.025em;color:#102033}.v8-datum-page-title p{margin:4px 0 0;font-size:13px;line-height:1.5;color:#657287}
.v8-role-banner{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid rgba(25,183,176,.17);border-radius:14px;background:linear-gradient(90deg,rgba(223,245,242,.72),rgba(255,255,255,.9))}
.v8-project-hero{padding:16px 20px;border:1px solid rgba(16,32,51,.09);border-radius:16px;background:rgba(255,255,255,.91);box-shadow:0 8px 24px rgba(16,32,51,.06)}
.v8-stages{display:grid;grid-template-columns:repeat(8,1fr);gap:4px;margin-top:14px}.v8-stage{position:relative;border:0;background:none;color:#8a96a4;font-size:11px;text-align:center}.v8-stage:before{content:"";position:absolute;top:9px;left:-50%;right:50%;height:1px;background:#d8e2e0}.v8-stage:first-child:before{display:none}.v8-stage i{position:relative;z-index:1;display:grid;width:20px;height:20px;margin:0 auto 6px;place-items:center;border:1px solid #d5dfdd;border-radius:50%;background:#fff;font-style:normal}.v8-stage.is-active{color:#167e79;font-weight:800}.v8-stage.is-active i{border-color:#19b7b0;background:#19b7b0;color:#fff;box-shadow:0 0 0 4px rgba(25,183,176,.1)}
.v8-datum-viewport{height:700px;position:relative;overflow:hidden;border:1px solid rgba(16,32,51,.09);border-radius:20px;background:rgba(255,255,255,.74);box-shadow:0 10px 32px rgba(16,32,51,.07)}
.v8-datum-world{position:relative;min-width:100%;height:100%;transform-origin:center;transition:transform 180ms ease-out}.v8-datum-line{position:absolute;left:6%;right:4%;top:50%;height:2px;background:linear-gradient(90deg,#19b7b0,#51d0c5);box-shadow:0 0 13px rgba(25,183,176,.28)}
.v8-datum-card{width:170px;padding:14px;border:1px solid rgba(16,32,51,.09);border-radius:15px;background:#fff;box-shadow:0 7px 22px rgba(16,32,51,.07);text-align:left;color:#102033}.v8-datum-card:hover{transform:translateY(-3px);box-shadow:0 16px 38px rgba(16,32,51,.1)}
```

Import it after foundations in `app/globals.css`:

```css
@import "../styles/v8-project-datum.css";
```

- [ ] **Step 4: Add dark and responsive translations**

```css
[data-theme='dark'] .v8-project-hero,[data-theme='dark'] .v8-datum-card,[data-theme='dark'] .v8-datum-viewport{background:var(--ax-surface-1);border-color:var(--ax-border);color:var(--ax-text)}
@media(max-width:760px){.v8-datum-page-head{display:grid}.v8-datum-page-actions{display:grid;grid-template-columns:repeat(2,1fr)}.v8-stages{grid-template-columns:repeat(4,1fr);row-gap:12px}.v8-datum-viewport{display:none}.v8-datum-sequence{display:grid}}
@media(min-width:761px){.v8-datum-sequence{display:none}}
@media(prefers-reduced-motion:reduce){.v8-datum-world,.v8-datum-card{transition:none!important}}
```

- [ ] **Step 5: Run computed-style and type gates, then commit**

Run: `npx playwright test e2e/v8-project-datum-contract.spec.ts --reporter=line`

Run: `npx tsc --noEmit`

Expected: both commands exit 0.

```powershell
git add styles/v8-project-datum.css app/globals.css styles/tokens.css e2e/v8-project-datum-contract.spec.ts
git commit -m "feat: apply measured V8 Project Datum styling"
```

---

### Task 6: Certify behaviour, responsive layout, and accessibility

**Files:**
- Modify: `e2e/v8-project-datum-contract.spec.ts`
- Modify: `e2e/v8-shell-visual.spec.ts`
- Create: `scripts/capture-v8-project-datum.mjs`
- Create: `release/evidence/v8-project-datum/README.md`

**Interfaces:**
- Consumes: the completed Project Datum primitives and reference fixture.
- Produces: automated desktop/tablet/mobile proof and identical-state screenshots.

- [ ] **Step 1: Add failing interaction and responsive assertions**

```ts
test('preserves stage selection, tool opening, zoom, mobile order, and focus', async ({ page }) => {
  await restoreAuthenticatedShell(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Comply' }).click();
  await expect(page.getByRole('button', { name: 'Comply' })).toHaveAttribute('aria-current', 'step');
  await page.getByTestId('v8-datum-card').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: /Practice/ })).toBeVisible();
  await page.goBack();
  await page.getByRole('slider', { name: 'Datum canvas zoom' }).fill('1.15');
  await expect(page.getByText('115%')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId('v8-datum-sequence-item')).toHaveCount(8);
  await runAxe(page);
  await assertNoBodyOverflow(page);
});
```

- [ ] **Step 2: Run and verify any remaining mismatch fails**

Run: `npx playwright test e2e/v8-project-datum-contract.spec.ts --reporter=line`

Expected: FAIL until responsive/focus behaviour matches the contract.

- [ ] **Step 3: Correct only observed failures and rerun the complete focused suite**

Run:

```powershell
npx vitest run lib/__tests__/v8-project-datum-contract.test.ts components/v8/__tests__/V8ProjectDatumIdentity.test.tsx components/v8/__tests__/V8StageTimeline.test.tsx components/v8/__tests__/V8DatumWorld.test.tsx
npx playwright test e2e/v8-project-datum-contract.spec.ts e2e/v8-shell-contract.spec.ts e2e/v8-shell-visual.spec.ts --reporter=line
npx tsc --noEmit
```

Expected: all focused unit tests, browser tests, and TypeScript checks pass.

- [ ] **Step 4: Capture identical-state evidence**

Implement `scripts/capture-v8-project-datum.mjs` to open the reference and authenticated implementation at 1600 × 1000, wait for `document.fonts.ready`, capture `reference.png` and `implementation.png`, and write `computed-styles.json` containing both region rectangles and styles.

Run: `node scripts/capture-v8-project-datum.mjs`

Expected files:

```text
release/evidence/v8-project-datum/reference.png
release/evidence/v8-project-datum/implementation.png
release/evidence/v8-project-datum/computed-styles.json
```

- [ ] **Step 5: Inspect screenshots at original resolution and commit certification evidence**

Use the image viewer on both PNG files. Unexplained differences require another red/green cycle before commit.

```powershell
git add e2e/v8-project-datum-contract.spec.ts e2e/v8-shell-visual.spec.ts scripts/capture-v8-project-datum.mjs release/evidence/v8-project-datum
git commit -m "test: certify V8 Project Datum parity"
```

---

### Task 7: Build, deploy to test, and certify the real data path

**Files:**
- Modify: `docs/v8-remediation/evidence/V8_REFERENCE_VS_LIVE_SIDE_BY_SIDE_AUDIT_2026-08-26.md`
- Create: `release/evidence/v8-project-datum/live-certification.json`

**Interfaces:**
- Consumes: a clean static-export build, current prototype API, and approved FTP target.
- Produces: live prototype evidence and rollback coordinates; production remains unchanged.

- [ ] **Step 1: Build the exact test artifact**

```powershell
$env:ARCHITEX_STATIC_EXPORT='1'
$env:NEXT_PUBLIC_API_BASE_URL='https://api.architex.co.za/api/v1'
$env:NEXT_PUBLIC_ARCHITEX_DATA_MODE='prototype'
$env:NEXT_PUBLIC_GOD_MODE_ENABLED='true'
npm run build
```

Expected: optimized static export completes with TypeScript validation and `out/index.html` exists.

- [ ] **Step 2: Hash, upload, and preserve rollback**

Compute the SHA-256 of `out/index.html`, upload the complete `out` directory to an inert sibling, verify `_next`, `.htaccess`, `index.html`, and `preview3.html`, rename the current test directory to a timestamped rollback directory, then rename the candidate into place. Never mutate `architex.co.za` in this task.

- [ ] **Step 3: Verify live artifact and API health**

Run cache-busted requests and require:

```text
GET https://test.architex.co.za/?v8-project-datum=<revision> -> 200 and matching index SHA-256
GET https://api.architex.co.za/api/v1/db-health -> 200, connected=true, migrations_applied>=13
```

- [ ] **Step 4: Run the real browser journey without API mocking**

Use the provisioned Architect prototype account through the visible login interface. Verify landing, sign-in, `/me`, `/projects`, Project Datum, eight stage controls, Datum card opening, reload/refresh, God Mode stage presentation, theme persistence, logout, and no unexpected console errors or API 5xx responses.

- [ ] **Step 5: Record live evidence and update the existing audit conservatively**

Write `live-certification.json` with revision, artifact hash, migration count, API statuses, viewport, screenshot paths, rollback target, and pass/fail result. Update only the existing audit document; distinguish local reference parity from live prototype certification and do not claim production readiness.

- [ ] **Step 6: Commit the live certification record**

```powershell
git add docs/v8-remediation/evidence/V8_REFERENCE_VS_LIVE_SIDE_BY_SIDE_AUDIT_2026-08-26.md release/evidence/v8-project-datum/live-certification.json
git commit -m "docs: certify live V8 Project Datum migration"
```

---

## Follow-on plans

After Task 7 passes, create and approve separate implementation plans in this order:

1. Global Command Centre aesthetic migration.
2. God Mode ecosystem aesthetic migration.
3. Navigator, inspector, and feedback completion.
4. Practice Management workspace migration.
5. Meetings workspace migration.
6. Engineering workspace migration.
7. Wingman workspace migration.
8. Remaining live tools, one at a time.
9. Remaining scaffold tools, one at a time.
10. Whole-product dark-theme and production no-mock-data certification.

Project Datum completion is not whole-product completion. The active programme remains open until every follow-on surface passes its own reference, data, authorization, browser, and deployment gates.
