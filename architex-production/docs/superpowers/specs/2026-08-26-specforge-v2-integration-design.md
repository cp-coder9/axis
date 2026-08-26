# SpecForge V2 Integration Design

**Date:** 2026-08-26

**Status:** Approved design

**Source pack:** `E:\arc-1\specforge-pack`

**Target:** Architex Datum OS V8 in `E:\axis-1\architex-production`

## Purpose

Replace the current mock-only `SpecForgeModule` with a functional, project-connected specification workspace derived from the supplied SpecForge pack. The result must retain Datum OS V8 shell and theme parity, use real authentication and MariaDB persistence, enforce record-level RBAC, and expose honest prototype and production states.

SpecForge is the specification layer connecting clauses, pictorial product selections, project drawings, approvals, budgets, BoM/BoQ records, issue sets, procurement actions, and closeout evidence. It is not an iframe, isolated demo, or second application shell.

## Source-of-truth boundaries

- The supplied SpecForge pack defines domain concepts, workflow behavior, role capabilities, and product interaction requirements.
- The supplied Datum OS V8 reference defines shell geometry, iconography, density, navigation ownership, responsive behavior, and light/dark theme appearance.
- The Architex API and MariaDB database are authoritative for users, organizations, projects, memberships, SpecForge records, actions, jobs, and audits.
- Existing Architex project, authentication, navigation, and theme contracts remain authoritative. Pack code is adapted to those contracts rather than copied wholesale.
- Production never derives records from frontend constants. Prototype seed data is inserted into MariaDB by an explicit prototype seed operation and then uses the same API as production.

## Scope

### Included

- A project-scoped SpecForge workspace and optional standalone library orientation.
- Setup/profile, trade sections, pictorial selections, product register, document composition, approval register, cost exposure, BoM/BoQ links, drawing coordination findings, issue/distribution, and audit history.
- Smart-add entry points for text, supplier URL, image, library, drawing suggestion, duplication, and manual entry.
- Real CRUD and reload persistence for workspaces, sections, specification items, approvals, drawing links/findings, and issue sets.
- Immutable issued snapshots. Editing an issued specification creates a new draft revision.
- Server-side authorization using organization membership, project membership, active role, item assignment, and issue state.
- Audited downstream commands for Action Centre, messaging, programme, BoM/BoQ, RFQ, escrow, and document generation.
- Existing Gemini-backed intelligence only through server-side services with source/provenance metadata and mandatory professional confirmation.
- V8 light/dark parity, responsive behavior, keyboard access, reduced-motion behavior, and no duplicate shell chrome.

### Excluded from this slice

- Direct supplier-catalog scraping without a licensed supplier integration.
- Direct mutation of third-party OpenProject, payment, or supplier systems unless an existing configured service already owns that operation.
- Automatic professional approval, automatic standards compliance claims, or automatic publication of AI-generated clauses.
- Fabricated success states for integrations that are unavailable. Such operations remain persisted as queued, failed, or integration-required commands.

## Architecture

SpecForge is divided into four bounded layers:

1. **Domain layer** — typed entities and pure policy/readiness/budget/revision functions adapted from the pack.
2. **Persistence and API layer** — MariaDB repositories, transactions, route handlers, server-side RBAC, audit logging, and downstream command creation.
3. **Client service layer** — authenticated `/api/v1` requests, stable error mapping, and explicit prototype seed status.
4. **V8 workspace layer** — a single child workspace rendered inside the existing `ToolHost`; it owns SpecForge controls and content while the V8 shell owns global navigation, identity, role/theme controls, inspector, and orientation.

The UI never imports seeded domain records. It receives a workspace payload from the API and renders loading, ready, empty, forbidden, conflict, and error states explicitly.

## Data model

All tables use UUID string identifiers, UTC timestamps, organization ownership, and foreign keys compatible with the existing core schema.

### `specforge_workspaces`

- `id`, `organization_id`, `project_id`
- `profile`, `stage`, `revision`, `issue_status`
- `created_by`, `updated_by`, `created_at`, `updated_at`
- Unique active workspace constraint for `organization_id + project_id`

### `specforge_sections`

- `id`, `workspace_id`, `code`, `title`, `discipline`
- `owner_role`, `reviewer_role`, `status`
- `standard_source`, `source_revision`, `last_reviewed_at`
- `created_by`, `updated_by`, `created_at`, `updated_at`

### `specforge_items`

- `id`, `workspace_id`, `section_id`, `code`, `title`
- `room`, `package_name`, `description`
- `supplier`, `model`, `finish`, `dimensions`, `image_url`
- `budget_allowance`, `estimated_cost`, `lead_time_days`
- `client_decision`, `owner_role`, `reviewer_role`, `approver_role`
- `status`, `source_revision`, `superseded_by`
- `created_by`, `updated_by`, `created_at`, `updated_at`

### `specforge_item_links`

- `id`, `item_id`, `link_type`, `target_id`, `label`, `source_revision`
- Supported types: `drawing`, `clause`, `bom_line`, `document`, `quote`, `warranty`, `site_evidence`

### `specforge_approvals`

- `id`, `workspace_id`, `item_id`, `approval_type`
- `requested_role`, `requested_user_id`, `status`, `decision_note`
- `requested_at`, `due_at`, `decided_at`, `decided_by`

### `specforge_drawing_findings`

- `id`, `workspace_id`, `drawing_revision_id`, `item_id`
- `severity`, `finding`, `status`, `source_payload`, `reviewed_by`, `reviewed_at`

### `specforge_issues` and `specforge_issue_items`

- Issue header: `id`, `workspace_id`, `revision`, `title`, `audience`, `status`, `snapshot_hash`, `issued_by`, `issued_at`
- Issue items store immutable JSON snapshots of included sections, items, links, approvals, and distribution scope.
- A transaction creates the issue, snapshots its records, advances workspace revision state, appends an audit event, and creates downstream commands.

Existing `action_items`, `jobs`, `documents`, `approvals`, `project_module_records`, and `audit_log` tables are reused where they already own the relevant cross-module record.

## API contract

All routes live under `/api/v1`, require normal bearer/session authentication, and derive organization/user identity from the authenticated session rather than request headers.

- `GET /projects/:projectId/specforge` — load the authorized workspace aggregate or an explicit empty state.
- `POST /projects/:projectId/specforge` — create the project workspace.
- `PATCH /projects/:projectId/specforge` — update profile/stage metadata.
- `POST /projects/:projectId/specforge/sections`
- `PATCH /projects/:projectId/specforge/sections/:sectionId`
- `POST /projects/:projectId/specforge/items`
- `PATCH /projects/:projectId/specforge/items/:itemId`
- `POST /projects/:projectId/specforge/items/:itemId/duplicate`
- `POST /projects/:projectId/specforge/items/:itemId/approvals`
- `POST /projects/:projectId/specforge/approvals/:approvalId/decision`
- `POST /projects/:projectId/specforge/intelligence/suggest` — create source-attributed candidates without directly mutating accepted records.
- `POST /projects/:projectId/specforge/drawing-scans` — enqueue a drawing-intelligence job.
- `POST /projects/:projectId/specforge/issues/validate` — return deterministic readiness blockers.
- `POST /projects/:projectId/specforge/issues` — create an immutable issue only when validation and permissions pass.
- `GET /projects/:projectId/specforge/audit` — return project-scoped SpecForge audit history.
- `GET /specforge/library` — return authorized personal/practice/platform library results with anonymization rules.

Mutations use optimistic concurrency via `updated_at` or revision tokens. Stale writes return `409` with the current record version. Validation errors return field-specific `422` responses. Missing integration configuration returns `503` without pretending a downstream action completed.

## Authorization and RBAC

God Mode changes structure-wide discoverability only; it never bypasses these record policies.

- `architect` and `bep`: full project specification authoring, role assignment, professional confirmation, issue, and substitution decisions.
- `engineer`, `energy_professional`, and `fire_engineer`: assigned technical section authoring and professional confirmation.
- `quantity_surveyor`: project view, cost review, cost-risk flags, and cost exports; no clause issue authority.
- `client` and `developer`: only client-decision items, comments, and client decisions.
- `contractor`: issued scope, clarification/substitution requests, pricing, and procurement status.
- `subcontractor` and `supplier`: assigned package/product scope only.
- `site_manager`: issued scope, installation status, site evidence, and conflicts.
- `admin` and `platform_admin`: library/template governance and audited overrides within their organization/platform authority.

Every API read and mutation checks organization isolation first, project membership second, capability third, assignment/scope fourth, and record state last. Denials are audited without leaking the existence of another organization's records.

## V8 workspace design

The existing `ToolHost` remains the only route/workspace host. The new SpecForge workspace does not render an application rail, top bar, role selector, theme switcher, inspector, project picker, or duplicate identity banner.

### Workspace header

- V8 `PageHeader` with the canonical `specification` origami icon.
- Project name, profile, active revision, and issue state in compact metadata.
- Primary actions: `Add specification` and `Prepare issue` when authorized.
- Existing controlled tool-tab navigation remains the source of tab selection and browser history.

### Smart-add experience

- A V8 compact command surface with one persistent input: `Type a product, paste a supplier URL, or describe the requirement`.
- Secondary methods: image, library, drawings, duplicate, and manual.
- Search results identify their source as project memory, practice library, platform library, supplier data, or AI candidate.
- Selecting a result opens a review drawer/form. No candidate becomes a specification item until an authorized user confirms it.

### Workspace tabs

- `Overview`: readiness, blockers, next actions, cost/drawing/approval summary.
- `Pictorial Board`: responsive product imagery tied to the same persisted items.
- `Trade Sections`: section and clause ownership/review state.
- `Product Register`: filterable project records and alternatives.
- `Document Preview`: living draft and immutable issued revision preview.
- `Approval Register`: scoped decisions and audit trail.
- `Budget & Cost Risk`: allowances, estimates, deltas, and QS review state.
- `BoM / BoQ Link`: persisted links and explicit unavailable states.
- `AI Drawing Scan`: queued jobs, source revisions, candidates, and human review.
- `Issue & Distribute`: readiness gate, recipients, immutable issue creation, and downstream command results.

### Theme and visual parity

- Use V8 semantic variables such as `--ax-text`, `--ax-text-muted`, `--ax-surface-1`, `--ax-surface-2`, `--ax-border`, `--ax-datum`, and elevation tokens.
- Cobalt is the SpecForge domain accent; teal remains the Datum/action accent and green/amber/red remain status semantics.
- Do not use hard-coded `bg-white`, light-only gray surfaces, legacy V7 chrome, or a second type system.
- Preserve V8 density, 13px working labels, compact 11px metadata, 13px radii for rows, 15px card radii, visible keyboard focus, and reduced-motion behavior.
- At narrow widths, tables become horizontally contained, cards collapse to one column, actions wrap, and the page must not create body-level horizontal overflow.

## Prototype and production behavior

`NEXT_PUBLIC_PROTOTYPE_MODE=true` permits an authenticated, idempotent server-side seed operation for the designated demo organization/project. Seeded records are marked as seed provenance and persist in MariaDB like normal records.

Production builds do not call the seed operation and contain no SpecForge record constants. A project without a workspace receives a role-aware empty state with `Create specification workspace` for authorized users and a read-only explanation for other roles.

## Intelligence and downstream integrations

- AI and drawing analysis return candidates with provider, source URL/document revision, generated timestamp, confidence, and raw evidence references.
- Candidate acceptance is a separate authorized mutation and audit event.
- Issue creation may atomically create Action Centre items and queued jobs for messages, programme milestones, BoM/BoQ synchronization, RFQs, documents, and escrow requirements.
- A downstream worker records `queued`, `running`, `completed`, `failed`, or `integration_required`; the UI shows those real states.
- Retries are idempotent using the issue ID plus command type as the idempotency key.

## Error and state handling

- Loading uses a V8 workspace skeleton without shifting shell geometry.
- Empty state explains whether no workspace, no records, or no visible records exists.
- `403` renders a scoped access explanation and does not fall back to mock data.
- `409` offers reload/compare guidance and retains unsaved form values.
- `422` maps errors to the relevant fields/readiness controls.
- `503` names the unavailable integration and leaves the core persisted record unchanged.
- Issue transactions either commit the snapshot, audit event, and downstream commands together or roll back completely.

## Testing and certification

Implementation follows red-green-refactor for each boundary.

- Pure domain tests: role visibility, budget summary, readiness blockers, issue immutability, revision transitions, and candidate acceptance.
- Repository/API tests: organization isolation, project membership, role and assignment policy, CRUD/reload, stale-write conflict, issue transaction, audit creation, and prototype seed idempotency.
- Component tests: API states, controlled tabs, smart-add confirmation, form validation, role-aware actions, error recovery, and theme-token use.
- Browser tests: project and standalone orientation, keyboard navigation, light/dark persistence, mobile overflow, issue gating, refresh persistence, logout/relogin, and record-level RBAC including God Mode.
- Visual evidence: side-by-side screenshots and computed rectangles/styles against the supplied V8 reference shell at desktop and mobile widths.
- Release certification: fresh static production export using `/api/v1`, atomic FTPS deployment to `test.architex.co.za`, exact asset hash match, authenticated live workflow, MariaDB read/write/reload proof, zero failed requests, and zero 5xx responses.

Local certification and live release certification remain separate. A clean build or focused test suite does not establish remote MariaDB or deployment readiness.

## Delivery sequence

1. Domain types, policies, readiness, and tests.
2. Additive MariaDB migration, repository, API, and authorization tests.
3. Authenticated client service and explicit state model.
4. V8 workspace shell and overview/smart-add flow.
5. Sections, products, pictorial, approvals, budget, and drawing flows.
6. Immutable issue/distribution transaction and downstream commands.
7. Prototype seed, production empty-state proof, browser/visual certification.
8. Static export, atomic test-host deployment, live API/MariaDB certification, and evidence commit.

## Acceptance criteria

- The current mock-only SpecForge constants no longer provide runtime records.
- A permitted user can create or load a workspace, add/edit a specification item, reload, and see the same MariaDB record.
- An unauthorized role or cross-organization user cannot read or mutate the record.
- Issued snapshots are immutable and a subsequent edit occurs in a new revision.
- Smart-add candidates show provenance and require explicit confirmation.
- Issue readiness prevents publication while required approvals, budget review, stale sources, or critical drawing findings remain unresolved.
- Downstream work is represented by real persisted commands and statuses, never toast-only success.
- The workspace follows V8 light/dark, desktop/mobile, keyboard, and shell-ownership contracts.
- Prototype mode uses persisted seeded data; production contains no mock SpecForge data.
- Test-host browser certification proves real authentication, API access, MariaDB persistence/reload, RBAC, theme persistence, and the core issue workflow.
