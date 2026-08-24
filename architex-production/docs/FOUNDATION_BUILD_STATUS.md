# Architex Foundation Build — Implementation Status

## Delivered

### Canonical module registry — DB-driven

- `E:/axis-1/tools.json` is the canonical registry.
- Exactly **47 modules** are registered.
- Native **Architex Meetings** is included explicitly.
- The MariaDB `modules` table is now the API's source of truth. `modules()` in `backend/public/index.php` reads rows and reproduces the full API contract shape (`id, name, icon, tone, group, stage, summary, tabs, source, status, governance, implementation_status`), falling back to `backend/data/modules.json` when MariaDB is unreachable.
- Migration `008_module_registry_fidelity.sql` adds `implementation_status` (native|sample|scaffold) and `governance_json` so each DB row is a faithful mirror of the canonical registry; current parity is verified separately by `npm run validate:registry`.
- Earlier references to 53 tools are treated as superseded planning counts.
- Backend registry mirrors the same 47 entries in `backend/data/modules.json`.

### Project Passport

- Native frontend module: `components/modules/ProjectPassportModule.tsx`
- API:
  - `GET /api/v1/projects/{projectId}/passport`
  - `PATCH /api/v1/projects/{projectId}/passport`
- MariaDB table: `project_passports`
- Versioned, RBAC-protected and audited.

### Documents & Drawings

- Native frontend module: `components/modules/DocumentsDrawingsModule.tsx`
- API:
  - `GET /api/v1/documents?project={projectId}`
  - `POST /api/v1/documents`
- MariaDB tables:
  - `documents`
  - `document_revisions`
  - `drawing_register`
  - `drawing_revisions`
- UI identifies controlled current-set records and revision purposes.

### Action Centre

- Native frontend module: `components/modules/ActionCentreModule.tsx`
- API:
  - `GET /api/v1/action-items?project={projectId}`
  - `PATCH /api/v1/action-items/{id}`
- Cross-module source attribution and audited status changes.

### Approvals

- Native frontend module: `components/modules/ApprovalsModule.tsx`
- API:
  - `GET /api/v1/approvals?project={projectId}`
  - `POST /api/v1/approvals/{id}/approve`
  - `POST /api/v1/approvals/{id}/reject`
- MariaDB tables: `approvals`, `approval_steps`
- Required-role decisions are server enforced; decided approvals cannot be overwritten.

### RBAC and audit logging

- PHP API has an explicit permission matrix for the foundation routes.
- Local-only demo identity headers:
  - `X-Architex-Role`
  - `X-Architex-User`
- Outside `APP_ENV=local`, the API requires a signed HS256 bearer JWT containing `sub`, `role`, and `exp`; default/empty production secrets fail closed.
- API audit endpoint: `GET /api/v1/audit-log`
- Every foundation mutation records actor, role, action, entity, timestamp and details.

### Human-governed AI

- MariaDB table: `ai_candidates`
- API review endpoints:
  - `POST /api/v1/ai-candidates/{id}/accept`
  - `POST /api/v1/ai-candidates/{id}/reject`
- Accepting a candidate records a human decision but does **not** publish it automatically.
- Provenance and confidence are carried with every candidate.

### Shared drawing intelligence

- One service contract serves:
  - SpecForge
  - BoM/BoQ
  - Municipal
  - BIM/IFC
  - XA as a permitted compliance consumer
- API: `POST /api/v1/drawing-intelligence/jobs`
- MariaDB table: `drawing_intelligence_jobs`
- All output returns as review-required AI candidates.

### Meetings reference module

- Native Meetings UI remains the first reference module.
- Added visible governance/audit preview.
- Outcome decisions are human actions.
- Publish is blocked while any outcome remains pending.
- Publish creates revision `M01` and records idempotent write-back state.
- Duplicate publication is prevented.
- API: `POST /api/v1/meetings/{id}/publish`
- MariaDB table: `meeting_write_back_log`

### Payments and escrow

- Registry label: **Payments & Escrow (Workflow Only)**.
- Invoice, milestone, approval, retention and release-status workflows remain in scope.
- `fund_holding_enabled` is explicitly `false`.
- Actual escrow/fund holding is deferred pending legal review and a licensed payment/escrow partner.

## Security hardening (post independent review)

The first independent security review failed the build; all critical/high findings were fixed and verified:

1. **Fail-closed authentication** — header-based identity (`X-Architex-Role`/`X-Architex-User`) is accepted ONLY when `APP_ENV=local` is explicitly set, and both headers are then REQUIRED (no default role). Any other environment requires a signed HS256 JWT with `sub`, `role`, `org`, `projects`, `exp`. Unauthenticated requests return 401.
2. **Object-level authorization** — `require_project_access` on every project-scoped route; `require_collection_scope` forces a `project` query parameter for every role except `platform_admin`; `/projects` and `/audit-log` are filtered by identity claims/org.
3. **Atomic JSON store** — `mutate_json_file()` performs read-modify-write entirely inside one exclusive `flock`; write/fflush results are checked; readers never observe partial files.
4. **Object validation** — project existence is verified before passport/document/drawing-job mutations; document status, action status and priority, and passport field types are whitelisted/enumerated.
5. **Sequential approvals** — the API now walks `approval.steps[]` (`current_step`, per-step role, note, `completed_at`), matching the schema, instead of flipping the whole approval flat.
6. **Chair-governed meetings** — outcome decisions and publish require the caller to BE the meeting chair (or `platform_admin`); non-chair users get 403.
7. **Real governed write-backs** — publishing creates one Action Centre item plus one `write_backs` ledger row (idempotency-keyed `wb-{meeting}-{outcome}-M01`) per accepted outcome; rejected outcomes create none; duplicate publish returns `idempotent: true` with zero new rows.
8. **AI candidate → approval gate** — accepting a candidate now creates a pending sequential approval (`entity_type: ai_candidate`) before any publication can occur; acceptance alone never publishes.
9. **Passport draft → publish gate** — PATCH creates a draft (`status: draft`); only `POST .../passport/publish` (permission `passport.publish`) promotes it and increments the version.
10. **Frontend/backend authorization drift** — Action Centre and Documents & Drawings buttons are role-disabled to match the backend permission matrix.
11. **Schema referential integrity** — `documents.current_revision_id`, `drawing_register.current_revision_id`, and `drawing_intelligence_jobs.source_revision_id` now have foreign keys.
12. **Policy consistency** — `xa` is a declared drawing-intelligence consumer; policy file no longer contains absolute filesystem paths.
13. **Registry lifecycle metadata** — Project Passport, Documents & Drawings, Action Centre, and Approvals Queue are marked `live` in `tools.json`, `backend/data/modules.json`, and `lib/data.ts`; `implementation_status` distinguishes `native|sample|scaffold`.
14. **Validation** — `scripts/validate-foundation.mjs` now asserts exact ID parity across all three registries, the XA consumer, and implemented-module live status.

API version bumped to `0.3.0`. All re-verification commands pass (`npm test`, typecheck, lint, build, `php -l`), and live API tests confirm: 401 without headers, passport draft→publish, sequential approval completion, 422 unscoped collections for clients, 403 non-chair outcome decisions, idempotent publish with write-backs, and approval creation on AI-candidate accept.

## Verification

Passed:

```bash
npm test
npm run typecheck
npm run lint
npm run build
php -l backend/public/index.php
```

API checks confirmed:

- Health reports canonical registry metadata; current count is verified by `npm run validate:registry`.
- Registry contains Meetings.
- Project Passport and Approvals return scoped project data.
- Client drawing-intelligence request is denied with HTTP 403.
- Meeting publication with a pending AI-derived outcome is denied with HTTP 409.
- Audit entries are generated for Passport access.
- Platform policy reports workflow-only payments and disabled fund holding.
