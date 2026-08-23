# Architex OS — Multi-Agent Architecture Review

This review consolidates three parallel specialist analyses of the existing Architex PRDs, prototype, decoded modules, tool registry, frontend architecture, PHP API and MariaDB design.

## Recommended MVP sequence

1. **Platform foundation** — authentication, organizations, 20-role RBAC, projects, stage history, module registry, audit trail, jobs queue, document primitives, and responsive four-layer Datum shell.
2. **Canonical project context** — Project Command Centre and Project Passport. All module records must carry `organization_id`, `project_id`, lifecycle stage, permissions, and audit context.
3. **Client acquisition** — guided brief, evidence uploads, plain-language project route, verified professional search, invitations, proposal comparison, and appointment handoff.
4. **Appointment/commercial workflow** — professional verification, directory, fee proposals, basic signing, Team Workspace, and project activation.
5. **Cross-cutting execution rails** — Action Centre, Approvals Queue, contextual messaging, Documents & Drawings, notifications, and immutable activity stream.
6. **Meetings reference module** — schedule, consent, live-room integration, transcript/minutes drafting, human review, issued records, and idempotent write-back.
7. **Native core modules** — Wingman, Forms, Town Planning, Municipal, XA, SpecForge, BoM/BoQ, ITP, Safety, and Feedback Intelligence.
8. **Payment workflow only** — invoices, requests, approval/release status, and audit trail. Defer actual escrow/fund holding until a licensed partner and legal model are agreed.

## Non-negotiable acceptance criteria

- Role and project authorization is enforced server-side; role switching in the UI is never an authorization mechanism.
- Every module supports project-connected and standalone orientation.
- Every write produces an immutable audit record.
- AI outputs remain drafts until an authorized human explicitly accepts, rejects, edits, or publishes them.
- The Command Centre is role-specific and shows stage, progress, next action, approvals, overdue work, risks, documents, payments, programme, and contextual messages.
- Documents & Drawings supports revisions, current-set control, transmittals, markups, and shared evidence links.
- Meetings lifecycle is `Draft → Scheduled → LobbyOpen → Live → Processing → ReviewRequired → Published`.
- Meeting consent gates recording/transcription; published minutes are immutable and corrections create new revisions.
- Long-running AI, transcription, drawing and export work uses the MariaDB `jobs` table plus cPanel cron.
- Under 760px the Datum canvas becomes a vertical stage/action view with no lost core functionality.
- Compliance, XA, SANS and drawing-derived outputs are advisory until professional review/sign-off.

## Frontend target architecture

### Routing

Canonical state should be URL-addressable:

- `/projects/[projectId]`
- `/projects/[projectId]/tools/[toolId]?tab=...`
- `/tools/[toolId]?tab=...`
- `/inbox/meetings?screen=review`

### Component hierarchy

- `app/(os)/layout.tsx`
  - `AppShell`
    - `GlobalRail`
    - `TopBar`
    - `ContextNavigator`
    - `MainWorkspace`
    - `ContextInspector`
    - `FeedbackDock`
    - `ToastProvider`
- `DatumProjectPage`
  - `ProjectHeader`
  - `StageStepper`
  - `RoleBanner`
  - `DatumViewport`
  - `ToolRegistrySections`
- `ToolWorkspacePage`
  - `NativeToolAdapter`
  - `LegacyToolAdapter`
  - `ScaffoldTool`
- `MeetingsWorkspace`
  - `MeetingHome`
  - `ScheduleWizard`
  - `PreJoin`
  - `LiveRoom`
  - `MinutesReview`
  - `IssuedMinutes`

### State strategy

- Server components/API: canonical user, organization, project, registry, permissions, and record data.
- URL: current project, tool, tab/screen, and project/standalone orientation.
- TanStack Query: mutable server data and cache invalidation.
- Local/Zustand state only for shell UI: rail, navigator, inspector, zoom, toasts and temporary panel state.
- WebRTC controls remain transient and separate from persisted Meetings records.

### Styling

Use CSS-variable-backed Architex tokens and Tailwind utilities:

- `--ax-teal: #19B7B0`
- `--ax-deep: #167E79`
- `--ax-jade: #58C8BC`
- `--ax-mint: #BFE9E2`
- `--ax-aqua: #DFF5F2`
- `--ax-ink: #102033`
- `--ax-muted: #657287`

Use CSS Modules for the Datum canvas, meeting room, review layout, and other complex compositions. Centralize status styles, semantic icons, focus states, touch targets, and reduced-motion handling.

## Backend and database sequence

The starter migration already establishes a safe subset. Extend it in ordered migrations:

1. `001_core_identity` — organizations, users, roles, user roles, refresh/API tokens.
2. `002_seed_roles` — all 20 PRD roles.
3. `003_modules_registry` — seed the canonical tool registry.
4. `004_role_permissions` — module/action permission matrix.
5. `005_projects_datum` — projects, teams, passport snapshots, stage/activity history.
6. `006_cross_cutting_registers` — action items, approvals, notifications, audit log.
7. `007_async_jobs` — cron-compatible work queue.
8. `008_documents_drawings` — documents and drawing revisions.
9. `009_feedback_loop` — feedback, clusters, briefs and roadmap.
10. `010_ai_foundation` — conversations, messages, provenance and usage.
11. `011_meetings_reference_module` — complete meeting lifecycle and write-back ledger.
12. `012_project_passport_action_centre` — project read models.
13. `013_forms_municipal_xa` — compliance chain.
14. `014_specforge_bom_shared_products` — shared material/product and extraction model.
15. `015_site_execution_core` — ITP, Safety, NCR and instructions.
16. `016_constraints_indexes` — indexes, uniqueness and MariaDB-compatible checks.
17. `017_retention_and_popia` — consent, confidentiality, expiry and retention cleanup.

## Immediate API priorities

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/me`
- `GET /api/v1/modules-registry`
- `GET|POST /api/v1/projects`
- `GET|PATCH /api/v1/projects/{uuid}`
- `GET /api/v1/projects/{uuid}/datum`
- `POST /api/v1/projects/{uuid}/stage`
- Project team/passport endpoints
- Document/drawing revision endpoints
- Action-item and approval endpoints
- Audit-log and job-status endpoints
- Full Meetings lifecycle endpoints

## Reconciliations required

1. **Module count:** Resolved. The canonical `tools.json` now contains exactly 46 entries: 1 native module (Architex Meetings), 11 functional sample modules, and 34 scaffold modules. References to 53 are superseded marketing/roadmap planning counts with no deployable registered IDs. `backend/data/platform-policy.json` records the resolution.
2. **Marketplace versus platform roadmap:** one scope prioritizes marketplace/payment; the technical PRD prioritizes foundation/core modules. Resolve this as a product decision before Sprint 2.
3. **Municipal overlap:** reconcile Municipal Approval Readiness, Municipal Tracker, and Council Drawing Navigator.
4. **Drawing intelligence:** build one shared extraction/confidence service for SpecForge, BoM, Municipal and BIM/IFC.
5. **Role model:** separate platform role, project role, meeting role, credentials, and approval authority.
6. **POPIA:** decide data residency, retention, consent, and cross-border processing before selecting AI/video/storage providers.
7. **Project switching:** add dirty-state protection, autosave/drafts, and explicit confirmation before switching projects.
