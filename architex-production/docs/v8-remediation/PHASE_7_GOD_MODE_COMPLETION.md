# Phase 7 God Mode Completion and Ecosystem Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete God Mode as an accessible ecosystem-learning experience that opens stage-specific Datum exploration, explains cross-workspace handoffs, preserves normal authorization, and enters and exits every navigation context deterministically.

**Architecture:** God Mode is a navigation and presentation session layered over the normal authenticated application. It extends Phase 1's `NavigationState`, `NavigationEvent`, and `transitionNavigation` reducer rather than creating a second navigation snapshot or transition API. God-only code owns exploration presentation, stage tool resolution, role-lens semantics, and handoff definitions; React surfaces dispatch Phase 1 navigation events, while API identity, project access, permissions, project lifecycle state, and professional rules remain unchanged. Lifecycle selection sets a session-local `presentationStage` and navigates to project Datum without mutating or PATCHing the durable project's `stage`.

**Version basis:** `package.json` declares Next.js `^15.4.9`, React/React DOM `^19.2.1`, Playwright `^1.62.1`, exact TypeScript `5.9.3`, and Tailwind CSS `4.1.11`; `package-lock.json` is installation authority. The phase consumes the Phase 1 navigation contract, Phase 3 API/RBAC contract, Phase 5-6 design system, shared Vitest runner, and Phase 5's locked `@axe-core/playwright` dependency.

## Global Constraints

- This phase is estimated at **8-12 person-days**.
- God Mode is opt-in and is never an authentication, tenancy, project-access, RBAC, professional-sign-off, or protected-data bypass.
- The authenticated role and the God Mode learning lens are separate values; changing the lens must not alter API identity or effective permissions.
- A God Mode exploration stage is local presentation state only. It never mutates `activeProject.stage`, emits a project-stage domain command, or sends `PATCH /projects/{id}`.
- Stage exploration exposes every ID in the selected stage's `STAGE_TOOL_MAP` and no tools outside that stage unless the user explicitly opens the all-workspace registry.
- Existing project records are read through normal APIs; production exploration uses authorized projections, while unrestricted examples use safe demo fixtures only.
- The evolved V8 semantic tokens and shared primitives from Phases 5 and 6 are mandatory; no new hard-coded theme palette is introduced.
- Desktop, tablet, and mobile behavior, keyboard operation, visible focus, reduced motion, minimum contrast, and selected-state semantics are release requirements.
- No protected API route, permission map, tenancy check, calculation approval rule, or professional responsibility rule may be weakened in this phase.
- No feature may be marked complete from source inspection alone; the evidence commands and outcomes in this document are required.
- Program finding mapping is mandatory: `V8-H05` maps to lifecycle/navigation Tasks 1-2 and 5; `V8-H06` to complete stage visibility and authorization Tasks 2-3; and `V8-M04` to handoff, responsive, selected-state, and accessibility Tasks 4-7. Tests and evidence include both local and program IDs.

---

## Executive Summary

The current implementation reproduces the God Mode landing page, role grid, grouped tool registry, rail item, top-bar toggle, inspector warning, and navigator shortcuts. It does not complete the behavior promised by the V8 prototype and approved remediation design. Selecting a lifecycle stage currently changes only `activeProject.stage`; it does not navigate to project Datum. The Datum still role-filters and truncates stage tools, the role selector changes the application's effective demo identity instead of a learning-only lens, no explicit handoff explorer exists, exit behavior depends on the current destination, and only two desktop smoke tests exist.

This phase introduces a small, pure God Mode domain contract and uses it throughout the shell. It completes lifecycle-to-Datum routing, all stage-relevant tool presentation, structured handoff explanation, role-lens emphasis, authorization separation, deterministic restoration, responsive layouts, keyboard and screen-reader semantics, reduced motion, and full state-transition and end-to-end coverage.

## Phase Objectives

1. Make every one of the eight lifecycle stage controls open project Datum at the selected stage.
2. Show every stage-relevant workspace in God Mode Datum without changing access to protected records or actions.
3. Add a handoff explorer that identifies source role/workspace, governed artifact, destination role/workspace, and decision boundary.
4. Separate the learning lens from the authenticated role and use it only for copy, emphasis, ordering, and handoff explanation.
5. Define one deterministic state transition for enter, home, stage, tool, global destination, and exit behavior.
6. Complete mobile, tablet, zoom, keyboard, screen-reader, focus, contrast, and reduced-motion behavior.
7. Prove the experience with pure contract checks, Playwright transition tests, negative RBAC tests, axe scans, and responsive assertions.

## V8 Requirement Coverage

| Source requirement | Current implementation state | Planned task | Required acceptance evidence |
|---|---|---|---|
| Original V8 `renderGodHome()` lifecycle explorer and `godOpenStage()` | Eight buttons render, but `GodModeView.onSelectStage` calls `handleSelectStage`, which only changes project state and leaves `activeGlobal='god'` | Tasks 1 and 2 | Eight data-driven Playwright cases land on `datum-canvas`, project mode, selected stage, and the complete stage tool set |
| Original V8 `v8RoleIds()` and `toolGroups()` reveal stage-relevant workspaces in God Mode | Current `DatumCanvas` intersects stage and role maps, adds fallbacks, and slices to eight | Task 2 | For each stage, displayed tool IDs equal `STAGE_TOOL_MAP[stage]` exactly and have no duplicates |
| Approved design: God Mode is not an authorization bypass | Current UI copy says this, but there is no negative authorization test and role selection changes `currentRole` | Task 3 | Lens changes leave `role-switcher`, API identity headers/JWT claims, 403 responses, and disabled protected controls unchanged |
| Approved design: role lenses affect explanation and emphasis, not permissions | Current role buttons call `onSetRole`, changing the application role | Task 3 | Lens has `aria-pressed`; copy/order changes; effective permissions and authenticated role remain stable |
| V8 copy promises understanding of inputs, outputs, and handoffs | Registry opens tools, but there is no handoff model or explorer | Task 4 | Every stage has at least one validated handoff; explorer exposes source, artifact, destination, owner, and gate |
| Original V8 toggle and global God destination | Toggle and conditional rail item exist; exit behavior varies after leaving the God home | Tasks 1 and 5 | Transition matrix proves exact state after enter, every internal route, exit, re-entry, browser reload, and invalid stale target |
| Approved theme direction: responsive and accessible behavior | Current fixed shell widths and desktop-only Chromium tests do not prove mobile or accessibility | Task 6 | 390x844, 768x1024, and 1440x900 suites pass; axe has zero serious/critical violations; keyboard path and reduced motion pass |
| Original V8 God banner and governed inspector warning | Present visually, but semantics and persistence across God contexts are not tested | Tasks 5 and 6 | Status is announced once, toggle uses `aria-pressed`, warning persists across God home, Datum, registry, and tool routes |
| Original V8 God navigator shortcuts | Present, but tool/global/exit state is not exhaustively tested | Tasks 5 and 7 | All navigator shortcuts open the specified destination and return without stale tool/tab/global state |

## Current-State Evidence

Finding IDs are stable and must be used in tests, evidence manifests, review comments, and the Phase 8 blocker register.

| Finding ID | Evidence | Exact finding | Consequence |
|---|---|---|---|
| P7-F01 | `docs/superpowers/specs/2026-08-23-v8-remediation-redesign-program-design.md:101-103` | Defines God Mode as exploration, not authorization, and role lenses as explanation/emphasis only | This is the controlling behavior contract |
| P7-F02 | Original V8 HTML `architex_datum_os_integrated_modules_v8_engineering_godmode.html:1323-1325` | `godOpenStage` combines presentation stage selection with navigation | The remediation must preserve navigation intent without copying durable-stage mutation |
| P7-F03 | Original V8 HTML `:1313`, `:1317-1319`, `:1335` | God Mode uses stage tools and presents full-system/project exploration | Datum needs an explicit exploration tool-resolution branch |
| P7-F04 / V8-H05 | `components/views/GodModeView.tsx:87-98` | Stage controls invoke only `onSelectStage(stage)` | No navigation intent is expressed by the component contract |
| P7-F05 / V8-H05 | `app/page.tsx:149-154` | `handleSelectStage` mutates `activeProject.stage` but does not navigate | The click both changes durable local project data incorrectly and leaves God home visible |
| P7-F06 / V8-H06 | `components/views/DatumCanvas.tsx:28-37` | Tools are role-intersected, fallback-filled, and sliced to eight | God stage exploration cannot show all stage-relevant tools |
| P7-F07 | `components/views/GodModeView.tsx:109-127` and `app/page.tsx:257` | Role grid invokes `setCurrentRole` | Learning lens currently changes the role used by `demoIdentity(currentRole)` in API workflows |
| P7-F08 | `app/page.tsx:121-137` | Exit resets only when `activeGlobal === 'god'`; otherwise it can leave the current God-opened tool/global state in place | Exit is not represented by the Phase 1 transition contract |
| P7-F09 | `components/views/GodModeView.tsx:131-163` | Registry has tool groups but no explicit handoff UI/data | The stated ecosystem handoff promise is not implemented |
| P7-F10 | `e2e/rail.spec.ts:301-317` | Only landing visibility and conditional rail item are tested | Lifecycle, tools, lens/RBAC, exit, responsive, and accessibility remain unverified |
| P7-F11 | `playwright.config.ts:15-20` | Only Desktop Chrome is configured | Tablet, mobile, Firefox/WebKit semantics, and touch layouts are not covered |
| P7-F12 | `components/layout/TopBar.tsx:90-104` | Toggle has only a `title`; no `aria-pressed` or stable test ID | Assistive technology cannot determine toggle state reliably |

## Scope

- Pure God Mode state and transition contracts.
- Stage-to-Datum exploration routing for all eight stages.
- Full stage tool resolution in God Mode Datum.
- Learning-only role lens state, descriptions, emphasis, and selected semantics.
- Stage handoff definitions and the responsive handoff explorer.
- God home, project Datum, all-tools registry, selected tools, rail, navigator, top bar, and inspector integration.
- Deterministic enter/exit and stale-state normalization.
- Safe-demo/authorized-projection labeling and protected-action behavior.
- Responsive and accessible behavior for the God Mode path.
- Contract, functional, RBAC-negative, accessibility, and responsive tests.

## Explicit Non-Scope

- Granting new roles, permissions, project memberships, tenant access, or professional authority.
- Changing Phase 3 repository/API authorization rules or calculation lifecycle rules.
- Creating synthetic copies of protected production records.
- Redesigning normal non-God workflows or migrating modules to the design system; those belong to Phases 5 and 6.
- Professional validation of engineering formulas; that belongs to Phase 2.
- Release-wide visual baselines, performance budgets, documentation reconciliation, and production go/no-go; those belong to Phase 8.
- Dark theme implementation.
- Persisting the selected learning lens to a user profile or server record.

## Prerequisites and Dependencies

| Dependency | Required state before work starts | Verification command | Blocking outcome |
|---|---|---|---|
| Phase 1 navigation contract | Global, mode, tool, and tab transitions have one canonical contract | `$ErrorActionPreference='Stop'; npm run typecheck; if (-not $?) { exit 1 }; npx playwright test e2e/rail.spec.ts --project=chromium --workers=1; if (-not $?) { exit 1 }` | Any type error or navigation failure blocks Task 1 |
| Phase 3 authorization | Phase 3 owns and has already added `test:api`; protected APIs enforce identity, organization, project scope, and permission checks | `npm run test:api` | Phase 7 consumes this script unchanged; a missing script or any RBAC/tenancy failure blocks Task 3 |
| Phases 5 and 6 design system | Semantic tokens, focus treatment, shell breakpoints, and module primitives are available | `$ErrorActionPreference='Stop'; npm run lint; if (-not $?) { exit 1 }; npm run build; if (-not $?) { exit 1 }` | Hard-coded fallback styling must not be introduced to bypass incomplete prerequisites |
| Registry parity | Canonical frontend/backend registries contain the same 47 IDs | `npm run test` | Count other than 47 or ID/order mismatch blocks Task 2 |
| Test browser installation | Chromium, Firefox, and WebKit are installed | `npx playwright install --dry-run` | Missing browser is installed before Task 6 |

## Architecture and Data Flow

### State Model

Phase 1 remains the only navigation owner. Phase 7 extends its types in `lib/navigation.ts` and keeps God-specific presentation data in `lib/god-mode.ts`:

```ts
export interface GodModeSession {
  lens: RoleKey;
  presentationStage: StageKey | null;
  returnTo: NavigationSnapshot;
}

export interface NavigationState {
  // ...retain Phase 1 mode/global/tool/tab/origin fields...
  // Replace its standalone godMode boolean; active iff non-null.
  godSession: GodModeSession | null;
}

// Replace Phase 1's coarse toggle-god variant with these variants;
// retain every existing non-God Phase 1 variant in this same union.
export type NavigationEvent =
  // ...existing non-God Phase 1 variants...
  | { type: 'enter-god'; initialLens: RoleKey }
  | { type: 'open-god-home' }
  | { type: 'open-god-stage'; stage: StageKey }
  | { type: 'set-god-lens'; lens: RoleKey }
  | { type: 'exit-god' };

export interface GodHandoff {
  id: string;
  stage: StageKey;
  fromToolId: string;
  fromRole: RoleKey;
  artifact: string;
  toToolId: string;
  toRole: RoleKey;
  decisionGate: string;
}
```

Phase 7 consumes Phase 1's frozen nullable `NavigationState.godSession` and explicit God variants in the same `NavigationEvent` union. All non-God variants and the single `transitionNavigation` entry point remain. God surfaces receive `dispatchNavigation(event: NavigationEvent)` and never call competing snapshot/transition helpers. `lib/god-mode.ts` exports only presentation/domain selectors. Entry captures a normalized non-God Phase 1 `NavigationSnapshot`; nested God sessions are therefore unrepresentable. Exit restores that snapshot through `transitionNavigation` with `godSession:null`.

### Identity Boundary

`currentRole` remains the authenticated/demo-session role used by API identity and protected UI controls. `godModeSession.lens` is passed only to God Mode view-model functions. The lens may change explanatory copy, handoff emphasis, and ordering; it must never be passed to `demoIdentity`, authorization headers, repository calls, or permission predicates.

### Lifecycle Flow

```text
God home stage button
  -> dispatchNavigation({ type: 'open-god-stage', stage })
  -> godSession.presentationStage = stage (local presentation only)
  -> NavigationState: globalId = projects; mode = project; toolId = null; tabKey = null
  -> DatumCanvas(godMode=true, explorationStage=godSession.presentationStage)
  -> stageExplorationToolIds(stage) returns STAGE_TOOL_MAP[stage] exactly
  -> workspace opens with authenticated role and normal API/RBAC enforcement
  -> activeProject.stage is unchanged and no project PATCH request is emitted
```

### Handoff Flow

`GOD_MODE_HANDOFFS` is validated against `STAGES`, `ROLE_PROFILES`, `ALL_TOOLS`, and `STAGE_TOOL_MAP`. The explorer filters by selected stage, then places handoffs involving the selected lens first without hiding other handoffs. Selecting a handoff opens an explanatory detail panel; opening either workspace follows normal navigation and authorization.

### Exit Flow

Entering God Mode captures one normalized pre-entry `NavigationState`. Internal exploration never overwrites it. Exiting always restores that state through Phase 1's reducer, or the canonical project Datum state if the target no longer exists. The exploration stage is discarded on exit; the durable active project's stage remains exactly what it was before and during God Mode. No God-only lens, banner, rail item, inspector warning, or all-tools presentation remains after exit.

## Exact File Map

| Action | Exact path | Responsibility |
|---|---|---|
| Modify | `lib/navigation.ts` | Extend Phase 1 `NavigationState`/`NavigationEvent` and reducer with God session entry/home/stage/lens/exit events; no second reducer |
| Create | `lib/god-mode.ts` | God session/domain types, complete handoff registry, stage tool resolver, feature availability selector, and validators; no navigation snapshot/functions |
| Modify | `lib/types.ts` | Export `GodModeSession` and `GodHandoff` only if the established central-type convention requires it |
| Modify | `app/page.tsx` | Dispatch Phase 1 events, keep exploration stage out of `activeProject`, and keep authenticated role independent from lens |
| Modify | `components/views/GodModeView.tsx` | Render lens controls, lifecycle actions, handoff entry points, status semantics, and responsive God home |
| Create | `components/views/GodModeHandoffExplorer.tsx` | Render stage handoff list/detail and workspace links without permission logic |
| Modify | `components/views/DatumCanvas.tsx` | Resolve all stage tools in exploration presentation; render God banner/lens/handoff entry without changing action authorization |
| Modify | `components/layout/TopBar.tsx` | Accessible God toggle state, compact mobile behavior, and authenticated-role versus lens copy |
| Modify | `components/layout/OsRail.tsx` | Responsive God destination and selected semantics |
| Modify | `components/layout/ContextNavigator.tsx` | God navigation actions wired to canonical transitions and mobile drawer behavior |
| Modify | `components/layout/ContextInspector.tsx` | Explain authenticated role, learning lens, authorized projection, and protected-action boundary |
| Modify | `app/globals.css` | God-specific responsive layout hooks, focus-visible, reduced-motion, and overflow rules using Phase 5 tokens |
| Create | `e2e/god-mode.spec.ts` | Full lifecycle, stage tools, handoffs, lens semantics, RBAC negative cases, exit matrix, keyboard, responsive tests |
| Create | `e2e/god-mode.a11y.spec.ts` | Axe scans and semantic/focus/reduced-motion assertions |
| Modify | `playwright.config.ts` | Add desktop Chromium, tablet Chromium, mobile Chromium, Firefox, and WebKit projects required by this phase |
| Modify | `package.json` | Add focused `test:god-mode`/`test:god-mode:a11y` scripts; consume Phase 5's existing axe dependency |
| No change | `package-lock.json` | Preserve the Phase 5 dependency lock; Phase 7 adds no duplicate accessibility dependency |
| Modify | `.env.example` | Document deny-by-default `NEXT_PUBLIC_GOD_MODE_ENABLED=false` release flag |
| Modify | `lib/__tests__/navigation.test.ts` | Add pure Vitest coverage for God events, immutable return state, local stage, and exit normalization |
| Create | `lib/__tests__/god-mode.test.ts` | Validate stage tools, handoffs, role lenses, and feature-flag parsing as pure state/domain behavior |

## Detailed Task Checklist

### Task 1: Define the God Mode Session and Transition Contract

**Responsible role:** Senior frontend/platform engineer  
**Dependencies:** Phase 1 navigation contract  
**Files:** `lib/navigation.ts`, `lib/god-mode.ts`, `lib/types.ts`, `lib/__tests__/navigation.test.ts`, `app/page.tsx`, `e2e/god-mode.spec.ts`

**Interfaces:** Extends Phase 1 `NavigationState`, `NavigationEvent`, and `transitionNavigation`; consumes `RoleKey`, `StageKey`, `GLOBAL_DESTINATIONS`, `ALL_TOOLS`, and `firstTabKey`. Produces no competing navigation state or transition function.

- [ ] Add table-driven Vitest cases named `enter-god captures the complete Phase 1 state`, `open-god-home selects standalone god`, `open-god-stage selects project Datum without changing durable stage`, `set-god-lens changes presentation only`, `exit-god restores returnTo`, and `exit-god normalizes an invalid return target` before changing application state.
- [ ] **RED pure contract:** Run `npm run test:unit -- lib/__tests__/navigation.test.ts -t "God Mode navigation events"`. Expected: FAIL with `enter-god is not handled` and state mismatches for `open-god-stage`/`exit-god`; a generic missing-file or no-tests failure is not valid RED evidence.
- [ ] Extend the Phase 1 event union and reducer in `lib/navigation.ts`; replace the boolean-only state and nested setter side effects in `app/page.tsx` with `dispatchNavigation`. Do not define `NavigationSnapshot`, `enterGodMode`, `godStageState`, or `exitGodMode` in `lib/god-mode.ts`.
- [ ] Ensure captured `returnTo: NavigationSnapshot` is immutable for the session and normalize missing tools/tabs through Phase 1's existing `ALL_TOOLS`, `GLOBAL_DESTINATIONS`, and `firstTabKey` rules.
- [ ] **GREEN pure contract:** Run `npm run test:unit -- lib/__tests__/navigation.test.ts -t "God Mode navigation events"`. Expected: all six named state behaviors pass with exact mode/global/tool/tab/origin/God-session assertions.
- [ ] **GREEN integration:** Run `npx playwright test e2e/god-mode.spec.ts --project=chromium -g "entry|home state|stage state|exit restores|invalid exit" --workers=1`. Expected: `5 passed` and no stale navigation state.
- [ ] Run `npm run typecheck`. Expected: exit code 0 and no TypeScript diagnostics.

### Task 2: Route Every Lifecycle Stage to Full Datum Exploration

**Responsible role:** Frontend engineer  
**Dependencies:** Task 1; canonical `STAGE_TOOL_MAP` parity  
**Files:** `lib/god-mode.ts`, `lib/__tests__/god-mode.test.ts`, `app/page.tsx`, `components/views/GodModeView.tsx`, `components/views/DatumCanvas.tsx`, `e2e/god-mode.spec.ts`

**Interfaces:** `onOpenStage(stage: StageKey)` dispatches `{ type: 'open-god-stage', stage }`; `stageExplorationToolIds(stage)` returns a deduplicated copy of `STAGE_TOOL_MAP[stage]` with every ID resolved in `ALL_TOOLS`.

- [ ] Add one parameterized test for each of `Brief`, `Appoint`, `Design`, `Comply`, `Procure`, `Build`, `Pay`, and `Close-out`; assert `datum-canvas` is visible, project mode is selected, the displayed exploration stage is current, rendered `data-tool-id` values equal the exact stage map, `activeProject.stage` is unchanged, and no `PATCH /api/v1/projects/*` request occurs.
- [ ] Add a pure Vitest matrix asserting `stageExplorationToolIds(stage)` equals `STAGE_TOOL_MAP[stage]` exactly for all eight stages and returns a fresh deduplicated array without mutating the canonical map.
- [ ] **RED pure domain:** Run `npm run test:unit -- lib/__tests__/god-mode.test.ts -t "resolves exact exploration tools"`. Expected: FAIL with per-stage expected/actual ID differences because the God resolver does not exist; no-tests is not valid RED evidence.
- [ ] **RED:** Run `npx playwright test e2e/god-mode.spec.ts --project=chromium -g "stage opens complete datum exploration" --workers=1`. Expected: 8 failures; current behavior leaves God home visible and current Datum logic omits/truncates stage tools.
- [ ] Change the God lifecycle callback from durable stage mutation to a Phase 1 `open-god-stage` event; pass `godMode`, `godLens`, `explorationStage`, and handoff navigation into `DatumCanvas`. Never call `setActiveProject`, project update clients, or project PATCH from exploration.
- [ ] In normal Datum preserve role prioritization; in God Datum render exactly the stage map, without the normal eight-card slice. Use a responsive list/grid when all cards cannot fit the spatial plane.
- [ ] Label every exploration card with `data-tool-id`, workspace status, authorized/demo projection state, and its normal open action.
- [ ] **GREEN:** Run `npx playwright test e2e/god-mode.spec.ts --project=chromium -g "stage opens complete datum exploration" --workers=1`. Expected: `8 passed`; expected card counts are Brief 8, Appoint 9, Design 10, Comply 10, Procure 8, Build 11, Pay 7, and Close-out 9; request capture reports zero project PATCHes.
- [ ] **GREEN pure domain:** Run `npm run test:unit -- lib/__tests__/god-mode.test.ts -t "resolves exact exploration tools"`. Expected: all eight exact-ID cases pass and canonical maps remain unchanged.

### Task 3: Separate Role Lens Semantics from Authorization

**Responsible role:** Security-aware frontend engineer with backend reviewer  
**Dependencies:** Task 1; Phase 3 RBAC integration suite  
**Files:** `lib/god-mode.ts`, `app/page.tsx`, `components/views/GodModeView.tsx`, `components/views/DatumCanvas.tsx`, `components/layout/ContextInspector.tsx`, `e2e/god-mode.spec.ts`

**Interfaces:** `currentRole` is effective identity; `godModeSession.lens` is presentation only; lens controls dispatch `{ type: 'set-god-lens', lens }` and cannot call `setCurrentRole` or mutate auth/session storage.

- [ ] Add tests that enter as `client`, select the `platform_admin` lens, and assert the role switcher remains `client`, outgoing `X-Architex-Role` remains `client` in local mode, and a protected approval/calculation action remains disabled or returns 403.
- [ ] Add the inverse case: enter as `platform_admin`, select `client` lens, and prove permissions remain those of the authenticated platform administrator.
- [ ] Add a Vitest reducer case proving `set-god-lens` changes only `godModeSession.lens`; every other `NavigationState` field and `returnTo` remain referentially/equivalently unchanged.
- [ ] **RED:** Run `npx playwright test e2e/god-mode.spec.ts --project=chromium -g "lens never changes authorization" --workers=1`. Expected: FAIL because current role-grid actions call `setCurrentRole`.
- [ ] Replace `onSetRole` with `onSetLens`; render `Authenticated as ${ROLE_PROFILES[currentRole].label}` and `Viewing through ${ROLE_PROFILES[godModeSession.lens].label} lens` where the distinction matters.
- [ ] Keep `ROLE_TOOL_MAP`, API identity creation, backend permissions, project access, tenancy, review, and approval logic unchanged.
- [ ] **GREEN:** Run `npx playwright test e2e/god-mode.spec.ts --project=chromium -g "lens never changes authorization" --workers=1`. Expected: `2 passed`, captured requests retain the authenticated role, and forbidden protected operations remain forbidden.
- [ ] Run `npm run test:unit -- lib/__tests__/navigation.test.ts -t "set-god-lens changes presentation only"`. Expected: the pure state-isolation case passes.
- [ ] Run Phase 3's existing `npm run test:api` script unchanged. Expected: all Phase 3 RBAC, tenancy, lifecycle, and cross-project denial tests pass; Phase 7 must not replace or broaden that script.

### Task 4: Implement the Lifecycle Handoff Explorer

**Responsible role:** Product engineer with built-environment workflow reviewer  
**Dependencies:** Tasks 2 and 3  
**Files:** `lib/god-mode.ts`, `components/views/GodModeHandoffExplorer.tsx`, `components/views/GodModeView.tsx`, `components/views/DatumCanvas.tsx`, `e2e/god-mode.spec.ts`

**Interfaces:** `GOD_MODE_HANDOFFS` and `handoffsForStage(stage, lens)` produce validated `GodHandoff[]`; the component receives `stage`, `lens`, `onOpenTool`, and `onClose`.

- [ ] Define at least these governed handoff chains: Brief `project_explorer -> project_passport`; Appoint `professional_directory -> team_workspace`; Design `engineering_calc -> documents_drawings`; Comply `xa -> municipal`; Procure `bom -> rfq_marketplace`; Build `itp -> ncr_manager`; Pay `contract_admin -> payments_escrow`; Close-out `snag_manager -> documents_drawings`.
- [ ] For every chain specify source role, artifact, destination role, decision gate, and whether the destination is an authorized live record or safe demonstration projection.
- [ ] Add Vitest validation cases that every handoff ID is unique, references known stages/roles/tools, and uses tools included in that stage map.
- [ ] **RED pure domain:** Run `npm run test:unit -- lib/__tests__/god-mode.test.ts -t "validates every governed handoff"`. Expected: FAIL with missing handoff IDs/references before `GOD_MODE_HANDOFFS` exists; no-tests is not valid RED evidence.
- [ ] **RED:** Run `npx playwright test e2e/god-mode.spec.ts --project=chromium -g "handoff explorer" --workers=1`. Expected: FAIL because no handoff control or detail exists.
- [ ] Render an `Explore handoffs` action on God home and God Datum; order lens-related handoffs first but retain all stage handoffs; use a dialog/sheet with focus trap, close button, Escape support, and source/destination workspace links.
- [ ] **GREEN pure domain:** Run `npm run test:unit -- lib/__tests__/god-mode.test.ts -t "validates every governed handoff"`. Expected: every ID/reference/stage-map invariant passes.
- [ ] **GREEN:** Run `npx playwright test e2e/god-mode.spec.ts --project=chromium -g "handoff explorer" --workers=1`. Expected: all eight stages show their named chain, detail semantics are complete, both workspace links resolve, and Escape restores focus to the opener.

### Task 5: Complete Deterministic Internal Navigation and Exit

**Responsible role:** Senior frontend engineer  
**Dependencies:** Tasks 1-4  
**Files:** `app/page.tsx`, `components/layout/TopBar.tsx`, `components/layout/OsRail.tsx`, `components/layout/ContextNavigator.tsx`, `components/layout/ContextInspector.tsx`, `e2e/god-mode.spec.ts`

**Interfaces:** Every God navigation action applies a contract transition; no shell component independently changes only one of mode/global/tool/tab/session.

- [ ] Add a transition matrix covering entry from project Datum, standalone registry, inbox, a project tool/tab, and a standalone tool/tab; then cover God home, stage Datum, all tools, Engineering Hub, Meetings, Practice, Wingman, and exit.
- [ ] Add the same state rows to Phase 1's Vitest matrix and reserve Playwright for rendered destinations, focus, and browser request observations.
- [ ] **RED:** Run `npx playwright test e2e/god-mode.spec.ts --project=chromium -g "deterministic transition matrix" --workers=1`. Expected: failures after exiting from God-opened destinations because current exit logic only resets `activeGlobal === 'god'`.
- [ ] Wire rail, top bar, navigator, Datum back actions, and workspace opens to `dispatchNavigation(NavigationEvent)`; retain `GodModeSession.returnTo` until exit.
- [ ] Set `aria-pressed` and `data-testid="god-mode-toggle"` on the toggle, `aria-current="page"` on the active God destination, and stable test IDs on God home/Datum/handoff states.
- [ ] Ensure the God banner and inspector governance notice remain present in every God context and are removed immediately on exit.
- [ ] **GREEN:** Run `npx playwright test e2e/god-mode.spec.ts --project=chromium -g "deterministic transition matrix" --workers=1`. Expected: every matrix row restores the exact normalized pre-entry mode/global/tool/tab state; no orphaned active tool or God-only UI remains.

### Task 6: Complete Responsive and Accessibility Behavior

**Responsible role:** Accessibility-focused frontend engineer  
**Dependencies:** Tasks 2-5; Phase 5 tokens and shell primitives  
**Files:** `components/views/GodModeView.tsx`, `components/views/GodModeHandoffExplorer.tsx`, `components/views/DatumCanvas.tsx`, `components/layout/TopBar.tsx`, `components/layout/OsRail.tsx`, `components/layout/ContextNavigator.tsx`, `components/layout/ContextInspector.tsx`, `app/globals.css`, `playwright.config.ts`, `package.json`, `package-lock.json`, `e2e/god-mode.a11y.spec.ts`

**Interfaces:** Breakpoints are 390x844 mobile, 768x1024 tablet, and 1440x900 desktop; interactive state uses native controls and ARIA only where native semantics are insufficient.

- [ ] Import Phase 5's locked `@axe-core/playwright` dependency and configure the five named Playwright projects: `chromium`, `chromium-tablet`, `chromium-mobile`, `firefox`, and `webkit`; fail preflight if the accepted dependency is absent rather than reinstalling it.
- [ ] Add tests for heading order, named landmarks, toggle/lens/stage selected state, complete keyboard traversal, focus restoration, 200% zoom reflow, 390px no-horizontal-page-overflow, 44px touch targets, and reduced-motion behavior.
- [ ] **RED:** Run `npx playwright test e2e/god-mode.a11y.spec.ts --workers=1`. Expected: FAIL for missing toggle/lens selected semantics, focus handling, and fixed-width mobile shell behavior.
- [ ] Implement responsive shell behavior using Phase 5 breakpoints: rail and inspector become dismissible drawers on mobile, lifecycle and role grids collapse without clipping, Datum uses a linear card list on mobile/tablet, and the handoff detail uses a full-height mobile sheet.
- [ ] Add visible `:focus-visible` treatment, `aria-live="polite"` for context changes, semantic headings/regions, explicit accessible names, and `prefers-reduced-motion: reduce` overrides.
- [ ] **GREEN:** Run `npx playwright test e2e/god-mode.a11y.spec.ts --workers=1`. Expected: all projects pass, axe reports zero serious or critical violations, and no assertion reports clipping, inaccessible state, lost focus, or unexpected motion.

### Task 7: Run the Full Phase Regression and Capture Evidence

**Responsible role:** QA automation engineer with security reviewer  
**Dependencies:** Tasks 1-6 and Task 8 release-control evidence  
**Files:** `e2e/god-mode.spec.ts`, `e2e/god-mode.a11y.spec.ts`, `e2e/rail.spec.ts`, `e2e/app.spec.ts`, `e2e/roles.spec.ts`

**Interfaces:** Phase tests must coexist with all current rail, 47-module-open, workflow, and 20-role suites.

- [ ] **RED baseline:** Before implementation, run `npm run test:god-mode`. Expected: named failures for `P7-F04` stage routing, `P7-F05` no-project-PATCH, `P7-F06` full stage map, `P7-F07` lens identity separation, `P7-F08` exit restoration, `P7-F09` handoffs, and `P7-F12` selected semantics; existing two smoke tests may pass and are not completion evidence.
- [ ] Run `npm run lint`. Expected: exit code 0, zero ESLint errors and warnings introduced by this phase.
- [ ] Run `npm run typecheck`. Expected: exit code 0, no TypeScript diagnostics.
- [ ] Run `npm run build`. Expected: successful production build with no ignored type errors.
- [ ] Run `npm run test`. Expected: foundation and backend baseline suites pass with exactly 47 canonical modules.
- [ ] **GREEN focused:** Run `npm run test:god-mode`. Expected: all God functional, five-browser/device, RBAC-negative, and accessibility cases pass with zero retries.
- [ ] **GREEN regression:** Run `npm run test:e2e`. Expected: all app, rail, roles, God Mode, and accessibility tests pass; no page errors, unhandled runtime errors, serious/critical axe violations, or unexpected console errors.
- [ ] Save the Playwright HTML/JUnit report, traces for any resolved failure, exact command transcript, browser versions, commit SHA when Git is available, and reviewer sign-offs for the Phase 8 evidence bundle.

### Task 8: Add and Prove the God Mode Release Flag

**Responsible role:** Frontend platform engineer with release reviewer  
**Dependencies:** Tasks 1-6  
**Files:** `lib/god-mode.ts`, `lib/__tests__/god-mode.test.ts`, `app/page.tsx`, `components/layout/TopBar.tsx`, `components/layout/OsRail.tsx`, `playwright.config.ts`, `.env.example`

**Interfaces:** `godModeAvailable(value = process.env.NEXT_PUBLIC_GOD_MODE_ENABLED): boolean` returns `true` only for the literal `true`; absent, empty, malformed, or `false` values fail closed.

- [ ] Add Vitest cases for unset, empty, `false`, malformed, and `true` values, plus Playwright coverage proving the toggle/rail entry are absent when disabled and present when enabled.
- [ ] **RED:** Run `npm run test:unit -- lib/__tests__/god-mode.test.ts -t "God Mode release flag"`. Expected: FAIL because the availability selector does not exist; no-tests is not valid RED evidence.
- [ ] Gate every entry point, not internal authorization, with the one selector. A user cannot enable God Mode from URL/local storage when the build-time flag is false.
- [ ] Add a Phase 7-only `E2E_PRODUCTION_BUILD=true` branch in `playwright.config.ts` whose managed `webServer.command` is `npm start -- -p 3100`, `url` is `http://127.0.0.1:3100`, and `reuseExistingServer` is `false`; default local E2E behavior remains unchanged.
- [ ] **GREEN:** Run `$ErrorActionPreference='Stop'; $env:E2E_PRODUCTION_BUILD='true'; $env:NEXT_PUBLIC_GOD_MODE_ENABLED='false'; npm run build; if (-not $?) { exit 1 }; npm run test:god-mode -- -g "release flag disabled"; if (-not $?) { exit 1 }; $env:NEXT_PUBLIC_GOD_MODE_ENABLED='true'; npm run build; if (-not $?) { exit 1 }; npm run test:god-mode -- -g "release flag enabled"; if (-not $?) { exit 1 }`. Expected: Playwright starts/stops each compiled production build and both named entry-point cases pass.
- [ ] Record the flag value in Phase 8's environment/evidence manifest. Changing it requires a new immutable frontend artifact because `NEXT_PUBLIC_*` is embedded at build time.

## Milestones and Exit Criteria

| Milestone | Work included | Exit criteria |
|---|---|---|
| M7.1 Contract | Tasks 1-2 | Eight stages route to Datum and exact stage maps render through pure transitions |
| M7.2 Governance | Task 3 | Learning lens is demonstrably independent from identity and authorization |
| M7.3 Ecosystem | Task 4 | All eight stages have complete, validated handoff explanations and workspace links |
| M7.4 Shell completion | Task 5 | Entry/internal/exit matrix is deterministic from every supported source context |
| M7.5 Inclusive quality | Task 6 | Mobile/tablet/desktop, keyboard, reduced motion, and axe gates pass |
| M7.6 Release control | Task 8 | Deny-by-default entry flag is tested in disabled and enabled artifacts |
| M7.7 Regression gate | Task 7 | Focused and full suites pass with captured evidence and no authorization regression |

## Required Resources, Skills, Environments, and Tools

| Resource | Requirement |
|---|---|
| Frontend/platform engineer | React state modeling, TypeScript contracts, Next.js shell navigation |
| Accessibility engineer | WCAG 2.2 AA review, keyboard/focus testing, responsive reflow, axe interpretation |
| Security/backend reviewer | RBAC, tenancy, project scope, protected-action negative testing |
| Built-environment workflow reviewer | Validate handoff artifacts, owners, and decision gates for all eight stages |
| QA automation engineer | Playwright fixtures, multi-browser projects, deterministic request assertions |
| Environment | Production Next.js build, PHP API, isolated MariaDB test schema, Chromium/Firefox/WebKit |
| Tools | npm, Node 20+, PHP 8.3, MariaDB 10/11 client/server, Playwright, axe, browser dev tools |

## Person-Day Estimate by Workstream

| Workstream | Person-days |
|---|---:|
| Session/state contract, release flag, and lifecycle routing | 1.5-2.0 |
| Full Datum stage presentation | 1.0-1.5 |
| Lens/authorization separation and security review | 1.0-1.5 |
| Handoff model and explorer | 1.5-2.0 |
| Deterministic shell integration | 1.0-1.5 |
| Responsive and accessibility completion | 1.5-2.0 |
| Regression, evidence, and review | 0.5-1.5 |
| **Total** | **8.0-12.0** |

## Dependency Sequence

| Work item | Depends on | May run in parallel with |
|---|---|---|
| Task 1 | Phase 1 | Handoff domain review for Task 4 |
| Task 2 | Task 1, Phase 6 primitives | Initial accessibility test authoring |
| Task 3 | Task 1, Phase 3 | Task 4 after lens interface is fixed |
| Task 4 | Tasks 2-3 data contracts | Task 5 test-matrix authoring |
| Task 5 | Tasks 1-4 | Responsive CSS investigation |
| Task 6 | Tasks 2-5, Phases 5-6 | Security review of completed Task 3 |
| Task 8 | Tasks 1-6 | Final Task 7 test preparation |
| Task 7 | Tasks 1-6 and Task 8 | None; this is the phase convergence gate |

## Acceptance Criteria

- Selecting any lifecycle stage from God home opens project Datum in project mode at that exact stage.
- The selected exploration stage exists only in `GodModeSession.presentationStage`; `activeProject.stage` remains unchanged and all eight stage journeys emit zero project PATCH requests.
- God Datum displays exactly every valid ID in the selected `STAGE_TOOL_MAP`, without role filtering, truncation, or duplicates.
- Opening a workspace never changes the authenticated role, project membership, tenant, permission set, or protected API response.
- Selecting any of the 20 role lenses changes explanatory emphasis and selected semantics but not the top-bar authenticated role or request identity.
- Every lifecycle stage has at least one complete, domain-reviewed handoff chain with source, artifact, destination, owner, and decision gate.
- Entering and exiting from project, standalone, global, and tool contexts restores the normalized pre-entry state exactly.
- God governance copy remains visible across home, Datum, registry, and workspace contexts and disappears on exit.
- The complete experience is usable at 390x844, 768x1024, and 1440x900 with no page-level horizontal overflow or inaccessible controls.
- Keyboard-only traversal, focus restoration, visible focus, 200% zoom, and reduced-motion behavior pass.
- Axe reports zero serious or critical violations on God home, stage Datum, handoff detail, and a God-opened workspace.
- Existing 47-module, rail, workflow, role, API RBAC, typecheck, lint, and production-build suites remain green.
- God Mode entry points are absent unless the tested build-time flag is exactly `true`; the evidence manifest records the compiled value.

## Test and Evidence Plan

| Evidence class | Command | Required artifact/outcome |
|---|---|---|
| Static quality | `$ErrorActionPreference='Stop'; npm run lint; if (-not $?) { exit 1 }; npm run typecheck; if (-not $?) { exit 1 }` | Exit 0; command transcript |
| Production build | `npm run build` | Exit 0; build log and route/bundle summary |
| God functional | `npm run test:god-mode` | Zero failures/retries; HTML/JUnit report |
| Authorization negative | `npx playwright test e2e/god-mode.spec.ts -g "lens never changes authorization" --workers=1` | Captured identity remains authenticated role; protected request is 403/disabled |
| Accessibility | `npm run test:god-mode:a11y` | Zero serious/critical axe findings; keyboard/focus/reflow assertions pass |
| Existing regressions | `$ErrorActionPreference='Stop'; npm run test; if (-not $?) { exit 1 }; npm run test:e2e; if (-not $?) { exit 1 }` | 47-module parity and all prior suites pass |
| Manual domain review | Review `GOD_MODE_HANDOFFS` in a recorded checklist | Named workflow reviewer approves each stage's artifact and gate |
| Visual inspection | Browser screenshots at 390x844, 768x1024, 1440x900 | No clipping, overlap, hidden governance warning, or ambiguous selected state |

Evidence is valid only when it records date/time, environment, exact command, exit code, browser versions, database schema version, and source revision. Phase 8 owns long-term bundling and release sign-off.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Detection |
|---|---|---:|---|---|
| Lens is accidentally reused as API identity | Medium | Critical | Separate types/state and prohibit lens in API interfaces | Request-capture and 403 negative tests |
| All-tools visibility leaks protected data | Medium | Critical | Show workspace metadata/demo projections only; all live reads remain authorized | Cross-role/project RBAC integration tests |
| Stage selection mutates a durable project stage unintentionally | Medium | High | Store only `GodModeSession.presentationStage`; never invoke the normal stage-change workflow from exploration | Assert durable stage equality and zero project PATCH requests for all eight stages |
| Exit restores stale or invalid tool/tab | Medium | Medium | Normalize `GodModeSession.returnTo` through the Phase 1 reducer and canonical registries | Invalid-target transition test |
| Full stage set overflows Datum | High | Medium | Responsive grid/list presentation and no eight-item truncation | Mobile/tablet overflow assertions |
| Handoff copy implies authority or automatic transfer | Medium | High | Explicit artifact owner and decision-gate language; domain review | Content checklist and accessibility snapshot review |
| God warning becomes visual-only | Medium | Medium | Semantic status/region and persistent inspector text | Screen-reader/axe and route persistence tests |
| Multi-browser behavior diverges | Medium | Medium | Chromium, Firefox, and WebKit gate | Playwright project matrix |
| Phase 6 shared-shell changes conflict | Medium | Medium | Rebase interfaces before Task 5 and avoid duplicated shell primitives | Typecheck and visual diff review |

## Rollback and Contingency Strategy

1. Keep the existing non-God navigation and permission paths intact; internal God events are handled only while `NavigationState.godSession !== null`.
2. If a critical authorization or data-leak defect is found, build and deploy a new immutable frontend artifact with `NEXT_PUBLIC_GOD_MODE_ENABLED=false`; verify both entry points are absent while normal project and standalone operation remain available. Do not claim a runtime toggle because `NEXT_PUBLIC_*` is build-time configuration.
3. Revert God presentation components and transition wiring as one coherent change; do not partially retain a lens that can mutate identity.
4. If responsive drawer work destabilizes the shared shell, retain the completed domain contract and stage routing behind desktop-only internal access until the shared shell fix passes Phase 6 and Phase 7 tests; this contingency is not releasable externally.
5. Handoff definitions are static presentation data. If domain review rejects one chain, remove that chain and fail the stage completeness validator until a reviewed replacement exists; do not ship unreviewed copy.
6. No rollback may weaken API authorization, change permission grants, or copy protected records into demo fixtures.

## Deliverables

- Pure God Mode session, transition, stage tool, and handoff contracts.
- Complete eight-stage lifecycle-to-Datum exploration.
- All stage-relevant workspace presentation without authorization bypass.
- Separate 20-role learning lens semantics.
- Eight-stage handoff explorer with governed artifacts and decision boundaries.
- Deterministic enter/internal/exit behavior across all shell contexts.
- Responsive and accessible God home, Datum, handoff, navigator, rail, top bar, and inspector states.
- Full functional, negative authorization, accessibility, responsive, and regression tests.
- Phase evidence ready for inclusion in the Phase 8 release bundle.

## Phase Exit Gate

Phase 7 is complete only when all checklist items are checked, every acceptance criterion is linked to stable finding IDs and passing evidence, all eight lifecycle stages and all 20 lenses are covered, no exploration action changes `activeProject.stage` or emits a project PATCH, all God navigation dispatches Phase 1 `NavigationEvent`, the authorization reviewer confirms no permission/identity path consumes the lens, the workflow reviewer approves all eight handoff chains, both release-flag states are tested, axe has zero serious/critical findings, and the full regression suite is green without retries. Any protected-data exposure, durable-stage mutation, competing navigation contract, identity mutation, missing stage tool, non-deterministic exit, inaccessible critical control, or unreviewed handoff is an automatic **NO-GO** for Phase 7.
