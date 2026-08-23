# V8 Remediation and Product Redesign Program Design

## Status

Approved design for producing a comprehensive, risk-first implementation program from the verified gaps in `docs/V8_ENGINEERING_GODMODE_INTEGRATION_PLAN.md` and the original `architex_datum_os_integrated_modules_v8_engineering_godmode.html` prototype.

## Purpose

The program will convert the current structurally complete but partially unsafe V8 integration into a validated production implementation. It also evolves the existing V8 visual identity across the complete 47-module product without discarding the recognizable teal, deep-ink, origami, and Datum language.

The output is a master index and nine standalone phase documents. Each phase must be independently understandable, estimable, assignable, testable, and releasable behind an explicit exit gate.

## Planning Principles

1. Engineering safety and data integrity take precedence over visual work.
2. Completed V8 requirements are verified rather than rebuilt.
3. Every phase defines scope, non-scope, dependencies, tasks, evidence, and rollback.
4. Timelines use person-day ranges rather than fixed calendar dates.
5. Work may run in parallel only where dependencies and shared files permit it.
6. No engineering calculator is considered complete without independent professional validation and automated golden tests.
7. MariaDB becomes the canonical calculation-record store; JSON fixtures may remain only for explicit offline/demo fallback.
8. The redesign uses semantic tokens and shared primitives rather than repeated hard-coded styling.
9. Accessibility, responsive behavior, and visual regression evidence are release requirements, not polish tasks.
10. Phase 0's full containment exit gate is mandatory before Phases 1, 2, or 5 start; a partial harness, code merge, or deployment without signed containment evidence is not sufficient.
11. Every audit finding has one immutable V8 finding ID that is registered in the program index and carried through work items, tests, evidence, decisions, and closure.

## Program Structure

| Phase | Document | Purpose | Estimate |
|---|---|---|---:|
| 0 | Engineering Safety Containment | Prevent incorrect calculations from being treated as controlled engineering evidence while remediation proceeds. | 2-3 person-days |
| 1 | Navigation Contract and Global Destinations | Make mode, global destination, tool, tab, rail, and back navigation deterministic and close partial destination content fidelity. | 5-8 person-days |
| 2 | Data Contracts and Calculation Engine Correctness | Establish the canonical unit-bearing persisted DTO and professionally validate all 17 calculators. | 15-25 person-days |
| 3 | MariaDB Persistence, API Security, and RBAC | Implement the canonical calculation repository, complete endpoint parity, and secure lifecycle transitions while preserving the Phase 2 DTO. | 12-18 person-days |
| 4 | Engineering Workflow and Inspector Integration | Isolate calculator state and complete save, review, linking, attachment, and inspector workflows. | 8-12 person-days |
| 5 | Evolved V8 Design System Foundation | Define semantic tokens, typography, layout, components, motion, responsive rules, and accessibility standards. | 8-12 person-days |
| 6 | Product-Wide Theme Migration Across 47 Modules | Apply the evolved identity to the shell, global views, and every module in controlled migration waves. | 45-70 person-days |
| 7 | God Mode Completion and Ecosystem Experience | Complete session-local lifecycle exploration, handoffs, responsive behavior, and accessibility without changing project lifecycle or authorization. | 8-12 person-days |
| 8 | Validation, Documentation, and Release Readiness | Prove functional, engineering, security, accessibility, visual, and documentation correctness. | 12-18 person-days |

Projected total: **115-178 person-days**: minimum `2 + 5 + 15 + 12 + 8 + 8 + 45 + 8 + 12 = 115`; maximum `3 + 8 + 25 + 18 + 12 + 12 + 70 + 12 + 18 = 178`. These are effort estimates, not elapsed-calendar promises. External reviewer booking, standards-body responses, client decisions, and approval waiting are delivery latency tracked separately from person-day effort and are not included in the total. After Phase 0 fully exits, Phases 1, 2, and 5 may overlap subject to the contracts and reconciliation gates below.

## Original V8 Coverage

| Original phase | Current assessment | Remediation phases |
|---|---|---|
| Phase 1: Navigation | Partial | 1 and 8 |
| Phase 2: Data, types, icons | Mostly complete | 2 and 8 |
| Phase 3: Calculation engine/module | Structurally complete, behaviorally unsafe | 0, 2, and 4 |
| Phase 4: Registry | Complete | 8 regression verification |
| Phase 5: God Mode | Partial | 5, 6, 7, and 8 |
| Phase 6: Backend | Partial; persistence architecture incomplete | 3 and 4 |
| Phase 7: Validation | Overstated | 8 |

Every implementation-plan document must contain a V8 coverage table identifying the stable V8 finding or requirement ID, source requirement, current implementation state, planned task, and required acceptance evidence. The master index is the authoritative ID registry: IDs are never renumbered or reused, and a newly discovered finding must be registered there before remediation work starts. Every phase manifest must reconcile its IDs back to exactly one index entry.

## Document Contract

Every phase document will use this structure:

1. Executive summary
2. Phase objectives
3. V8 requirement coverage
4. Current-state evidence
5. Scope
6. Explicit non-scope
7. Prerequisites and dependencies
8. Architecture and data-flow impact
9. Detailed task checklist
10. Milestones and exit criteria
11. Required roles, skills, environments, and tools
12. Person-day estimate by workstream
13. Test and evidence plan
14. Risk register and mitigations
15. Rollback and contingency strategy
16. Deliverables
17. Phase exit gate

Tasks must name likely files or subsystems, identify the responsible role, state dependencies, and define a verifiable completion condition. Broad tasks such as “improve navigation” or “fix calculations” are not acceptable.

## Architecture Boundaries

### Navigation

`lib/navigation.ts` is the source of truth for global destinations and canonical tab resolution. Shell components render this contract but do not duplicate destination metadata. Mode changes execute one transition that updates mode, global destination, active tool, and active tab consistently. Phase 1 explicitly owns the partial `GlobalDestinations` content-fidelity finding as well as transition correctness: its owner inventories each destination's V8-required selectors, labels, quick links, and visible content and obtains product-owner acceptance rather than treating successful routing as complete fidelity.

### Calculation Engine

Calculation definitions remain pure and independent from React and persistence. Inputs use explicit units and validation ranges. Results carry value, unit, pass/fail state, formula/reference metadata, derivation, assumptions, and professional limitations. Phase 2 defines and freezes the canonical unit-bearing persisted DTO for Phases 2-4, including typed input quantities, structured result quantities, formula version and references, derivation, assumptions, limitations, calculator release state, and record-envelope fields needed by persistence. Phase 3 stores and returns that DTO without flattening or redefining engineering fields; Phase 4 uses it as its sole server-record and working-copy boundary.

A professional reviewer must be demonstrably competent in the applicable discipline and calculation method, hold current registration with the applicable statutory or recognized professional body where such registration exists, and be independent of the implementation and evidence production being reviewed. The reviewer cannot be the formula author, fixture producer, implementation owner, or subordinate whose objectivity is impaired by the implementer, and must disclose conflicts. No person or role, including an administrator, may approve their own work or a calculation record they authored.

Each calculator has exactly one production release path: it is `validated` only after the complete automated and independent professional evidence gate passes, or it remains technically `contained` with record and controlled-evidence actions blocked. `Disabled` and `deferred` are documented disposition reasons for a contained calculator, not alternative executable release states. External approval waiting affects calendar forecasts but does not consume person-day effort unless review work is actively performed.

### Persistence

The API depends on a calculation repository interface implemented by MariaDB. Routes enforce identity, organization tenancy, project access, permissions, valid state transitions, and request schemas. JSON data is not a second writable source of truth.

### Engineering UI

Calculator identity owns its input, output, dirty, saved-record, and review state. A calculator change cannot reuse another calculator's state. Input changes invalidate previous output and controlled-record status. Linking and inspector surfaces consume the same record state rather than separate copies.

### Design System

Semantic tokens define color, typography, spacing, radius, elevation, motion, focus, status, and data visualization. Shared shell and module primitives encode the evolved V8 identity. Module migrations consume primitives and tokens without redesigning business workflows. Phase 5 may start beside Phase 1 from a recorded baseline selector and surface inventory, but it must reconcile changed selectors, navigation states, destination metadata, and shell contracts against the accepted Phase 1 contract before Phase 5 can exit.

### God Mode

God Mode is an opt-in exploration state, not an authorization bypass. Lifecycle actions navigate to a project Datum exploration context that exposes stage-relevant workspaces without changing protected-data access. The stage selected for exploration belongs only to the active God Mode session; it must not update the project's durable lifecycle stage, project history, or persistence payload, and exiting God Mode discards it. Role lenses affect explanation and emphasis, not permissions.

## Theme Direction

The redesign evolves rather than replaces V8:

- Preserve Architex teal, deep ink, mint surfaces, origami iconography, and the Datum line-of-truth metaphor.
- Introduce semantic color roles so modules no longer depend directly on hexadecimal values.
- Establish a deliberate display, body, and utility typography hierarchy.
- Improve information density for professional workflows while retaining scanability.
- Standardize shell navigation, cards, tables, forms, status treatments, empty states, dialogs, and workflow ribbons.
- Support desktop, tablet, and mobile layouts with explicit breakpoint behavior.
- Provide visible focus, keyboard operation, reduced-motion support, minimum contrast, and selected-state semantics.
- Prepare token architecture for a future dark theme, but dark-theme implementation is outside this program unless separately approved.

## Validation Strategy

Validation is layered:

1. Pure calculation unit tests with professionally approved golden fixtures and dimensional checks.
2. Repository and API integration tests against MariaDB, including RBAC, tenancy, validation, lifecycle, and idempotency.
3. Component and E2E tests for navigation state, calculator switching, persistence, review, God Mode, and every critical workflow.
4. Accessibility tests for keyboard operation, focus, semantic state, and automated WCAG checks.
5. Visual regression baselines for the shell, global destinations, flagship modules, foundation modules, and representative graduated modules at desktop, tablet, and mobile widths.
6. Documentation parity checks for module counts, endpoint lists, migration names, test totals, and completion status.

## Program Risks

| Risk | Program response |
|---|---|
| Incorrect engineering evidence reaches users | Phase 0 containment and professional approval gates |
| Formula remediation expands beyond available expertise | Calculator-by-calculator validation owners; unapproved calculators remain contained with explicit disabled/deferred dispositions |
| Dual persistence causes divergent records | One repository contract and MariaDB canonical-store migration |
| Full redesign changes business behavior | Visual-only migration waves with workflow regression tests |
| Forty-seven-module migration creates inconsistent quality | Shared primitives, module inventory, wave gates, and visual baselines |
| Navigation fixes regress existing tool entry points | Transition-matrix tests for every source and destination |
| Phase 5 exits against obsolete selectors while Phase 1 changes navigation | Baseline inventory permits parallel start, but Phase 1 contract reconciliation is a mandatory Phase 5 exit condition |
| God Mode is mistaken for elevated authorization or changes project lifecycle | Separate session-local exploration state from permission evaluation and durable project stage; test both non-bypass and non-persistence |
| Professional review is conflicted, unqualified, or delayed | Competence and registration evidence, strict independence and no-self-approval rules; track booking/approval latency outside effort |
| Migration and integrated validation effort is understated | Use the revised Phase 6 and Phase 8 ranges, bounded waves, evidence sampling controls, and explicit scope-change decisions |
| Documentation becomes stale again | Machine-verifiable counts and release documentation gate |

## Completion Definition

The program is complete only when:

- Every V8 finding in the stable index is assigned and traceable to implementation, test, evidence, and an explicit closure or accepted non-release disposition; all critical and high findings are closed with evidence.
- All 17 calculators are either independently approved and `validated`, or remain `contained` with a documented disabled/deferred reason and all record/controlled-evidence paths blocked.
- Calculation records are durable in MariaDB with secure lifecycle transitions.
- The Phase 2 unit-bearing persisted DTO is the unchanged canonical engineering payload across Phases 2-4.
- Navigation transitions are deterministic across project, standalone, global, inbox, and God Mode contexts.
- Every `GlobalDestinations` surface meets its accepted content-fidelity inventory as well as its routing contract.
- Every module uses the evolved semantic theme and passes its migration acceptance checklist.
- God Mode lifecycle and handoff exploration work as described without changing authorization or persisting the exploration-selected stage to the project.
- Functional, engineering, security, accessibility, visual, and documentation suites pass.
- The master V8 coverage matrix contains no unexplained partial or overstated completion claims.

## Planned Outputs

- `docs/v8-remediation/README.md`
- `docs/v8-remediation/PHASE_0_ENGINEERING_SAFETY_CONTAINMENT.md`
- `docs/v8-remediation/PHASE_1_NAVIGATION_CONTRACT.md`
- `docs/v8-remediation/PHASE_2_CALCULATION_ENGINE.md`
- `docs/v8-remediation/PHASE_3_PERSISTENCE_SECURITY.md`
- `docs/v8-remediation/PHASE_4_ENGINEERING_WORKFLOW.md`
- `docs/v8-remediation/PHASE_5_DESIGN_SYSTEM_FOUNDATION.md`
- `docs/v8-remediation/PHASE_6_PRODUCT_THEME_MIGRATION.md`
- `docs/v8-remediation/PHASE_7_GOD_MODE_COMPLETION.md`
- `docs/v8-remediation/PHASE_8_VALIDATION_RELEASE.md`

The workspace is not a Git repository, so this specification cannot be committed in the current environment.
