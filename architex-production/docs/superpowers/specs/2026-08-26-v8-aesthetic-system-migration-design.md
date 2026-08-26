# V8 Aesthetic System Migration Design

Date: 2026-08-26

## Purpose

Make the authenticated Architex interface reproduce the visual language, spatial hierarchy, density, iconography, and interaction presentation of `E:\Downloads\architex_datum_os_integrated_modules_v8_engineering_godmode.html` throughout the product while retaining the existing real authentication, MariaDB persistence, auditing, tenant isolation, and record-level RBAC.

This design extends `2026-08-26-exact-v8-parity-recovery-design.md`. That recovery design remains authoritative for authentication, security, data, deployment, and certification. This document controls the aesthetic system and page-level migration.

## Subject and audience

Architex is a built-environment operating system for architects, engineers, quantity surveyors, contractors, clients, authorities, suppliers, and project administrators. The interface must feel like a precise professional coordination instrument: calm, information-dense, traceable, and project-aware rather than decorative or consumer-oriented.

## Reference authority

The supplied V8 HTML controls:

- visible composition and hierarchy;
- type scale, weights, line heights, and wrapping;
- palette, opacity, borders, shadows, and radii;
- spacing and information density;
- origami iconography and icon sizing;
- normal, hover, focus, selected, disabled, empty, live, and scaffold states;
- desktop, compact navigator, tablet, and mobile presentation;
- global Command Centre, Project Datum, God Mode, inspector, feedback, meetings, engineering, tool-registry, and scaffold presentation.

The reference's embedded sample records and client-side access logic are not runtime authorities. Real API data is mapped into reference-defined visual slots.

## Chosen approach

Create a reusable V8 presentation system over the existing authenticated React application, then migrate one complete surface at a time.

The migration will not be a CSS overlay. Structural differences such as the stage timeline, page head, Datum world, inspector blocks, and tool cards require shared React primitives. The application will not be rebuilt from the standalone HTML because that would duplicate or discard working security and persistence.

## Aesthetic thesis

The product is organised around a single luminous Datum line. White and translucent working surfaces sit over a quiet blue-green canvas. Teal communicates connection and active project state; ink communicates governance; restrained discipline colours distinguish categories without becoming separate visual brands. Origami folds make the system identifiable as Architex.

The memorable element is the Datum world: a precise horizontal project spine connecting governed tool cards, stages, records, and handoffs. Other surfaces remain visually quiet so the Datum carries the identity.

## Token system

### Colour

| Token | Value | Use |
|---|---:|---|
| Datum teal | `#19B7B0` | active connectors, selected controls, focus and progress |
| Deep teal | `#167E79` | rail, primary actions, strong project identity |
| Ink | `#102033` | primary text, governed actions, icon outlines |
| Muted ink | `#657287` | secondary text and metadata |
| Aqua | `#DFF5F2` | selected and contextual surfaces |
| Mint | `#BFE9E2` | subtle folds, progress, and connective accents |
| Canvas | `#F5FAF9` | application background |
| White | `#FFFFFF` | primary working surfaces |
| Violet | `#8B5CF6` | God Mode and Wingman only |
| Coral | `#FF6B6B` | risk, compliance, and attention states |
| Amber | `#F59E0B` | commercial and procurement states |
| Cobalt | `#2563EB` | planning and technical information states |

Category colours are semantic accents. They do not replace the teal/ink product identity.

### Typography

- Interface and content: `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`.
- System codes, short metadata, state labels, and technical captions: `JetBrains Mono, ui-monospace, monospace`.
- Shell utility text: 8–13 px.
- Body and card copy: 11–14 px depending on reference state.
- Page and tool headings: 15–21 px inside the authenticated product.
- Weight range: 500 for body, 650–760 for controls and headings, 800 for short uppercase state labels.
- Tight display tracking is reserved for page titles. Uppercase tracking is reserved for genuine system metadata and section labels.

### Geometry and density

- OS rail: 74 px collapsed.
- Context navigator: 306 px full; reference compact state when selected.
- Top bar: 66 px.
- Inspector: 344 px desktop.
- Canvas: remaining centre plane; 876 px at the 1600 × 1000 reference viewport.
- Common control heights: 34–39 px.
- Common card radii: 11–16 px; 20 px for the Datum canvas; 99 px only for genuine pills.
- Common spacing increments: 4, 7, 9, 11, 14, 18, and 24 px, following measured reference composition.
- Borders: predominantly `1px solid rgba(16,32,51,.09)`.
- Shadows: soft and low-contrast; stronger elevation is limited to overlays, the rail edge, floating feedback, and hovered Datum cards.

## Icon system

Origami icons are the default product icon language. Each icon uses:

- an ink outline and line work;
- a teal or semantic-colour fold;
- rounded line caps and joins;
- stable 16, 18, 21, 25, 27, 32, 38, or 42 px containers according to context;
- no emoji, mismatched filled glyphs, or generic substitutes when a reference icon exists.

The logo, Datum origin, rail destinations, navigator rows, page identities, tool cards, feedback controls, and inspector states all use the same registry.

## Shared presentation primitives

The aesthetic layer provides bounded primitives for:

1. `V8PageHead` — icon, title, description, and reference action cluster.
2. `V8RoleBanner` — role identity, focus text, audited/project-aware tags, and God Mode lens state.
3. `V8ProjectHero` — project metadata, progress, eight-stage timeline, and stage guidance.
4. `V8StageTimeline` — fine connector line, numbered nodes, active halo, and responsive wrap.
5. `V8DatumWorld` — origin, luminous line, nodes, cards, connectors, stage badge, zoom, and fit controls.
6. `V8DatumCard` — origami identity, title, summary, governed metadata, status, and connector orientation.
7. `V8ToolCard` and `V8RegistryItem` — live/scaffold distinctions, category tone, metadata, and hover state.
8. `V8InspectorBlock` — context note, scope, module relationship, activity, Wingman prompt, and professional boundary variants.
9. `V8FeedbackSurface` — floating action, panel, tabs, categories, context, records, and state feedback.
10. `V8ScaffoldWorkspace` — truthful reserved capability presentation without pretending the workflow is implemented.

These primitives accept real data and domain actions through props. They do not fetch data or grant access themselves.

## Surface requirements

### Project Datum

Project Datum reproduces the reference page head, role banner, project hero, fine eight-stage timeline, stage guidance, horizontal Datum world, origami cards, connector lines, zoom controls, and inspector context. Normal mode presents role- and stage-relevant tools. God Mode presents all stage-relevant tools while retaining the selected role as a viewing lens.

### Global Command Centre

The global Command Centre remains distinct from the Practice Management tool. It uses the reference page head and four principal destination cards: project Datum, Practice / Project Command Centre, workspace registry, and Feedback Intelligence. Counts and records come from authenticated API responses.

### God Mode

God Mode reproduces the violet identity, explanatory banner, ecosystem statistics, eight-stage lifecycle, role-lens grid, information-handoff chain, and complete reference tool catalogue. Its visible scope changes; authenticated record scope does not.

### Navigator and inspector

The navigator follows the reference group order, labels, badges, section headings, active border, compact state, and contextual notes. The inspector implements Context, Wingman, and Activity with the reference tab hierarchy, copy density, contextual notes, activity rows, and controlled-output boundaries.

### Tool surfaces

Every tool opens inside the shared shell. Live workspaces retain their domain controls and data flow but adopt V8 page identity, tabs, surfaces, controls, typography, and origami icons. Unimplemented capabilities use the reference scaffold presentation and never show fabricated successful records.

### Feedback

The feedback action stays fixed at the lower-right reference position and opens a contextual panel. It records current destination, project, tool, orientation, and internal section. Submitting feedback uses the real API and returns explicit pending, success, and failure states.

## Responsive behaviour

At desktop, all four shell layers are visible. At reference tablet width, the navigator remains inline while the inspector becomes a drawer. At mobile, the 74 px rail remains visible, the canvas uses the remaining width, and navigator/inspector content opens through accessible drawers. Datum cards become a readable vertical or two-column sequence rather than retaining unusable absolute positioning.

Responsive corrections may repair clear defects in the standalone reference, but they must preserve its hierarchy, palette, density, and interaction intent. Each correction is documented and browser-tested.

## Theme behaviour

Light mode is the reference certification baseline. Dark mode translates every token while preserving contrast, hierarchy, semantic accents, icon folds, and state differentiation. No light-only component island is permitted. Theme remains available in the top bar and persists under `architex-theme`.

## Data and authorization boundaries

- All displayed runtime records originate from authenticated API responses.
- Prototype demonstration data is permitted only on the test environment.
- Production renders empty states rather than frontend fixtures.
- God Mode never changes identity, tenant, memberships, permissions, query scope, mutation scope, or audit actor.
- Forbidden operations fail closed and do not reveal protected record metadata.
- Aesthetic primitives receive already-authorized data and cannot broaden access.

## Error and empty states

Errors state what failed and provide the next safe action. Empty states explain what belongs in the surface and expose an authorized creation, invitation, upload, or retry action where applicable. Neither state silently loads sample data or JSON fallback persistence.

## Implementation sequence

1. Establish shared V8 tokens and primitives without changing domain behaviour.
2. Migrate and certify Project Datum.
3. Migrate and certify the global Command Centre.
4. Migrate and certify God Mode.
5. Complete navigator, inspector, and feedback fidelity.
6. Migrate one tool workspace at a time, starting with Practice Management, Meetings, Engineering, and Wingman.
7. Migrate remaining live and scaffold tool surfaces one at a time.
8. Complete dark-mode translation.
9. Run the full page-by-page completion audit and deploy separately to prototype and production.

## Per-surface acceptance gate

Each surface requires:

1. reference capture at the certified viewport and state;
2. accessible-name and interactive-control inventory;
3. stored expected rectangles and computed styles;
4. a failing contract test for each targeted mismatch before implementation;
5. focused unit, integration, and browser tests;
6. implementation capture at the identical viewport and state;
7. comparison of geometry, typography, wrapping, icon size, colour, border, radius, shadow, and interaction states;
8. keyboard, focus, responsive, and reduced-motion checks;
9. real login and session restoration;
10. MariaDB mutation/reload, authorization denial, and audit proof where the surface changes records;
11. prototype deployment with artifact hash and rollback target;
12. conservative readiness-ledger update.

Unexplained differences fail the gate. A build, unit suite, static health response, or historical screenshot cannot certify visual parity.

## Completion definition

The objective is complete only when every promoted authenticated surface uses the V8 aesthetic system, every reference page has same-state comparison evidence, real data and authorization paths remain verified, the prototype deployment is certified, and the production deployment separately proves no mock data. Shared-shell parity alone does not complete this programme.

## Non-goals

- Recreating insecure client-side identity switching.
- Treating reference sample data as production truth.
- Releasing unvalidated engineering calculations.
- Hiding missing workflows behind visually convincing fake records.
- Claiming whole-product parity from a single page or viewport.
