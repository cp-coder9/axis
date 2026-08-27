# Site-Wide Datum OS V8 God Mode Parity Design

**Date:** 2026-08-27

**Status:** Approved design sections; written-spec review pending

**Target:** `E:\axis-1\architex-production`

**Sole visual and workflow reference:** `E:\Downloads\architex_datum_os_integrated_modules_v8_engineering_godmode.html`

## Purpose

Rebuild the complete Architex Datum OS V8 site so its shell and all 47 registered tools match the supplied integrated God Mode HTML pixel for pixel and function for function. Reference mock behavior is not copied as fake production state: each interaction becomes a real authenticated operation, a persisted cross-tool command, or an explicit `integration_required` state.

## Non-negotiable interpretation

- The supplied integrated HTML is the only authority for visible layout, styling, labels, tool placement, role lenses, tabs, controls, workflows, responsive behavior, and interaction outcomes.
- The existing authenticated session, Architex API, and MariaDB remain authoritative for identity, organizations, memberships, projects, domain records, commands, jobs, and audit events.
- Exact parity means the same visible hierarchy and behavior, not embedding the prototype or retaining its in-memory records and fabricated success messages.
- A reference mutation must produce a real persisted result, invoke the module that owns the downstream record, or return a named `integration_required` result without fabricating success.
- Existing unrelated working-tree changes are preserved. Parity work replaces existing code only where the supplied reference or the production boundary requires it.

## Selected approach

Use a reference-contract program rather than a direct unstructured rewrite. Decode the supplied HTML into mechanically checked manifests for shell structure, tool inventory, stages, roles, tabs, copy, controls, states, and interactions. Rebuild the shared shell first, then migrate and certify one tool at a time against those contracts.

Direct manual rewrites were rejected because repeated shell and policy mappings would drift across 47 tools. Embedding the integrated HTML was rejected because it would duplicate the application shell, retain unsafe mock state, and bypass the React, authentication, authorization, persistence, and audit architecture.

## Architecture

```text
Supplied integrated HTML
    -> deterministic extraction
Generated reference manifests and visual contracts
    -> parity enforcement
Shared V8 shell
    -> tool workspace
Authenticated API
    -> MariaDB repositories and integration workers
```

### Reference extraction layer

The extraction layer reads the sole reference file and produces deterministic generated artifacts containing:

- shell regions, ownership, ordering, dimensions, breakpoints, theme tokens, icons, copy, and interactive states;
- the 47-tool registry, stage placement, role placement, God Mode discoverability, summaries, metrics, and source payload identifiers;
- per-tool navigation groups, tabs/views, visible controls, fields, filters, tables, cards, modals, state transitions, and downstream outcomes;
- fixed desktop, tablet, and mobile viewport contracts used by browser certification.

Generated files are never hand-edited. A check command regenerates them in memory and fails on source drift or generated-artifact drift.

### Shared V8 shell

The shell owns global navigation, project orientation, standalone orientation, project selection, authenticated identity, role lens, theme, God Mode, tool registry, inspector, and browser-history state. A tool workspace never renders duplicate global chrome.

### Tool workspaces

Each tool owns only its domain navigation, controls, records, dialogs, workflow state, and cross-module handoffs. Shared components may be reused only when their rendered geometry and behavior match the reference in every consuming tool. Reuse cannot homogenize intentionally different layouts.

### Production data boundary

- The browser uses the authenticated client and never supplies user, organization, role, membership, or authorization headers.
- Every tenant-owned query includes organization scope before project, capability, assignment, and record-state checks.
- Mutations use validation, optimistic concurrency, idempotency where replay is possible, and audit logging.
- Prototype records may be inserted only by an explicit authenticated test/prototype fixture and then travel through the production API.
- Production rendering never imports domain record constants.

## Delivery decomposition

### Release 1: Reference contracts and shared shell

Extract the canonical reference and reproduce the rail, context navigator, top bar, central canvas, inspector, tool registry, project orientation, standalone orientation, theme, responsive behavior, role lens, and God Mode discoverability.

### Release 2: SpecForge completion

Complete all reference workflows using one persisted specification model:

1. Overview
2. Pictorial Board
3. Sections
4. Products
5. Document Preview
6. Approvals
7. Budget & Risk
8. BoM/BoQ
9. Planning
10. Procurement
11. Issue & Distribute
12. Drawing Intelligence
13. Closeout
14. Integration

### Release 3: Design and compliance tools

Engineering Calculations, Planning, Municipal, XA, Forms, BoM/BoQ, BIM/IFC, and Documents/Drawings.

### Release 4: Project and practice tools

Meetings, Practice, Project Passport, Project Explorer, Professional Directory, Team Workspace, Inbox/Action Centre, Issues/RFIs, and Approval Queue.

### Release 5: Procurement and commercial tools

RFQ Marketplace, Supplier Catalogue, Market Insights, Fee Proposal, Insurance Register, Contract Administration, and Payments/Escrow.

### Release 6: Construction and closeout tools

Safety, ITP, Contractor Compliance, Site Instructions, NCR Manager, Snag Manager, FM Bridge, and related registers.

### Release 7: Specialist, administrative, and remaining tools

Environmental/Heritage, EIA, Refuse Calculator, NHBRC Enrolment, Survey/Geomatics, Council Navigator, Municipal Tracker, Remote Desktop, CPD Learning, Admin Review, Feedback, Wingman, and Iconography Registry.

Each tool is completed and browser-certified before the next tool begins. Site-wide completion requires the aggregate 47-tool gate after every individual tool gate is green.

## Functional mapping rules

Every reference control is mapped to one of four production behaviors:

| Reference behavior | Production behavior |
| --- | --- |
| Read, search, filter, or inspect | Query authenticated persisted records and preserve the exact visible filtering and ordering behavior. |
| Create, edit, approve, publish, or transition | Execute a validated, authorized API mutation with concurrency and audit records. |
| Cross-tool action | Create an idempotent command or record in the module that owns the destination workflow. |
| Unavailable external integration | Persist no fabricated domain result and render the reference workflow with a named `integration_required` state. |

Toast-only prototype actions are not considered implemented. A visible success state requires persisted state that survives reload or a real downstream job/command status.

## SpecForge production model

### Smart Add and candidates

Smart Add supports manual input, supplier URL, product image, personal library, practice library, platform library, project memory, and project drawing sources. Search results and candidates carry source type, source URL or document revision, provider, generated timestamp, confidence, and raw evidence references. Selecting a result opens an editable review surface. Candidate acceptance is a separate authorized and audited mutation; no candidate becomes a specification item automatically.

### Specification records

Workspaces, profiles, sections, clauses, items, alternatives, comments, approvals, costs, quantities, item links, drawing findings, distribution recipients, issue headers, immutable issue items, commands, and audit events are persisted records. Sections and items expose create, edit, review, assignment, decision, substitution, pricing, procurement, installation, site-evidence, and closeout actions according to the authenticated policy.

### Shared relationships

Drawing references, clauses, BoM/BoQ lines, documents, quotes, warranties, and site evidence use persisted item links. Planning, procurement, and closeout views project the same specification items and links rather than copying state into frontend-only collections.

### Approvals and professional responsibility

Authorized users can request scoped approvals, decide assigned requests, record decision notes, confirm professional responsibility, and inspect the corresponding audit trail. Client decisions, professional confirmations, budget review, section readiness, stale sources, and critical drawing findings participate in deterministic issue readiness.

### Issue and distribution

The issue workflow selects recipients and package/document scope, validates on the server, creates an immutable snapshot, advances the draft revision, records the audit event, and creates downstream work in one transaction. Editing an issued record creates a draft successor and never changes issued snapshot JSON or its hash. Replaying an issue command with the same key returns the same issue and creates no duplicate jobs.

### Cross-module outcomes

Issue and workflow actions target Action Centre, Messaging, Programme, BoM/BoQ, RFQ, Documents, Escrow, and Project Passport. The UI renders persisted `pending`, `processing`, `done`, `failed`, or `integration_required` status and supports idempotent refresh/retry where authorized.

## Authorization mapping

One generated/canonical role-capability manifest owns presentation discoverability and is checked mechanically against authoritative server policy and database grants. Role mapping covers tool discovery, view scope, authoring, reviewing, deciding, issuing, budget review, drawing requests, procurement, site updates, evidence, governance, and audited override capabilities.

God Mode changes discoverability and the presentation lens only. It never changes the authenticated role, tenant, project membership, record assignment, issue authority, or API authorization result.

## Pixel-level visual contract

The integrated HTML controls the complete visible presentation. Existing styles may remain only when their computed browser output matches the reference.

Parity includes:

- element rectangles, alignment, scroll ownership, and stacking;
- rail, navigator, top-bar, canvas, inspector, panel, table, card, and modal geometry;
- font family, size, weight, line height, letter spacing, and text transform;
- colors, gradients, borders, radii, shadows, opacity, and semantic state treatments;
- spacing, grids, table density, control dimensions, and icon size/stroke;
- default, hover, focus, active, expanded, selected, disabled, loading, error, empty, and conflict states;
- light theme, dark theme, reduced motion, desktop, tablet, and mobile behavior;
- keyboard order, visible focus, accessible names, and body-level overflow.

Browser contracts compare computed styles and bounding rectangles at fixed reference viewports. Screenshots provide supporting evidence. Allowed tolerances cover unavoidable subpixel rounding and font rasterization only; they do not permit different layouts, components, colors, copy, or workflows.

## Error and unavailable-state behavior

- `401` returns to the authenticated-session flow without a mock fallback.
- `403` explains scoped access without revealing foreign records.
- `404` distinguishes a permitted empty state from a non-disclosing foreign-record result.
- `409` preserves unsaved input and offers exact reload/compare recovery.
- `422` maps field and readiness errors to the responsible controls.
- `503` or missing connector configuration names the unavailable integration and leaves the core record unchanged.
- Failed issue or multi-record transactions roll back completely.
- Failed downstream integrations retain their command/job record and expose a safe retry path where the owning integration supports it.
- Loading and empty states preserve reference geometry and do not shift global shell regions.

## Testing and certification

Implementation follows red-green-refactor for each shell boundary and tool workflow.

### Generated reference gates

- deterministic extraction and byte-stable generated manifests;
- exact count and identity of 47 tools;
- stage, role, God Mode, tab, label, control, and interaction coverage;
- no unclassified reference controls or outcomes.

### Unit and component gates

- domain transitions, validation, visibility, readiness, revision, idempotency, and mapping functions;
- all loading, ready, empty, forbidden, conflict, validation, unavailable, and failure states;
- keyboard operation and accessible names for every reference control;
- no runtime imports of prototype record constants.

### Repository and API gates

- disposable MariaDB schema on an approved loopback host;
- migration, seed, authenticated CRUD, reload, concurrency, idempotency, audit, tenant isolation, project membership, assignment scope, and rollback;
- immutable issue/revision behavior and real downstream command state;
- guaranteed fixture cleanup even after a failed assertion.

### Browser and visual gates

- production build and isolated disposable data;
- authenticated desktop, tablet, and mobile journeys;
- all role lenses plus God Mode non-bypass behavior;
- complete tool interactions, refresh persistence, logout/relogin persistence, and cross-tool round trips;
- zero unexpected console errors, failed requests, or `5xx` responses;
- computed rectangle/style comparison, screenshot comparison, accessibility, reduced motion, and body-overflow checks.

### Aggregate completion gate

The site is complete only when all 47 tools have unique functional contracts, all individual tool gates pass without skips or retries, the site-wide navigation and cross-tool journeys pass, the production artifact is reproducible, and live deployment evidence separately proves authenticated API and MariaDB behavior. Focused tests, a build, static health, or screenshots alone cannot establish completion.

## Deployment and rollback

Local implementation and local production-build certification do not authorize or certify deployment. Deployment to a named test host requires an atomic artifact, exact asset hashes, API bundle/migration compatibility, backup, rollback instructions, authenticated live workflow, remote MariaDB read/write/reload evidence, and post-deployment observation. Production mutation requires separate explicit authorization.

## Decision log

- Use the reference-contract approach because it makes 47-tool drift mechanically detectable.
- Preserve production authentication and persistence rather than copying prototype state.
- Implement shell first, SpecForge second, then dependency-ordered tool families.
- Treat the reference's 14-view SpecForge workflow as required functionality even where the current ten-tab design is narrower.
- Represent unavailable integrations honestly rather than delaying the visible workflow or fabricating success.
- Work inline unless the user later explicitly requests delegated agents.
- Preserve existing dirty changes and commit only scoped parity artifacts.

## Acceptance criteria

- The supplied integrated HTML is the only visual and workflow reference consumed by the parity extractor and certification suite.
- The shared shell matches the reference across its required themes, states, and viewports.
- All 47 tools are registered, placed, rendered, and interactive according to the generated reference contracts.
- Every reference interaction is backed by persisted state, a real owning-module command, or a visible `integration_required` state.
- SpecForge exposes all 14 reference workflows over a single persisted, linked, revisioned specification model.
- Authentication, tenant isolation, record-level RBAC, God Mode non-bypass, concurrency, idempotency, audit, and rollback contracts pass.
- Every tool passes its individual functional, visual, accessibility, responsive, API, database-reload, and role gate.
- The aggregate 47-tool production-build browser gate passes with no skips, retries, unexpected errors, or fabricated states.
- Remote or release completion is claimed only after separate live deployment certification.
