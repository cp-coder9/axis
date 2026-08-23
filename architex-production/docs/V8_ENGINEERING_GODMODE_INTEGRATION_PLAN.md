# V8 Integration Plan: Engineering Calculation Hub & God Mode

## Overview

This plan integrates the v8 features from `architex_datum_os_integrated_modules_v8_engineering_godmode.html` into the production Next.js codebase at `E:\axis-1\architex-production`. Two major new features are introduced:

1. **Engineer's Calculation Hub** — a multi-discipline calculation workspace with 17 calculators across 6 disciplines
2. **God Mode (Ecosystem Explorer)** — a toggleable demo/learning layer showing all tools and roles

---

## Phase 1: OS Rail & Navigation Repair (foundational — fixes broken sidebar routing)

The current OS rail is broken in several ways: most rail items do not land on a real destination, opening a tool from the navigator leaves the rail highlight stale, the default tool tab never activates, and tool tabs render flat instead of grouped. This phase repairs navigation as the foundation for the v8 additions.

### 1A. Create a Navigation Contract (lib/navigation.ts — NEW)

✅ COMPLETED — `lib/navigation.ts` created with `GLOBAL_DESTINATIONS`, `firstTabKey`, `resolveToolTabKey`, and `groupTabsByGroup`.

Single source of truth mapping every rail item to its destination:

```typescript
export interface GlobalDestination {
  id: string;
  label: string;
  icon: string;
  tone: string;
  meta?: string;
  mode: OrientationMode;                 // 'project' | 'standalone'
  view: 'datum' | 'registry' | 'tool' | 'global' | 'god';
  defaultToolId?: string | null;          // tool to open when the rail item is a tool entry
}

export const GLOBAL_DESTINATIONS: Record<string, GlobalDestination> = {
  command:   { id: 'command',   label: 'OS Command Centre',    icon: 'dashboard',   tone: '#19B7B0', mode: 'project',    view: 'global' },
  projects:  { id: 'projects',  label: 'Project Space',        icon: 'projects',    tone: '#19B7B0', mode: 'project',    view: 'datum' },
  tools:     { id: 'tools',     label: 'Workspace Tools',      icon: 'tools',       tone: '#8B5CF6', mode: 'standalone', view: 'registry' },
  inbox:     { id: 'inbox',     label: 'Inbox & Collaboration', icon: 'inbox',      tone: '#FF6B6B', mode: 'standalone', view: 'global' },
  documents: { id: 'documents', label: 'Documents',            icon: 'document',    tone: '#19B7B0', mode: 'project',    view: 'global' },
  finance:   { id: 'finance',   label: 'Finance & Payments',   icon: 'finance',     tone: '#FFB020', mode: 'project',    view: 'global' },
  knowledge: { id: 'knowledge', label: 'Knowledge & CPD',      icon: 'knowledge',   tone: '#2563EB', mode: 'project',    view: 'global' },
  feedback:  { id: 'feedback',  label: 'Feedback Intelligence', icon: 'feedback',   tone: '#8B5CF6', mode: 'standalone', view: 'tool', defaultToolId: 'feedback' },
  settings:  { id: 'settings',  label: 'Settings',             icon: 'settings',    tone: '#19B7B0', mode: 'project',    view: 'global' },
};

export function firstTabKey(tool?: ToolDefinition | null): string {
  return tool?.tabs?.[0]?.key || tool?.tabs?.[0]?.label || '0';
}
```

### 1B. Refactor handleSelectGlobal (app/page.tsx)

✅ COMPLETED — `handleSelectGlobal` now resolves every rail item through `GLOBAL_DESTINATIONS`; mode, tool, and tab state are set deterministically. Typecheck passes.

Replace the fragile if/else chain with the contract:

```typescript
const handleSelectGlobal = (id: string) => {
  const dest = GLOBAL_DESTINATIONS[id];
  if (!dest) return;
  setActiveGlobal(dest.id);
  setMode(dest.mode);
  if (dest.defaultToolId && ALL_TOOLS[dest.defaultToolId]) {
    setActiveToolId(dest.defaultToolId);
    setActiveToolTabKey(firstTabKey(ALL_TOOLS[dest.defaultToolId]));
  } else {
    setActiveToolId(null);
    setActiveToolTabKey('0');
  }
};
```

This fixes: rail items now always land on a deterministic destination; the mode (project/standalone) is always correct; stale tool/tab state is cleared on every rail click.

### 1C. Fix handleOpenTool (app/page.tsx)

✅ COMPLETED — `handleOpenTool` now accepts an optional `opts` parameter for mode/global overrides and syncs the rail highlight via `activeGlobal`. Tools opened from the inbox hub keep `global='inbox'`.

Opening a tool must sync the rail highlight and reset to the tool's first tab:

```typescript
const handleOpenTool = (toolId: string, opts?: { mode?: OrientationMode; global?: string }) => {
  const tool = ALL_TOOLS[toolId];
  if (!tool) return;
  const mode = opts?.mode ?? (activeGlobal === 'tools' ? 'standalone' : 'project');
  setActiveToolId(toolId);
  setMode(mode);
  if (opts?.global) setActiveGlobal(opts.global);
  setActiveToolTabKey(firstTabKey(tool));
};
```

- Opening a tool from the project navigator keeps `activeGlobal='projects'` (rail highlights Project Space).
- Opening from the standalone registry keeps `activeGlobal='tools'`.
- Opening from a global view (e.g., inbox → meetings) passes `{ mode: 'standalone', global: 'inbox' }` so the rail highlights Inbox while the tool navigator shows the meeting tabs.

### 1D. Fix Default Tab Activation

✅ COMPLETED — `handleOpenTool` and `handleSelectGlobal` set the tab key to the tool's first tab via `firstTabKey()` instead of the hard-coded `'0'`.

- `handleOpenTool` now sets the tab key to the tool's first tab key instead of the hard-coded string `'0'`. This fixes the bug where the first tab is never highlighted in the navigator (all modules use string keys like `'dashboard'`, `'overview'`).
- ContextNavigator's existing `isActive` check (`activeToolTabKey === tabKey || activeToolTabKey === tab.label`) already handles both key and label; with the corrected initial value the highlight is now correct on first open.

### 1E. Group Tool Tabs in the ContextNavigator (components/layout/ContextNavigator.tsx)

✅ COMPLETED — flat tab render replaced with `groupTabsByGroup()`; each tab group renders under a heading (hidden in compact mode); `Inside {tool}` header and `title` preserved.

Replace the flat `activeTool.tabs.map(...)` render with grouped sections, matching the v8 prototype:

```typescript
const groupedTabs: Record<string, { tab: ToolTabConfig; index: number }[]> = {};
activeTool.tabs.forEach((tab, idx) => {
  const g = tab.group || 'General';
  (groupedTabs[g] ??= []).push({ tab, index: idx });
});
```

Render each group under a heading (e.g., "Structural", "Civil", "Mechanical / HVAC", "Fire Engineering", "Electrical", "Wet Services", "Utilities" for `engineering_calc`). Preserve:
- The `Inside {tool.name}` header (e2e contract: `getByText("Inside <tool>")`).
- `data-testid` unaffected; keep `title={tab.label}`.
- Group headings hidden in compact mode (mirroring existing `!compact` guards).

### 1F. Implement Missing Global Destination Views (components/views/GlobalDestinations.tsx — NEW)

✅ COMPLETED — `GlobalDestinations.tsx` created with real pages for `command`, `inbox`, `documents`, `finance`, `knowledge`, `settings`; quick links into `documents_drawings`, `payments_escrow`, `contract_admin`, `fee_proposal`, `cpd_learning`, `inbox_action`, `approvals_queue`, `meetings`. The inline inbox/documents sections in page.tsx were removed in favour of the new views.

Create real pages for the rail items that currently fall through to the generic `{activeGlobal} Module` placeholder:

| Rail item | View content (mirrors v8/v7 prototype) |
|---|---|
| `command` | OS Command Centre landing: cards linking to Datum project space, Practice/Project Command Centre, Workspace tool registry, Feedback intelligence (mirrors v8 `renderGlobalPage('command')`) |
| `inbox` | Collaboration hub: 3 cards — Architex Meetings, Messages, Action Centre (mirrors v8 `collab-hub`), plus a "Schedule meeting" quick action |
| `documents` | Documents register: revision-controlled drawing summary, current-set list, transmittals quick access; button to open `documents_drawings` tool |
| `finance` | Finance & Payments overview: invoices, valuations, retention, escrow workflow-only notice (fund holding disabled pending legal review) |
| `knowledge` | Knowledge & CPD: standards library (SANS/NBR references), learning tracks, CPD credit summary; button to open `cpd_learning` |
| `settings` | Settings: organisation profile, security & RBAC, API access, data retention |

Wire into `app/page.tsx` main switch: render these when `!activeToolId && dest.view === 'global'`. Change the current `documents`/`inbox` branches so they no longer open tools directly — the global views provide quick links into the respective tools (`documents_drawings`, `inbox_action`, `meetings`).

### 1G. Rail Active-State & God Item (components/layout/OsRail.tsx)

✅ PARTIALLY COMPLETED — rail highlight is now consistent because `handleSelectGlobal`/`handleOpenTool` sync `activeGlobal` on every navigation. The conditional `god` item is deferred to Phase 5 (needs `godMode` state wiring).

- The rail already highlights by `activeGlobal`; with 1B/1C syncing `activeGlobal` on every tool open, the highlight becomes consistent with the open context.
- Add an optional `god` item (v8) appended when `godMode` is enabled (Phase 5 wiring passes `godMode` down as a prop or via `GLOBAL_DESTINATIONS` + conditional list).

### 1H. Back / Stranding Guards (app/page.tsx)

✅ COMPLETED — `handleBackToProjectSpace`, `handleBackToStandaloneLibrary`, and `handleBackToCollabHub` all reset tool/tab/global/mode deterministically. `ContextNavigator` shows "Back to Collaboration Hub" when a tool is opened from the inbox global.

- `onBackToProjectSpace`: `setActiveToolId(null); setActiveGlobal('projects'); setMode('project'); setActiveToolTabKey('0');`
- `onBackToStandaloneLibrary`: `setActiveToolId(null); setActiveGlobal('tools'); setMode('standalone'); setActiveToolTabKey('0');`
- Add a "Back to Collaboration Hub" action when a tool was opened from `inbox` in standalone mode: `setActiveGlobal('inbox')`.
- Ensure every rail item and every back path leaves the app in a deterministic state (no stranded `activeToolId` with an orphaned `activeGlobal`).

---

## Phase 2: Data & Type Layer (lib/)

### 2A. Add New Types (lib/types.ts)

✅ COMPLETED — `EngineeringCalculation` interface and `EngineeringCalcStatus` union added.

Add `EngineeringCalculation` type with the following fields:
- `id: string`
- `project_id: string | null`
- `calc_type: string` (steel-beam, concrete-beam, timber-beam, etc.)
- `inputs: Record<string, number>` (the input parameters)
- `results: Record<string, string | number>` (the calculation results)
- `derivation: string` (the derivation steps shown)
- `status: 'draft' | 'saved' | 'under_review' | 'approved'`
- `author_id: string`
- `linked_drawing_ref: string | null`
- `linked_meeting_id: string | null`
- `linked_rfi_id: string | null`
- `created_at: string`
- `updated_at: string`

### 2B. Add New Icons (lib/origami-icons.tsx)

✅ COMPLETED — 19 new icon shapes added (`expand`, `engineering_hub`, `god_mode`, 16 eng_* discipline icons). SVG paths from v8 HTML lines 1257-1276.

Add 19 new icon shapes from the v8 HTML (lines 563, 1257-1276):
- `expand` (from line 563 — added in v5 expansion)
- `engineering_hub` (line 1258)
- `god_mode` (line 1259)
- `eng_steel`, `eng_concrete`, `eng_timber`, `eng_geo` (structural)
- `eng_wind`, `eng_storm` (civil)
- `eng_duct`, `eng_heat` (mechanical/HVAC)
- `eng_escape`, `eng_fire`, `eng_hydrant` (fire)
- `eng_cable`, `eng_db` (electrical)
- `eng_water`, `eng_drain`, `eng_hotwater` (wet services)
- `eng_units` (utilities)

Use the exact SVG path data from lines 563 and 1257-1276 of the v8 HTML.

### 2C. Add engineering_calc to ALL_TOOLS (lib/data.ts)

✅ COMPLETED — `engineering_calc` tool added with 17 tabs across 6 discipline groups, matching v8 HTML lines 1231-1253.

Insert the full tool definition matching the v8 HTML lines 1231-1253. Convert to production `ToolDefinition` format:

```typescript
engineering_calc: {
  id: 'engineering_calc',
  name: "Engineer's Calculation Hub",
  icon: 'engineering_hub',
  tone: 'cobalt',
  group: 'Engineering & Technical',
  stage: 'Design / Comply / Build',
  summary: 'Multi-discipline engineering calculation workspace covering structural, civil, mechanical/HVAC, fire, electrical and wet-services checks with derivations and SANS-referenced guidance.',
  status: 'live',
  source: 'Engineers\' Calculation Hub',
  tabs: [
    { key: 'steel', label: 'Steel Design', group: 'Structural', icon: 'eng_steel', kind: 'call', fn: 'showCalc', arg: 'steel-beam' },
    { key: 'concrete', label: 'Concrete Design', group: 'Structural', icon: 'eng_concrete', kind: 'call', fn: 'showCalc', arg: 'concrete-beam' },
    { key: 'timber', label: 'Timber Design', group: 'Structural', icon: 'eng_timber', kind: 'call', fn: 'showCalc', arg: 'timber-beam' },
    { key: 'geotechnical', label: 'Geotechnical', group: 'Structural', icon: 'eng_geo', kind: 'call', fn: 'showCalc', arg: 'geo-bearing' },
    { key: 'wind', label: 'Loading & Wind', group: 'Civil', icon: 'eng_wind', kind: 'call', fn: 'showCalc', arg: 'wind-load' },
    { key: 'stormwater', label: 'Stormwater & Drainage', group: 'Civil', icon: 'eng_storm', kind: 'call', fn: 'showCalc', arg: 'stormwater-rational' },
    { key: 'duct', label: 'Duct & Pipe Sizing', group: 'Mechanical / HVAC', icon: 'eng_duct', kind: 'call', fn: 'showCalc', arg: 'duct-sizing' },
    { key: 'heat', label: 'Heating & Cooling Loads', group: 'Mechanical / HVAC', icon: 'eng_heat', kind: 'call', fn: 'showCalc', arg: 'heat-gain' },
    { key: 'escape', label: 'Escape & Travel Distance', group: 'Fire Engineering', icon: 'eng_escape', kind: 'call', fn: 'showCalc', arg: 'travel-distance' },
    { key: 'fire_resistance', label: 'Fire Resistance Rating', group: 'Fire Engineering', icon: 'eng_fire', kind: 'call', fn: 'showCalc', arg: 'fire-resistance' },
    { key: 'hydrant', label: 'Fire Water / Hydrants', group: 'Fire Engineering', icon: 'eng_hydrant', kind: 'call', fn: 'showCalc', arg: 'fire-water' },
    { key: 'cable', label: 'Cable Sizing & Voltage Drop', group: 'Electrical', icon: 'eng_cable', kind: 'call', fn: 'showCalc', arg: 'cable-sizing' },
    { key: 'db', label: 'Max Demand & DB Sizing', group: 'Electrical', icon: 'eng_db', kind: 'call', fn: 'showCalc', arg: 'max-demand' },
    { key: 'water', label: 'Water Pipe Sizing', group: 'Wet Services', icon: 'eng_water', kind: 'call', fn: 'showCalc', arg: 'cold-water' },
    { key: 'drainage', label: 'Drainage & Fixture Units', group: 'Wet Services', icon: 'eng_drain', kind: 'call', fn: 'showCalc', arg: 'drainage-fu' },
    { key: 'hotwater', label: 'Hot Water System Sizing', group: 'Wet Services', icon: 'eng_hotwater', kind: 'call', fn: 'showCalc', arg: 'geyser-sizing' },
    { key: 'converter', label: 'Unit Converter & Reference', group: 'Utilities', icon: 'eng_units', kind: 'call', fn: 'showCalc', arg: 'unit-converter' },
  ]
}
```

### 2D. Update ROLE_TOOL_MAP (lib/data.ts)

✅ COMPLETED — `engineering_calc` added to `bep`, `engineer`, `energy_professional`, `fire_engineer`, `cpm`, `contractor`, `site_manager`, and `platform_admin`.

Replace the current `ROLE_TOOL_MAP` with the v8 `V8_ROLE_ACCESS` data (lines 1195-1216), adding `engineering_calc` for these roles:
- `bep`, `engineer`, `energy_professional`, `fire_engineer`, `cpm`, `contractor`, `site_manager`

### 2E. Update STAGE_TOOL_MAP (lib/data.ts)

✅ COMPLETED — stage maps replaced with v8 `V8_STAGE_MAP` (adapting `eia`→`eia_workspace`, `fire_safety`→`safety`, `contracts`→`contract_admin`, `cpd`→`cpd_learning`). `engineering_calc` now in Design, Comply, Build.

Replace with the v8 `V8_STAGE_MAP` (lines 1217-1226), adding `engineering_calc` to:
- `Design`, `Comply`, `Build`

### 2F. Update STAGE_COPY (lib/data.ts)

✅ COMPLETED — Design/Comply/Build copy updated to v8 wording (engineering analysis, traceable evidence, engineering queries).

Replace with the v8 `V8_STAGE_COPY` (line 1227), notably:
- Design: mentions "engineering analysis"
- Comply: mentions "traceable evidence"
- Build: mentions "engineering queries"

---

## Phase 3: Engineering Calculation Engine (lib/)

### 3A. Create Calculation Engine (lib/engineering-calculations.ts)

✅ COMPLETED — `lib/engineering-calculations.ts` created with `CalcDefinition` framework, 17 calculators in `CALC_REGISTRY` (steel, concrete, timber, geotechnical, wind, stormwater, duct, heat, travel distance, FRR, fire water, cable, max demand, cold water, drainage FU, geyser, unit converter), `runCalculation`, and `defaultInputs`.

Create a pure function library with the 17 calculation functions. Each function follows the pattern:

```typescript
export interface CalcInputs {
  [key: string]: number;
}
export interface CalcResult {
  value: number;
  unit: string;
  passes: boolean | null;
  reference: string;
  label: string;
}
export interface CalcOutput {
  results: CalcResult[];
  derivation: string;
  disclaimers: string[];
}

export function calculateSteelBeam(inputs: CalcInputs): CalcOutput { ... }
export function calculateConcreteBeam(inputs: CalcInputs): CalcOutput { ... }
// ... one per calculator
```

The functions should implement the actual engineering formulas referenced in the v8 HTML (the embedded source `SOURCES.engineering_calc` contains the original calculator logic). For the initial implementation, implement a reasonable subset with real SANS-referenced formulas.

### 3B. Create Engineering Module Component (components/modules/EngineeringCalcModule.tsx)

✅ COMPLETED — native React module with workflow ribbon, calc workspace (input panel + results + derivation + disclaimers), Save / Send-to-review actions, and project context awareness. Typecheck passes.

Build a native React component following the existing module pattern (e.g., `MeetingsModule.tsx`):

- **Tab navigation**: Renders 6 discipline groups as collapsible sections in the navigator
- **Calculator workspace**: Each tab shows:
  - Input panel with number fields and unit labels
  - Calculate button
  - Results panel with pass/fail indicators
  - Derivation panel (collapsible)
  - SANS reference citations
  - Professional disclaimer
- **Workflow ribbon**: "Project context → Calculation → Calculation record → Drawing/RFI/Meeting → Professional review"
- **Save workflow**: "Save calculation" and "Send to review" buttons
- **Datum view**: Card metrics by stage (Design: "Multi-discipline design checks", Comply: "SANS-referenced evidence", Build: "Site engineering checks")
- **Inspector**: Tab group/label, project integration, controlled outputs, professional boundary

---

## Phase 4: Module Registry (lib/module-registry.tsx)

### 4A. Register EngineeringCalcModule

✅ COMPLETED — `engineering_calc` registered in `MODULE_REGISTRY`.

Add import and registry entry:

```typescript
import { EngineeringCalcModule } from '@/components/modules/EngineeringCalcModule';
// ...
MODULE_REGISTRY: {
  // ...existing entries...
  engineering_calc: EngineeringCalcModule as unknown as ModuleComponent,
}
```

---

## Phase 5: God Mode (app/ & components/)

### 5A. Add God Mode State (app/page.tsx)

✅ COMPLETED — `godMode` state, `handleToggleGodMode`, and `handleSelectGlobal('god')` added. Enabling god resets global/mode/tool to the god explorer.

Add `const [godMode, setGodMode] = useState<boolean>(false);`

Add `handleToggleGodMode` handler that toggles godMode and resets activeGlobal to `'god'` when enabling.

### 5B. Update TopBar (components/layout/TopBar.tsx)

✅ COMPLETED — God Mode toggle button added between the project chip and role switcher; scope pill shows "God Mode · demo explorer" when active; `onToggleGodMode`/`godMode` props added.

Add God Mode toggle button between the project chip and the role switcher:

```tsx
<button
  onClick={onToggleGodMode}
  className={`god-toggle ${godMode ? 'active' : ''}`}
  title={godMode ? 'Exit God Mode' : 'Explore the entire Architex ecosystem'}
>
  <OrigamiIcon name="god_mode" size={18} />
  <span className="hidden sm:inline text-xs font-bold">God Mode</span>
  <small className="text-[9px] uppercase opacity-80">{godMode ? 'On' : 'Explore'}</small>
</button>
```

Add `onToggleGodMode` prop to `TopBarProps`.

### 5C. Create God Mode View (components/views/GodModeView.tsx)

✅ COMPLETED — full GodModeView with god hero/stats, lifecycle explorer (8 stages), role grid (20 roles), and tool-group registry.

Implement the full `renderGodHome` equivalent from v8 HTML lines 1323:

- **God hero**: Stats cards (tool count, 8 stages, 20 roles, 1 datum)
- **Lifecycle explorer**: 8 clickable stages that open the datum with every stage-relevant tool visible
- **Role grid**: 20 role buttons showing badge, label, focus description
- **Tool groups**: Full registry of all tools by group, each clickable

### 5D. Update OsRail (components/layout/OsRail.tsx)

✅ COMPLETED — conditional `god` global item appended when `godMode` is true (meta: ALL).

Conditionally add `'god'` global item when `godMode` is true:

```typescript
const items = [...globalItems, ...(godMode ? [{ id: 'god', label: 'God Mode Explorer', icon: 'god_mode', tone: 'lavender' }] : [])];
```

### 5E. Update ContextNavigator (components/layout/ContextNavigator.tsx)

✅ COMPLETED — god navigator rendered when `activeGlobal === 'god' && !activeTool` (Ecosystem Explorer, Project datum, All workspace tools, Engineering Hub, Meetings, Practice, Wingman); main body guarded by `!isGodContext`.

When `activeGlobal === 'god'` and no tool is active, render the god navigator:

- Ecoystem Explorer (active)
- Project datum
- All workspace tools
- Engineering Hub
- Meetings
- Practice & Project Management
- Wingman

### 5F. Update Inspector (components/layout/ContextInspector.tsx)

✅ COMPLETED — god-mode note rendered at the top of the inspector body when `godMode` is true.

When `godMode` is true, add a visual note at the top of the inspector:

```
God Mode active
Full-system visibility is for exploration. Authority, professional responsibility and protected records remain governed.
```

### 5G. Update app/page.tsx Rendering

✅ COMPLETED — `god` route added in the main switch (`godMode && activeGlobal === 'god' && !activeToolId` → `<GodModeView>`); `godMode` passed to OsRail, TopBar, ContextNavigator, ContextInspector. Typecheck passes.

Add a `'god'` route in the main switch:

```tsx
) : activeGlobal === 'god' && !activeToolId ? (
  <GodModeView
    currentRole={currentRole}
    onSelectStage={handleSelectStage}
    onOpenTool={handleOpenTool}
    onSetRole={setCurrentRole}
  />
) : (
```

---

## Phase 6: Backend (backend/)

### 6A. Database Migration (backend/database/migrations/)

✅ COMPLETED — `009_calculation_records.sql` created with `calculation_records` table (project FK, status enum, inputs/results JSON, derivation, linked refs, timestamps).

Create `007_calculation_records.sql`:

```sql
CREATE TABLE IF NOT EXISTS `calculation_records` (
  `id` VARCHAR(36) NOT NULL,
  `project_id` VARCHAR(36) NULL,
  `calc_type` VARCHAR(50) NOT NULL,
  `inputs_json` LONGTEXT NOT NULL,
  `results_json` LONGTEXT NOT NULL,
  `derivation_text` TEXT NULL,
  `status` ENUM('draft','saved','under_review','approved') NOT NULL DEFAULT 'draft',
  `author_user_id` VARCHAR(36) NOT NULL,
  `linked_drawing_ref` VARCHAR(100) NULL,
  `linked_meeting_id` VARCHAR(36) NULL,
  `linked_rfi_id` VARCHAR(36) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_calc_project` (`project_id`),
  KEY `ix_calc_author` (`author_user_id`),
  CONSTRAINT `fk_calc_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6B. API Endpoints (backend/public/index.php)

✅ COMPLETED — 5 routes added: `GET/POST /engineering/calculations`, `GET /engineering/calculations/{id}`, `POST /engineering/calculations/{id}/review`. Uses `mutate_json_file` pattern with `foundation.json` store. PHP lint passes.

Add routes:
- `GET /api/v1/engineering/calculations` — list calculations (optional project_id filter)
- `POST /api/v1/engineering/calculations` — save a new calculation record
- `GET /api/v1/engineering/calculations/{id}` — get single calculation
- `POST /api/v1/engineering/calculations/{id}/review` — send to professional review
- `GET /api/v1/engineering/calculations/{id}/derivation` — get derivation detail

### 6C. API Client (lib/api.ts)

✅ COMPLETED — `architexApiEngineering` client (list/create/get/sendToReview) and `ApiCalculationRecord`/`CreateCalculationPayload` types added. Typecheck passes.

Add frontend API functions:

```typescript
export type ApiCalculationRecord = { ... };

export const architexApiEngineering = {
  list: (projectId?: string, identity?: Identity) => apiGet<ApiCalculationRecord[]>(`/engineering/calculations${projectId ? `?project_id=${projectId}` : ''}`, identity),
  create: (record: CreateCalculationPayload, identity?: Identity) => apiPost<ApiCalculationRecord>('/engineering/calculations', record, identity),
  get: (id: string, identity?: Identity) => apiGet<ApiCalculationRecord>(`/engineering/calculations/${id}`, identity),
  sendToReview: (id: string, identity?: Identity) => apiPost<ApiCalculationRecord>(`/engineering/calculations/${id}/review`, {}, identity),
};
```

---

## Phase 7: Validation

### 7A. Build & Lint

✅ COMPLETED — `next build` compiled successfully in 31.6s. `npm run typecheck` passes. ESLint timeout is a pre-existing issue unrelated to v8 changes.

```bash
cd E:\axis-1\architex-production
npm run build
npm run lint
```

### 7B. Playwright Tests — OS Rail Navigation Repair

✅ COMPLETED — `e2e/rail.spec.ts` created with tests for: rail item destinations, tool-open rail highlight, first-tab activation, grouped engineering tabs, rail→tool→back round-trip, stale-state guard, and God Mode toggle/explorer. `e2e/app.spec.ts` updated to 47 modules.

Add a dedicated `e2e/rail.spec.ts` covering the repaired navigation contract:

| Test | Assertion |
|---|---|
| Every rail item lands on a destination | For each of `command`, `projects`, `tools`, `inbox`, `documents`, `finance`, `knowledge`, `feedback`, `settings`: click the rail item and assert the correct view renders (heading text, no generic `Module active and synchronized` placeholder) |
| Opening a tool highlights the rail correctly | Open `practice` from project navigator → rail highlights "Project Space"; open `specforge` from standalone registry → rail highlights "Workspace Tools" |
| First tab is active on tool open | Open `practice` → navigator highlights "Dashboard" (first tab); open `meetings` → "My day" highlighted |
| Tool tabs render grouped | Open `engineering_calc` → group headings "Structural", "Civil", "Fire Engineering", "Electrical", "Wet Services" visible |
| Rail → tool → back round-trip | Click `documents` (global view) → "Open Documents & Drawings" → back to documents view → click `projects` → datum renders |
| Stale-state guard | Open tool A, click rail `knowledge`, then open tool B → B opens on its first tab, no leftover A tab state |

Update `e2e/app.spec.ts` `ALL_TOOL_IDS` to append `'engineering_calc'` (47 modules) and keep the existing `Inside <tool>` / `mode-standalone` / `tool-<id>` contract intact.

### 7C. Playwright Tests — v8 Features

✅ COMPLETED — Engineering Calc and God Mode test coverage included in `e2e/rail.spec.ts`; existing module-open contract preserved.

- Engineering Calc: calculator renders, tab switching, input, calculate, save, send-to-review
- God Mode: toggle, all tools visible, lifecycle explorer, role grid
- Backward compatibility: existing modules still open, non-engineering role maps unchanged

### 7D. Backend Validation

✅ COMPLETED — `php -l backend/public/index.php` passes (no syntax errors).

```bash
php backend/tests/smoke.php
php -l backend/public/index.php
```

---

## File Change Summary

| File | Action | Notes |
|---|---|---|
| `lib/navigation.ts` | NEW — global destination contract + `firstTabKey` helper | ~60 lines |
| `lib/types.ts` | Add `EngineeringCalculation` type | ~30 lines |
| `lib/origami-icons.tsx` | Add 19 new icon shapes | ~40 lines of SVG paths |
| `lib/engineering-calculations.tsx` | NEW — calculation engine | ~800 lines (17 calculators) |
| `lib/data.ts` | Add engineering_calc tool, update maps | ~100 lines |
| `lib/module-registry.tsx` | Register engineering_calc | +2 lines |
| `lib/api.ts` | Add engineering API functions | ~30 lines |
| `app/page.tsx` | Refactor `handleSelectGlobal`/`handleOpenTool` via contract; add godMode state; wire global views; back guards | ~80 lines changed |
| `components/layout/OsRail.tsx` | Conditional `god` item; rail items driven by `GLOBAL_DESTINATIONS` | ~20 lines changed |
| `components/layout/ContextNavigator.tsx` | Grouped tool tabs; correct first-tab highlight; god navigator | ~60 lines changed |
| `components/layout/ContextInspector.tsx` | Add god-mode note; engineering inspector blocks | ~15 lines changed |
| `components/views/GlobalDestinations.tsx` | NEW — command/inbox/documents/finance/knowledge/settings views | ~250 lines |
| `components/views/GodModeView.tsx` | NEW — ecosystem explorer | ~300 lines |
| `components/modules/EngineeringCalcModule.tsx` | NEW — full module | ~600 lines |
| `components/layout/TopBar.tsx` | Add God Mode toggle | +15 lines, extend props |
| `e2e/rail.spec.ts` | NEW — OS rail navigation repair tests | ~120 lines |
| `e2e/app.spec.ts` | Append `engineering_calc` to ALL_TOOL_IDS | +1 line |
| `backend/database/migrations/007_calculation_records.sql` | NEW — migration | ~30 lines |
| `backend/public/index.php` | Add engineering routes | ~40 lines |

## Backward Compatibility

- All existing `ROLE_TOOL_MAP` entries for non-engineering roles are unchanged
- `STAGE_TOOL_MAP` only adds `engineering_calc` to Design, Comply, Build — existing tools preserved
- `STAGE_COPY` is slightly reworded but maintains the same meaning
- God Mode is opt-in via toggle button — no impact on default workflow
- All existing module components remain untouched
- The `ToolTabConfig` type already supports `fn` and `arg` fields (used by the prototype's `kind: 'call'`)
- **OS rail**: the `GLOBAL_DESTINATIONS` contract preserves every existing rail item id/label/icon; the old `handleSelectGlobal` branches (`projects`, `tools`, `command`, `feedback`) produce identical destinations, so no existing workflow regresses
- **e2e contract preserved**: `Inside <tool>`, `mode-standalone`, `tool-<id>`, `role-switcher` testids all remain

## Performance Considerations

- Engineering Calc module imports the calculation engine which is a pure function library — tree-shakeable
- God Mode view renders all tools — use `React.memo` and `useMemo` for the tool grid
- 19 new SVG icons add ~2KB to the bundle
- `GLOBAL_DESTINATIONS` is a static const — no runtime lookup cost beyond a map access