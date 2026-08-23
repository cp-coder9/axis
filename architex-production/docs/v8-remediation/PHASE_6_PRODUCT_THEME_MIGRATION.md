# Phase 6: Product-Wide Theme Migration Across 47 Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved evolved V8 design system to the application shell, global views, and every one of the 47 registered modules in controlled waves while preserving all navigation, workflow, data, calculation, persistence, and authorization behavior.

**Architecture:** Migrate outside-in: first freeze behavior and capture legacy evidence, then migrate shell and global surfaces, then move all 47 modules through six visual-only waves using Phase 5 semantic tokens and primitives. Every wave has its own desktop/tablet/mobile, keyboard, WCAG, reduced-motion, behavior, and visual-regression gate. Shared visual defects are fixed in the design system rather than patched repeatedly in modules.

**Package and runtime contract:** `package.json` currently declares Next.js `^15.4.9`, React/React DOM `^19.2.1`, Playwright `^1.62.1`, and exact TypeScript `5.9.3` and Tailwind CSS `4.1.11`; exact resolved packages come from `package-lock.json`. Phase 5 semantic CSS tokens and primitive APIs are the visual implementation contract. Run all evidence on the same locked CI Node/npm runtime used for Phase 5, record it with `npm run runtime:versions`, and reject evidence from a floating or different runtime.

## Global Constraints

- Documentation source of truth: `docs/superpowers/specs/2026-08-23-v8-remediation-redesign-program-design.md`.
- Phase 5 exit gate and approved visual baselines are mandatory prerequisites.
- Phase estimate: **45-70 person-days of active implementation, automation, review, and integration effort**. Independent approval queue time is elapsed schedule latency and is reported separately, not hidden inside person-days.
- Exactly **47 modules** must be inventoried, migrated, checked, and evidenced; registry IDs remain unchanged.
- Preserve teal, deep ink, mint surfaces, origami iconography, and the Datum line-of-truth identity through semantic tokens and shared primitives.
- No workflow behavior changes: do not change state transitions, API calls, calculations, persistence, authorization, routing, tabs, labels, test IDs, record counts, validation rules, keyboard commands, or success/error outcomes.
- Target **WCAG 2.2 AA** and verify desktop `1440x1000`, tablet `1024x1366`, and mobile `390x844` for every shell/global wave and every module.
- Status meaning must never rely on color alone; focus must remain visible; reduced motion must be honored.
- Do not approve a wave with skipped modules, unreviewed visual diffs, serious/critical axe violations, body-level horizontal overflow, or changed behavior assertions.
- Dark-theme implementation remains out of scope.
- Existing selectors used by `e2e/app.spec.ts`, `e2e/rail.spec.ts`, and `e2e/roles.spec.ts` are contracts and must remain stable unless tests are extended without weakening assertions.
- Every migration task begins with behavior and visual/a11y assertions against the unmigrated surface, then implements the smallest visual-only change.
- Stable Phase 6 audit IDs (`P6-*`) must appear in module metadata, Playwright test titles/annotations, the wave evidence matrix, and exit review. Existing program findings retain their `V8-*` IDs.

---

## Executive Summary

Architex OS currently exposes 47 live modules through one shell, six explicit global destination families, the Datum project surface, the tool registry, God Mode, error/not-found states, and a global feedback overlay. The product is structurally complete, but visual implementation is duplicated across large and small module files. Direct hexadecimal colors, generic Tailwind palettes, fixed widths, fixed canvas geometry, tiny local type sizes, inconsistent tabs/cards/forms/tables/dialogs, unconditional motion, and incomplete mobile behavior make a one-shot theme replacement unsafe.

This phase is a behavior-preserving product migration, not a redesign of workflows. The Phase 5 catalog and primitives are the visual authority. Each wave first records the current interaction contract, adds responsive/visual/accessibility assertions, then replaces only presentation markup and classes. Product design reviews the intended visual result; QA reviews visual diffs; accessibility reviews focus, semantics, zoom, target size, and reduced motion; domain owners verify that workflows still behave identically.

The migration is explicit. Wave 0 covers the shell and cross-cutting surfaces. Waves 1-5 cover all 47 modules grouped by risk and domain. High-complexity reference modules move first to prove primitive sufficiency. Lower-complexity and scaffold-derived modules then migrate by domain. No module is counted complete because it opens; each must pass its own checklist at all three viewports and in keyboard/a11y/visual regression.

## Objectives

1. Migrate the shell, Datum, tool registry, six global destination views, God Mode, feedback overlay, error, and not-found surfaces to Phase 5 tokens/primitives.
2. Migrate all 47 module components in explicit, independently releasable waves.
3. Remove direct brand/status values and duplicated presentational patterns from migrated files.
4. Preserve every existing workflow, route, tab, role, calculation, API, and persistence contract.
5. Provide intentional desktop, tablet, and mobile composition rather than scaled desktop layouts.
6. Establish per-wave visual and accessibility regression gates with approved baseline images.
7. Finish with machine-verifiable registry/file/checklist parity and no unexplained migration exceptions.

## V8 Requirement Coverage

The IDs below are stable Phase 6 audit IDs. Original V8 coverage is explicit: original V8 Phase 1 navigation is preserved while `V8-H07` and `V8-H08` remain owned by remediation Phase 1; original V8 Phase 4's exact registry is migrated 47/47; original V8 Phase 5 God Mode receives responsive, visual, and selected-state treatment while `V8-H05`/`V8-H06` remain behaviorally owned by remediation Phase 7; and original V8 Phase 7's missing responsive/accessibility/visual evidence is produced here. This phase supports but does not independently close those four high findings.

Supporting program medium IDs remain attached to wave evidence: `V8-M03`, `V8-M05`, and `V8-M06` cover destination/metadata/rail presentation parity, while `V8-M04` covers God Mode responsive and selected-state migration. Closure remains with the owning behavioral phases and Phase 8.

| Audit ID | Source requirement and original V8 coverage | Current implementation state | Planned task | Required acceptance evidence |
|---|---|---|---|---|
| `P6-INV-01` | Exact complete product inventory; original V8 Phase 4 | Canonical registry has 47 dedicated modules | Tasks 1, 5-10 | Machine-proven 47/47 union/file/checklist/snapshot parity |
| `P6-ID-01` | Evolved identity across the complete product; original V8 Phase 5 | V8 palette exists but styling is local and inconsistent | Tasks 2-9 | 47/47 module matrix, approved snapshots, static scan |
| `P6-TOK-01` | Semantic tokens/shared primitives; evolved V8 and original Phase 7 quality gap | Phase 5 foundation required; current product mostly direct classes | All migration waves | No forbidden visual literals in migrated files |
| `P6-NAV-01` | Stable shell navigation/workspace chrome; original V8 Phase 1, supporting `V8-H07`/`V8-H08` | Four-layer shell exists with fixed panel widths | Tasks 1-2 | Final Phase 1 manifest parity plus shell behavior and visual evidence |
| `P6-GOD-01` | God/Datum/global destination presentation; original V8 Phase 5, supporting `V8-H05`/`V8-H06` | Repeated headers/cards and fixed Datum canvas | Tasks 3-4 | Global/Datum/God baselines with preserved navigation/authorization assertions |
| `P6-TYP-01` | Intentional typography and density; original V8 Phase 7 evidence | Local text sizes and density vary substantially | Tasks 2-9 | Type/density audit and screenshots |
| `P6-API-01` | Standard cards, tables, forms, statuses, dialogs, workflow ribbons; evolved V8 | Repeated local patterns exist in nearly every module | Tasks 2-9 | Phase 5 primitive usage and component-specific tests |
| `P6-RSP-01` | Desktop/tablet/mobile behavior; original V8 Phases 5 and 7 | Partial responsive utilities; fixed shell/canvases remain | All wave gates | Exact three-viewport run per surface/module |
| `P6-A11Y-01` | Focus, keyboard, motion, contrast; original V8 Phases 5 and 7 | Partial focus and unconditional transitions/pulses | All wave gates | Axe, keyboard, reduced-motion, forced-colors evidence |
| `P6-VIS-01` | Visual regression evidence; original V8 Phase 7 | Existing tests are behavioral and screenshot-on-failure only | Tasks 1, 10 | Approved committed baselines and clean diff run |
| `P6-BEH-01` | No workflow behavior changes; all original V8 phases | Existing E2E covers module open, roles, rail, and reference workflows | All tasks | Existing suites unchanged and green; wave behavior matrices pass |

## Coverage

This phase covers:

- Application root, shell, rails/drawers, navigator, top bar, inspector, workspace spacing, and cross-cutting feedback UI.
- Datum project surface, tool registry, God Mode, command, inbox, documents, finance, knowledge, settings, user management, error, and not-found states.
- Every module ID in the canonical 47-module registry and its corresponding React module component.
- Shared scaffold fallback only as a defensive route; canonical registry modules are all live and must use dedicated components.
- Responsive composition, keyboard/focus, reduced motion, forced colors, status semantics, visual snapshots, and workflow parity.
- Removal of Phase 5 legacy aliases after no production consumer remains.

## Current Evidence

- `scripts/validate-foundation.mjs:16-19` enforces exactly 47 canonical frontend/backend IDs; `e2e/app.spec.ts:3-16` repeats the canonical list and tests every module opens.
- `lib/module-registry.tsx:75-123` maps all 47 module IDs to dedicated React components, with `ScaffoldModule` as fallback.
- `app/page.tsx:177-305` owns the four-layer shell and rendering switch. The root is fixed to `h-screen w-screen overflow-hidden`, the central workspace scrolls, and shell components are always arranged side by side.
- `components/layout/OsRail.tsx`, `ContextNavigator.tsx`, `TopBar.tsx`, and `ContextInspector.tsx` directly encode colors, fixed dimensions, transitions, and selected states.
- `ContextNavigator` has behaviorally important project creation, role filtering, collaboration back paths, God context, grouped tabs, and stable `data-testid` contracts; visual migration must not change those branches.
- `DatumCanvas.tsx` uses a `520px` transformed absolute canvas within a `580px` minimum surface. The seed feedback record explicitly says iPad/phone layouts clip and create horizontal scrollbars.
- `GlobalDestinations.tsx` holds command, inbox, documents, finance, knowledge, and settings in one file and repeats tone arrays, page headers, cards, buttons, and status surfaces.
- `ToolRegistryView.tsx` owns search, group, and status filters; visual migration must preserve filtering and counts.
- `GodModeView.tsx` owns role lenses, lifecycle stages, tool groups, and opt-in exploration semantics; styling must not imply elevated authorization.
- `FeedbackWidget.tsx` owns a keyboard shortcut, async submission/fallback, dialog-like overlay, tabs, categories, and toast, but does not use the Phase 5 dialog/tabs primitives.
- `app/error.tsx` and `app/not-found.tsx` duplicate full-screen state compositions.
- High-complexity modules such as Meetings (`components/modules/MeetingsModule.tsx`) and Practice (`components/modules/PracticeModule.tsx`) contain many internal screens and stateful actions. A visual class replacement without workflow tests is unsafe.
- Current `e2e/rail.spec.ts` verifies synchronized tabs for nine flagship modules and deterministic navigation, but does not provide all-module responsive, axe, or visual coverage.
- `e2e/roles.spec.ts` verifies 20 role dashboards and rail destinations, but uses only the configured desktop Chromium project.
- The original V8 prototype supplies the recognizable shell, Datum plane, cards, origami folds, mint surfaces, and breakpoint intent; production must evolve that identity rather than reproduce prototype fixed geometry.

## Scope

- Replace direct visual values with Phase 5 semantic tokens and primitives.
- Recompose shell regions as desktop columns and tablet/mobile drawers without changing navigation state.
- Establish a mobile Datum list/sequence while retaining the desktop spatial Datum plane and the same tool order/actions.
- Standardize page headers, actions, cards/surfaces, tabs, forms, data tables, statuses, empty/error/loading states, dialogs, toasts, and workflow ribbons.
- Preserve intentional domain accents through semantic roles, not raw module colors.
- Add deterministic visual snapshots and axe checks for every module at every required viewport.
- Add targeted workflow assertions before touching high-risk modules.
- Remove obsolete duplicated presentational CSS/classes and temporary legacy token aliases only after all consumers migrate.

## Explicit Non-Scope

- New features, workflow steps, records, tabs, filters, actions, calculations, APIs, routes, or authorization behavior.
- Copy rewrites except accessibility-only labels required to expose the existing action; visible business labels remain unchanged.
- Information-architecture changes or moving a function to a different module.
- Backend, database, API schema, fixture, calculation formula, or RBAC changes.
- Dark theme, user-selectable themes, white-label themes, or tenant branding.
- Replacing origami icon paths or introducing decorative icon families.
- Storybook or hosted visual-regression services.
- Performance refactors unrelated to rendering regressions caused by migration.
- Closing unrelated pre-existing functional defects discovered during migration; record them and route them to the owning remediation phase.

## Prerequisites

- Phase 5 exit gate passes with approved tokens, primitives, catalog, axe checks, and baseline images.
- Phase 1 navigation contract tests are green and selectors are frozen.
- Phase 2 identifies disabled/deferred calculators and their required status presentation.
- Phase 3/4 workflow and API contracts are stable for modules migrated in each wave; avoid concurrent edits to the same module.
- `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run test:e2e` pass or pre-existing failures are documented with reproducible logs before migration starts.
- Product design supplies approved target compositions for shell, Datum, table-heavy, form-heavy, workflow-heavy, and dense dashboard archetypes.
- QA has deterministic Chromium screenshot infrastructure from Phase 5.
- Accessibility has NVDA, keyboard-only, reduced-motion, forced-colors, and 200% zoom test scripts.
- Module/domain owners are assigned for engineering, meetings, commercial, planning/compliance, site/safety, and platform administration workflows.
- Phase 1's final selector/behavior manifest has replaced Phase 5's `as-found` inventory, `npm run validate:navigation-reconciliation` exits `0`, and no unresolved selector disposition remains.
- `npm run runtime:versions` matches the Phase 5 evidence manifest and `npm ci` completes without changing `package-lock.json`.

## Architecture

### Migration Boundary

Migration changes imports from `components/ui`, class names, layout wrappers, semantic elements, and accessibility attributes needed to expose existing state correctly. It does not change state declarations, reducer/event logic, effect dependencies, API functions, payloads, calculation calls, conditions controlling authorization, tab keys, tool IDs, routing callbacks, or user-visible workflow outcomes.

For every file, review the diff in two passes:

1. **Behavior pass:** ignore styling and prove event handlers, conditions, state, calls, and data are unchanged.
2. **Presentation pass:** verify semantic tokens/primitives, responsive composition, focus, motion, density, and status meaning.

### Executable Per-Surface Migration Contract

Every shell/global/module case is declared once in `e2e/helpers/v8-migration.ts`; specs iterate this metadata rather than maintaining separate ID lists:

```ts
export type V8MigrationCase = {
  auditId: `P6-${string}`;
  id: string;
  wave: 0 | 1 | 2 | 3 | 4 | 5;
  componentFile: string;
  open(page: Page): Promise<void>;
  defaultHeading: string;
  defaultTab?: string;
  majorActions: readonly string[];
  snapshotStem: string;
};

export const VIEWPORTS = {
  desktop: { width: 1440, height: 1000 },
  tablet: { width: 1024, height: 1366 },
  mobile: { width: 390, height: 844 },
} as const;

export async function assertMigrationContract(page: Page, entry: V8MigrationCase): Promise<void>;
export async function assertNoBodyOverflow(page: Page): Promise<void>;
export async function runAxe(page: Page): Promise<{ serious: number; critical: number }>;
export async function captureApprovedState(page: Page, name: string): Promise<void>;
```

For each production surface, perform this exact implementation sequence:

1. Register the audit ID, file, opener, default heading/tab, major existing actions, and snapshot stem; the validator must fail until all required evidence markers exist.
2. Add behavior assertions that invoke existing handlers and compare visible outcome, API request method/path/body where applicable, selected tab/state, disabled state, and return path with the legacy baseline.
3. Add three target `toHaveScreenshot` assertions, `assertNoBodyOverflow`, axe serious/critical count `0`, keyboard entry/focus-visible, and reduced-motion checks; before migration, behavior must pass and target visual/responsive assertions must fail for the named reason.
4. Replace presentation through the Phase 5 APIs: page title/actions with `PageHeader`; regions/cards with `Surface`/`Card`; actions with `Button`/`IconButton`; selected navigation with controlled `Tabs`; labels/errors/units with `Field`; registers with `DataTable`; statuses with `StatusBadge`; overlays with controlled `Dialog`; empty/error/permission states with `EmptyState`; lifecycle display with `WorkflowRibbon`.
5. Do not move or rewrite state, effects, handlers, API calls, conditions, labels, IDs, test IDs, or data. A behavior-pass diff containing those changes fails `P6-BEH-01` unless separately reverted.
6. Run the single-case command, then the entire current wave, all completed waves, design-system suite, and existing behavior suites. Snapshot generation is allowed only after design, QA, accessibility, and required domain reviewers approve the rendered candidate.

### Named Command And RED/GREEN Contract

Add these PowerShell-compatible scripts to `package.json`; scripts do not use `&&`, glob expansion, or POSIX environment assignment:

| Script | Exact value |
|---|---|
| `validate:v8-migration` | `node scripts/validate-v8-migration.mjs` |
| `test:e2e:v8-parity` | `playwright test e2e/v8-workflow-parity.spec.ts --project=chromium` |
| `test:e2e:v8-shell` | `playwright test e2e/v8-shell-visual.spec.ts --project=chromium` |
| `test:e2e:v8-wave-1` | `playwright test e2e/v8-wave-1.spec.ts --project=chromium` |
| `test:e2e:v8-wave-2` | `playwright test e2e/v8-wave-2.spec.ts --project=chromium` |
| `test:e2e:v8-wave-3` | `playwright test e2e/v8-wave-3.spec.ts --project=chromium` |
| `test:e2e:v8-wave-4` | `playwright test e2e/v8-wave-4.spec.ts --project=chromium` |
| `test:e2e:v8-wave-5` | `playwright test e2e/v8-wave-5.spec.ts --project=chromium` |
| `test:e2e:v8-waves` | `playwright test e2e/v8-wave-1.spec.ts e2e/v8-wave-2.spec.ts e2e/v8-wave-3.spec.ts e2e/v8-wave-4.spec.ts e2e/v8-wave-5.spec.ts --project=chromium` |
| `test:e2e:v8-migration` | `playwright test e2e/v8-workflow-parity.spec.ts e2e/v8-shell-visual.spec.ts e2e/v8-wave-1.spec.ts e2e/v8-wave-2.spec.ts e2e/v8-wave-3.spec.ts e2e/v8-wave-4.spec.ts e2e/v8-wave-5.spec.ts --project=chromium` |

Run one case with `npm run test:e2e:v8-wave-N -- --grep "P6-WN-XX <module-id>"`; replace `N`, `XX`, and `<module-id>` with the declared case. Deterministic RED means behavior assertions pass while the command exits nonzero only for explicitly named absent target snapshots, overflow, missing primitive use, or accessibility contract. A runtime error, ambiguous locator, timeout, changed behavior, or unrelated failure is not an acceptable RED. GREEN means exit `0`, no skips/retries, no snapshot write, axe serious/critical count `0`, exact viewport snapshot match, no body overflow, and unchanged behavior assertions. Candidate images are generated only with `npm run test:e2e:v8-wave-N -- --grep "<audit-id>" --update-snapshots` after reviewer authorization; PowerShell performs no wildcard expansion.

### Responsive Shell

- Desktop retains rail, navigator, workspace, and optional inspector with Phase 5 dimensions.
- Tablet keeps the rail compact and moves navigator/inspector to independent overlay drawers. Opening either does not change navigation state or close the active tool.
- Mobile uses a compact top app bar and drawer triggers. The global rail, context navigator, and inspector are modal drawers with focus trap/restore. The workspace is one column and no persistent side panel reduces content below the viewport.
- Existing rail item IDs, tool IDs, back actions, mode switch, role switcher, God Mode toggle, Wingman trigger, inspector trigger, and test IDs remain unchanged.

### Global And Datum Surfaces

- Global pages consume `PageHeader`, `Surface`, `Button`, `StatusBadge`, `Tabs`, `DataTable`, and `EmptyState` as applicable.
- Desktop Datum preserves the line-of-truth spatial metaphor. Tablet reduces card count per row and permits a controlled internal pan only within the Datum surface. Mobile renders the same ordered tools as a vertical connected Datum sequence; click targets call the same `onOpenTool` handlers.
- The Datum rule is visible only on project-truth and workflow linkage surfaces.

### Module Archetypes

- **Dashboard-heavy:** Practice, Feedback, Market Insights, Admin Review.
- **Workflow-heavy:** Meetings, Engineering Calculation, Approvals, Forms, Contract Administration, Payments, EIA, NHBRC.
- **Table/register-heavy:** Documents, BoM, ITP, Safety, Project Passport, Professional Directory, Municipal Tracker, Insurance, NCR, Snags.
- **Canvas/model-heavy:** Datum, SpecForge, BIM/IFC, Council Navigator, Survey/Geomatics, Remote Desktop.
- **Scaffold-derived record workspaces:** modules that graduated from the shared integration shape; migrate through shared primitives but verify their dedicated actions and records.

Archetypes guide visual composition only. They do not merge module code or business models.

### Visual Baseline Model

- Keep **legacy reference captures** outside screenshot assertions during each wave to compare information and controls; do not treat legacy appearance as the target.
- Commit **approved target snapshots** under each Playwright spec snapshot directory after design review.
- Each module has three stable default-view images: `{module}-desktop.png`, `{module}-tablet.png`, and `{module}-mobile.png`.
- High-risk modules add workflow-state images named by state, for example `meetings-review-mobile.png` and `engineering-results-desktop.png`.
- Visual diffs require product-design and QA approval. Updating a snapshot solely to make CI green is prohibited.

### Accessibility Gate

Each surface must have no serious/critical axe violations, logical heading order, landmark/name coverage, visible focus, keyboard reachability, semantic selected/current state, non-color status meaning, reduced motion, forced-colors resilience, no keyboard trap outside an intentional dialog, and usable 200% zoom. Mobile target size follows Phase 5.

## Exact File Map

### Cross-Cutting Files To Modify

- `app/page.tsx`
- `app/error.tsx`
- `app/not-found.tsx`
- `app/globals.css`
- `components/layout/OsRail.tsx`
- `components/layout/ContextNavigator.tsx`
- `components/layout/TopBar.tsx`
- `components/layout/ContextInspector.tsx`
- `components/layout/FeedbackWidget.tsx`
- `components/views/DatumCanvas.tsx`
- `components/views/ToolRegistryView.tsx`
- `components/views/GlobalDestinations.tsx`
- `components/views/GodModeView.tsx`
- `components/views/UserManagementSection.tsx`
- `lib/origami-icons.tsx` only if a missing semantic icon state is proven in Phase 6; path data remains unchanged
- `scripts/validate-design-system.mjs`
- `scripts/validate-foundation.mjs`
- `package.json` only for the named migration-validation/test scripts above; no new UI framework
- `playwright.config.ts` only for shared wave fixtures/reporting that Phase 5 did not already establish

### Wave 1 Module Files: Reference And Flagship Workflows (13)

- `components/modules/MeetingsModule.tsx` (`meetings`)
- `components/modules/PracticeModule.tsx` (`practice`)
- `components/modules/WingmanModule.tsx` (`wingman`)
- `components/modules/EngineeringCalcModule.tsx` (`engineering_calc`)
- `components/modules/TownPlanningModule.tsx` (`planning`)
- `components/modules/MunicipalModule.tsx` (`municipal`)
- `components/modules/XaEnergyModule.tsx` (`xa`)
- `components/modules/FormsModule.tsx` (`forms`)
- `components/modules/SpecForgeModule.tsx` (`specforge`)
- `components/modules/BomModule.tsx` (`bom`)
- `components/modules/ItpModule.tsx` (`itp`)
- `components/modules/SafetyModule.tsx` (`safety`)
- `components/modules/FeedbackModule.tsx` (`feedback`)

### Wave 2 Module Files: Project, Collaboration, And Design Records (10)

- `components/modules/ProjectPassportModule.tsx` (`project_passport`)
- `components/modules/ProjectExplorerModule.tsx` (`project_explorer`)
- `components/modules/ProfessionalDirectoryModule.tsx` (`professional_directory`)
- `components/modules/TeamWorkspaceModule.tsx` (`team_workspace`)
- `components/modules/ActionCentreModule.tsx` (`inbox_action`)
- `components/modules/IssuesRfisModule.tsx` (`issues_rfis`)
- `components/modules/ApprovalsModule.tsx` (`approvals_queue`)
- `components/modules/DocumentsDrawingsModule.tsx` (`documents_drawings`)
- `components/modules/SurveyGeomaticsModule.tsx` (`survey_geomatics`)
- `components/modules/BimIfcModule.tsx` (`bim_ifc`)

### Wave 3 Module Files: Planning And Compliance (7)

- `components/modules/ComplianceHubModule.tsx` (`compliance_hub`)
- `components/modules/EnvironmentalHeritageModule.tsx` (`environmental_heritage`)
- `components/modules/EiaWorkspaceModule.tsx` (`eia_workspace`)
- `components/modules/RefuseCalculatorModule.tsx` (`refuse_calculator`)
- `components/modules/NhbrcEnrolmentModule.tsx` (`nhbrc_enrolment`)
- `components/modules/CouncilNavigatorModule.tsx` (`council_navigator`)
- `components/modules/MunicipalTrackerModule.tsx` (`municipal_tracker`)

### Wave 4 Module Files: Commercial And Procurement (8)

- `components/modules/FeeProposalModule.tsx` (`fee_proposal`)
- `components/modules/InsuranceRegisterModule.tsx` (`insurance_register`)
- `components/modules/RfqMarketplaceModule.tsx` (`rfq_marketplace`)
- `components/modules/SupplierCatalogModule.tsx` (`supplier_catalog`)
- `components/modules/MarketInsightsModule.tsx` (`market_insights`)
- `components/modules/ContractAdminModule.tsx` (`contract_admin`)
- `components/modules/PaymentsEscrowModule.tsx` (`payments_escrow`)
- `components/modules/DisputeResolutionModule.tsx` (`dispute_resolution`)

### Wave 5 Module Files: Site, Close-Out, And Platform Services (9)

- `components/modules/ContractorComplianceModule.tsx` (`contractor_compliance`)
- `components/modules/SiteInstructionsModule.tsx` (`site_instructions`)
- `components/modules/NcrManagerModule.tsx` (`ncr_manager`)
- `components/modules/SnagManagerModule.tsx` (`snag_manager`)
- `components/modules/FmBridgeModule.tsx` (`fm_bridge`)
- `components/modules/RemoteDesktopModule.tsx` (`remote_desktop`)
- `components/modules/CpdLearningModule.tsx` (`cpd_learning`)
- `components/modules/AdminReviewModule.tsx` (`admin_review`)
- `components/modules/IconographyRegistryModule.tsx` (`iconography_registry`)

### Defensive Fallback File

- `components/modules/ScaffoldModule.tsx`: migrate after Wave 2 to keep unknown/future registry fallback visually compatible; it is not one of the canonical 47 completion items.

### Test And Evidence Files To Create

- `e2e/helpers/v8-migration.ts`: canonical viewport fixtures, module opener, axe runner, reduced-motion/forced-colors helpers, overflow and focus assertions
- `e2e/v8-shell-visual.spec.ts`: shell, drawers, global views, Datum, catalog integration, error/not-found, feedback overlay
- `e2e/v8-wave-1.spec.ts` through `e2e/v8-wave-5.spec.ts`: module behavior/a11y/visual matrices
- `e2e/v8-workflow-parity.spec.ts`: high-risk workflow assertions preserved across migration
- `e2e/v8-shell-visual.spec.ts-snapshots/`
- `e2e/v8-wave-1.spec.ts-snapshots/` through `e2e/v8-wave-5.spec.ts-snapshots/`
- `scripts/validate-v8-migration.mjs`: canonical 47 ID, component file, wave membership, checklist, forbidden-literal, and legacy-alias parity validation

### Existing Tests To Preserve And Extend, Not Weaken

- `e2e/app.spec.ts`
- `e2e/rail.spec.ts`
- `e2e/roles.spec.ts`
- `e2e/design-system.spec.ts`

## Detailed Task Checklist

### Deterministic Task Gate Matrix

Wave 0 uses stable sub-IDs `P6-W0-SYS` for feedback/error/not-found and `P6-W0-GLOBAL` for Datum, registry, God Mode, six global destinations, and user management. Canonical module IDs are `P6-W1-01` through `P6-W5-09` exactly as shown in the 47 completion rows.

| Task | Exact RED command and required failure | Exact GREEN command and required result |
|---|---|---|
| 1 | `npm run validate:v8-migration`; nonzero for missing `P6-INV-01` case/evidence metadata, never for a registry count other than the canonical 47 | `npm run validate:v8-migration`, then `npm run test:e2e:v8-parity`; both exit `0`, with 47 unique cases and frozen behavior green |
| 2 | `npm run test:e2e:v8-shell -- --grep "P6-NAV-01"`; behavior passes, target layout/drawer screenshots or assertions fail | Same command exits `0` at all viewports; then `npm run test:e2e -- e2e/rail.spec.ts e2e/roles.spec.ts` exits `0` |
| 3 | `npm run test:e2e:v8-shell -- --grep "P6-W0-SYS"`; legacy behavior passes and target primitive/a11y/visual checks fail | Same command exits `0` with feedback/error/not-found behavior unchanged |
| 4 | `npm run test:e2e:v8-shell -- --grep "P6-GOD-01|P6-W0-GLOBAL"`; behavior passes and target Datum/global/God responsive/visual checks fail | Same command exits `0`; `npm run test:e2e:v8-parity` remains green |
| 5 | `npm run test:e2e:v8-wave-1`; 13 behavior cases pass and only named target checks fail | Same command exits `0` for `P6-W1-01` through `P6-W1-13`; completed shell/parity/design-system suites remain green |
| 6 | `npm run test:e2e:v8-wave-2`; 10 behavior cases pass and only named target checks fail | Same command exits `0` for `P6-W2-01` through `P6-W2-10`; Waves 0-1 remain green |
| 7 | `npm run test:e2e:v8-wave-3`; seven behavior cases pass and only named target checks fail | Same command exits `0` for `P6-W3-01` through `P6-W3-07`; Waves 0-2 remain green |
| 8 | `npm run test:e2e:v8-wave-4`; eight behavior cases pass and only named target checks fail | Same command exits `0` for `P6-W4-01` through `P6-W4-08`; Waves 0-3 remain green |
| 9 | `npm run test:e2e:v8-wave-5`; nine behavior cases pass and only named target checks fail | Same command exits `0` for `P6-W5-01` through `P6-W5-09`; Waves 0-4 remain green |
| 10 | `npm run validate:v8-migration`; nonzero with an explicit remaining literal, alias consumer, evidence gap, or count mismatch | `npm run validate:v8-migration`, `npm run test:e2e:v8-migration`, `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e`, and `npm run build` all exit `0`; no command writes snapshots or lockfiles |

### Task 1: Inventory, Freeze Behavior, And Create Migration Harness

**Role:** QA lead, frontend lead, design-systems engineer.

**Dependencies:** Phase 5 exit gate.

- [ ] Create `scripts/validate-v8-migration.mjs` with failing assertions that the five module waves contain 13, 10, 7, 8, and 9 unique IDs; their union equals the 47 IDs in `e2e/app.spec.ts`/canonical registry; every ID maps to the exact component file in `lib/module-registry.tsx`; and no wave duplicates an ID.
- [ ] Run `npm run validate:v8-migration`; expect the Task 1 RED condition in the gate matrix.
- [ ] Create `e2e/helpers/v8-migration.ts` with exact viewport fixtures (`1440x1000`, `1024x1366`, `390x844`), stable module opening, font readiness, body-overflow check, focus-visible check, axe scan, reduced-motion emulation, forced-colors emulation, and deterministic screenshot setup.
- [ ] Add `e2e/v8-workflow-parity.spec.ts` before production edits. Cover rail destinations/back paths, mode switch, role switch, project selection/creation UI, tool search/filter, God Mode toggle/lens/tool open, feedback shortcut/open/category/validation/submit fallback, and existing high-risk module scenarios.
- [ ] For Meetings, assert schedule wizard steps, consent-gated prejoin, room entry, review decisions, publish guard, and tab reset behavior.
- [ ] For Engineering Calculation, assert calculator switch state isolation, input invalidation, calculate, derivation visibility, save, review, and disabled/deferred status behavior from earlier phases.
- [ ] For Practice, assert dashboard drill-down, tab synchronization, task movement, modal close, and module navigation.
- [ ] For Approvals, assert role-based disabled decisions and required rejection reason behavior.
- [ ] For Tool Registry, assert search, group, status filters, counts, and module open.
- [ ] Run the new behavior suite against the unmigrated product; fix only test determinism, not production behavior, until it passes.
- [ ] Capture legacy reference screenshots for every shell/global surface and all 47 default module views at all three viewports as CI artifacts, not target baselines.
- [ ] Archive baseline outputs from `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e`, and the new parity suite.
- [ ] Run `npm run validate:v8-migration`, then `npm run test:e2e:v8-parity`; expect the Task 1 GREEN condition before shell production edits.
- [ ] Commit with message `test(theme): freeze V8 migration behavior contracts`.

### Task 2 / Wave 0A: Migrate Application Shell And Responsive Drawers

**Role:** Senior frontend engineer; product designer and accessibility lead review.

**Dependencies:** Task 1.

- [ ] Add failing shell tests for desktop four-region layout, tablet overlay drawers, mobile drawer triggers, focus trap/restore, Escape, preserved active destination/tool/tab, no body overflow, and visible current location.
- [ ] Add failing screenshots for default project shell, standalone registry shell, active tool shell, inspector open/closed, expanded/collapsed rail, tablet navigator drawer, tablet inspector drawer, and mobile global/context/inspector drawers.
- [ ] Run `npm run test:e2e:v8-shell -- --grep "P6-NAV-01"`; expect the Task 2 RED condition before shell implementation.
- [ ] Migrate `app/page.tsx` root/workspace to semantic canvas/text/layout tokens without changing state declarations, handlers, branch order, or `ModuleRouter` props.
- [ ] Migrate `OsRail.tsx` to semantic navigation/action tokens and shared action/surface primitives where compatible; consume navigation tones semantically and preserve all item IDs, click handlers, labels, counts, God item behavior, and tooltip names.
- [ ] Migrate `ContextNavigator.tsx` presentation while preserving project creation validation/API call, mode handlers, role filtering, grouped tabs, collaboration/God back routes, `aria-pressed`, and `data-testid` values.
- [ ] Migrate `TopBar.tsx` into desktop layout and tablet/mobile overflow/drawer controls; preserve role select, God toggle, Wingman, inspector, breadcrumb content, and callbacks.
- [ ] Migrate `ContextInspector.tsx` to responsive drawer/desktop panel using `Tabs`, `Surface`, `Button`, and statuses; preserve all three tabs, God warning, attach action, Wingman prompts, and activity content.
- [ ] Implement dialog-grade focus mechanics for tablet/mobile drawers using the Phase 5 overlay contract; opening a drawer must not mutate navigation/product state.
- [ ] Remove ambient project-chip pulse unless it represents a genuinely changing live state; selected/current semantics remain explicit in text and ARIA.
- [ ] Run `npm run test:e2e:v8-shell -- --grep "P6-NAV-01"`; expect the Task 2 GREEN condition at all viewports, reduced motion, forced colors, 200% zoom, and keyboard-only traversal.
- [ ] Product design and QA review target snapshots; commit approved baselines only.
- [ ] Run existing `e2e/rail.spec.ts` and `e2e/roles.spec.ts`; expect unchanged behavior assertions to pass.
- [ ] Commit with message `feat(theme): migrate responsive Architex shell`.

### Task 3 / Wave 0B: Migrate Cross-Cutting Feedback, Error, And Not-Found States

**Role:** Frontend engineer; accessibility and QA review.

**Dependencies:** Task 2.

- [ ] Add failing tests for feedback shortcut, open/close, initial focus, Escape, focus restoration, tab semantics, category selected state, textarea error, async/fallback toast, and mobile keyboard-safe layout.
- [ ] Add failing tests and screenshots for error and not-found states at all three viewports, including long error text and keyboard focus.
- [ ] Run `npm run test:e2e:v8-shell -- --grep "P6-W0-SYS"`; expect the Task 3 RED condition before production edits.
- [ ] Migrate `FeedbackWidget.tsx` to `Dialog`, `Tabs`, `Field`, `Button`, `StatusBadge`, and semantic surfaces without changing shortcut, state, submission payload, fallback behavior, record creation, or messages.
- [ ] Migrate `app/error.tsx` and `app/not-found.tsx` to shared full-page `EmptyState`/surface/action patterns without changing reset/reload/link behavior.
- [ ] Verify feedback dialog has one accessible name, traps/restores focus, and remains reachable at 200% zoom and `390x844` with the software keyboard area approximated.
- [ ] Run `npm run test:e2e:v8-shell -- --grep "P6-W0-SYS"`; expect the Task 3 GREEN condition, then approve snapshots through the independent review gate.
- [ ] Commit with message `feat(theme): migrate global feedback and system states`.

### Task 4 / Wave 0C: Migrate Datum, Tool Registry, God Mode, And Six Global Destinations

**Role:** Product designer, senior frontend engineer, accessibility specialist, QA engineer.

**Dependencies:** Tasks 2-3.

- [ ] Add failing behavior assertions for Datum stage selection, role-prioritized card order, zoom controls on desktop, tool opening, tool registry search/filter/counts, God role/stage/tool interactions, and every global destination action.
- [ ] Add failing screenshots for Datum desktop spatial plane, tablet condensed plane, mobile connected sequence, tool registry filtered/unfiltered, God Mode, and command/inbox/documents/finance/knowledge/settings at all viewports.
- [ ] Run `npm run test:e2e:v8-shell -- --grep "P6-GOD-01|P6-W0-GLOBAL"`; expect the Task 4 RED condition before production edits.
- [ ] Migrate `DatumCanvas.tsx` to semantic headers, surfaces, actions, statuses, and Datum rule. Desktop retains spatial relationships; tablet uses controlled internal layout; mobile renders the same `activeTools` order as a vertical Datum sequence with identical `onOpenTool` calls.
- [ ] Preserve desktop zoom range/reset and expose zoom controls only where scaling remains meaningful; mobile sequence must not silently change active tools or action order.
- [ ] Migrate `ToolRegistryView.tsx` to semantic search field, filter tabs/chips, cards, status badges, and empty results state; preserve `searchQuery`, `selectedGroup`, `filterStatus`, counts, and open handlers.
- [ ] Migrate `GodModeView.tsx` while preserving opt-in exploration wording, role lens, all stages, all tool groups, tool opening, and the distinction between visibility and authorization.
- [ ] Refactor visual repetition inside `GlobalDestinations.tsx` using shared primitives/local presentational helpers in the same file; preserve switch cases and every action callback.
- [ ] Migrate `UserManagementSection.tsx` table, form, status, loading/error/empty, actions, and toast without changing API calls, role checks, or state updates.
- [ ] Verify long project/tool names, Rand values, counts, and status labels at all viewports; no body-level horizontal overflow.
- [ ] Run `npm run test:e2e:v8-shell -- --grep "P6-GOD-01|P6-W0-GLOBAL"`, `npm run test:e2e:v8-parity`, and `npm run test:e2e -- e2e/rail.spec.ts e2e/roles.spec.ts`; expect the Task 4 GREEN condition and all commands to exit `0`.
- [ ] Approve snapshots and commit with message `feat(theme): migrate Datum and global workspaces`.

### Task 5: Wave 1 - Reference And Flagship Workflows (13 Modules)

**Role:** Two frontend engineers with non-overlapping file ownership; domain owners for meetings/engineering/compliance; design, accessibility, and QA reviewers.

**Dependencies:** Task 4 and stable Phase 2/4 behavior for engineering workflows.

- [ ] Add all 13 IDs to `e2e/v8-wave-1.spec.ts` before edits; for each, assert open/default tab, tab synchronization, no body overflow, axe, keyboard entry, reduced motion, and three screenshots.
- [ ] Add workflow-state assertions/screenshots for Meetings schedule/prejoin/review/issued, Practice dashboard/actions/modal, Wingman conversation/import/provenance, Engineering inputs/results/derivation/review, Forms editor/export, SpecForge review/issue, BoM table/anomalies/tender, ITP hold points, Safety file/permits/incidents, and Feedback clusters/roadmap.
- [ ] Run `npm run test:e2e:v8-wave-1`; expect the Task 5 RED condition.
- [ ] Migrate modules one at a time in the checklist order below. Replace repeated headers/tabs/surfaces/statuses/forms/tables/dialogs/workflow ribbons with Phase 5 primitives while leaving state/effects/handlers/data unchanged.
- [ ] After each module, run its targeted parity test and all three viewport screenshots before touching the next module.
- [ ] Fix shared primitive defects in `components/ui`, update catalog tests, and re-run previously migrated modules; do not add module-local copies of shared visual logic.
- [ ] Run `npm run test:e2e:v8-wave-1`, `npm run test:e2e:design-system`, `npm run test:e2e:v8-parity`, and `npm run test:e2e -- e2e/app.spec.ts e2e/rail.spec.ts`; all must exit `0` without snapshot writes.
- [ ] Obtain domain-owner confirmation that visible workflow controls, outcomes, and professional limitations are unchanged.
- [ ] Approve Wave 1 visual diffs and commit with message `feat(theme): migrate flagship module wave`.

#### Wave 1 Module Completion Checklist

- [ ] `P6-W1-01 meetings`: seven tabs and all governed screens preserve consent, review, publish, record, and preference behavior; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W1-02 practice`: seventeen tabs, KPI drill-downs, task movement, sub-module navigation, and modal behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W1-03 wingman`: conversation, BYOAI, provenance, drafting, summary, compliance, provider, and governance states preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W1-04 engineering_calc`: all 17 calculator tabs, input/result isolation, derivation, limitation, save/review states preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W1-05 planning`: eight synchronized tabs and domain records/actions preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W1-06 municipal`: six synchronized tabs and readiness/certificate/outcome actions preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W1-07 xa`: ten synchronized tabs, input calculations, status, and report behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W1-08 forms`: five tabs, editing, drafts, export, and audit interactions preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W1-09 specforge`: ten tabs, pictorial/spec/product/approval/budget/BoM/drawing/issue interactions preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W1-10 bom`: eight tabs, takeoff, line items, anomalies, procurement, QS review, tender, export, and audit behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W1-11 itp`: six tabs, inspection, hold point, materials, lab, and NCR states preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W1-12 safety`: eight tabs, safety file, permit, HIRA, incident, induction, plan, and fall-protection states preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W1-13 feedback`: five tabs, clusters, trends, briefs, and roadmap behavior preserved; desktop/tablet/mobile/a11y/visual pass.

### Task 6: Wave 2 - Project, Collaboration, And Design Records (10 Modules)

**Role:** Frontend engineers, collaboration/project-record domain owner, accessibility and QA.

**Dependencies:** Wave 1 gate.

- [ ] Add all 10 IDs to `e2e/v8-wave-2.spec.ts` first and assert default/open/tab behavior, major actions, responsive overflow, axe, reduced motion, and three screenshots per module.
- [ ] Add targeted parity for passport edits/health, explorer search/relationships, professional verification, team/RACI controls, action status changes, RFI submission/response, approval decisions, document register/transmittals/markups, survey records, and BIM extraction/schedules.
- [ ] Run `npm run test:e2e:v8-wave-2`; expect the Task 6 RED condition.
- [ ] Migrate one module at a time, preserving API calls, role gates, state updates, tab keys, and test IDs.
- [ ] Migrate `ScaffoldModule.tsx` after the ten canonical modules using the same primitives; run a synthetic unknown-tool fallback test without counting it toward 47.
- [ ] Verify table/register surfaces choose intentional mobile behavior and announce horizontal scrolling where retained.
- [ ] Run `npm run test:e2e:v8-wave-2`, `npm run test:e2e:v8-wave-1`, and `npm run test:e2e:design-system`; all must exit `0` without snapshot writes.
- [ ] Approve visual diffs and commit with message `feat(theme): migrate project record module wave`.

#### Wave 2 Module Completion Checklist

- [ ] `P6-W2-01 project_passport`: overview, identity, site/ERF, stakeholders, and health behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W2-02 project_explorer`: search, graph/relationship, orientation, and integration behaviors preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W2-03 professional_directory`: verification, appointment, role, and directory actions preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W2-04 team_workspace`: team, RACI, permissions, and resource actions preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W2-05 inbox_action`: actions, notifications, escalations, all-task filters, status updates, and API fallback preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W2-06 issues_rfis`: issue/RFI records, submission, response, status, and audit behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W2-07 approvals_queue`: pending/submitted/history, role-authority disables, rejection reason, immutable decision, and API fallback preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W2-08 documents_drawings`: register, current set, transmittal, markup/review, revision, and action behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W2-09 survey_geomatics`: cadastral, contour/GIS, record, and integration actions preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W2-10 bim_ifc`: model extraction, element schedules, quantity links, and processing states preserved; desktop/tablet/mobile/a11y/visual pass.

### Task 7: Wave 3 - Planning And Compliance (7 Modules)

**Role:** Frontend engineer, planning/environmental compliance domain owner, accessibility and QA.

**Dependencies:** Wave 2 gate.

- [ ] Add all seven IDs to `e2e/v8-wave-3.spec.ts` first with open/tab/action, responsive, axe, reduced-motion, and visual assertions.
- [ ] Add targeted parity for compliance aggregation, environmental/heritage screening, EIA workflow stages, refuse calculations, NHBRC enrolment/inspection, council drawing review, and municipal SLA alerts.
- [ ] Run `npm run test:e2e:v8-wave-3`; expect the Task 7 RED condition, then migrate one module at a time using the executable per-surface contract.
- [ ] Preserve standards/references, calculation inputs/outputs, required notices, and authority workflow labels exactly.
- [ ] Verify warning/danger/success states use text/icons and meet contrast in default and forced-colors modes.
- [ ] Run `npm run test:e2e:v8-wave-3`, `npm run test:e2e:v8-wave-2`, `npm run test:e2e:v8-wave-1`, and `npm run test:e2e:design-system`; all must exit `0`.
- [ ] Obtain planning/compliance domain approval and visual approval.
- [ ] Commit with message `feat(theme): migrate planning compliance module wave`.

#### Wave 3 Module Completion Checklist

- [ ] `P6-W3-01 compliance_hub`: standard aggregation, evidence, status, and navigation behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W3-02 environmental_heritage`: NEMA/NHRA screening, permit, evidence, and status behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W3-03 eia_workspace`: assessment workflow, participation, records, and stage transitions preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W3-04 refuse_calculator`: inputs, units, outputs, compliance status, and reset/recalculate behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W3-05 nhbrc_enrolment`: registration, fee, inspection, certificate, and workflow states preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W3-06 council_navigator`: drawing markups, comments, revisions, and navigation behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W3-07 municipal_tracker`: tracker, timeline, alert, SLA/status, and action behavior preserved; desktop/tablet/mobile/a11y/visual pass.

### Task 8: Wave 4 - Commercial And Procurement (8 Modules)

**Role:** Frontend engineer, QS/commercial domain owner, accessibility and QA.

**Dependencies:** Wave 3 gate.

- [ ] Add all eight IDs to `e2e/v8-wave-4.spec.ts` first with open/tab/action, currency/data layout, responsive, axe, reduced-motion, and visual assertions.
- [ ] Add targeted parity for fee calculations/proposals, insurance expiry/status, RFQ issue/comparison/award, catalog filter/link, market trend/filter, contract certificates/variations/claims, payment workflow/legal notice, and dispute notices/timelines.
- [ ] Run `npm run test:e2e:v8-wave-4`; expect the Task 8 RED condition, then migrate modules one at a time using the executable per-surface contract.
- [ ] Use tabular utility typography for IDs, quantities, dates, percentages, and Rand values; retain accessible text equivalents and avoid truncating decisive commercial values.
- [ ] Preserve the exact “workflow only” and fund-holding-disabled constraints in `payments_escrow`; visual emphasis must not imply true escrow.
- [ ] Verify tables at tablet/mobile with keyboard-operable internal scroll or domain-approved card composition that preserves all columns/actions.
- [ ] Run `npm run test:e2e:v8-wave-4`, `npm run test:e2e:v8-wave-3`, `npm run test:e2e:v8-wave-2`, `npm run test:e2e:v8-wave-1`, and `npm run test:e2e:design-system`; all must exit `0`.
- [ ] Obtain QS/commercial and legal-notice approval; approve snapshots.
- [ ] Commit with message `feat(theme): migrate commercial procurement module wave`.

#### Wave 4 Module Completion Checklist

- [ ] `P6-W4-01 fee_proposal`: fee basis, work-stage allocations, calculations, proposal, and actions preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W4-02 insurance_register`: policy types, expiry, status, evidence, and actions preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W4-03 rfq_marketplace`: packages, distribution, quote comparison, award, and status behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W4-04 supplier_catalog`: search/filter, product data, pricing, specification links, and actions preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W4-05 market_insights`: indices, trend/forecast, filters, benchmarks, and data states preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W4-06 contract_admin`: certificates, variations, claims, EoT, records, and actions preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W4-07 payments_escrow`: invoices, milestones, approvals, retention, release status, legal notice, and disabled fund-holding meaning preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W4-08 dispute_resolution`: notices, adjudication, mediation, claim timelines, status, and actions preserved; desktop/tablet/mobile/a11y/visual pass.

### Task 9: Wave 5 - Site, Close-Out, And Platform Services (9 Modules)

**Role:** Frontend engineers, site/safety/platform domain owners, accessibility and QA.

**Dependencies:** Wave 4 gate.

- [ ] Add all nine IDs to `e2e/v8-wave-5.spec.ts` first with open/tab/action, responsive, axe, reduced-motion, and visual assertions.
- [ ] Add targeted parity for contractor verification, site instructions/acknowledgement, NCR lifecycle, snag evidence/reinspection, FM export/handover, remote session controls, CPD credits/courses, admin decisions/logs, and icon registry filtering/specimens.
- [ ] Run `npm run test:e2e:v8-wave-5`; expect the Task 9 RED condition, then migrate one module at a time using the executable per-surface contract.
- [ ] Preserve safety/quality severity meaning and platform-admin authority states; disabled controls remain visibly and semantically disabled.
- [ ] Ensure remote desktop/canvas surfaces provide usable mobile fallback information without claiming unsupported interaction changes.
- [ ] Ensure iconography registry consumes the same origami/token contract and does not become a second source of icon truth.
- [ ] Run `npm run test:e2e:v8-waves`, `npm run test:e2e:v8-parity`, `npm run test:e2e:design-system`, and `npm run test:e2e`; all must exit `0`.
- [ ] Obtain site/safety/platform domain approval and visual approval.
- [ ] Commit with message `feat(theme): migrate site platform module wave`.

#### Wave 5 Module Completion Checklist

- [ ] `P6-W5-01 contractor_compliance`: COIDA, tax, CIDB, subcontractor verification, status, and actions preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W5-02 site_instructions`: issue, acknowledgement, cost implication, records, and status behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W5-03 ncr_manager`: issue, severity, root cause, rectification, evidence, and closure behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W5-04 snag_manager`: photos/evidence, trade assignment, reinspection, sign-off, and status behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W5-05 fm_bridge`: asset/COBie export, O&M handover, record, and status behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W5-06 remote_desktop`: session list, launch/stop, file handoff, hosted instance, and status behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W5-07 cpd_learning`: credits, courses, validation, progress, and action behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W5-08 admin_review`: review, logs, tenants, authority gates, acknowledgement, and status behavior preserved; desktop/tablet/mobile/a11y/visual pass.
- [ ] `P6-W5-09 iconography_registry`: icon search/filter, semantic specimens, token references, and registry behavior preserved; desktop/tablet/mobile/a11y/visual pass.

### Task 10: Remove Legacy Styling, Prove 47/47 Completion, And Lock Product Baselines

**Role:** Frontend lead, QA lead, product design lead, accessibility lead.

**Dependencies:** All wave gates.

- [ ] Extend `scripts/validate-v8-migration.mjs` to fail on direct V8 brand/status hex values and disallowed generic status palette classes in migrated production files, while allowing reference values only in `styles/tokens.css` and documented visualization data.
- [ ] Run the validator and remove remaining direct values through semantic tokens/primitives; do not suppress files without a written architecture reason approved in the PR.
- [ ] Remove temporary legacy variable aliases from `app/globals.css` only after the validator proves no production consumer remains.
- [ ] Verify the 47-module union, 47 component mappings, 47 checklist completion markers, and three required default snapshots per module: **141 module baseline images minimum**, plus shell/global/workflow-state images.
- [ ] Re-run all visual specs without `--update-snapshots`; investigate every pixel diff and update only after product-design/QA approval.
- [ ] Run axe across shell, all global views, and all 47 default modules at all three viewports; require zero serious/critical violations and triage lower findings explicitly.
- [ ] Run keyboard-only smoke through rail, drawers, every module tab strip, major forms/tables/dialogs, and all high-risk workflows.
- [ ] Run reduced-motion and forced-colors matrices for shell plus each module archetype; run targeted module checks where unique controls exist.
- [ ] Run 200% zoom checks for shell, all globals, and representative/high-risk screens; no control or content needed to complete existing workflows is lost.
- [ ] Run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e`, all wave specs, and `npm run build`.
- [ ] Review behavior-only diffs to confirm no state/effect/handler/API/calculation/authorization changes entered the phase.
- [ ] Record final sign-offs and commit with message `test(theme): lock 47-module V8 migration baselines`.

## Milestones

| Milestone | Exit criteria | Estimate |
|---|---|---:|
| M6.1 Behavior freeze and harness | Legacy references and parity suite pass | 3-4 person-days |
| M6.2 Shell/global migration | Shell, drawers, Datum, global views, feedback/system states pass | 8-12 person-days |
| M6.3 Wave 1 flagship modules | 13/13 complete with workflow/domain gate | 12-18 person-days |
| M6.4 Wave 2 project/collaboration | 10/10 complete | 6-9 person-days |
| M6.5 Wave 3 planning/compliance | 7/7 complete | 4-6 person-days |
| M6.6 Wave 4 commercial/procurement | 8/8 complete | 5-7 person-days |
| M6.7 Wave 5 site/platform | 9/9 complete | 5-7 person-days |
| M6.8 Product-wide closeout | 47/47 validation, cleanup, complete regression evidence | 2-7 person-days |

## Required Resources

### Design

- Product design lead: shell/global target compositions, wave reviews, final baseline approval.
- Design-systems designer: primitive fit, token discipline, density, responsive archetypes, shared defect resolution.
- Domain UX reviewer for engineering, meetings, commercial, planning/compliance, site/safety, and platform administration.

### Frontend

- Two senior React/TypeScript engineers for parallel waves with strict non-overlapping file ownership.
- One design-systems engineer owning `components/ui`, tokens, and catalog regression.
- Frontend lead performing behavior-vs-presentation diff review.

### Accessibility

- WCAG 2.2 AA specialist for shell/drawer/dialog, module archetypes, status semantics, tables, forms, zoom, reduced motion, and forced colors.
- Manual test access to NVDA with Chromium and Firefox on Windows.
- Keyboard-only and touch-device testing on at least one physical tablet and one physical phone.

### QA And Domain Validation

- QA lead for migration harness, deterministic visual diffs, evidence matrix, and final 47/47 count.
- Product/domain owners for engineering calculations, meetings governance, QS/commercial, planning/environmental compliance, construction safety/quality, and platform administration.
- CI capacity for at least 141 module baseline comparisons plus shell/global/workflow states.
- sRGB design-review display and artifact retention for screenshots, diffs, traces, axe JSON, and command logs.

## Person-Day Estimate

| Workstream | Person-days |
|---|---:|
| Inventory, behavior freeze, canonical metadata, migration harness | 3-4 |
| Shell/global/cross-cutting implementation | 5-7 |
| Shell/global automation, responsive evidence, and active review | 3-5 |
| Per-module implementation across 47 modules | 17-25 |
| Per-module behavior/a11y/viewport automation and evidence across 47 modules | 8-12 |
| Active product-design, accessibility, and domain review across module waves | 5-9 |
| Legacy cleanup, integration reruns, final evidence and exit review | 4-8 |
| **Total active effort** | **45-70** |

The 47-module allowance is explicit rather than treating modules as bulk class replacement: implementation averages **0.36-0.53 person-day per module**, automation/evidence **0.17-0.26**, and active design/accessibility/domain review **0.11-0.19**. Wave 1 modules consume the upper end because their governed workflows and state images are materially larger; scaffold-derived and narrow register modules consume the lower end. These are averages, not per-module caps. A module that does not complete its behavior, three-viewport, a11y, visual, and domain gates consumes additional effort and remains open.

Parallelism can reduce elapsed implementation time but never person-days. It is allowed between modules in the same wave only when engineers do not share a module file. Changes to `components/ui`, token CSS, shell files, test helpers, or snapshot specs have a single owner and are merged before module branches rebase/re-run.

### Independent Approval Latency

The **45-70 person-days includes reviewers' active inspection and decision effort**, but excludes time waiting in an independent approver's queue. Plan elapsed schedule separately: reserve **1-3 business days after each of Wave 0 and Waves 1-5** for product design, QA, accessibility, and applicable domain owners, plus **2-5 business days** for final exit approval. If none of those queues overlap, approval can add **8-23 business days of elapsed latency** without adding person-days. A late or rejected approval extends calendar duration and may add rework effort; it does not justify bypassing or self-approving a gate.

## Dependencies

- Phase 5 foundation is the hard dependency and source of visual truth.
- Phase 0 safety status must remain visible for disabled/deferred engineering outputs.
- Phase 1 navigation selectors, transitions, and back paths are regression contracts.
- Phase 2 professionally validated calculator definitions/statuses must be stable before `engineering_calc` visual migration approval.
- Phase 3 persistence/RBAC state and Phase 4 engineering workflow state must be stable for behavior parity.
- Phase 7 God Mode completion may begin only after shell/global migration; it must consume the migrated God surface rather than restyle it independently.
- Phase 8 release validation consumes all snapshots, axe results, checklist parity, and command logs from this phase.

## Acceptance Criteria

- Shell, Datum, tool registry, God Mode, all six global destination views, user management, feedback overlay, error, and not-found surfaces use Phase 5 tokens/primitives.
- The canonical module matrix is exactly 47/47 with no duplicate, omitted, fallback-only, or unexplained module.
- Every module has approved desktop, tablet, and mobile default-view snapshots and passes its module checklist.
- High-risk workflow-state snapshots and behavior assertions pass for Meetings, Engineering Calculation, Practice, Approvals, Forms, SpecForge, BoM, Safety, commercial/legal, and platform administration flows.
- Existing app, rail, role, API-backed workflow, and module-open tests remain green without weakened assertions.
- No migration diff changes state transitions, API calls/payloads, calculation logic, persistence, authorization checks, navigation IDs, tab keys, labels, or workflow outcomes.
- No migrated file contains forbidden direct brand/status visual values; reference values live only in approved token/visualization sources.
- No serious/critical axe violations exist on required surfaces at any required viewport.
- All keyboard focus is visible; dialogs/drawers trap and restore focus; selected/current/status semantics are exposed.
- Reduced-motion and forced-colors requirements pass; no ambient pulse remains except semantically live recording.
- No body-level horizontal overflow exists at required viewports; intentional table/canvas overflow is contained, keyboard-operable, and visibly indicated.
- The product remains usable at 200% zoom and mobile target sizes meet the Phase 5 floor.
- Legacy aliases and obsolete duplicated styling are removed only after consumer count reaches zero.
- Production build succeeds and the development design-system catalog remains inaccessible in production.
- All stable `P6-*` audit IDs appear in case metadata and the completed evidence matrix; supporting references to `V8-H05` through `V8-H08` remain open/closed only according to their owning remediation phases.

## Test Evidence

| Evidence | Command or method | Passing condition |
|---|---|---|
| Locked runtime | `npm run runtime:versions` | Exactly matches Phase 5 runtime evidence |
| Navigation reconciliation | `npm run validate:navigation-reconciliation` | Final Phase 1 manifest remains reconciled with no unknown dispositions |
| Migration parity | `npm run validate:v8-migration` | 47 unique IDs/files/wave/checklist entries; no forbidden literals or legacy consumers |
| Type safety | `npm run typecheck` | Exit 0 |
| Lint | `npm run lint` | Exit 0 with no new warnings |
| Foundation/backend | `npm run test` | Existing registry/backend checks pass |
| Existing product E2E | `npm run test:e2e` | App, rail, roles, modules, workflows all pass |
| Behavior parity | `npm run test:e2e:v8-parity` | Frozen behavior matrix passes |
| Shell/global visual | `npm run test:e2e:v8-shell` | Behavior, axe, responsive, visual pass |
| Module waves | `npm run test:e2e:v8-waves` | 47/47 at all viewports pass |
| Accessibility | Automated axe plus manual NVDA/keyboard/zoom scripts | No serious/critical findings; manual checklist signed |
| Reduced motion/forced colors | Emulated matrix plus manual Windows check | State remains understandable and operable |
| Visual regression | All specs without `--update-snapshots` | Every approved image matches |
| Production | `npm run build` | Exit 0; no catalog route exposure |

For each wave, attach a matrix with one row per module and columns: behavior, desktop, tablet, mobile, axe, keyboard, reduced motion, forced colors if unique, design approval, QA approval, domain approval, and commit SHA. A wave cannot close with blank cells.

## Risks And Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Visual migration changes behavior inside large components | Controlled workflows regress | Freeze behavior first; two-pass diff review; targeted workflow tests |
| 47-module scope hides omissions | Inconsistent product and false completion | Machine-verified canonical union, explicit checklist, 141 minimum snapshots |
| Shared primitive change regresses earlier waves | Broad visual/interaction break | Single primitive owner; catalog and all prior waves rerun after shared changes |
| Fixed desktop canvases break mobile | Clipping and unusable actions | Explicit mobile Datum sequence and archetype-specific responsive contracts |
| Snapshot volume creates noisy review | Rubber-stamped diffs | Wave-level ownership, stable captures, target-state approval, no bulk blind updates |
| Generic standardization erases domain meaning | Modules become interchangeable | Preserve domain content/structure and semantic accent roles; design/domain review |
| Status colors lose meaning or contrast | Professional risk and WCAG failure | Semantic status primitive with text/icon, contrast and forced-colors tests |
| Concurrent work conflicts in shared files | Lost changes and inconsistent primitives | Non-overlapping module ownership; serialized shared-file changes and rebases |
| Dark-theme readiness causes premature complexity | Scope expansion | Use semantic aliases only; no dark values or controls |
| Legacy aliases remain indefinitely | Design debt persists | Consumer validator and final zero-consumer exit criterion |
| Commercial/payment styling implies unsupported escrow | Legal/product misrepresentation | Preserve workflow-only copy and domain/legal review |
| God Mode styling implies elevated permissions | Security misunderstanding | Preserve exploration warnings and authorization distinction in all viewports |

## Rollback And Contingency Strategy

- Release each wave as a separate, reviewable change set behind normal deployment rollback; never combine all 47 modules into one irreversible commit.
- If shell migration blocks navigation or focus, revert the shell wave as a unit while keeping Phase 5 foundation/catalog. Do not patch navigation state to fit the new layout.
- If a module fails behavior parity, revert that module file and its target snapshots only; it remains on legacy styling and the wave remains open.
- If a primitive causes cross-wave regressions, revert/fix the primitive and rerun catalog plus all completed waves before resuming; do not fork it locally.
- Keep legacy variable aliases until all waves pass. Restore aliases if an untracked consumer appears, then add that consumer to the migration matrix.
- Keep legacy reference captures through Phase 8 so missing controls/content can be detected; they are not shipped product assets.
- Snapshot rollback restores the last approved target only when production code is also rolled back. Never update images to conceal an unexplained diff.
- Functional defects discovered but unrelated to presentation are recorded against the owning remediation phase. Do not fix them opportunistically inside a theme commit.
- Backend records, calculations, authorization, and persisted data require no rollback because this phase must not modify them.

## Deliverables

- Fully migrated responsive shell and cross-cutting feedback/system states.
- Migrated Datum, tool registry, God Mode, six global destination views, and user management.
- All 47 module components migrated and checked in five explicit module waves.
- Defensive scaffold fallback aligned with the design system.
- Behavior-parity, responsive, accessibility, reduced-motion, forced-colors, and visual test harness.
- At least 141 approved default module snapshots plus shell/global/high-risk workflow-state baselines.
- Machine-verifiable 47-module/wave/file/checklist parity and forbidden-literal scan.
- Zero-consumer removal of legacy visual aliases and obsolete duplicated styling.
- Product design, frontend, accessibility, QA, and domain-owner sign-off matrix.

## Exit Gate

Phase 6 is complete only when Wave 0 and Waves 1-5 are independently approved, all 47 module checklist items are checked, the validator proves exact registry/file/wave/snapshot/audit-ID parity, Phase 1 navigation reconciliation remains green, the runtime matches Phase 5 evidence, no workflow behavior changed, all three required viewports pass for every module, all visual diffs are approved, no serious/critical accessibility findings remain, reduced motion/focus/forced colors/zoom gates pass, legacy styling consumers are removed, and the full type/lint/foundation/E2E/build suite is green. Any omitted module, unexplained screenshot update, behavior difference, accessibility regression, responsive overflow, runtime/lock drift, unresolved selector disposition, self-approval, or blank sign-off cell blocks transition to Phase 7/8 release work.
