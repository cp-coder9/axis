# Phase 1 Navigation Contract And Global Destination Fidelity Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans task by task. Checkbox state is not exit evidence.

**Goal:** Make every mode, global destination, tool, tab, rail, God entry, and Back transition deterministic through one pure navigation contract, while closing the known partial `GlobalDestinations` content-fidelity gap.

**Architecture:** `lib/navigation.ts` owns one `NavigationState`, one extensible `NavigationEvent` union, canonical destination metadata, content metadata, tab resolution, and `transitionNavigation`. `app/page.tsx` owns one writable state. Every consumer dispatches events; no component coordinates local mode/global/tool/tab setters.

**Version basis:** `package.json` declares Next.js `^15.4.9`, React `^19.2.1`, Playwright `^1.62.1`, and exact TypeScript `5.9.3`; lockfile resolutions are installation authority. Phase 0 supplies the lock-resolved Vitest dependency and `test:unit` script. Node.js 20+ is the runtime prerequisite.

## Entry Gate And Constraints

- Signed Phase 0 deployed evidence `P0-E05` is mandatory. A merged Vitest harness is insufficient.
- Existing tool IDs, tab arguments, visible destination labels, `Inside <tool>`, `mode-standalone`, `tool-<id>`, and `role-switcher` contracts remain stable.
- Role visibility, Design/Comply/Build stage visibility, icon keys, calculator types, and tab arguments are parity constraints, not data to rewrite here.
- Unknown destination, tool, and tab values return the same state object.
- Browser URL routing, authorization, formulas, persistence, and visual redesign are out of scope.

## Verification Command Policy

All multi-command gates use PowerShell 5.1 fail-fast execution or a checked-in named npm script. Double-ampersand shell chaining is prohibited:

```powershell
$ErrorActionPreference = 'Stop'
function Invoke-Checked([scriptblock]$Command) {
  & $Command
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

## Stable Finding Coverage

| Finding / V8 requirement | Current state | Stable task IDs | Stable evidence ID |
|---|---|---|---|
| `V8-H07`: Project/Standalone switching strands destination/tool/tab state | Independent setters | `P1-T01` to `P1-T03`, `P1-T05` | `P1-E01`, `P1-E02`, `P1-E04` |
| `V8-H08`: keyless first tabs resolve inconsistently | Helper can return label while consumers use index/key differently | `P1-T01`, `P1-T02`, `P1-T05` | `P1-E01`, `P1-E04` |
| `V8-H05`: God stage must later route to project Datum | God destination is special-cased outside metadata | `P1-T01` to `P1-T04` | `P1-E03`; Phase 7 extends same contract for closure |
| V8 1A-1H destination, rail, grouped tabs, Back | Metadata and setters are duplicated | `P1-T01` to `P1-T05` | `P1-E01` to `P1-E04` |
| Medium: global destinations only partially faithful | Current sections and quick-link routing are not contract-tested | `P1-T04` | `P1-E03` |

Finding IDs appear in test names/metadata, phase evidence entries, and the exit review.

Program medium-finding mapping is also mandatory: `V8-M03` maps to the Global Destination Content Contract and fidelity tests; `V8-M05` maps to canonical metadata selectors/source scans; and `V8-M06` maps to rail `aria-current` and highlight assertions. Those IDs accompany the applicable `P1-*` work/evidence IDs.

## Exact Contract

```ts
export type GlobalDestinationId =
  | 'command' | 'projects' | 'tools' | 'inbox' | 'documents'
  | 'finance' | 'knowledge' | 'feedback' | 'settings' | 'god';

export interface NavigationSnapshot {
  mode: OrientationMode;
  globalId: GlobalDestinationId;
  toolId: string | null;
  tabKey: string | null;
  originGlobalId: GlobalDestinationId;
}

export interface GodModeSession {
  lens: RoleKey;
  presentationStage: StageKey | null;
  returnTo: NavigationSnapshot;
}

export interface NavigationState extends NavigationSnapshot {
  godSession: GodModeSession | null;
}

export interface NavigationEventMap {
  'select-global': { id: GlobalDestinationId };
  'set-mode': { mode: OrientationMode };
  'open-tool': { toolId: string; origin?: GlobalDestinationId; mode?: OrientationMode };
  'select-tab': { tabKey: string };
  'back': Record<string, never>;
  'enter-god': { initialLens: RoleKey };
  'open-god-home': Record<string, never>;
  'open-god-stage': { stage: StageKey };
  'set-god-lens': { lens: RoleKey };
  'exit-god': Record<string, never>;
}

export type NavigationEvent = {
  [K in keyof NavigationEventMap]: { type: K } & NavigationEventMap[K]
}[keyof NavigationEventMap];

export function transitionNavigation(
  state: NavigationState,
  event: NavigationEvent,
  tools?: Record<string, ToolDefinition>,
): NavigationState;
```

`INITIAL_NAVIGATION_STATE` is exactly `{ mode:'project', globalId:'projects', toolId:null, tabKey:null, originGlobalId:'projects', godSession:null }`.

### Destination Metadata

Every entry has `{ id, label, icon, tone, mode, view, defaultToolId, visibility }`. The exact God entry is:

```ts
god: {
  id: 'god',
  label: 'God Mode Explorer',
  icon: 'god_mode',
  tone: '#8B5CF6',
  mode: 'standalone',
  view: 'god',
  defaultToolId: null,
  visibility: 'god-mode-only',
}
```

The nine non-God entries use `visibility:'always'`. `OsRail` renders `god` only when `state.godSession !== null`. A normal `select-global god` while disabled returns state unchanged. `enter-god` captures the normalized current `NavigationSnapshot` in `godSession.returnTo`, stores `initialLens`, sets `presentationStage:null`, and selects standalone God home. `exit-god` restores `godSession.returnTo` with `godSession:null`. Phase 7 implements the complete God experience through these frozen fields/events; it may not create a second shell navigation state or `NavigationSnapshot` type.

### Transition Rules

- `select-global` uses metadata mode/view/default tool and clears stale tool/tab. `feedback` opens tool `feedback` on `firstTabKey`.
- `set-mode project` resolves project Datum. `set-mode standalone` resolves Workspace Tools. Both clear tool/tab atomically.
- `open-tool` validates ID, selects `firstTabKey(tool)`, records explicit origin, and uses destination mode unless an explicit valid mode is supplied.
- `firstTabKey(tool)` returns `tab.key ?? tab.label ?? String(index)` and rendering/select resolution uses that same helper. This closes keyless mismatch rather than retaining a separate index convention.
- `select-tab` accepts only a key produced by canonical resolution for the active tool.
- `back` returns the recorded origin metadata state and clears tool/tab.
- Every invalid event returns the original object by reference.

## Global Destination Content Contract

`GLOBAL_DESTINATION_CONTENT` in `lib/navigation.ts` is typed presentation data consumed by `GlobalDestinations.tsx`; components do not re-declare IDs, labels, icons, descriptions, mode, or origins. Phase 1 owns fidelity for:

| Destination | Required content and actions |
|---|---|
| Command | Heading/subheading; cards for Project Space, Practice, Workspace Tools, Feedback; Project/Tools dispatch `select-global`; Practice/Feedback dispatch explicit `open-tool` origins |
| Inbox | Meetings, Messages & Action Centre, Approvals Queue cards and Schedule a meeting; all origin `inbox`, standalone |
| Documents | Existing three document summaries and Open Documents & Drawings; origin `documents`, project |
| Finance | Payments & Escrow, Contract Admin, Fee Proposal Builder and legal/fund-holding warning; origin `finance`, project |
| Knowledge | Standards Library, CPD Credit Tracker, Learning Tracks and Open CPD & Learning; origin `knowledge`, declared destination mode |
| Settings | User Management, Organisation, Security & RBAC, API Access, Data Retention tabs; preserve role-aware user section and current explanatory copy |
| Feedback | Contract remains destination metadata with `view:'tool'`, `defaultToolId:'feedback'`; no duplicate global page |

Content work restores missing/incorrect source copy and links only. Seed counts (`3`, `7`, `128`, and similar) must be labeled demo/static unless backed by runtime data; the task must not invent live records or redesign these views.

## Downstream Consumer Contract

- **Phase 4:** its dirty-navigation guard receives a complete `NavigationEvent`, prompts if needed, then dispatches that same event after approval. It extends `NavigationEventMap` in `lib/navigation.ts` with `'engineering-attached': { projectId: string }`; the reducer preserves the active engineering tool/tab while atomically setting project mode, `globalId:'projects'`, and `originGlobalId:'projects'` after server success. It must not call `setMode`, maintain parallel shell state, or use a callback that mutates navigation fields directly.
- **Phase 7:** it consumes the frozen `godSession: GodModeSession | null` shape and God event variants above. `open-god-stage` updates only `godSession.presentationStage` while selecting project Datum presentation; it never mutates the durable project stage. God handoff helpers may own non-navigation data, but Phase 7 must not redeclare `NavigationSnapshot`, `GodModeSession`, or shell navigation state.
- Contract tests in Phases 4 and 7 import `NavigationState`, `NavigationEvent`, and `transitionNavigation` from `lib/navigation.ts` and prove their added events preserve Phase 1 invariants.

## Exact File Map

| Action | Path | Patch responsibility |
|---|---|---|
| Modify | `lib/navigation.ts` | Add exact state/event/destination/content types, initial state, reducer, invariant, rail/content selectors; retain tab grouping |
| Create | `lib/__tests__/navigation.test.ts` | Pure matrix for destinations, modes, 47 tools, keyed/keyless tabs, origins, God visibility, invalid identity |
| Modify | `app/page.tsx` | Replace five writable navigation values and handlers with one state and `dispatchNavigation(event)` |
| Modify | `components/layout/OsRail.tsx` | Render selector output, conditional God entry, `aria-current="page"`, typed dispatch |
| Modify | `components/layout/ContextNavigator.tsx` | Replace `onSetMode`, tab setters, and three Back callbacks with `onNavigate(event)` |
| Modify | `components/views/GlobalDestinations.tsx` | Render typed content and dispatch exact origin events; remediate fidelity table |
| Modify | `components/views/GodModeView.tsx` | Dispatch only Phase 1 God/global/tool events pending Phase 7 extension |
| Modify | `components/layout/TopBar.tsx` | Dispatch `enter-god`/`exit-god` |
| Modify | `e2e/rail.spec.ts` | Transition, selected-state, Back, keyless, God visibility, and fidelity assertions |

## Detailed Tasks

### P1-T01: Add Types, Metadata, And Invariants

**Owner:** Frontend platform engineer  
**Estimate:** 1.25 person-days  
**Findings:** `V8-H07`, `V8-H08`, support for `V8-H05`

- [ ] After signed Phase 0 exit `P0-E05`, add tests `V8-H07 initial navigation state is canonical`, `V8-H08 keyed and keyless first tabs share one key`, and `V8-H05 God metadata and visibility are exact`.
- [ ] Run the navigation unit file. Expected behavior-specific RED: state/event types, God metadata, and canonical keyless resolver are absent.
- [ ] Patch `GlobalDestination` to use exact ID/view/visibility unions, add the exact contracts above, and make `assertNavigationState(state, tools)` reject tab-without-tool, unknown tool, invalid tab, destination/tool mismatch, and disabled God destination.
- [ ] Run unit file and typecheck separately; both must pass. Record the contract portion of `P1-E01`.

### P1-T02: Implement The Pure Transition Matrix

**Owner:** Frontend platform engineer  
**Estimate:** 1.50 person-days  
**Findings:** `V8-H07`, `V8-H08`

- [ ] Add table tests for all ten destinations, both modes from clean/tool states, all 47 tools, every configured tab including keyless examples, Back from six origins, God enter/exit, invalid IDs, and object-identity preservation on invalid events.
- [ ] Run unit file. Expected RED: `transitionNavigation` is absent or current behavior mismatches named rows.
- [ ] Implement one exhaustive switch with the exact rules above. Signature and return type must match the contract; no React imports or side effects.
- [ ] Re-run unit tests. Expected: matrix passes without snapshots. Record `P1-E01` linked to both findings.

### P1-T03: Move Shell And Children To One State

**Owner:** React engineer  
**Estimate:** 1.25 person-days  
**Finding:** `V8-H07`

- [ ] Add E2E `V8-H07 mode changes cannot leave a stranded tool` and a static/type test that shell children accept `onNavigate(event: NavigationEvent)` rather than writable mode/tab callbacks.
- [ ] Run focused E2E after its server is started by Playwright `webServer` readiness. Expected RED: direct `setMode` retains a tool.
- [ ] In `app/page.tsx`, replace `mode`, `activeGlobal`, `activeToolId`, `activeToolTabKey`, and `godMode` writable states with `useState<NavigationState>(INITIAL_NAVIGATION_STATE)`. Implement `dispatchNavigation = (event) => setNavigation(state => transitionNavigation(state,event,ALL_TOOLS))` and derive compatibility read values only.
- [ ] Replace all mode, global, tool, tab, Back, and God callbacks in shell children with typed events. No parallel writable navigation state remains.
- [ ] Run typecheck and focused E2E separately. Record `P1-E02` linked to `V8-H07`.

### P1-T04: Derive Rail And Restore Global Destination Fidelity

**Owner:** React/product engineer with product-owner copy review  
**Estimate:** 1.50 person-days  
**Findings:** support for `V8-H05`; medium fidelity gap

- [ ] Add tests for exact God metadata/conditional visibility; canonical rail labels/icons/tones; `aria-current`; each content row above; demo/static labels; and every quick-link event including exact origin/mode.
- [ ] Run focused tests. Expected RED: rail metadata and content/actions are local duplicated arrays, God is appended ad hoc, Documents/Knowledge links omit origin, and fidelity assertions are absent or fail.
- [ ] Add `visibleGlobalDestinations(state,totalToolsCount)` and typed `GLOBAL_DESTINATION_CONTENT`. Keep dynamic badge values separate from canonical identity metadata. Render `GlobalDestinations` from content without introducing a second routing map.
- [ ] Ensure God is absent when disabled, present exactly once when enabled, and selected with `aria-current="page"` only at `globalId:'god'`.
- [ ] Run focused E2E and content unit/component assertions. Product owner records source-copy/link approval. Store as `P1-E03`.

### P1-T05: Complete Parity And Downstream Handoff

**Owner:** QA automation engineer and frontend lead  
**Estimate:** 1.50 person-days  
**Findings:** `V8-H07`, `V8-H08`, support for `V8-H05`

- [ ] Iterate all `ALL_TOOLS`: open selects canonical first tab, every tab selects, Back restores each tested origin. Assert no role/stage/icon/calculator-type/tab-argument data changed.
- [ ] Add critical journeys: project to Practice to Back; tools to Engineering to Back; inbox to Meetings to Back; documents to Documents tool to Back; command to Feedback to Back; God enter/rail/exit; rail interruption after non-first tab; representative keyless tool.
- [ ] Add compile-time fixtures showing Phase 4 guard accepts a `NavigationEvent` and Phase 7 event-map extension remains reducible without a second `NavigationState`.
- [ ] Run unit matrix, typecheck, complete rail E2E, 47-module compatibility, and role suite as separate fail-fast steps. Record `P1-E04`.
- [ ] Publish the exact extension rules in the phase handoff. Phase 4 and 7 plans cannot exit if they introduce local shell navigation setters or duplicate snapshot types.

## Estimate

| Workstream | Person-days |
|---|---:|
| Types, metadata, invariants | 1.25 |
| Pure reducer matrix | 1.50 |
| Shell migration | 1.25 |
| Rail and global content fidelity | 1.50 |
| Parity, regressions, handoff | 1.50 |
| **Total** | **7.00** |

## Test And Exit Evidence

| Evidence ID / findings | Procedure | Required result |
|---|---|---|
| `P1-E01` / `V8-H07,V8-H08` | navigation unit matrix | Ten destinations, 47 tools, all tabs/modes/origins, invalid identity, exact God metadata pass |
| `P1-E02` / `V8-H07` | typecheck and focused shell E2E | One writable state; no stranded state or direct child setter |
| `P1-E03` / `V8-H05` support | rail/content tests and product copy review | Conditional God item; exact selected state; all destination content/actions/origins faithful |
| `P1-E04` / `V8-H07,V8-H08,V8-H05` support | full rail, app, role, and parity suites | Keyed/keyless and Back journeys pass; role/stage/icon/type/tab parity unchanged; downstream extension fixtures pass |

## Risks And Rollback

| Risk | Control |
|---|---|
| Shell refactor changes behavior | Pure matrix before integration; one atomic state migration |
| Content remediation becomes redesign | Fixed fidelity table and product-owner source comparison |
| God state forks navigation | Exact conditional metadata and Phase 7 extension rule |
| Phase 4 guard bypasses reducer | Guard receives and eventually dispatches the same typed event |
| Registry parity drifts | Exact role/stage/icon/type/tab equality regression |

Rollback shell consumers and `app/page.tsx` together; never retain dual writable navigation state. Pure contract/tests may remain if integration is reverted. No data migration is involved.

## Phase Exit Gate

Phase 1 exits only when `P1-E01` through `P1-E04` link applicable rows to `V8-H07`, `V8-H08`, and Phase 1 support for `V8-H05`; one writable `NavigationState` remains; every mutation is a `NavigationEvent`; God metadata and visibility match the exact contract; all global content/actions pass fidelity review; all 47 first-tab and named Back paths pass; role/stage/icon/calculator-type/tab-argument parity is unchanged; and Phase 4/7 handoffs explicitly consume or extend this same contract. `V8-H05` remains open for Phase 7 behavioral closure.
