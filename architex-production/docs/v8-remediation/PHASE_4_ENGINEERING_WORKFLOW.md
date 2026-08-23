# Phase 4 Engineering Workflow and Inspector Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a calculator-safe engineering workflow in which state cannot leak across calculators, changed inputs invalidate outputs, and save, review, linking, standalone attachment, and inspector actions operate on one canonical record state.

**Architecture:** A dedicated engineering workflow provider owns a reducer-driven working copy and canonical server record. Calculator identity is a hard state boundary: changing `calc_type` remounts a keyed workspace with that calculator's defaults and no prior calculator output, record ID, dirty state, links, or review state. The module and `ContextInspector` consume the same workflow context, while Phase 3 remains authoritative for persistence, permissions, transitions, links, concurrency, and idempotency.

**Version basis:** `package.json` declares Next.js `^15.4.9`, React/React DOM `^19.2.1`, Playwright `^1.62.1`, exact TypeScript `5.9.3`, and Tailwind CSS `4.1.11`; `package-lock.json` is installation authority. The phase uses reducer/context state, Phase 1 navigation, the Phase 2 DTO, Phase 3 API, the shared Vitest runner, and Phase 5's locked `@axe-core/playwright` dependency.

## Global Constraints

- Calculation definitions remain pure and do not import React, browser APIs, API clients, or persistence code.
- Calculator identity owns inputs, output, dirty state, canonical record, links, lifecycle, and request state.
- Switching calculators must never display or submit another calculator's inputs, output, record ID, links, messages, or review state.
- Any input change invalidates the rendered output immediately and removes saved/controlled eligibility until recalculation and save succeed.
- The server record returned by Phase 3 is the canonical persisted state; the client never fabricates an approved or under-review state.
- `project_id: null` is a deliberate standalone record, not a missing-context error.
- Linking and inspector surfaces consume the same workflow state rather than storing independent copies.
- Under-review and approved records are immutable in place; revision begins as a new unsaved working copy.
- God Mode changes explanation and visibility only and never bypasses engineering permissions.
- All critical engineering workflows require keyboard, semantic state, visible focus, automated accessibility, and responsive E2E evidence.
- Formula correction, professional golden validation, and persistence repository implementation remain owned by Phases 2 and 3.
- Phase 2's `EngineeringCalculationPayloadV1` is consumed verbatim: `Record<string, QuantityDto>` inputs, `CalculationResultDto[]`, `string[]` derivation/assumptions/limitations, `StandardReferenceDto[]`, schema version, calculator ID, and formula version flow unchanged to Phase 3. Display formatting never enters a request.
- Shell changes emit Phase 1 `NavigationEvent` values through `dispatchNavigation(event)`. Phase 4 never writes `activeToolTabKey`, mode, destination, tool, or tab state directly.
- Unit tests stay on the existing centrally configured Vitest `test:unit` runner. Phase 4 does not add `tsx`, Node test-runner syntax, a second Vitest config, or another axe dependency declaration.
- Every requirement, patch step, named test, and evidence row uses its stable `V8-P4-*` ID.
- Program finding mapping is mandatory: `V8-H01` maps to Tasks 1-3; `V8-H02` to Tasks 2-5; `V8-H03` to Tasks 4 and 7; `V8-H04` to Tasks 4-6; and `V8-M01` to Tasks 6-7. Tests and evidence include both the local task ID and applicable program finding IDs.

---

## Executive Summary

The current engineering module renders the calculators and can create or submit a record, but its workflow state is unsafe. `useState(() => defaultInputs(calcId))` runs only on initial mount, so tab changes update `calcId` without resetting inputs. Output, saved record ID, save state, messages, and derivation visibility are likewise shared across calculator identities. Input changes do not clear output or controlled-record state. Once a record is created, another Save performs no update, and Send to review may target an old record even after inputs change or the user switches calculators.

The workflow ribbon and inspector currently describe linking and controlled outputs but do not implement them. The inspector is a generic sibling of the module with no calculation state. Its standalone attachment button only changes global mode, so it does not attach a saved standalone record. This phase replaces those disconnected states with one explicit workflow model, completes update/save/review semantics, implements drawing/RFI/meeting linking and standalone project attachment, exposes accurate engineering state in the inspector, and closes keyboard, screen-reader, responsive, and E2E gaps.

## Objectives

1. Enforce calculator-keyed state reset on every calculator identity change.
2. Invalidate output, save eligibility, controlled status, and review eligibility on every input mutation.
3. Define deterministic calculate, create, update, save, submit, retry, and revise-as-new semantics.
4. Link a calculation record to a drawing, RFI, and meeting with project consistency checks.
5. Attach an unsaved or saved standalone calculation to an authorized project without merely toggling shell mode.
6. Present live calculator, dirty, output, record, project, link, and review state in the engineering inspector.
7. Make module actions and inspector actions operate on the same state and command set.
8. Meet keyboard, focus, semantic status, error, contrast, responsive, and automated accessibility requirements.
9. Provide deterministic Playwright coverage for state isolation and every critical workflow.

## V8 Requirement Coverage

| Source requirement | Current implementation state | Planned task | Required acceptance evidence |
|---|---|---|---|
| `V8-P4-REQ-001` calculator tab switching | Calculator title changes but one hook state is reused | `V8-P4-T01`, `V8-P4-T02` | Phase 1 tab event A -> B shows B defaults and no A output/record |
| `V8-P4-REQ-002` input/output workspace | Input changes leave old output visible | `V8-P4-T02` | Quantity input edit immediately removes result/derivation and disables save/review |
| `V8-P4-REQ-003` Save calculation | First save creates; later save is a no-op even after edits | `V8-P4-T03`, `V8-P4-T04` | Create/update preserve exact Phase 2 DTO and version semantics |
| `V8-P4-REQ-004` Send to review | Can target stale `savedRecordId`; no transition-aware UI | `V8-P4-T03`, `V8-P4-T04` | Only clean saved records submit; immutable states are enforced |
| `V8-P4-REQ-005` Drawing/RFI/Meeting links | Display-only text | `V8-P4-T05`, `V8-P4-T06` | Canonical scoped targets link/unlink and persist |
| `V8-P4-REQ-006` project context | Attachment is not a record operation | `V8-P4-T06` | Attachment patches first and then dispatches a Phase 1 mode event |
| `V8-P4-REQ-007` inspector | Generic module summary only | `V8-P4-T07` | Inspector reflects the one provider state |
| `V8-P4-REQ-008` UI boundary | Identity must own workflow state | `V8-P4-T01`-`V8-P4-T04` | Vitest reducer tests and E2E isolation pass |
| `V8-P4-REQ-009` linking consistency | Linking and inspector must consume same state | `V8-P4-T05`-`V8-P4-T07` | One canonical server response updates both |
| `V8-P4-REQ-010` accessibility/E2E | Existing tests cover labels only | `V8-P4-T08`, `V8-P4-T09` | Centrally installed axe, keyboard, focus, mobile, API, and workflow suites pass |
| `V8-P4-REQ-011` controlled rollout | No workflow flag contract exists | `V8-P4-T01`, `V8-P4-T09` | `engineering_workflow_v2` on/off behavior and rollback mode are explicitly tested |

## Exact Current Evidence

| File and lines | Verified evidence | Consequence |
|---|---|---|
| `components/modules/EngineeringCalcModule.tsx:39-46` | `calcId` changes with `activeTabKey`, but inputs/output/saved record/save message are ordinary component-wide state | Calculator identity does not own workflow state |
| `components/modules/EngineeringCalcModule.tsx:41` | Inputs initialize with `defaultInputs(calcId)` only on mount | Switching tabs can show the previous calculator's field values under a new calculator |
| `components/modules/EngineeringCalcModule.tsx:48-50` | Input handler only merges the numeric value | Previous output, derivation, record, success message, and review eligibility remain visible |
| `components/modules/EngineeringCalcModule.tsx:52-55` | Calculate sets output and hides derivation but has no validation/error/dirty transition | Workflow state is implicit and cannot be inspected reliably |
| `components/modules/EngineeringCalcModule.tsx:62-81` | Persist always calls create and serializes results into presentation strings | Update is absent and persisted output loses structured result semantics |
| `components/modules/EngineeringCalcModule.tsx:83-108` | If `savedRecordId` exists, Save performs no API request; Send to review uses that ID regardless of later input changes | Saved changes can be lost and stale records can be submitted |
| `components/modules/EngineeringCalcModule.tsx:110-116` | Reset uses current `calcId`, but it is only a user action and not tied to calculator identity changes | Tab switches do not invoke reset automatically |
| `components/modules/EngineeringCalcModule.tsx:261-289` | Save/review actions appear whenever any output exists; no status/dirty/version/link semantics | Actions do not reflect lifecycle validity |
| `components/modules/EngineeringCalcModule.tsx:120-141` | Workflow ribbon lists Calculation record and Drawing/RFI/Meeting but has no actions | Display overstates implementation |
| `components/layout/ContextInspector.tsx:8-17,123-138` | Props include generic tool/project context only; no engineering workflow state | Inspector cannot show or control the actual calculation record |
| `components/layout/ContextInspector.tsx:99-105` | Standalone Attach button calls `onAttachProject` | It changes shell mode but does not update calculation `project_id` |
| `app/page.tsx:231-242,284-295` | Module and inspector are siblings; no shared engineering state is passed | Separate local copies would drift unless a shared provider is introduced |
| `lib/module-registry.tsx:56-69,125-160` | Registry props have no engineering workflow bridge | Router contract must carry provider context rather than ad hoc calculator props |
| `lib/api.ts:275-295` | Create has one link field; client has no update, derivation, link-target, or generalized review operation | Phase 3 client contract is prerequisite for full workflow |
| `e2e/rail.spec.ts:257-265` | Engineering coverage only verifies grouped discipline labels | No calculation state, save, review, link, inspector, attachment, or accessibility E2E exists |
| `playwright.config.ts:15-20` | Only desktop Chromium is configured | Responsive mobile evidence must be added explicitly in the engineering suite or project config |

## Scope

- Engineering workflow state types, reducer, provider, commands, and reducer tests.
- Calculator-keyed workspace remount/reset and default input initialization.
- Input validation display and output/controlled-state invalidation.
- Calculate, first save, saved-record update, clean no-op, conflict recovery, submit to review, approve/return display, and revise-as-new behavior.
- Structured result persistence without converting results to presentation strings.
- Project-scoped drawing/RFI/meeting target discovery and link/unlink UI.
- Standalone working-copy and saved-record project attachment.
- Engineering-specific inspector state and actions.
- Loading, empty, success, conflict, permission, unavailable, and retry states.
- Keyboard/focus/ARIA improvements, automated axe checks, and desktop/mobile Playwright flows.

## Explicit Non-Scope

- Formula or standards corrections and professional golden approval.
- MariaDB repository internals, route tenancy/RBAC implementation, and JSON migration; Phase 3 owns them.
- Migrating the full Documents, Issues/RFIs, or Meetings modules to new persistence models.
- Uploading binary files to calculation records; attachment means binding the calculation to a project datum and linking existing records.
- Multi-record calculation history browser beyond the active record and revise-as-new action.
- Collaborative live editing or offline synchronization.
- Product-wide visual redesign and semantic-token migration.
- Allowing reviewers to approve from the calculator module; review decision remains an authorized inspector/queue operation unless separately approved.

## Prerequisites and Dependencies

- Phase 3 exit gate is signed and its DTO, `project_id`, ETag/lock version, idempotency, lifecycle, derivation, and permission contracts are frozen.
- Phase 2 identifies which calculators are enabled; disabled calculators cannot expose Save or Send to review.
- Phase 5 has accepted the shared Vitest/Playwright accessibility tooling, semantic focus/status primitives, and locked `@axe-core/playwright` dependency required by Phase 4 accessibility tasks. Product-wide module migration remains outside Phase 4.
- API provides a project-scoped engineering link-target operation in this phase using existing canonical target stores; target records include stable ID/ref, label, type, project ID, and status.
- Test identities include at least an author, reviewer, denied role, platform admin, and a user without access to a second project.
- Playwright can intercept or reach the Phase 3 API deterministically.
- The existing active project remains available to the provider for standalone attachment confirmation.

## Architecture and Data Flow

```text
app/layout.tsx
  -> EngineeringWorkflowProvider
       -> app/page.tsx navigation handlers
            -> ContextNavigator calculator-tab requests
       -> ModuleRouter
            -> EngineeringCalcModule
                 -> CalculatorWorkspace key={calcId}
                 -> inputs -> calculate -> output -> save/update -> record
                 -> link dialog -> patch record -> canonical record
       -> ContextInspector
            -> useEngineeringWorkflow()
            -> same state and commands (attach, link, retry, submit, revise)

Phase 3 API
  <- create/update/review/derivation DTOs with lock_version
  <- link-target query constrained by project_id and permission
```

### Workflow State Contract

```typescript
type EngineeringWorkflowPhase =
  | 'editing'
  | 'calculated'
  | 'saving'
  | 'saved'
  | 'submitting_review'
  | 'under_review'
  | 'approved'
  | 'conflict'
  | 'error';

type EngineeringWorkflowState = {
  calcId: string;
  inputs: Record<string, QuantityDto>;
  inputErrors: Record<string, string>;
  output: EngineeringCalculationPayloadV1 | null;
  dirty: boolean;
  record: ApiCalculationRecord | null;
  projectId: string | null;
  links: {
    drawingRef: string | null;
    rfiId: string | null;
    meetingId: string | null;
  };
  phase: EngineeringWorkflowPhase;
  derivationExpanded: boolean;
  pendingCommand: 'save' | 'review' | 'attach' | 'link' | null;
  message: { kind: 'status' | 'success' | 'error'; text: string } | null;
};
```

There is exactly one active workflow state. `CalculatorWorkspace` is keyed by `calcId`; an identity change dispatches `activate(calcId, defaults, projectId)` before actions are available. Defaults are unit-bearing `Quantity` values. The new state contains only target-calculator defaults, null output/record/links, `dirty:false`, `phase:'editing'`, and no message. Unsaved state is not retained when returning to a calculator; dirty navigation is confirmed before the provider forwards the requested `NavigationEvent` to `dispatchNavigation`.

### Feature Flag Contract

`engineering_workflow_v2` is backed by build-time variable `NEXT_PUBLIC_ENGINEERING_WORKFLOW_V2`. `lib/features.ts` accepts only literal `true`; unset, empty, `false`, or malformed values resolve to false. `.env.example` documents `NEXT_PUBLIC_ENGINEERING_WORKFLOW_V2=false`. Staging enablement sets it to true and rebuilds the immutable Next artifact; rollback sets it false, rebuilds, and redeploys. The flag is evaluated before rendering the provider. When false, engineering remains Phase 0-contained and read-only. It is not a security boundary and never changes Phase 3 authorization.

### State Transition Contract

| Event | Preconditions | Result |
|---|---|---|
| Activate calculator | New `calcId` | Replace complete state with target defaults; never merge old state |
| Change input | Record absent or status `saved`; valid calculator | Set value, validate field, set `output:null`, `dirty:true`, `phase:'editing'`, collapse derivation, clear success/record-controlled message; retain saved record ID/version only as update target |
| Calculate | Inputs pass Phase 2 validation | Run pure function; set output, `phase:'calculated'`; `dirty` remains true until save |
| Reset | User confirms if dirty | Restore current calculator defaults; clear output/record/links/messages; preserve current project context only |
| Save new | Output exists, dirty, no record | Phase 3 create with one command key; server response becomes record; `dirty:false`, `phase:'saved'` |
| Save update | Output exists, dirty, record status `saved` | Phase 3 patch with record lock version; response replaces record; `dirty:false`, `phase:'saved'` |
| Save clean | Record exists and `dirty:false` | Button disabled with visible text `Saved`; no request |
| Submit review | Record status `saved`, `dirty:false`, output exists | Phase 3 review `submit`; response replaces record; `phase:'under_review'` |
| Edit reviewed/approved | Record status `under_review` or `approved` | Inputs disabled; user must choose Revise as new |
| Revise as new | Under-review or approved record | Copy current persisted inputs into a new unsaved working copy, clear record ID/version/review metadata, output, links, and messages; set `dirty:true` |
| Stale update | API returns `412` | Set `phase:'conflict'`; retain working copy; show Reload server record and Revise as new; never retry with a new version silently |

### Link and Attachment Contract

- A record can have zero or one drawing, RFI, and meeting link, matching the Phase 3 DTO.
- Link targets are queried with canonical `project_id` and filtered server-side to the record's project and identity permissions.
- Drawing targets come from `drawing_register`; meetings come from `meetings`; RFIs come from `project_module_records` where `module_id = 'issues_rfis'` and `record_type = 'rfi'`. The RFI adapter maps `id` from `project_module_records.id`, `label` from `title`, `status` from `status`, and optional display metadata only from validated `payload_json.number`, `payload_json.discipline`, and `payload_json.due_at`. It scopes by `project_id`, joins `projects` to require `projects.organization_id = identity.org`, requires the project claim, and orders by `updated_at DESC, id`. Existing `idx_project_module (project_id, module_id, status)` is the lookup index; the integration test runs `EXPLAIN` and rejects a full-table scan. No `foundation.json`, `rfi_drafts`, or component seed is a source.
- Unsaved links remain in the working copy and are sent on create. Saved links use Phase 3 patch and update `lock_version`.
- Standalone records cannot link project targets until attached.
- Attaching an unsaved standalone working copy changes its working `projectId` after confirmation; no request occurs until save.
- Attaching a saved standalone record calls patch with `project_id` and current version; success switches shell mode to project and replaces the canonical record. Shell mode changes only after server success.
- Under-review and approved records cannot be attached, detached, linked, or unlinked in place.
- Project detachment and cross-project movement are not exposed in Phase 4 UI.

## Exact File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `components/modules/engineering/engineering-workflow.ts` | State types, reducer, action/event guards, selectors, and initial-state factory |
| Create | `components/modules/engineering/engineering-commands.ts` | Pure command coordinator for idempotency keys, version headers, retries, and server DTO events |
| Create | `components/modules/engineering/EngineeringWorkflowProvider.tsx` | API commands, idempotency-key retention, conflict handling, shared context, and hook |
| Create | `components/modules/engineering/EngineeringDiscardDialog.tsx` | Global accessible confirmation for dirty calculator, tool, project, role, and mode transitions |
| Create | `components/modules/engineering/CalculatorWorkspace.tsx` | Keyed inputs, calculate/results/derivation, save/review controls, dirty-switch guard |
| Create | `components/modules/engineering/CalculationLinksDialog.tsx` | Accessible drawing/RFI/meeting link selection and unlink confirmation |
| Create | `components/modules/engineering/EngineeringInspectorPanel.tsx` | Calculation-specific inspector summary and actions using shared context |
| Modify | `components/modules/EngineeringCalcModule.tsx:1-292` | Replace local workflow state with provider/workspace components and truthful ribbon/status UI |
| Modify | `components/layout/ContextInspector.tsx:3-17,19-30,78-152` | Render engineering panel when `activeTool.id === 'engineering_calc'`; retain generic context for other modules |
| Modify | `lib/module-registry.tsx:56-69,125-160` | Keep module dispatch stable and consume provider from the app shell without calculator-specific prop duplication |
| Modify | `app/layout.tsx` | Mount exactly one engineering provider above navigator, module, and inspector consumers |
| Modify | `app/page.tsx:34-46,190-203,228-242,284-295` | Consume provider navigation guards and coordinate successful standalone attachment with shell mode |
| Modify | `lib/features.ts` | Add typed `engineering_workflow_v2` default/environment parsing; flag off is Phase 0-contained read-only mode |
| Modify | `.env.example` | Document `NEXT_PUBLIC_ENGINEERING_WORKFLOW_V2=false` and immutable-build rollout/rollback behavior |
| Modify | `lib/api.ts:165-184,257-295` | Consume Phase 3 update/derivation/review and add project-scoped link-target client/type |
| Modify | `backend/public/index.php` | Add tenant/RBAC-protected `GET /api/v1/engineering/link-targets?project_id={id}` adapter only |
| Create | `backend/tests/engineering_link_targets_integration.php` | Prove project/tenant/permission filtering and empty target sections |
| Create | `components/modules/engineering/engineering-workflow.test.ts` | Vitest reducer, selector, feature-flag, and navigation-event tests |
| Create | `components/modules/engineering/engineering-commands.test.ts` | Vitest pure command coordinator tests |
| Create | `e2e/engineering-workflow.spec.ts` | State reset, invalidation, save/update/review, links, attachment, conflict, inspector, keyboard, and responsive flows |
| Create | `e2e/engineering-accessibility.spec.ts` | axe and keyboard/focus assertions at desktop and mobile widths |
| Modify | `playwright.config.ts:10-20` | Add mobile Chromium project or retain targeted viewport tests with explicit project names |
| No change | `package.json`, `package-lock.json`, `vitest.config.ts` | Reuse Phase 5's accepted `test:unit`, Vitest config, and locked `@axe-core/playwright`; Phase 5 tooling is required before Phase 4 accessibility tasks |
| Create | `scripts/verify-phase4.ps1` | Set `$ErrorActionPreference='Stop'`; run named type/lint/Vitest/API/E2E/build groups one at a time; check every native `$LASTEXITCODE`; stop on first failure; emit stable-ID output |
| Create | `docs/v8-remediation/evidence/PHASE_4_RELEASE_EVIDENCE.md` | Record actual state, workflow, accessibility, responsive, regression, build, wording, and sign-off evidence |

## Detailed Task Checklist

### Task 1 (`V8-P4-T01`): Specify the Workflow State Machine and Flag

**Owner:** Senior frontend engineer  
**Dependencies:** Frozen Phase 3 DTO and status transitions  
**Produces:** Pure reducer/state contract that both UI surfaces consume

- [ ] **`V8-P4-T01-RED-01`: Write Vitest transition tests first.** Cover unit-bearing activation/input mutation, calculate, create/update/submit success, conflict, revise, attach/link/reset, immutable actions, and complete `EngineeringCalculationPayloadV1` preservation.

Run: `npm run test:unit -- components/modules/engineering/engineering-workflow.test.ts`  
Expected: test runner exits non-zero because `engineering-workflow.ts` does not exist.

- [ ] **`V8-P4-T01-RED-02`: Add feature-flag contract tests.** Assert central parsing defaults `engineering_workflow_v2` off in production, accepts only explicit true/false values, selects the provider path when on, and exposes a Phase 0-contained read-only engineering surface with no mutation controls when off.

- [ ] **`V8-P4-T01-GREEN-03`: Implement typed feature flag and state factory.** Add the flag to the central registry and gate rendering at the server boundary. `createEngineeringWorkflowState(calcId, projectId)` uses Phase 2 `defaultInputs(calcId)` unchanged and returns the exact reset state. Unknown calculator identity is a controlled developer error.

Run: `npm run test:unit -- components/modules/engineering/engineering-workflow.test.ts -t "V8-P4-T01"`  
Expected: activation tests pass and assert no old keys, output, record, links, or messages remain.

- [ ] **`V8-P4-T01-GREEN-04`: Implement guarded reducer events.** Events carry complete typed payloads; server-success replaces the canonical record without guessed fields. Invalid transitions return unchanged state plus a deterministic developer assertion.

Run: `npm run test:unit -- components/modules/engineering/engineering-workflow.test.ts`  
Expected: all reducer tests pass with `0` skipped tests.

- [ ] **`V8-P4-T01-GREEN-05`: Add selectors.** Export the workflow selectors; derive behavior from validation/output/dirty/record status and no API role assumptions.

Run: `npm run typecheck`  
Expected: exit `0` and no selector/state type errors.

- [ ] **`V8-P4-T01-COMMIT-06`: Commit the workflow state machine and flag.**

Run: `git add lib/features.ts components/modules/engineering/engineering-workflow.ts components/modules/engineering/engineering-workflow.test.ts; if ($?) { git commit -m "feat: define engineering workflow state" }`  
Expected: one commit containing the typed flag, reducer, and Vitest tests; no package or runner changes.

### Task 2 (`V8-P4-T02`): Enforce Calculator-Keyed Reset and Output Invalidation

**Owner:** Frontend engineer  
**Dependencies:** Task 1; Phase 3 create endpoint available to the Playwright API mock  
**Produces:** Safe calculator identity boundary and honest calculation state

- [ ] **`V8-P4-T02-RED-01`: Add Playwright state-leak scenario.** Use unit-bearing steel inputs, calculate/save, dispatch a concrete tab event, and assert complete A/B/A isolation.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "calculator identity"`  
Expected: fails because current component retains previous inputs/output.

- [ ] **`V8-P4-T02-GREEN-02`: Extract keyed workspace and provider shell.** Mount one provider, render keyed workspace, and activate only from the post-transition Phase 1 navigation state. Do not maintain a parallel active tab.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "calculator identity"`  
Expected: passes A -> B -> A reset assertions and discard dialog keyboard behavior.

- [ ] **`V8-P4-T02-RED-03`: Add quantity-input invalidation scenario.** Edit a quantity value or unit and assert output/provenance disappear, controlled status clears, review is unavailable, and saved ID is only an update target.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "invalidates output"`  
Expected: fails because current input handler leaves output visible.

- [ ] **`V8-P4-T02-GREEN-04`: Implement quantity validation and invalidation.** Preserve `QuantityDto` values, validate dimension/unit/min/max/finite rules, clear the full `EngineeringCalculationPayloadV1` output on value or unit change, and never coerce blank to zero.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "invalidates output|input validation"`  
Expected: all invalidation and field-error assertions pass.

- [ ] **`V8-P4-T02-COMMIT-05`: Commit calculator state isolation.**

Run: `git add app/layout.tsx components/modules/EngineeringCalcModule.tsx components/modules/engineering/CalculatorWorkspace.tsx components/modules/engineering/EngineeringWorkflowProvider.tsx e2e/engineering-workflow.spec.ts; if ($?) { git commit -m "fix: isolate calculator workflow state" }`  
Expected: one commit containing keyed reset, invalidation, and their E2E coverage.

### Task 3 (`V8-P4-T03`): Implement Shared Provider Commands and Retry Safety

**Owner:** Frontend platform engineer  
**Dependencies:** Task 2 provider state shell and Phase 3 API client  
**Produces:** One command implementation for module and inspector

- [ ] **`V8-P4-T03-RED-01`: Add Vitest command coordinator tests.** Assert one key per command/retry, version propagation, exact server DTO replacement, and no retry after `412`.

Run: `npm run test:unit -- components/modules/engineering/engineering-commands.test.ts -t "V8-P4-T03"`  
Expected: fails because provider commands do not exist.

- [ ] **`V8-P4-T03-GREEN-02`: Implement command coordinator and provider context.** Keep pure orchestration, dispatch typed outcomes, expose one command API, and abort display updates without compensating writes.

Run: `npm run test:unit -- components/modules/engineering/engineering-commands.test.ts`  
Expected: all key/version/retry/server-replacement assertions pass.

- [ ] **`V8-P4-T03-GREEN-03`: Complete one provider and typed navigation guard.** Expose `requestNavigation(event: NavigationEvent)` for tab/tool/mode/global/back events. If clean, call the shell's existing `dispatchNavigation(event)` immediately; if dirty, retain the exact event and dispatch it only after Discard. Never accept a state-mutating callback. Role/project identity changes use a separate typed `requestContextChange` and do not masquerade as navigation events.

Run: `npm run typecheck`  
Expected: exit `0`; module and inspector consume the same context type.

- [ ] **`V8-P4-T03-GREEN-04`: Handle route and identity changes.** Navigation uses `NavigationEvent`; project/role identity changes use the context-change guard. Confirmed exit clears workflow state.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "route guard"`  
Expected: dirty exit is guarded; confirmed re-entry has no stale record or output.

- [ ] **`V8-P4-T03-GREEN-05`: Guard calculator tabs through Phase 1.** Replace direct tab writes with `requestNavigation({ type:'select-tab', tabKey:key })`. The provider forwards to `dispatchNavigation`; Stay retains source state/focus, Discard dispatches the stored event, and activation follows the resulting navigation state. No `setActiveToolTabKey` call is introduced or retained in Phase 4 code.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "dirty calculator switch"`  
Expected: Stay retains the source calculator and dirty state; Discard activates the target defaults with no source state.

- [ ] **`V8-P4-T03-COMMIT-06`: Commit shared workflow commands.**

Run: `git add app/layout.tsx app/page.tsx lib/module-registry.tsx components/modules/engineering/EngineeringWorkflowProvider.tsx components/modules/engineering/EngineeringDiscardDialog.tsx components/modules/engineering/engineering-commands.ts components/modules/engineering/engineering-commands.test.ts e2e/engineering-workflow.spec.ts; if ($?) { git commit -m "feat: share engineering workflow commands" }`  
Expected: one commit containing one provider, pure command coordinator, tests, and route guards.

### Task 4 (`V8-P4-T04`): Complete Calculate, Update, Save, and Review Semantics

**Owner:** Frontend engineer  
**Dependencies:** Task 3  
**Produces:** Deterministic record lifecycle UI

- [ ] **`V8-P4-T04-RED-01`: Add exact-DTO save flow.** Assert POST then PATCH preserve every `QuantityDto`, `CalculationResultDto`, derivation/assumption/limitation string, `StandardReferenceDto`, schema version, calculator ID, and formula version; clean save sends nothing.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "create update save"`  
Expected: fails because current second save is a no-op and results are presentation strings.

- [ ] **`V8-P4-T04-GREEN-02`: Persist the Phase 2 DTO verbatim.** Send one unchanged `EngineeringCalculationPayloadV1` containing `Record<string, QuantityDto>`, `CalculationResultDto[]`, string-array derivation/assumptions/limitations, `StandardReferenceDto[]`, `schemaVersion`, `calculatorId`, and `formulaVersion`. Do not invent a per-result `reference` field or flatten `quantity`; `toFixed` is display-only.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "create update save"`  
Expected: one create, one update after recalculation, no duplicate create, and exact structured request assertions pass.

- [ ] **`V8-P4-T04-RED-03`: Add review and immutability flows.** Assert clean-save submission, server-owned state, retry safety, immutable controls, and Revise as new; the UI never implies admin status is professional approval.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "review lifecycle"`  
Expected: fails because current review only relies on output and saved ID.

- [ ] **`V8-P4-T04-GREEN-04`: Implement lifecycle-aware actions.** Use selector-driven labels, server actor/time/note, immutable controls, and explicit text that a decision requires an independent registered discipline-competent professional and can never be made by the author.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "review lifecycle"`  
Expected: all lifecycle and immutable-revision assertions pass.

- [ ] **`V8-P4-T04-GREEN-05`: Implement conflict recovery.** Preserve working copy on `412`; offer explicit reload/revise with no silent overwrite.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "version conflict"`  
Expected: both recovery paths pass with no silent retry or overwritten server state.

- [ ] **`V8-P4-T04-COMMIT-06`: Commit controlled record lifecycle UI.**

Run: `git add components/modules/EngineeringCalcModule.tsx components/modules/engineering/CalculatorWorkspace.tsx components/modules/engineering/EngineeringWorkflowProvider.tsx lib/api.ts e2e/engineering-workflow.spec.ts; if ($?) { git commit -m "feat: complete calculation save and review workflow" }`  
Expected: one commit containing structured persistence, lifecycle UI, and conflict recovery.

### Task 5 (`V8-P4-T05`): Provide Secure Project Link Targets

**Owner:** Backend engineer  
**Dependencies:** Phase 3 repository security  
**Produces:** Read-only, project-scoped target adapter for workflow linking

- [ ] **`V8-P4-T05-RED-01`: Add link-target integration tests.** Seed two tenants/projects and canonical targets. For RFIs insert `project_module_records(module_id='issues_rfis', record_type='rfi')` with title/status and validated payload metadata; assert exact mapping, index use, authorized scope, cross-project exclusion, cross-tenant `404`, denied `403`, malformed optional payload omission, and empty arrays.

Run: `npm run test:api -- -Group link-targets`  
Expected: fails because the route does not exist.

- [ ] **`V8-P4-T05-GREEN-02`: Implement the adapter route and exact RFI query.** `GET /api/v1/engineering/link-targets?project_id={id}` requires `engineering.view`, project claim, and organization. RFI SQL selects from `project_module_records pmr JOIN projects p ON p.id=pmr.project_id` with `pmr.project_id=:project_id AND pmr.module_id='issues_rfis' AND pmr.record_type='rfi' AND p.organization_id=:organization_id`, ordered by `pmr.updated_at DESC, pmr.id`; it maps `{id:pmr.id,label:pmr.title,status:pmr.status,number?,discipline?,due_at?}` from the validated payload keys only. Return typed drawing/RFI/meeting arrays with no fixture fallback.

Run: `npm run test:api -- -Group link-targets`  
Expected: PHP lint passes and `Engineering link targets integration: PASS`.

- [ ] **`V8-P4-T05-GREEN-03`: Add typed client access.** Add exact target types and canonical `project_id` query.

Run: `npm run typecheck`  
Expected: exit `0` with exact drawing/RFI/meeting target types.

- [ ] **`V8-P4-T05-COMMIT-04`: Commit secure link-target discovery.**

Run: `git add backend/public/index.php backend/tests/engineering_link_targets_integration.php lib/api.ts; if ($?) { git commit -m "feat: expose engineering link targets" }`  
Expected: one commit containing the protected adapter, typed client, and tenant/project tests.

### Task 6 (`V8-P4-T06`): Implement Linking and Standalone Attachment

**Owner:** Frontend engineer  
**Dependencies:** Tasks 3-5  
**Produces:** Persisted, project-consistent record relationships

- [ ] **`V8-P4-T06-RED-01`: Add link dialog E2E.** Assert create/patch/unlink/restore for all canonical targets and exact version behavior.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "record links"`  
Expected: fails because current ribbon has no link interaction.

- [ ] **`V8-P4-T06-GREEN-02`: Build the accessible link dialog.** Implement focus, keyboard, typed states, and one patch per saved link command.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "record links"`  
Expected: create/update/unlink/restore and keyboard dialog assertions pass.

- [ ] **`V8-P4-T06-RED-03`: Add standalone attachment flows.** Assert unsaved/saved paths, failure retention, denied project, and that the only shell transition after record success is `dispatchNavigation({type:'engineering-attached',projectId})`; the active engineering tool, tab, record, links, and workflow state remain selected.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "attach standalone"`  
Expected: fails because current inspector button only calls `setMode('project')`.

- [ ] **`V8-P4-T06-GREEN-04`: Implement record attachment through Phase 1 navigation.** Module and inspector call the same command. After successful working-copy transition or saved-record patch, call `requestNavigation({type:'engineering-attached',projectId})`, which forwards to `dispatchNavigation`; the Phase 1 reducer selects project mode/origin while preserving the active engineering tool/tab. On error dispatch nothing. Remove mode callbacks/direct setters from the engineering integration.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "attach standalone"`  
Expected: both success paths and the failure/permission path pass; no mode-only attachment remains.

- [ ] **`V8-P4-T06-COMMIT-05`: Commit links and attachment.**

Run: `git add app/page.tsx components/modules/EngineeringCalcModule.tsx components/modules/engineering/CalculationLinksDialog.tsx components/modules/engineering/EngineeringWorkflowProvider.tsx e2e/engineering-workflow.spec.ts; if ($?) { git commit -m "feat: link and attach calculation records" }`  
Expected: one commit containing drawing/RFI/meeting links and both standalone attachment paths.

### Task 7 (`V8-P4-T07`): Integrate Engineering Inspector State

**Owner:** Frontend engineer with design-system familiarity  
**Dependencies:** Tasks 3, 4, and 6  
**Produces:** Accurate inspector that controls the same record state

- [ ] **`V8-P4-T07-RED-01`: Add inspector synchronization E2E.** Assert identity, scope, dirty/output, record/version/status, links, and professional boundary update live.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "engineering inspector"`  
Expected: fails because inspector has no engineering state.

- [ ] **`V8-P4-T07-GREEN-02`: Build `EngineeringInspectorPanel`.** Render truthful selector/server states and state that admin roles alone cannot decide professional review.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "engineering inspector"`  
Expected: inspector follows every state transition immediately.

- [ ] **`V8-P4-T07-GREEN-03`: Wire inspector actions to shared commands.** Use only provider commands and matching selectors; remove generic engineering Attach.

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-phase4.ps1 -Group inspector`  
Expected: typecheck and all shared-command/no-duplicate-request assertions pass.

- [ ] **`V8-P4-T07-GREEN-04`: Preserve non-engineering inspector behavior.** Verify Meetings/Documents project and standalone behavior.

Run: `npx playwright test e2e/engineering-workflow.spec.ts --project=chromium --grep "non-engineering inspector"`  
Expected: existing generic inspector contracts pass.

- [ ] **`V8-P4-T07-COMMIT-05`: Commit engineering inspector integration.**

Run: `git add components/layout/ContextInspector.tsx components/modules/engineering/EngineeringInspectorPanel.tsx e2e/engineering-workflow.spec.ts; if ($?) { git commit -m "feat: show calculation state in inspector" }`  
Expected: one commit containing synchronized engineering inspector behavior and non-engineering regression coverage.

### Task 8 (`V8-P4-T08`): Close Accessibility and Responsive Gaps

**Owner:** Accessibility-focused frontend engineer  
**Dependencies:** Tasks 2, 4, 6, and 7  
**Produces:** WCAG-oriented keyboard, semantic, contrast, and mobile evidence

- [ ] **`V8-P4-T08-RED-01`: Add axe and keyboard tests before remediation.** Import the centrally installed `@axe-core/playwright`; scan six states and test keyboard/focus paths.

Run: `npx playwright test e2e/engineering-accessibility.spec.ts --project=chromium`  
Expected: fails on current semantic/focus gaps; a missing central dependency is a prerequisite failure, not a Phase 4 install step.

- [ ] **`V8-P4-T08-GREEN-02`: Use the central automated scanner.** Reuse the one locked `@axe-core/playwright` version and shared Playwright setup. Fail on critical, serious, or moderate engineering violations; exclusions require a stable issue ID and Phase 8 approval. Do not run `npm install` or edit dependency manifests in this phase.

Run: `npm run typecheck`  
Expected: central axe import and all types resolve with no package changes.

- [ ] **`V8-P4-T08-GREEN-03`: Implement semantic and focus requirements.** Add field associations/errors, live status, disclosures, non-color status, names, busy state, invalid-field/status focus, and dialog restoration.

Run: `npx playwright test e2e/engineering-accessibility.spec.ts --project=chromium --grep "axe|keyboard|focus"`  
Expected: zero targeted axe violations and every keyboard/focus assertion passes.

- [ ] **`V8-P4-T08-GREEN-04`: Prove responsive behavior.** Test Pixel 7 dimensions, stacking, no overflow, reachable actions, dialog/drawer focus, and 200% zoom.

Run: `npx playwright test e2e/engineering-accessibility.spec.ts --project=mobile-chromium`  
Expected: responsive and axe tests pass with no horizontal body overflow.

- [ ] **`V8-P4-T08-COMMIT-05`: Commit accessibility and responsive behavior.**

Run: `git add components/modules/engineering components/layout/ContextInspector.tsx e2e/engineering-accessibility.spec.ts playwright.config.ts; if ($?) { git commit -m "fix: make engineering workflow accessible" }`  
Expected: one commit containing semantic/focus/mobile changes and central axe usage; no dependency changes.

### Task 9 (`V8-P4-T09`): Run End-to-End Workflow and Regression Gates

**Owner:** QA automation engineer  
**Dependencies:** Tasks 1-8  
**Produces:** Complete Phase 4 evidence bundle

- [ ] **`V8-P4-T09-RED-01`: Finalize the stable-ID workflow matrix.** Include all critical flows plus flag-on behavior and flag-off Phase 0 containment; every Playwright title begins with its `V8-P4-*` ID.

Run: `npx playwright test e2e/engineering-workflow.spec.ts e2e/engineering-accessibility.spec.ts`  
Expected: any unimplemented matrix row fails with its named scenario; no scenario is skipped.

- [ ] **`V8-P4-T09-GREEN-02`: Pass targeted frontend gates.** Use the named fail-fast PowerShell script for Vitest, type, lint, desktop, and mobile gates.

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-phase4.ps1 -Group frontend`  
Expected: every command exits `0`, all engineering tests pass, and Playwright reports `0 failed` and `0 skipped`.

- [ ] **`V8-P4-T09-GREEN-03`: Pass API adapter and navigation regressions.** Run Phase 3 `test:api` link targets, backend smoke, Phase 1 rail/tab tests, module count, and non-engineering inspector tests; add a source assertion that Phase 4 contains no `setActiveToolTabKey` call.

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-phase4.ps1 -Group regression`  
Expected: adapter/smoke pass and all targeted rail regressions pass.

- [ ] **`V8-P4-T09-GREEN-04`: Build production bundle.** Build after targeted suites.

Run: `npm run build`  
Expected: Next.js production build exits `0` with no engineering route, serialization, or client-boundary error.

- [ ] **`V8-P4-T09-COMMIT-05`: Commit completed Phase 4 evidence.** Populate observed results under stable evidence IDs, including flag on/off, navigation dispatch, DTO round-trip, RFI source/index/scope, axe, viewport/zoom, build, and professional wording.

Run: `git add docs/v8-remediation/evidence/PHASE_4_RELEASE_EVIDENCE.md; if ($?) { git commit -m "docs: record phase 4 release evidence" }`  
Expected: one commit containing observed evidence only, with every exit-gate approver and result recorded.

## Milestones and Exit Criteria

| Milestone | Estimate | Exit criteria |
|---|---:|---|
| P4.1 State isolation and invalidation | 2-3 person-days | Reducer tests and calculator A/B reset/invalidation E2E pass |
| P4.2 Controlled record lifecycle | 2-3 person-days | Create/update/save/review/conflict/revise semantics pass against Phase 3 contract |
| P4.3 Linking, attachment, and inspector | 2-3 person-days | Three link types, standalone attachment, and shared inspector state pass |
| P4.4 Accessibility and release evidence | 2-3 person-days | Axe, keyboard, focus, mobile, regression, and build gates pass |

## Staffing and Resources

| Role | Allocation | Responsibilities |
|---|---:|---|
| Frontend lead | 0.7 FTE | State architecture, lifecycle semantics, review |
| Frontend engineer | 1.0 FTE | Workspace, links, attachment, inspector |
| Backend engineer | 0.25 FTE | Link-target adapter and integration test |
| Accessibility specialist | 0.3 FTE | Semantics, keyboard/focus, axe review |
| QA automation engineer | 0.5 FTE | Playwright API mocks, desktop/mobile workflows, evidence |
| Engineering domain reviewer | 0.15 FTE | Controlled-record wording and professional-boundary review |

Required resources: Phase 3 test API or deterministic Playwright mocks, authorized/denied identities, two projects in separate tenants, drawing/RFI/meeting target fixtures, desktop and mobile Chromium, and CI artifact retention for traces/screenshots/axe output.

## Person-Day Estimate

| Workstream | Person-days |
|---|---:|
| Reducer/provider and calculator-keyed reset | 2-3 |
| Calculate/update/save/review/conflict semantics | 2-3 |
| Link targets, link UI, and standalone attachment | 1.5-2 |
| Engineering inspector integration | 1-1.5 |
| Accessibility, responsive E2E, regression, evidence | 1.5-2.5 |
| **Total** | **8-12** |

## Dependencies

| Dependency | Direction | Constraint |
|---|---|---|
| Phase 0 containment | Incoming | UI cannot claim controlled/approved status for disabled or professionally unvalidated calculators |
| Phase 2 engine contract | Incoming | Field ranges, output shape, derivation, and enabled state drive validation and persistence |
| Phase 3 API/security | Incoming | DTO, versions, review actions, links, idempotency, and authorization are mandatory |
| Phase 5 design-system tooling | Incoming | Supplies locked axe dependency and accepted focus/status/dialog primitives; Phase 4 does not duplicate tooling |
| Phase 8 release validation | Outgoing | Consumes E2E, axe, responsive, API, and professional wording evidence |

## Acceptance Criteria

- Switching calculator identity replaces the complete visible workflow with target defaults and no stale state.
- Dirty calculator switching and route exit require explicit discard confirmation.
- Input changes immediately clear output/derivation, invalidate controlled state, and prevent review.
- Empty or invalid numeric input is not coerced to zero and receives an associated accessible error.
- First save creates exactly one record; changed saved data updates the same saved record/version; clean save makes no request.
- Structured result metadata, not formatted display strings, is persisted.
- Send to review is available only for a clean saved record and adopts server-returned lifecycle state.
- Under-review and approved records are immutable; Revise as new never overwrites the controlled record.
- Version conflicts preserve the working copy and require an explicit recovery choice.
- Drawing, RFI, and meeting links can be selected, persisted, restored, changed, and removed within the record project.
- Standalone attachment updates the working or server record and changes shell mode only after a successful state transition.
- Module and inspector display and mutate one shared engineering state.
- Engineering inspector states never overstate unsaved output as controlled evidence.
- God Mode does not enable an action denied by the API.
- Desktop/mobile axe, keyboard, focus, workflow E2E, targeted regressions, typecheck, lint, backend adapter, and build gates pass with no skipped critical cases.
- Unit-bearing inputs and every Phase 2 output/provenance field round-trip unchanged; no flattened numeric map or display string is persisted.
- Every shell transition is a Phase 1 `NavigationEvent` passed through `dispatchNavigation`; Phase 4 contains no direct tab/mode/tool/destination setter.
- `engineering_workflow_v2` on and off paths pass, with off mode demonstrably Phase 0-contained and read-only.
- Every named test, CI line, and release artifact carries a stable `V8-P4-*` ID.

## Test and Evidence Plan

| Layer | Evidence | Retention |
|---|---|---|
| `V8-P4-EVID-UNIT` Vitest | DTO/state transitions, invalid actions, selectors, flag defaults/on/off, navigation events, reset purity | CI unit-test artifact |
| `V8-P4-EVID-PROVIDER` Provider | Idempotency, ETag, abort/retry, exact server replacement | CI unit-test artifact |
| `V8-P4-EVID-RFI` API adapter | `project_module_records` payload/index/scope mapping and tenant/RBAC filtering | Backend CI log |
| `V8-P4-EVID-DESKTOP` Desktop E2E | Reset, invalidation, lifecycle, links, attachment, conflict, inspector, flag | Playwright report/traces |
| `V8-P4-EVID-MOBILE` Mobile E2E | Stacking, overflow, dialog/drawer, keyboard/focus, 200% zoom | Playwright report/screenshots |
| `V8-P4-EVID-A11Y` Accessibility | Central axe scans in six states plus keyboard path | Accessibility evidence bundle |
| `V8-P4-EVID-NAV` Regression | Phase 1 dispatch, rail tabs, stale guard, no direct setters, non-engineering inspector | CI log |
| `V8-P4-EVID-BUILD` Build | Typecheck, lint, production build | CI log |
| `V8-P4-EVID-DOMAIN` Domain wording | Independent registered discipline reviewer wording signed by engineering reviewer | Release ticket |

## Risk Register and Mitigations

| Risk | Likelihood/impact | Mitigation |
|---|---|---|
| Calculator switch submits stale record | High/critical | Keyed remount, complete replacement reducer event, dirty guard, A/B E2E |
| Input edit leaves obsolete engineering evidence visible | High/critical | Synchronous invalidation in reducer and review/save selectors |
| Duplicate saves/reviews on retry | Medium/high | Provider retains command key; buttons busy-disable; Phase 3 idempotency evidence |
| Client silently overwrites newer record | Medium/high | Lock version/If-Match and explicit conflict recovery |
| Inspector and module disagree | High/high | One provider above siblings; no inspector-local engineering record state |
| Shell mode claims attachment after failed API call | Medium/high | Saved attachment patches first and changes mode only on success |
| Links cross project or tenant | Medium/critical | Server-scoped target adapter and Phase 3 patch validation; negative integration tests |
| RFI store lacks canonical records in an environment | Medium/medium | Return an honest empty RFI target section; never fabricate component seed targets |
| Review state is mistaken for approval | Medium/high | Distinct status labels and immutable professional-boundary text |
| Dialog/inspector becomes inaccessible on mobile | Medium/high | Semantic dialog/drawer, focus trap/restore, mobile axe and keyboard E2E |
| Provider changes regress other 46 modules | Medium/high | Provider is inert outside engineering; non-engineering inspector and rail regressions |

## Rollback and Contingency Strategy

1. Keep the existing Phase 0 safety gate available independently of the new workflow.
2. Deploy Phase 4 behind the typed, server-evaluated `engineering_workflow_v2` flag defined and tested in `V8-P4-T01`; Phase 3 remains backward compatible for reads.
3. If staging gates fail, set the central flag to `false` and redeploy. The tested off path is Phase 0-contained/read-only and exposes no mutation controls; do not roll back or mutate MariaDB records.
4. If link-target discovery fails, disable only Manage links and show `Link targets unavailable`; calculate/save/review remains governed by the Phase 3 API.
5. If a save/review response is uncertain after a network failure, retry with the same retained idempotency key or reload the record. Never create a replacement record automatically.
6. If a stale-version conflict occurs, preserve the local working copy in memory until the user chooses reload or revise; never force-update.
7. If standalone attachment fails, retain `project_id:null` and standalone shell mode; no compensating detach is needed because mode changes only after success.
8. Rolling back frontend code must leave under-review/approved records readable and immutable; Phase 3 audit and command evidence is retained.

## Deliverables

- Pure engineering workflow state/reducer/selectors.
- Shared workflow provider and typed command API.
- Calculator-keyed workspace with reset, dirty guard, validation, and output invalidation.
- Complete calculate/create/update/save/review/conflict/revise UI semantics.
- Secure engineering link-target adapter and client.
- Accessible drawing/RFI/meeting link dialog.
- Working-copy and saved-record standalone attachment.
- Engineering-specific inspector panel using shared state.
- Desktop/mobile Playwright workflow and accessibility suites.
- Reducer/provider/backend adapter tests and release evidence bundle.

## Phase Exit Gate

Phase 4 is complete only when the frontend lead, backend owner, QA owner, accessibility reviewer, and engineering domain reviewer confirm all of the following:

- [ ] **`V8-P4-EXIT-001`:** A/B/A switching proves complete keyed reset with no workflow leakage.
- [ ] **`V8-P4-EXIT-002`:** Quantity mutation invalidates the full output/provenance and controlled eligibility synchronously.
- [ ] **`V8-P4-EXIT-003`:** Lifecycle and conflict flows match Phase 3 and round-trip the exact Phase 2 DTO.
- [ ] **`V8-P4-EXIT-004`:** Drawing, canonical `project_module_records` RFI, and meeting links pass scope/index/security/synchronization tests.
- [ ] **`V8-P4-EXIT-005`:** Attachment succeeds only through record transition followed by Phase 1 `dispatchNavigation`.
- [ ] **`V8-P4-EXIT-006`:** Inspector reports truthful state and independent professional boundary.
- [ ] **`V8-P4-EXIT-007`:** Central axe, keyboard/focus, mobile, and 200% zoom gates pass.
- [ ] **`V8-P4-EXIT-008`:** Vitest, API, E2E, regression, typecheck, lint, and build exit `0` with stable IDs and no skipped critical tests.
- [ ] **`V8-P4-EXIT-009`:** `engineering_workflow_v2` on/off tests pass; off remains Phase 0-contained/read-only.
