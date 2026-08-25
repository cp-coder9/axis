# Architex Full V8 Prototype and Production Parity Design

Date: 2026-08-25

## Purpose

Build one production-grade Architex application whose public homepage and authenticated operating system follow two supplied authorities:

- Public homepage: `E:\axis-1\preview(3).html`.
- Authenticated application: `E:\Downloads\architex_datum_os_integrated_modules_v8_engineering_godmode.html`.

The application is deployed in two isolated environments from the same source:

- Prototype: `https://test.architex.co.za`, with the complete V8 demonstration dataset.
- Production: `https://architex.co.za`, with no mock, fixture, fallback, or demonstration records.

Both environments use real authentication, MariaDB persistence, RBAC, auditing, background processing, and the same interface and workflows.

## Binding product decisions

### Public and authenticated routes

- `/` is the public homepage reproduced from `preview(3).html`.
- `/signin` and `/register` are real authentication routes.
- Successful authentication redirects to `/dashboard`.
- `/dashboard`, `/projects/...`, `/tools/...`, `/settings`, and related destinations mount the authenticated V8 shell.
- Public-home calls to action use application routes rather than simulated modal copy.

### Environment and data isolation

The prototype and production deployments must use separate:

- MariaDB databases and credentials;
- API configuration and JWT/session secrets;
- file/object storage prefixes or buckets;
- cron/worker queues and logs;
- deployment artifacts and rollback records.

The prototype database may be seeded only by an explicit, idempotent V8 demonstration seeder. The production environment must reject demonstration seed execution and reject records tagged as mock, fixture, fallback, sample, or demo. There is no shared database and no production demo tenant.

### Production onboarding

- The first verified production registrant creates an organisation and receives `organisation_admin`.
- Later users join through audited, expiring invitations.
- Platform-owner access is provisioned separately and is not created through public registration.
- Empty production organisations remain fully usable through truthful empty states and creation workflows.

## V8 visual authority

The authenticated application treats the supplied V8 engineering/God Mode HTML as the visual and interaction authority for:

- 74 px steady-state rail, 306 px navigator, 344 px inspector, and 66 px top bar at the full desktop breakpoint;
- the teal, ink, mint, aqua, white, violet, coral, amber, green, and red palette;
- the Inter/system sans typography and reference scale;
- glass-like white shell surfaces, borders, shadows, radii, padding, and responsive collapse behavior;
- branded origami iconography and fold/outline treatment;
- Datum project-space geometry, stage rail, cards, connectors, zoom, fit, and selected states;
- top-bar control order, dimensions, labels, hover/focus states, and compact behavior;
- navigator groups, badges, tool statuses, project/standalone orientation, inspector tabs, feedback overlay, and module surfaces;
- God Mode, Engineering Hub, Meetings, Practice & Project Management, Wingman, and standalone-tool entry behavior.

The source HTML's embedded demo data is not a runtime data source. It is converted into the prototype seed dataset and acceptance fixtures.

## Theme contract

- The top bar exposes the canonical text-plus-icon theme action near its right edge.
- Light mode shows a moon icon and the destination label `Dark`.
- Dark mode shows a sun icon and the destination label `Light`.
- The accessible name remains `Switch colour theme` and dark state is exposed through `aria-pressed`.
- Theme preference uses `architex-theme`, applies at the document root, and persists across authentication and navigation.
- Theme tokens must restyle the complete shell and module surfaces; no hard-coded light-only islands remain.

## God Mode contract

God Mode is a persistent toggle beside the role selector. It removes role-based UX filtering without bypassing record authorization.

When enabled it provides:

- every live tool and scaffold in one catalogue;
- all eight project stages;
- all user-role lenses;
- the handoff sequence `Client -> Lead BEP -> Engineers -> QS -> Contractor -> Subcontractors -> Suppliers -> Authorities -> Handover`;
- quick access to Datum Project Space, Engineering Hub, Meetings, Practice & Project Management, Wingman, and all standalone tools;
- all stage-relevant tools on the Datum rather than only role-prioritised tools;
- the selected user's role as an active viewing lens.

God Mode can expose navigation, descriptions, schemas, learning content, and permitted records. Every API query and mutation continues to enforce organisation, project, record, and action permissions. Role preview changes presentation only and never changes the signed identity or permission set.

## Authentication and session architecture

The existing session-storage access bypass is removed. Authentication uses the PHP API and MariaDB users:

1. Registration verifies email, creates the first organisation when allowed, hashes the password, assigns the initial role, and writes an audit event.
2. Login validates credentials and returns short-lived access plus rotating refresh credentials.
3. The browser stores access credentials in memory and refresh credentials in a Secure, HttpOnly, SameSite cookie where hosting supports it. A bearer fallback may be used only if the cookie boundary is technically unavailable and is documented as a release risk.
4. The client obtains the active profile, organisation, roles, project memberships, and permissions from `/api/v1/auth/me`.
5. Route guards render loading, unauthenticated, forbidden, and authenticated states without revealing protected content.
6. Sign-out revokes the refresh session and clears local identity state.

Header-based `X-Architex-*` demo identity is never accepted outside an explicitly local developer environment.

## RBAC and tenancy

- Signed identity is authoritative; UI role selection is never authoritative.
- Organisation-scoped tables include and enforce organisation ownership.
- Project-scoped reads and writes require membership unless the signed role has an explicit platform permission.
- Permission resolution comes from MariaDB grants and fails closed when the database is unavailable.
- No production permission path falls back to a PHP constant, frontend map, or fixture.
- API list, create, update, decision, export, and administrative routes each declare and test their required permission.
- Audit records capture actor, organisation, project, action, target, outcome, request correlation ID, and timestamp.

## Persistence and module functionality

Every interactive control must be classified and completed as one of:

- navigation or presentation state with deterministic browser behavior;
- persisted domain mutation through an authenticated API route;
- background job submission with durable status, retry, and error reporting;
- explicitly read-only reference action with a visible explanation.

Prototype in-component seeds such as Documents, Fee Proposals, Feedback, Compliance, Contract Administration, Disputes, and Council records are moved to MariaDB prototype seeds. Production components begin with API-backed empty collections. Network or database failures render explicit error/retry states and never silently load fixture data.

All 47 registered tools remain browsable. A tool marked scaffold is clearly labelled, exposes its intended inputs/outputs and access requirements, and does not imitate successful persistence. Production readiness for a tool requires authenticated create/read/update flows, reload proof, RBAC proof, and audit proof.

## Background work

- Queued calculations, drawing intelligence, document processing, AI candidates, and other long-running work use MariaDB job records.
- `backend/worker.php` claims jobs atomically, records attempts and last errors, and applies bounded retry rules.
- Prototype and production use separate cron invocations and logs.
- A health/readiness route reports worker freshness and queue depth without exposing secrets.

## Public homepage integration

The public homepage preserves the supplied layout, embedded Architex identity, content hierarchy, responsive behavior, keyboard accessibility, and public Wingman presentation. Simulated buttons are replaced with real destinations:

- `Sign in` -> `/signin`;
- account creation -> `/register`;
- authenticated project creation -> `/projects/new`;
- unauthenticated project creation first enters registration and resumes the intended destination afterward.

Public Wingman must be explicitly rate-limited and must not receive or reveal organisation data before authentication.

## Release decomposition

The program is delivered as separately testable slices from the same design:

1. Environment policy, authentication, tenant creation, invitations, and fail-closed RBAC.
2. Public homepage integration and authentication handoff.
3. Exact V8 shell, iconography, responsive geometry, theme, navigation, and God Mode.
4. MariaDB-backed project Datum, Command Centre, Meetings, Practice, Engineering, Documents, Approvals, Actions, and audit workflows.
5. Remaining tool families, scaffold contracts, workers, and queue observability.
6. Prototype seeding, production no-mock enforcement, deployment, rollback, and release certification.

No slice may claim the whole product production-ready. Local verification, prototype deployment verification, and production release certification remain separate states.

## Verification and acceptance

### Visual parity

- Render reference and implementation at the same desktop, tablet, and mobile viewports.
- Compare bounding rectangles and computed styles for rail, navigator, top bar, main canvas, inspector, controls, typography, surfaces, and icons.
- Disable steady-state entry animation before geometry capture.
- Maintain reference screenshots and an allowed-difference ledger; unexplained differences fail the gate.

### Functional parity

- Browser tests cover every top-level destination, every top-bar action, role lens, God Mode lifecycle, Datum stage selection, zoom/fit, navigator mode, inspector tabs, feedback, and representative module workflows.
- Button and link inventories must have no inert controls.
- Refresh/relogin tests prove persistence rather than local React state.

### Security and data

- Registration, verification, login, refresh, sign-out, invitation, revocation, and recovery are tested.
- Cross-organisation and non-member project access return `403` without record leakage.
- God Mode tests prove full structural discovery and unchanged API authorization.
- Production build and database tests prove there are no demo users, projects, actions, documents, meetings, fallback arrays, or seed execution paths.

### Operational readiness

- API health, database health, worker freshness, queue depth, CORS, TLS, cache behavior, backups, migrations, and rollback are verified independently.
- The prototype receives the seeded dataset only after an exact database backup and target check.
- Production deployment requires an empty/new production schema or an approved migration and backup record; it is never inferred from prototype success.

## Current gaps this design resolves

- `AccessGateway` currently grants access through session storage without authentication.
- The frontend currently sends demo identity headers instead of signed production identity.
- API permission lookup can fall back to constants when MariaDB is unavailable.
- Project and module views can silently fall back to frontend/PHP fixtures.
- Several modules initialise mutable UI state from local seed arrays.
- The workspace theme currently uses the wrong key, incomplete document scope, icon-only presentation, and incomplete dark-surface coverage.
- The public homepage currently exists only as a standalone HTML file with simulated authentication actions.
- Prototype and production data policy is not mechanically enforced.

## Non-goals

- God Mode does not grant cross-organisation data access.
- The production environment does not contain demo tenants or fixtures.
- Visual parity does not justify bypassing authentication, RBAC, audit, persistence, or professional calculation controls.
- A static build, health response, or local test suite alone does not certify production readiness.
