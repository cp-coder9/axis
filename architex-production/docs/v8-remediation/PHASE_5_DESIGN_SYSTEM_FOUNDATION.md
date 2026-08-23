# Phase 5: Evolved V8 Design System Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the semantic tokens, typography, responsive rules, accessible interaction standards, reusable primitives, component catalog, and visual baselines required to migrate the complete Architex OS product without changing workflow behavior.

**Architecture:** Keep Tailwind CSS v4 as the utility engine, but move visual decisions into semantic CSS custom properties and focused React primitives. Expose the foundation through an in-app development catalog tested by the existing Playwright harness; do not introduce Storybook in this phase. The teal, deep-ink, mint, origami, and Datum identity remains recognizable while typography, density, state communication, focus, motion, and responsive behavior become explicit contracts.

**Package and runtime contract:** `package.json` currently declares Next.js `^15.4.9`, React/React DOM `^19.2.1`, Playwright `^1.62.1`, and exact TypeScript `5.9.3` and Tailwind CSS `4.1.11`; `package-lock.json`, not this plan, determines the resolved package versions. CSS custom properties, local WOFF2 fonts through `next/font/local`, `@axe-core/playwright`, and Node.js validation scripts remain the implementation stack. Execute all evidence on the repository's locked CI Node/npm runtime, record it with `npm run runtime:versions`, and block implementation if the runtime is not pinned by the repository or CI image.

## Global Constraints

- Documentation source of truth: `docs/superpowers/specs/2026-08-23-v8-remediation-redesign-program-design.md`.
- Preserve Architex teal, deep ink, mint surfaces, origami iconography, and the Datum line-of-truth metaphor.
- Phase estimate: **8-12 person-days**.
- Target **WCAG 2.2 AA** for contrast, focus visibility, keyboard operation, target size, semantics, and reduced motion.
- Support desktop, tablet, and mobile at the exact verification viewports `1440x1000`, `1024x1366`, and `390x844` CSS pixels.
- Dark-theme readiness is required in token naming; dark-theme implementation is out of scope.
- Do not alter navigation, calculation, persistence, authorization, record lifecycle, workflow state, labels, or business rules.
- Do not replace origami icons with a generic icon library.
- Do not add component APIs unless at least one shell, global-view, or module migration in Phase 6 will consume them.
- New visual values must enter production through semantic tokens; arbitrary hexadecimal values are allowed only in the token source and documented data-visualization palettes.
- Every task starts with a failing automated, static-contract, accessibility, or visual assertion and ends with recorded passing evidence.
- Stable requirement IDs in this plan (`P5-*`) must appear in test titles or annotations and in the Phase 5 evidence manifest; applicable program finding IDs remain `V8-H05` through `V8-H08` and are not renumbered.
- Supporting medium IDs are preserved in evidence: `V8-M03`, `V8-M05`, and `V8-M06` accompany navigation/destination reconciliation; `V8-M04` accompanies responsive, selected-state, focus, and accessibility foundation work.

---

## Executive Summary

The current product retains the V8 palette and origami language, but it does not yet have a design system. `app/globals.css` defines a small set of brand variables while `app/page.tsx`, shell components, global views, and module components repeat hard-coded colors, tiny type sizes, radii, spacing, focus behavior, and motion. The original V8 prototype also contains two overlapping density generations: an early compact `8px-10px` interface and a later v5 usability expansion. That history is visible in production as locally chosen styles rather than a coherent hierarchy.

This phase creates the migration contract before product-wide restyling begins. The foundation is deliberately restrained: deep ink carries structure, mint creates orientation and selected-state surfaces, teal marks the Datum and primary action path, and origami folds remain the signature visual grammar. A locally hosted display/body/utility typography system, two intentional density modes, semantic status roles, accessible focus, reduced motion, and responsive shell measurements make the identity usable for professional, data-dense workflows.

The component catalog decision is **an in-app development catalog, not Storybook**. The repository already has Next.js routes and Playwright but no Storybook, Vite, component-test runner, or snapshot service. Adding Storybook would create a second bundler and styling environment before the migration. The catalog will render real primitives and states under `/design-system`, will be unavailable in production builds, and will become a stable Playwright visual and accessibility target. Storybook can be reconsidered after Phase 6 if external package distribution or non-engineering design review requires it.

## Objectives

1. Convert V8 brand values into semantic color, typography, spacing, shape, elevation, motion, focus, density, layout, and data-visualization tokens.
2. Define an evolved identity that is recognizably Architex rather than a generic dashboard theme.
3. Provide primitive React components for repeated shell and module patterns without absorbing business behavior.
4. Establish exact desktop, tablet, and mobile layout contracts and touch-target rules.
5. Make keyboard focus, selected state, status meaning, contrast, and reduced motion testable release requirements.
6. Establish an existing-stack-compatible component catalog and approved visual baselines before module migration.
7. Give Phase 6 a mechanical migration path away from hard-coded visual values.

## V8 Requirement Coverage

The IDs below are stable Phase 5 audit IDs. Original V8 coverage is explicit: this foundation supports original V8 Phase 5 (God Mode identity, responsive and selected-state accessibility) and closes the visual/accessibility evidence gaps identified under original V8 Phase 7 (Validation). It also protects original V8 Phase 1 navigation while remediation Phase 1 resolves `V8-H07` and `V8-H08`; Phase 5 does not claim those navigation findings closed.

| Audit ID | Source requirement and original V8 coverage | Current implementation state | Planned task | Required acceptance evidence |
|---|---|---|---|---|
| `P5-ID-01` | Preserve teal, deep ink, mint, origami, and Datum identity; original V8 Phase 5 | Palette and origami icons exist; application is inconsistent | Tasks 1-4 | Token manifest, identity board, approved catalog screenshots |
| `P5-TOK-01` | Semantic visual roles; original V8 Phases 5 and 7 | Brand variables exist, but components use direct hex/Tailwind colors | Tasks 1-2 | Static token validation and zero undocumented foundation values |
| `P5-TYP-01` | Deliberate display/body/utility typography; original V8 Phase 7 quality evidence | Browser/system sans is used globally; type sizes are locally selected | Task 3 | Font loading check, type specimen baseline, no layout shift |
| `P5-DEN-01` | Professional information density; original V8 Phase 5 usability evolution | Prototype and production mix compact and enlarged scales | Tasks 2-4 | Comfortable/compact density specimens and target-size tests |
| `P5-API-01` | Shared shell/module primitives; original V8 Phases 5 and 7 | Repeated cards, buttons, tabs, forms, status, tables, dialogs | Tasks 5-7 | Primitive catalog states and component contracts |
| `P5-RSP-01` | Explicit responsive behavior; original V8 Phase 5 | Prototype has coarse breakpoints; production shell is fixed-width/fixed-height | Tasks 2, 4, 8 | Three-viewport catalog and shell-layout contract tests |
| `P5-A11Y-01` | Visible focus and keyboard operation; original V8 Phases 5 and 7 | Focus styling is partial and often `focus:outline-none` | Tasks 2, 5-8 | Keyboard walkthrough and axe evidence |
| `P5-MOT-01` | Reduced-motion support; original V8 Phase 7 | Transitions and pulse animations are unconditional | Tasks 2, 5, 8 | Emulated reduced-motion screenshots and assertions |
| `P5-VIS-01` | Visual regression evidence; original V8 Phase 7 | Failure screenshots exist; no committed golden suite | Tasks 8-9 | Committed baseline images and clean comparison run |
| `P5-THM-01` | Future dark-theme readiness; evolved V8 requirement | Tokens are light-theme values without explicit semantic layering | Tasks 1-2 | Semantic alias structure with no dark implementation |
| `P5-NAV-01` | Preserve and reconcile navigation selectors/behavior; original V8 Phase 1, supporting `V8-H07`/`V8-H08` | Phase 1 may still be changing navigation when Phase 5 starts | Task 0 and exit reconciliation | As-found inventory plus zero unexplained differences against Phase 1 final manifest |

## Coverage

This phase covers the design contract consumed by the shell, global destinations, and all 47 modules in Phase 6. It covers token definitions, typography assets, base CSS, responsive/density rules, reusable presentational primitives, origami icon states, catalog specimens, automated design-contract checks, axe integration, and representative visual baselines.

It does not migrate all product screens. Only the catalog and the minimum shell-level wiring necessary to load tokens/fonts and prove compatibility are changed here. Product surfaces retain their current appearance until their Phase 6 wave.

## Current Evidence

- `app/globals.css:4-38` defines brand and dimensional variables, but names such as `--teal`, `--deep`, `--white`, and `--green` describe raw values rather than semantic use.
- `app/page.tsx:178` hard-codes the application canvas and text colors; `app/page.tsx:229` uses broad responsive padding without a complete shell adaptation.
- `components/layout/OsRail.tsx:29-39` repeats global navigation tones instead of consuming `lib/navigation.ts`; `components/layout/OsRail.tsx:43-46` fixes rail widths directly in JSX.
- `components/layout/ContextNavigator.tsx:123-126` and `components/layout/ContextInspector.tsx:41` fix panel widths at `306px` and `344px`, which leaves no mobile drawer contract.
- `components/layout/TopBar.tsx:40-145` contains repeated direct colors and hides controls progressively, but has no explicit overflow or mobile action strategy.
- `components/views/DatumCanvas.tsx:200-337` uses a fixed spatial canvas and absolute cards. Existing seed feedback in `lib/data.ts:1267-1274` explicitly reports clipping and horizontal scroll on iPad/phone.
- `components/views/GlobalDestinations.tsx` repeats page headers, cards, action styles, semantic status colors, and inline tone values across six destinations.
- `components/modules/ScaffoldModule.tsx` demonstrates repeated header, tabs, surfaces, records, badges, and toast patterns that should be primitives.
- `components/modules/MeetingsModule.tsx` and `components/modules/PracticeModule.tsx` contain rich, behaviorally important workflows with extensive one-off visual state classes. These are reference cases for primitive sufficiency, not Phase 5 migration targets.
- `app/error.tsx` and `app/not-found.tsx` duplicate full-page states and action styling.
- A repository-wide UI scan returns hundreds of direct hexadecimal and generic palette classes; status meaning is therefore not centrally controlled.
- The original V8 prototype defines `--teal:#19B7B0`, `--deep:#167E79`, `--ink:#102033`, mint/aqua surfaces, origami folds, the Datum line, and responsive breakpoints at `1260`, `1050`, and `760` pixels. A later v5 section increases rail/nav/inspector dimensions and font sizes, proving that density evolved without a formal token contract.
- `playwright.config.ts` currently runs only Desktop Chrome and retains screenshots only on failure; there is no committed visual baseline or accessibility scanner.
- `package.json` has no Storybook, axe, unit-component, or visual-regression dependency.

## Scope

- Semantic color aliases for canvas, surface, text, border, action, focus, status, data visualization, Datum, and role/tool accents.
- A two-tier token architecture: immutable reference values and semantic aliases consumed by components.
- Intentional local typography with display, body, and utility roles.
- Comfortable and compact density contracts; compact is opt-in through `data-density="compact"` and never reduces touch targets below the accessible floor.
- Breakpoint and shell dimension contracts for desktop, tablet, and mobile.
- Motion duration/easing tokens, meaningful transition guidance, and reduced-motion overrides.
- Accessible focus ring, forced-colors resilience, keyboard behavior, and selected-state semantics.
- Origami icon sizing, current-color behavior, fold treatment, and motion policy.
- Presentational primitives: button, icon button, surface/card, page header, badge/status, tabs, field, table frame, dialog, empty state, and workflow ribbon.
- Development-only in-app catalog and Playwright visual/a11y coverage.
- Static validation that prevents new direct brand/status colors in migrated files.

## Explicit Non-Scope

- Product-wide shell/global/module migration, which belongs to Phase 6.
- Workflow redesign, content redesign, information-architecture changes, new product actions, or changed tab/navigation behavior.
- Dark-theme implementation or user theme preference controls.
- A public component package, package publishing, Storybook, Chromatic, Percy, or another hosted visual service.
- Replacing Tailwind CSS, adopting a third-party component suite, or introducing CSS-in-JS.
- Rebuilding `OrigamiIcon` path data or replacing its visual language.
- Changes to APIs, MariaDB, calculation formulas, RBAC, persistence, or project data.
- Full data-chart abstraction; this phase defines palette and accessibility rules only.
- Production enablement of `/design-system`.

## Prerequisites

- Phase 0 containment remains active for any unsafe engineering outputs.
- Phase 5 may start immediately after Phase 0 and may run in parallel with Phase 1. Phase 1 exit is **not** an entry prerequisite.
- At Phase 5 entry, freeze only the selectors, IDs, labels, and observable navigation behavior that exist in the current working baseline. Mark that inventory `as-found`; do not describe it as the final navigation contract and do not modify navigation behavior to make the inventory pass.
- Before Phase 5 exit, obtain Phase 1's final selector/behavior manifest, reconcile every difference, update foundation tests to the final contract without weakening assertions, and require joint Phase 1/Phase 5 owner sign-off. Any unexplained selector or behavior difference blocks M5.4.
- Phase 2 calculation remediation may run in parallel, but must not share `components/modules/EngineeringCalcModule.tsx` ownership during foundation review.
- Phase 3/4 backend and workflow work may run in parallel because Phase 5 does not alter data contracts.
- Product design approves the evolved identity board before primitive implementation.
- Accessibility lead approves contrast targets, focus treatment, keyboard contracts, and density floor.
- Font licenses and exact WOFF2 files are reviewed before adding binaries.
- A clean baseline run of `npm run typecheck`, `npm run test`, and `npm run test:e2e` is archived before implementation.
- The repository or CI image pins Node and npm. Record the locked versions with `npm run runtime:versions`; a floating local runtime is not acceptable evidence.

## Architecture

### Identity Direction

The evolved V8 identity is **Datum drafting desk**: deep ink supplies the stable technical frame; mineral white and mint sheets create layered work surfaces; calibrated teal draws the single line of truth and primary action path; origami folds signal transformation, linkage, and handoff. The aesthetic risk is a restrained **Datum rule** that can cross a page header, workflow ribbon, or selected surface as a precise 2px line with one folded junction. It is used only where information is connected to project truth, not as decoration.

### Color Contract

Reference values remain recognizable:

| Reference token | Value | Purpose |
|---|---:|---|
| `--ax-ref-teal-500` | `#19B7B0` | Datum line, active emphasis |
| `--ax-ref-teal-700` | `#167E79` | Accessible teal text/action |
| `--ax-ref-ink-950` | `#102033` | Primary structure and text |
| `--ax-ref-mint-200` | `#BFE9E2` | Strong mint surface |
| `--ax-ref-mint-100` | `#DFF5F2` | Orientation/selected surface |
| `--ax-ref-paper-50` | `#F5FAF9` | Application canvas |
| `--ax-ref-violet-600` | `#7C4DDB` | Wingman/God exploration semantic role |
| `--ax-ref-coral-600` | `#D95747` | Critical/error foreground |
| `--ax-ref-amber-700` | `#8A5A00` | Warning foreground |
| `--ax-ref-green-700` | `#218956` | Success foreground |

Semantic aliases include `--ax-canvas`, `--ax-surface-1`, `--ax-surface-2`, `--ax-text`, `--ax-text-muted`, `--ax-border`, `--ax-border-strong`, `--ax-action-primary`, `--ax-action-primary-hover`, `--ax-action-secondary`, `--ax-focus`, `--ax-selection`, `--ax-datum`, `--ax-status-info-*`, `--ax-status-success-*`, `--ax-status-warning-*`, `--ax-status-danger-*`, and `--ax-status-neutral-*`. Components consume aliases, never reference tokens. Status is always encoded by icon/text as well as color. The ordered data series is fixed as teal `#167E79`, cobalt `#2563EB`, amber `#B77900`, violet `#7C4DDB`, coral `#D95747`, green `#218956`, cyan `#087E8B`, and ink `#526074`; charts must also use labels, symbols, line styles, or patterns so adjacent meaning does not depend on hue.

### Typography Contract

- **Display:** Manrope Variable, local WOFF2, weights `600-800`; used for product/page titles and critical numeric summaries, never body copy.
- **Body:** IBM Plex Sans Variable, local WOFF2, weights `400-700`; used for controls, prose, tables, and navigation.
- **Utility/data:** IBM Plex Mono Variable, local WOFF2, weights `400-600`; used only for IDs, codes, units, timestamps, revisions, and aligned figures.
- Type tokens use a restrained scale: `11`, `12`, `13`, `14`, `16`, `20`, `24`, `32` CSS pixels with corresponding line heights. No essential interactive text is below `12px`; `11px` is limited to nonessential metadata with sufficient contrast.
- Numeric tables use tabular figures. Uppercase utility labels use letter spacing only at `11px` or above.

### Density And Spacing

- Base spacing unit is `4px`; named semantic spacing ranges from `--ax-space-1` (`4px`) to `--ax-space-12` (`48px`).
- Comfortable controls are `40px` high; compact desktop controls are visually `32px` high but preserve a `40px` interaction box where adjacent targets permit. Mobile touch targets are at least `44x44px`.
- Comfortable surfaces use `16-24px` internal space; compact data surfaces use `8-16px` while preserving readable row rhythm.
- Radius levels are `6`, `10`, `14`, and `20px`. Pill radius is reserved for statuses, filters, and scope indicators.
- Elevation is limited to inset/flat, raised, overlay, and floating. Borders carry most hierarchy; shadows do not decorate every card.

### Breakpoints And Shell Rules

| Range | Contract |
|---|---|
| `>=1280px` desktop | Rail `74/264px`, navigator `306/78px`, optional inspector `344px`, top bar `64px`, central workspace never below `520px` |
| `768-1279px` tablet | Rail `64px`; navigator and inspector become mutually independent overlay drawers; central workspace is full remaining width; top actions collapse into labeled overflow |
| `<768px` mobile | Top app bar plus bottom/global navigation entry; rail, navigator, and inspector are modal drawers; no fixed four-column shell; content padding `12px`; tables choose responsive table/card/scroll behavior explicitly |

Container behavior, not device names, controls module internals. Every primitive must render at `320px` content width even when the complete shell is tested at `390px` viewport width.

### Motion

- Durations: `80ms` press, `140ms` hover/focus, `220ms` drawer/overlay, `320ms` one-time Datum reveal.
- Easing: standard `cubic-bezier(.2,.8,.2,1)` and exit `cubic-bezier(.4,0,1,1)`.
- Motion communicates spatial change, selection, or completion. Pulse is prohibited for ambient statuses; use a static status dot. Live recording may pulse only when its accessible text says “Recording”.
- Under `prefers-reduced-motion: reduce`, nonessential animation is disabled, smooth scrolling becomes auto, transforms are removed, and required state transitions complete in `1ms` without hiding content.

### Focus And Accessibility

- `:focus-visible` uses a 2px deep-ink/teal dual ring with 2px offset so it remains visible on white, mint, teal, and ink surfaces.
- Components never remove outline without applying the shared focus contract.
- Selected tabs expose `aria-selected`; toggle buttons expose `aria-pressed`; navigation uses current-page/current-location semantics where appropriate.
- Dialogs trap focus, restore focus, label title/description, close with Escape, and prevent background interaction.
- Text meets 4.5:1; large text and non-text controls meet 3:1; disabled state remains identifiable without relying on low opacity alone.
- Forced-colors mode preserves borders, focus, selected state, and icon visibility.

### Primitive Boundary

Primitives own visual variants, states, and accessible interaction mechanics. Modules retain state, API calls, calculations, routing, business copy, authorization checks, and workflow transitions. `StatusBadge` receives a semantic tone, not a raw color. `DataTable` does not own sorting or records. `Dialog` owns focus mechanics but not open-state policy. `WorkflowRibbon` renders supplied steps and current state but never advances a workflow.

### Concrete Primitive API Contract

The following public API is the minimum executable contract. Implementations may use private helpers, but may not add business-state, routing, API, raw-color, or record-management props. `components/ui/index.ts` exports exactly these public names.

```ts
type Density = 'comfortable' | 'compact';
type StatusTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'exploration';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger' | 'ink';
  size?: 'sm' | 'md' | 'lg';
  busy?: boolean;
};
export type IconButtonProps = Omit<ButtonProps, 'children'> & { label: string; icon: React.ReactNode };
export type SurfaceProps = React.HTMLAttributes<HTMLElement> & {
  as?: 'section' | 'article' | 'div'; level?: 'flat' | 'raised' | 'inset' | 'overlay';
};
export type CardProps = SurfaceProps;
export type StatusBadgeProps = { tone: StatusTone; label: string; icon?: React.ReactNode };
export type PageHeaderProps = {
  title: string; metadata?: React.ReactNode; actions?: React.ReactNode;
  origami?: React.ReactNode; datum?: boolean;
};
export type TabsProps = { value: string; onValueChange(value: string): void; children: React.ReactNode };
export type TabListProps = React.HTMLAttributes<HTMLDivElement> & { label: string };
export type TabProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string };
export type TabPanelProps = React.HTMLAttributes<HTMLDivElement> & { value: string };
export type FieldProps = {
  label: string; description?: string; error?: string; required?: boolean;
  unit?: string; children: React.ReactElement;
};
export type DataTableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  caption: string; density?: Density; stickyHeader?: boolean; empty?: React.ReactNode;
};
export type DialogProps = {
  open: boolean; onOpenChange(open: boolean): void; title: string;
  description: string; initialFocusRef?: React.RefObject<HTMLElement | null>; children: React.ReactNode;
};
export type EmptyStateProps = {
  variant?: 'empty' | 'error' | 'permission'; title: string; guidance: string;
  icon?: React.ReactNode; action?: React.ReactNode;
};
export type WorkflowStep = { id: string; label: string; state: 'complete' | 'current' | 'upcoming' | 'blocked' };
export type WorkflowRibbonProps = { label: string; steps: readonly WorkflowStep[] };
```

API tests must assert controlled-state behavior: `Tabs` calls `onValueChange` without owning the selected business tab, `Dialog` calls `onOpenChange(false)` on Escape without deciding whether it may open, `DataTable` renders supplied rows without sorting/paging, and `WorkflowRibbon` exposes no transition callback.

### Named Command Contract

Task commands are PowerShell-compatible npm invocations and must be added to `package.json` before use:

| Script | Exact value |
|---|---|
| `runtime:versions` | `node scripts/print-runtime-versions.mjs` |
| `validate:design-system` | `node scripts/validate-design-system.mjs` |
| `validate:navigation-reconciliation` | `node scripts/reconcile-navigation-contract.mjs` |
| `test:e2e:design-system` | `playwright test e2e/design-system.spec.ts --project=chromium` |
| `test:e2e:design-system:update` | `playwright test e2e/design-system.spec.ts --project=chromium --update-snapshots` |

Use `npm run <script> -- --grep "[P5-ID]"` for focused Playwright checks. RED is deterministic only when the command exits nonzero for the named missing contract and all unrelated pre-existing checks remain unchanged; GREEN requires exit `0`, the named assertion passing, and no skipped test or regenerated snapshot unless that task explicitly approves snapshots.

### Catalog Decision

Create a development-only Next.js catalog at `/design-system`. `app/design-system/page.tsx` returns `notFound()` when `NODE_ENV === 'production'`; the catalog is not linked from product navigation. It renders deterministic specimens for all token roles, density modes, primitive variants, focus states, status combinations, long text, empty/error/loading states, and three representative composite patterns. Playwright treats this route as the visual contract. This is compatible with the current stack and avoids a second build system.

## Exact File Map

### Create

| File | Responsibility |
|---|---|
| `styles/tokens.css` | Reference and semantic tokens for color, type, spacing, radius, elevation, motion, density, focus, breakpoints, shell dimensions, and data visualization |
| `styles/foundations.css` | Base element styles, focus-visible, reduced motion, forced colors, typography utilities, density selectors, and Datum/origami foundation rules |
| `public/fonts/Manrope-Variable.woff2` | Locally hosted display font from the official Manrope release |
| `public/fonts/IBMPlexSans-Variable.woff2` | Locally hosted body font from the official IBM Plex release |
| `public/fonts/IBMPlexMono-Variable.woff2` | Locally hosted utility/data font from the official IBM Plex release |
| `public/fonts/OFL-Manrope.txt` | Manrope license text |
| `public/fonts/OFL-IBMPlex.txt` | IBM Plex license text |
| `components/ui/Button.tsx` | `Button` and `IconButton` variants, sizes, busy/disabled behavior |
| `components/ui/Surface.tsx` | `Surface`, `Card`, and inset/raised/overlay hierarchy |
| `components/ui/StatusBadge.tsx` | Text/icon semantic status treatment |
| `components/ui/PageHeader.tsx` | Evolved V8 page title, origami mark, actions, metadata, optional Datum rule |
| `components/ui/Tabs.tsx` | Accessible tab list/tab/panel mechanics and overflow contract |
| `components/ui/Field.tsx` | Label, description, input shell, required, error, disabled, and unit suffix layout |
| `components/ui/DataTable.tsx` | Table frame, sticky header option, overflow affordance, empty region, density |
| `components/ui/Dialog.tsx` | Accessible overlay, focus trap/restore, Escape, title/description |
| `components/ui/EmptyState.tsx` | Empty, error, and permission-limited state composition |
| `components/ui/WorkflowRibbon.tsx` | Semantic ordered workflow/lifecycle presentation |
| `components/ui/index.ts` | Public primitive exports only |
| `components/design-system/DesignSystemCatalog.tsx` | Deterministic catalog specimens and composite examples |
| `app/design-system/page.tsx` | Development-only catalog route guard and metadata |
| `scripts/validate-design-system.mjs` | Static checks for required tokens, forbidden primitive literals, exports, and font/license assets |
| `scripts/print-runtime-versions.mjs` | Print the locked Node and npm versions without shell-specific command chaining |
| `scripts/reconcile-navigation-contract.mjs` | Compare Phase 5 as-found navigation inventory with Phase 1 final manifest and reject unexplained changes |
| `e2e/fixtures/phase5-navigation-as-found.json` | Entry-time selector/ID/label/observable-behavior inventory; never represented as Phase 1 final truth |
| `e2e/design-system.spec.ts` | Catalog keyboard, axe, responsive, reduced-motion, and visual tests |
| `e2e/design-system.spec.ts-snapshots/` | Reviewed Chromium baseline PNGs for catalog specimens |

### Modify

| File | Responsibility |
|---|---|
| `app/layout.tsx` | Load local fonts, apply font variables, and replace generic metadata with Architex OS metadata |
| `app/globals.css` | Import token/foundation layers, retain only global patterns that are not primitive-specific, and map legacy variables temporarily |
| `lib/origami-icons.tsx` | Make icon color inherit semantic context and expose accessible-title support without changing path data |
| `package.json` | Add the named command contract and compatible `@axe-core/playwright` dev-dependency range |
| `package-lock.json` | Lock the accessibility dependency |
| `playwright.config.ts` | Add deterministic color scheme, locale, timezone, animation/screenshot defaults, and named desktop/tablet/mobile projects or equivalent per-test viewport fixtures |
| `scripts/validate-foundation.mjs` | Invoke or import design-system contract validation without weakening existing 47-module checks |

### Evidence Only, Not Modified In This Phase

- `app/page.tsx`
- `components/layout/*.tsx`
- `components/views/*.tsx`
- `components/modules/*.tsx`
- `e2e/app.spec.ts`, `e2e/rail.spec.ts`, `e2e/roles.spec.ts`
- `e2e/fixtures/phase1-navigation-final.json`, supplied and owned by the Phase 1 handoff; Phase 5 reads but does not author it

## Detailed Task Checklist

### Task 0: Freeze The As-Found Navigation Contract Without Blocking Phase 1

**Role:** QA engineer with Phase 1 and Phase 5 integration owners.

**Dependencies:** Phase 0 exit only. Phase 1 may be in progress.

- [ ] Add stable inventory keys `P5-NAV-01.SEL-*` and `P5-NAV-01.BEH-*` to `e2e/fixtures/phase5-navigation-as-found.json` for every selector currently consumed by `e2e/app.spec.ts`, `e2e/rail.spec.ts`, and `e2e/roles.spec.ts`, plus current destination labels, mode/tool/tab entry, Back, and God entry observations.
- [ ] Add `scripts/reconcile-navigation-contract.mjs` and the named `validate:navigation-reconciliation` script. Its schema requires `{ auditId, kind, value, sourceFile, sourceLine, disposition }`; `disposition` is initially `as-found`.
- [ ] Run `npm run validate:navigation-reconciliation`; **RED:** exit nonzero with `P5-NAV-01: final Phase 1 manifest missing`. No selector or production behavior may be changed to remove this failure.
- [ ] Run `npm run test:e2e -- e2e/app.spec.ts e2e/rail.spec.ts e2e/roles.spec.ts`; **GREEN entry baseline:** exit `0`, or archive each pre-existing failure with test title and trace before Phase 5 visual work.
- [ ] Before M5.4, import Phase 1's final manifest from `e2e/fixtures/phase1-navigation-final.json`, classify every inventory row as `unchanged`, `phase1-replaced`, or `removed-by-phase1`, and reject blank/unknown dispositions, duplicate final selectors, missing stable labels, or weakened behavior assertions.
- [ ] Run `npm run validate:navigation-reconciliation` and the three existing E2E specs; **GREEN exit:** exit `0`, zero unexplained differences, and joint Phase 1/Phase 5 owner approval recorded. This task remains open until that exit run, even though Tasks 1-9 may proceed in parallel with Phase 1.

#### Deterministic Task Gate Matrix

Each test title starts with the listed audit ID. Only the two commands explicitly named with `update` may write snapshots; every other command is read-only with respect to baselines.

| Task | Exact RED command and required failure | Exact GREEN command and required result |
|---|---|---|
| 1 | `npm run validate:design-system -- --scope tokens`; nonzero and reports missing `P5-TOK-01` token groups, not a parse/runtime error | Same command exits `0`; required reference/semantic/status/data tokens and contrast metadata all pass |
| 2 | `npm run validate:design-system -- --scope foundations`; nonzero and reports missing `P5-A11Y-01`, `P5-RSP-01`, and `P5-MOT-01` foundation selectors | Same command exits `0`, then `npm run typecheck` exits `0` |
| 3 | `npm run test:e2e:design-system -- --grep "P5-TYP-01"`; nonzero because local families/assets are absent | Same command exits `0`; all three `document.fonts.check` assertions are true and third-party font request count is `0` |
| 4 | `npm run test:e2e:design-system -- --grep "P5-ID-01|P5-DEN-01|P5-RSP-01"`; nonzero for absent catalog specimens | Same command exits `0`; expected section IDs each occur once and body `scrollWidth <= clientWidth` at all three viewports |
| 5 | `npm run test:e2e:design-system -- --grep "P5-API-01 actions"`; nonzero for absent exports/specimens | Same command exits `0`; every declared variant/state is present, icon buttons have names, and Enter/Space counts equal one activation |
| 6 | `npm run test:e2e:design-system -- --grep "P5-API-01 tabs-fields-table"`; nonzero for absent API/semantics | Same command exits `0`; roving-focus sequence, ARIA relationships, caption/header cells, and overflow assertions match fixtures |
| 7 | `npm run test:e2e:design-system -- --grep "P5-API-01 dialog-empty-workflow"`; nonzero for absent API/mechanics | Same command exits `0`; focus trap/restore, Escape, inert background, ordered workflow semantics, and no transition callback pass |
| 8 | `npm run test:e2e:design-system -- --grep "P5-A11Y-01|P5-MOT-01"`; nonzero for missing icon/a11y/motion contracts | Same command exits `0`; axe serious/critical count is `0`, mobile boxes meet the stated floor, and forced-color/reduced-motion assertions pass |
| 9 | `npm run test:e2e:design-system`; nonzero only because reviewed target images do not yet exist | After human approval, `npm run test:e2e:design-system:update` creates only the eight named images; a subsequent `npm run test:e2e:design-system` exits `0` with no snapshot writes |

### Task 1: Freeze Identity Decisions And Token Contract

**Role:** Product designer with design-systems engineer; accessibility lead reviews contrast.

**Dependencies:** Approved program design and original V8 prototype.

- [ ] Add failing assertions in `scripts/validate-design-system.mjs` for every required reference and semantic token name, both density selectors, three font assets, both license files, motion reduction, focus-visible, forced-colors, and dark-ready semantic aliases.
- [ ] Implement validator argument parsing for `--scope tokens`, `--scope foundations`, and `--scope full`; an absent/unknown scope exits `2`, assertion failures exit `1`, and a complete selected scope exits `0`.
- [ ] Run `npm run validate:design-system -- --scope tokens`; expect the Task 1 RED condition in the gate matrix.
- [ ] Implement `styles/tokens.css` with the exact reference/semantic layers defined in Architecture, including status foreground/background/border triplets and an eight-color data series that meets adjacent-mark differentiation requirements.
- [ ] Record contrast calculations for every text/status/action pair directly as comments beside token groups; reject any normal-text pair below 4.5:1 or non-text pair below 3:1.
- [ ] Define light-theme semantic aliases on `:root` and repeat alias names, without values, in a validator fixture to prove future themes can override semantics without changing consumers.
- [ ] Run `npm run validate:design-system -- --scope tokens`; expect the Task 1 GREEN condition in the gate matrix.
- [ ] Review the token sheet against the prototype: teal/deep ink/mint/origami/Datum remain primary; violet, coral, amber, cobalt, and green remain semantic accents rather than competing brands.
- [ ] Commit only token contract and validator changes with message `feat(design-system): define evolved V8 semantic tokens`.

### Task 2: Establish Foundations, Density, Breakpoints, Focus, And Motion

**Role:** Design-systems engineer with accessibility specialist.

**Dependencies:** Task 1.

- [ ] Extend the validator first to require base canvas/text styles, semantic selection colors, `:focus-visible`, `prefers-reduced-motion`, `forced-colors`, `[data-density="comfortable"]`, `[data-density="compact"]`, and shell dimension tokens.
- [ ] Run the validator; expect failures for every missing foundation contract.
- [ ] Implement `styles/foundations.css` with base typography inheritance, background/text, selection, focus ring, disabled behavior, density, motion, scrollbar, forced-colors, and Datum/origami rules.
- [ ] Define CSS media queries matching `>=1280`, `768-1279`, and `<768` shell contracts; expose dimensions through semantic variables rather than component selectors.
- [ ] Add a reduced-motion override that removes transforms, ambient pulse, smooth scrolling, and nonessential keyframes while preserving immediate state feedback.
- [ ] Update `app/globals.css` to import `styles/tokens.css` and `styles/foundations.css`; map legacy `--teal`, `--deep`, `--ink`, `--muted`, `--border`, and shell dimensions to semantic tokens for temporary compatibility.
- [ ] Run `npm run validate:design-system -- --scope foundations`, then `npm run typecheck`; expect the Task 2 GREEN condition and both commands to exit `0`.
- [ ] Use browser contrast emulation and Windows High Contrast/forced-colors emulation on a temporary catalog skeleton; record that focus and selected states remain visible.
- [ ] Commit with message `feat(design-system): add accessible responsive foundations`.

### Task 3: Load Intentional Local Typography

**Role:** Frontend engineer; product designer verifies hierarchy; legal/brand owner verifies licenses.

**Dependencies:** Task 2.

- [ ] Add a failing Playwright check that computed styles expose `--font-ax-display`, `--font-ax-body`, and `--font-ax-mono`, and that `document.fonts.check()` succeeds for all three families.
- [ ] Run `npm run test:e2e:design-system -- --grep "P5-TYP-01"`; expect the Task 3 RED condition.
- [ ] Add the exact official WOFF2 assets and license texts listed in the file map; verify checksums against the downloaded official release artifacts and record them in the implementation PR description.
- [ ] Configure `next/font/local` in `app/layout.tsx` with variable names, `display: 'swap'`, correct weight ranges, and no external font request.
- [ ] Apply body/display/mono font tokens in foundations and update metadata to `Architex OS` with a Datum-oriented product description.
- [ ] Render the initial type specimen in `DesignSystemCatalog.tsx` with title, body, navigation, utility label, record ID, unit, and tabular numeric samples.
- [ ] Run `npm run test:e2e:design-system -- --grep "P5-TYP-01"`; expect the Task 3 GREEN condition.
- [ ] Compare before/after layout shift using Playwright; accept only zero visible late font swap in the captured catalog state.
- [ ] Commit with message `feat(design-system): establish Architex typography roles`.

### Task 4: Build The Development Catalog And Identity Specimens

**Role:** Design-systems engineer and product designer.

**Dependencies:** Tasks 1-3.

- [ ] Write failing catalog route tests for development visibility, production guard behavior through an exported guard function, semantic swatches, both density modes, three responsive specimen widths, origami family, Datum rule, and status combinations.
- [ ] Run `npm run test:e2e:design-system -- --grep "P5-ID-01|P5-DEN-01|P5-RSP-01"`; expect the Task 4 RED condition.
- [ ] Create `app/design-system/page.tsx` with `notFound()` production protection and no product-navigation link.
- [ ] Implement `DesignSystemCatalog.tsx` with deterministic sections: identity, color semantics, typography, spacing/radius/elevation, density, breakpoints, focus, motion, origami, statuses, and data visualization.
- [ ] Include content stress cases: 80-character project name, long municipality, large Rand value, negative value, missing optional metadata, and bilingual-length labels without changing product copy.
- [ ] Render the signature Datum rule only in identity and workflow specimens, proving restraint rather than decorative repetition.
- [ ] Run catalog tests at `1440x1000`, `1024x1366`, and `390x844`; expect no horizontal body overflow and no clipped focus rings.
- [ ] Obtain product-design approval on the identity, type hierarchy, density, and signature use before primitive implementation.
- [ ] Commit with message `feat(design-system): add development catalog`.

### Task 5: Implement Actions, Surfaces, Headers, And Status Primitives

**Role:** Frontend/design-systems engineer; accessibility specialist reviews interaction states.

**Dependencies:** Task 4 approval.

- [ ] Add failing catalog and Playwright assertions for `Button`, `IconButton`, `Surface`, `Card`, `PageHeader`, and `StatusBadge` across default, hover, focus-visible, active, busy, disabled, long-label, icon-only, and semantic status variants.
- [ ] Verify keyboard activation with Enter/Space and accessible names for icon-only controls; expect failures before implementation.
- [ ] Implement `Button.tsx` with `primary`, `secondary`, `quiet`, `danger`, and `ink` variants; `sm`, `md`, and `lg` sizes; busy announcement; and native disabled behavior.
- [ ] Implement `Surface.tsx` with `flat`, `raised`, `inset`, and `overlay` levels and optional interactive semantics only when a real button/link is supplied.
- [ ] Implement `PageHeader.tsx` with responsive title/action wrapping, origami slot, metadata, and opt-in Datum rule.
- [ ] Implement `StatusBadge.tsx` with required visible label and optional icon for `info`, `success`, `warning`, `danger`, `neutral`, and `exploration`; prohibit raw colors.
- [ ] Add specimens with all variants on white, mint, and ink surfaces, in both densities and at mobile width.
- [ ] Run axe, keyboard, contrast, reduced-motion, and visual tests; resolve every serious/critical violation and every clipped/ambiguous state.
- [ ] Commit with message `feat(design-system): add action and surface primitives`.

### Task 6: Implement Tabs, Fields, And Data Table Primitives

**Role:** Frontend engineer with accessibility specialist and QA engineer.

**Dependencies:** Task 5.

- [ ] Add failing tests for arrow-key tab navigation, Home/End, `aria-selected`, panel ownership, focus retention, overflow affordance, field label/description/error linkage, unit suffix semantics, and table caption/header relationships.
- [ ] Add failing visual cases for a 12-tab strip, 20-column-equivalent table sample, validation error, disabled field, readonly calculated value, and compact/comfortable rows.
- [ ] Implement `Tabs.tsx` using roving focus and explicit `Tabs`, `TabList`, `Tab`, and `TabPanel` boundaries; keep controlled state in consumers.
- [ ] Implement `Field.tsx` with generated IDs, visible labels, `aria-describedby`, `aria-invalid`, unit suffix, required marker text, and no placeholder-only labeling.
- [ ] Implement `DataTable.tsx` as a semantic frame with caption slot, sticky header option, overflow announcement/gradient, empty slot, and density; do not own records, sorting, selection, or pagination.
- [ ] Verify table behavior at all three viewports: cards are not automatically substituted because column meaning must remain module-owned; horizontal scroll must be keyboard-operable and visibly indicated.
- [ ] Run targeted Playwright and axe tests; expect zero serious/critical violations and no body-level overflow.
- [ ] Commit with message `feat(design-system): add tabs fields and table primitives`.

### Task 7: Implement Dialog, Empty State, And Workflow Ribbon Primitives

**Role:** Frontend engineer; accessibility specialist signs off dialog mechanics.

**Dependencies:** Tasks 5-6.

- [ ] Write failing tests for dialog initial focus, Tab/Shift+Tab containment, Escape, focus restoration, background inertness, title/description naming, nested scroll, mobile full-height behavior, and reduced-motion entry.
- [ ] Write failing tests for empty/error/permission states and workflow ribbon semantics using an ordered list, current step, complete steps, blocked step, and scroll behavior.
- [ ] Implement `Dialog.tsx` without adding a second component framework; use native React/DOM focus management and a portal, with explicit title and description IDs.
- [ ] Implement `EmptyState.tsx` with icon, title, guidance, and optional action slots; variant changes tone but not semantics or behavior.
- [ ] Implement `WorkflowRibbon.tsx` as a presentational ordered sequence with supplied state and no transition handlers.
- [ ] Add catalog specimens modeled on Meetings governance, engineering calculation review, and project lifecycle without importing module business state.
- [ ] Run keyboard tests from first trigger through close/restore at all viewports and with reduced motion.
- [ ] Commit with message `feat(design-system): add overlay and workflow primitives`.

### Task 8: Harden Origami, Accessibility, Responsive, And Reduced-Motion Contracts

**Role:** Accessibility specialist, frontend engineer, QA engineer.

**Dependencies:** Tasks 4-7.

- [ ] Add failing tests for decorative `aria-hidden`, titled semantic icons, `currentColor` inheritance, high-contrast visibility, 16/20/24/32 sizes, and fold motion reduction.
- [ ] Update `lib/origami-icons.tsx` without changing SVG path data; decorative icons remain hidden, meaningful standalone icons require a title/label contract.
- [ ] Add catalog keyboard traversal that reaches every control in logical order without traps, hidden focus, or pointer-only affordances.
- [ ] Run axe on each catalog section at desktop, tablet, and mobile with default and compact density.
- [ ] Emulate `prefers-reduced-motion: reduce`; assert computed animation/transition durations are effectively disabled except immediate state updates.
- [ ] Emulate forced colors; assert focus, selected tab, buttons, fields, dialog boundary, and status label remain visible.
- [ ] Verify minimum mobile targets with bounding-box assertions: interactive controls are at least `44x44px` unless an adjacent hit-area wrapper supplies that size.
- [ ] Verify page zoom at 200% and text-only zoom approximation: content reflows, labels are not clipped, and dialog actions remain reachable.
- [ ] Commit with message `test(design-system): enforce responsive accessibility contracts`.

### Task 9: Approve And Lock Visual Baselines

**Role:** Product designer owns visual approval; QA owns deterministic capture; accessibility lead reviews nonvisual parity.

**Dependencies:** Tasks 1-8.

- [ ] Configure deterministic Playwright capture: Chromium, light color scheme, `en-ZA`, `Africa/Johannesburg`, device scale factor 1, animations disabled after state setup, and stable font readiness.
- [ ] Add failing `toHaveScreenshot` expectations for `identity-desktop.png`, `primitives-desktop.png`, `primitives-tablet.png`, `primitives-mobile.png`, `density-compact.png`, `focus-keyboard.png`, `reduced-motion.png`, and `forced-colors.png`.
- [ ] Generate candidates only with `npm run test:e2e:design-system:update` after the required reviewers are present.
- [ ] Review candidates at 100% pixel scale; reject inconsistent spacing, weak hierarchy, generic dashboard styling, clipped content, hidden focus, color-only meaning, or excessive origami/Datum decoration.
- [ ] Record approval owner and date in the implementation PR and commit only approved PNGs.
- [ ] Re-run without `--update-snapshots`; expect all visual comparisons to pass with no changed pixels beyond the configured anti-aliasing threshold.
- [ ] Run `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run test:e2e`; archive command output.
- [ ] Commit with message `test(design-system): lock evolved V8 visual baselines`.

## Milestones

| Milestone | Exit criteria | Estimate |
|---|---|---:|
| M5.1 Identity contract approved | Tokens, typography, density, breakpoints, motion, focus, and signature use approved | 2-3 person-days |
| M5.2 Primitive API complete | All listed primitives render required variants and pass targeted keyboard/axe tests | 3-4 person-days |
| M5.3 Catalog and visual contract locked | Catalog is deterministic and all baseline images are approved | 2-3 person-days |
| M5.4 Foundation release gate | Full type, lint, static, E2E, a11y, and visual suites pass | 1-2 person-days |

## Required Resources

### Design

- Senior product designer: evolved V8 identity, typography, density, responsive composition, catalog approval.
- Design-systems designer: token taxonomy, component states, primitive boundaries, visual-baseline review.
- Brand/legal reviewer: font licensing and origami/Architex identity approval.

### Frontend

- Senior React/TypeScript engineer familiar with Tailwind v4, CSS custom properties, focus management, and responsive shell architecture.
- Design-systems engineer able to keep primitive APIs presentational and behavior-neutral.

### Accessibility

- WCAG 2.2 AA specialist for contrast, keyboard, focus, target sizes, reduced motion, forced colors, semantics, and zoom.
- Keyboard-only and screen-reader manual test access on Windows with NVDA and Chromium/Firefox.

### QA And Tooling

- Playwright-capable QA engineer for deterministic screenshots and three-viewport matrices.
- Chromium reference environment with fonts installed only from repository assets.
- CI artifact storage for HTML reports, traces, axe JSON, and baseline diffs.
- Product-design review display calibrated for sRGB.

## Person-Day Estimate

| Workstream | Person-days |
|---|---:|
| Evidence audit, identity, tokens, typography | 2.0-3.0 |
| Foundations, density, breakpoints, focus, motion | 1.0-1.5 |
| Primitive implementation | 2.5-3.5 |
| Catalog and composite specimens | 0.75-1.25 |
| Accessibility and responsive validation | 1.0-1.5 |
| Visual baselines, QA, documentation/evidence | 0.75-1.25 |
| **Total** | **8.0-12.0** |

## Dependencies

- Phase 0 safety controls remain non-negotiable and visually distinguish disabled/deferred engineering outputs.
- Phase 1 and Phase 5 may execute concurrently after Phase 0 with serialized ownership of shared shell files. Phase 5 freezes the `as-found` contract at entry, must not rename selectors or change navigation behavior, and must reconcile Phase 1's final manifest before exit.
- Phase 2 defines calculation status semantics that `StatusBadge` must express without embedding formulas.
- Phase 4 supplies workflow ribbon states and inspector usage examples but does not depend on visual implementation details.
- Phase 6 cannot begin shell migration until M5.4 passes and baseline images are approved.
- Phase 7 consumes the same responsive/focus/dialog primitives for God Mode completion.
- Phase 8 re-runs the complete foundation evidence set as release evidence.

## Acceptance Criteria

- Semantic tokens cover every planned visual role and no primitive contains an undocumented brand/status hex value.
- The product loads all fonts locally with no third-party font request and no visible late layout shift.
- Display, body, and utility roles are visibly distinct and used according to the typography contract.
- Comfortable and compact density are demonstrated; mobile targets meet the `44x44px` floor.
- All listed primitives exist, are exported, and render every documented state in the catalog.
- Every primitive passes keyboard and `@axe-core/playwright` checks with no serious or critical violations.
- Focus is visible on white, mint, teal, and ink surfaces and in forced-colors mode.
- Reduced-motion mode removes nonessential transform, pulse, smooth-scroll, and reveal animation.
- Catalog specimens have no body-level horizontal overflow at all three exact viewports.
- Dialog focus trap/restore, tabs keyboard behavior, field relationships, table semantics, and workflow semantics pass automated and manual checks.
- Approved visual baselines exist and pass on a clean run.
- `/design-system` is unavailable in production and absent from product navigation.
- Existing 47-module open, navigation, role, and workflow tests continue to pass without selector or behavior changes.
- `P5-NAV-01` reconciliation has zero unknown dispositions, and the Phase 1 final selector/behavior manifest is the exit baseline rather than the Phase 5 `as-found` inventory.
- Every applicable `P5-*` audit ID appears in test metadata and the evidence manifest; this phase does not claim closure of `V8-H05` through `V8-H08`.

## Test Evidence

Store the following evidence in the implementation PR/CI artifacts; committed evidence consists of tests, scripts, and approved snapshots rather than transient reports:

| Evidence | Command or method | Passing condition |
|---|---|---|
| Locked runtime | `npm run runtime:versions` | Node/npm exactly match the repository/CI lock recorded at entry |
| Navigation reconciliation | `npm run validate:navigation-reconciliation` | Phase 1 final manifest present; zero missing, duplicate, unknown, or weakened contract rows |
| Static token contract | `npm run validate:design-system` | Required aliases/assets/exports present; forbidden literals absent |
| Type safety | `npm run typecheck` | Exit 0 |
| Lint | `npm run lint` | Exit 0 with no new warnings |
| Foundation parity | `npm run test` | Existing 47-module and backend foundation checks pass |
| Catalog behavior | `npm run test:e2e:design-system` | All keyboard, route, responsive, and reduced-motion checks pass |
| Accessibility | Axe scans plus manual NVDA keyboard script | No serious/critical automated findings; manual script complete |
| Visual regression | Playwright `toHaveScreenshot` | All approved images match |
| Product regression | `npm run test:e2e` | Existing app, rail, role, and module tests pass |
| Production guard | `npm run build` and route check | Build succeeds; `/design-system` resolves as not found in production |

## Risks And Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Semantic tokens merely rename raw colors | Migration remains inconsistent | Require role-based aliases and forbid primitives from consuming references |
| New typography changes layout and table fit | Clipping and baseline churn | Local variable fonts, constrained scale, content stress specimens, three viewports |
| Primitive APIs absorb business logic | Workflow regressions and deep coupling | Presentational boundaries, controlled state, no API/routing imports in `components/ui` |
| Catalog diverges from production | False confidence | Same Next.js/Tailwind build, same exports, no second bundler |
| Visual tests become flaky | Gate loses trust | Local fonts, fixed locale/timezone, deterministic content, stable viewport/DPR, animation control |
| Focus treatment conflicts with brand surfaces | Invisible keyboard position | Dual ring and explicit white/mint/teal/ink specimens plus forced-colors tests |
| Compact density harms accessibility | Small targets and unreadable metadata | Minimum text/target rules and bounding-box tests |
| Overuse of Datum/origami motif becomes decorative | Identity feels noisy or generic | One signature rule with explicit allowed contexts and design approval |
| Compatibility aliases become permanent | Hard-coded legacy survives migration | Track aliases for deletion in Phase 6 exit gate |
| Storybook is later required | Catalog investment appears stranded | Components remain framework-neutral; catalog is a consumer, not the source of truth |

## Rollback And Contingency Strategy

- Implement foundation commits in the task order so token/font/catalog/primitive changes can be reverted independently.
- Keep legacy CSS variables mapped to semantic aliases until Phase 6 completes; if a shell regression appears, restore the prior `app/globals.css` import order while retaining catalog code off the product route.
- If a local font causes rendering or licensing risk, revert font loading to the existing system stack and keep typography role tokens; do not substitute an unreviewed remote font.
- If a primitive fails behavior parity in Phase 6, keep the module on its existing markup and fix the primitive in the catalog before retrying; do not fork a module-specific copy.
- If screenshot stability cannot be achieved in CI, block baseline approval and retain behavior/a11y tests; do not weaken image thresholds until font, locale, DPR, and animation causes are resolved.
- If `@axe-core/playwright` conflicts with the existing Playwright version, pin a compatible release in `package-lock.json`; do not remove accessibility gating.
- Rollback never changes API data, workflow records, calculation state, or authorization because this phase does not own those concerns.

## Deliverables

- Approved evolved V8 identity and semantic token implementation.
- Locally licensed display/body/utility typography.
- Responsive, density, motion, focus, forced-colors, and reduced-motion foundations.
- Ten focused primitive files exposing fifteen documented components (`Button`, `IconButton`, `Surface`, `Card`, `StatusBadge`, `PageHeader`, `Tabs`, `TabList`, `Tab`, `TabPanel`, `Field`, `DataTable`, `Dialog`, `EmptyState`, and `WorkflowRibbon`) with catalog specimens.
- Development-only in-app design-system catalog.
- Static design-system validation integrated with existing foundation validation.
- Playwright accessibility, keyboard, responsive, and visual regression suite.
- Approved desktop, tablet, mobile, compact, focus, reduced-motion, and forced-colors baselines.
- Recorded design, frontend, accessibility, and QA sign-offs.

## Exit Gate

Phase 5 is complete only when all checklist tasks, including Task 0 exit reconciliation, are checked; M5.4 passes; product design approves identity and baselines; accessibility signs off WCAG 2.2 AA foundation behavior; the catalog is production-inaccessible; `npm run validate:navigation-reconciliation` proves the final Phase 1 selector/behavior contract with zero unexplained differences; and existing navigation/module/workflow tests remain green. Phase 1 does not have to exit before Phase 5 starts, but it must exit and provide its final manifest before Phase 5 can exit. Phase 6 must not migrate shell or modules while any navigation reconciliation, required token, primitive state, viewport baseline, focus behavior, reduced-motion behavior, or catalog accessibility result is unresolved.
