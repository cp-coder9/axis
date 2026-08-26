# Exact V8 Parity Recovery Design

Date: 2026-08-26

## Purpose

Recover the Architex authenticated interface from the failed fresh-session audit and make it reproduce `E:\Downloads\architex_datum_os_integrated_modules_v8_engineering_godmode.html` exactly at the presentation and interaction layer without weakening real authentication, MariaDB persistence, tenant isolation, auditing, or record-level RBAC.

This specification refines `2026-08-25-full-v8-production-parity-design.md`. Where the two documents differ, this recovery specification controls visual parity, catalogue presentation, implementation order, and certification.

## Binding authorities

- Public homepage authority: `E:\axis-1\preview(3).html`.
- Authenticated V8 authority: `E:\Downloads\architex_datum_os_integrated_modules_v8_engineering_godmode.html`.
- Current failure ledger: `docs/v8-remediation/evidence/V8_REFERENCE_VS_LIVE_SIDE_BY_SIDE_AUDIT_2026-08-26.md`.
- Runtime data authority: authenticated API responses backed by MariaDB.
- Authorization authority: signed identity, tenant membership, project membership, and server-side permission checks.

The reference HTML controls visible geometry, typography, colour, iconography, naming, hierarchy, states, responsive behaviour, and interactions. Its embedded sample data and client-side role logic do not control production data or authorization.

## Chosen architecture

Build a reference-shell parity layer over the existing production modules. The parity layer owns global chrome, navigation presentation, route identity, reference labels, theme tokens, God Mode presentation, and responsive layout. Existing modules remain responsible for authenticated domain data and mutations through stable adapters.

The application will not be rewritten from the standalone HTML, because doing so would discard working authentication, persistence, and auditing. It will not be repaired through isolated CSS patches, because exact parity requires a coherent shell contract and repeatable computed-style verification.

## Release decomposition

The programme is divided into independently certifiable slices:

1. Fresh entry, sign-in, registration, session restoration, and logout.
2. Shared V8 shell: rail, navigator, top bar, canvas, inspector, iconography, themes, and responsive states.
3. Command Centre and Project Space / Datum.
4. God Mode, role lens, lifecycle stages, and ecosystem explorer.
5. One matched workspace or tool surface at a time.
6. Governed extension catalogue for production tools absent from the reference.
7. Prototype deployment certification, followed separately by production release certification.

Only one surface may enter implementation at a time. A surface is complete only after its automated, computed-style, screenshot, interaction, persistence, and authorization gates pass. Completion of one slice does not certify later slices.

## Slice 1: entry and authentication recovery

The current deployed landing runtime fails when `document.currentScript` is `null`. The repair must give the landing runtime an explicit, stable Shadow DOM host rather than discovering its owner through the executing script element.

Acceptance requirements:

- a fresh browser session renders the supplied public homepage without uncaught exceptions;
- Sign in and Register are keyboard- and pointer-reachable;
- Sign in uses the real API and establishes the production session model;
- registration uses the schema-backed organisation/user workflow;
- successful authentication reaches the V8 Command Centre without browser-side identity injection;
- reload restores the signed session through the supported refresh mechanism;
- logout revokes the refresh session and returns to the public homepage;
- errors render actionable UI and never switch to mock identity or local fixture data.

The existing uncommitted landing-host change is input for review, not accepted implementation. A regression test must fail against the defective mount behaviour before production code changes are accepted.

## Slice 2: exact shared shell

At the full desktop reference viewport, the steady-state shell contract is:

- OS rail: approximately 74 px wide;
- context navigator: approximately 306 px wide;
- top bar: approximately 66 px high;
- context inspector: approximately 344 px wide;
- canvas: remaining centre area, approximately 876 px in the reference capture.

Approximate values describe the source reference, not an error tolerance. Final expected rectangles are measured from the reference at each certified viewport and stored as fixtures. The implementation must match those fixtures within the explicitly documented browser-rendering tolerance.

The shell owns exactly one instance of global chrome. Route hosts own one workspace identity region. Child modules own domain controls and content and must not render duplicate rails, top bars, identity cards, or inspectors.

The shell must reproduce:

- reference typefaces, weights, sizes, line heights, wrapping, and density;
- reference palette, borders, shadows, radii, spacing, surfaces, and selected states;
- reference origami-style iconography and icon dimensions;
- navigator group order, badges, labels, tool states, and collapse behaviour;
- top-bar control order and responsive compaction;
- inspector tabs, feedback affordance, focus states, hover states, and keyboard order;
- steady-state geometry with entry animations disabled during certification.

## Theme contract

The V8 theme action remains visible in the top bar beside the role and God Mode controls. It uses the reference text-plus-icon presentation:

- light mode offers `Dark` with the reference moon icon;
- dark mode offers `Light` with the reference sun icon;
- accessible name is `Switch colour theme`;
- dark state is exposed through `aria-pressed`;
- preference persists under `architex-theme` across reload, authentication, and navigation;
- all shell and module surfaces use theme tokens, with no light-only islands.

## Catalogue and naming contract

The normal parity interface presents the reference catalogue of 45 tools with the exact reference names, ordering, badges, statuses, and scaffold semantics. Production capabilities absent from the supplied reference remain available through a clearly separated `Extensions` area and do not change the reference tool count or default navigation hierarchy.

The initial extension set is:

- Inspection Test Plans;
- Health & Safety;
- Approvals Queue when it is not represented by the reference Action Centre workflow.

If an apparent extension is proven to correspond to a reference tool, it is mapped to that reference identity instead of duplicated. Internal route IDs may remain stable; visible copy and hierarchy follow the reference.

## God Mode and RBAC

God Mode is a persistent presentation toggle beside the role selector. It reveals all reference tools, all eight project stages, all role lenses, the ecosystem handoff, and all reference destinations. The selected role remains visible as an explanatory lens.

God Mode changes discoverability only. It never changes the signed identity, tenant, memberships, permission grants, API query scope, mutation scope, or audit actor. Records outside the signed user's authorization remain unavailable. Forbidden API operations fail closed with no record leakage.

## Data flow and error behaviour

1. The browser restores or establishes a signed session.
2. The authenticated shell requests identity, organisation, memberships, permissions, projects, and module data from `/api/v1`.
3. The parity layer maps real records and capabilities into reference-defined presentation slots.
4. Mutations use authenticated API routes and produce audit records.
5. Reload rehydrates from MariaDB-backed API state rather than component fixtures or session-storage bypasses.

Database, authorization, and network failures remain distinguishable. No error path silently substitutes JSON fallback persistence, demo headers, mock records, or seeded frontend arrays. Empty production collections render functional creation or invitation flows and truthful empty states.

## Per-surface delivery gate

Each surface follows the same sequence:

1. Capture the reference surface at the certified viewport and state.
2. Record its accessible names, visible labels, interactive inventory, rectangles, and computed styles.
3. Add a failing automated contract test for the next mismatch or missing behaviour.
4. Implement only the smallest change required for that contract.
5. Run focused unit and integration tests.
6. Run the real browser journey through authentication; API injection is diagnostic only and cannot certify the journey.
7. Capture the implementation at the identical viewport and state.
8. Compare geometry, computed styles, icon dimensions, typography, wrapping, and interactions.
9. Verify mutation, reload persistence, authorization denial, and audit evidence where the surface changes data.
10. Update the existing readiness ledger conservatively and commit the independently reviewable slice.

Unexplained differences fail the gate. A successful build, static health response, historical screenshot, or direct API login alone cannot pass it.

## Deployment and certification

`test.architex.co.za` is the prototype certification environment and may contain the explicit V8 demonstration dataset. `architex.co.za` is the production environment and must contain no mock, demo, fixture, fallback, or sample records.

Every deployment records the built artifact, destination, rollback target, migration state, cache purge result, and browser evidence. Prototype success does not authorize or certify production. Production promotion requires:

- clean normal-user registration/sign-in/session/logout journeys;
- live MariaDB health and migration confirmation;
- cross-tenant and record-level RBAC proof;
- audit persistence proof;
- worker/queue readiness for applicable workflows;
- production no-mock-data checks;
- page-by-page V8 parity evidence for every promoted surface;
- an identified rollback artifact and verified rollback procedure.

## Initial implementation boundary

The first implementation plan covers only Slice 1 and Slice 2. Tool and workspace implementation starts only after fresh entry/authentication and the shared shell are certified, because every later page depends on those foundations.

## Non-goals

- God Mode does not grant broader record access.
- The production environment does not receive the prototype demonstration seed.
- Reference sample data does not become runtime production data.
- Extension tools do not alter the reference catalogue or its 45-tool count.
- This programme does not claim exact parity for a surface before current live browser evidence exists.
