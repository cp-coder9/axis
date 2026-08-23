# Architex OS Continuation Plan

> **For Hermes:** Use subagents for independent slices: frontend shell integration, PHP API/RBAC, MariaDB migrations/seeds, module graduation, QA.

**Goal:** Turn the Architex prototype/PRDs into a production-ready Next.js + PHP + MariaDB application, starting from the extracted `architex-production` starter.

**Architecture:** Keep the prototype's four-layer Datum UI shell as the persistent frontend layout. Move all canonical data into the PHP API and MariaDB. Every module remains either project-attached or standalone, with governed write-back and audit logging for all AI/prototype-derived outputs.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, PHP 8.3, MariaDB/InnoDB, cPanel shared hosting, cron-polled `jobs` table for async AI/video/drawing work.

---

## Current State

Created `architex-production/` from the existing `architex-os.zip` and added:

- `backend/public/index.php` — PHP REST API router with health, user, module registry, projects and datum endpoints.
- `backend/config.php` — environment-driven backend config.
- `backend/data/modules.json` — module registry (46 canonical entries, generated from `tools.json`).
- `backend/database/migrations/001_core_schema.sql` — MariaDB foundation schema.
- `backend/data/platform-policy.json` — canonical registry resolution and policy model.
- Updated `README.md` and `package.json`.

Verified:

- `php backend/tests/smoke.php` passes.
- `php -l backend/public/index.php` passes.
- Local PHP server responds at `/api/v1/health` and `/api/v1/projects/proj-faerie-glen/datum`.

---

## Phase 1 — Make the starter fully data-backed

### Task 1: Seed MariaDB from the module registry

**Objective:** Convert `backend/data/modules.json` into database rows.

**Files:**
- Create: `backend/database/seeds/001_seed_modules.php`
- Modify: `backend/README.md` if added later

**Steps:**
1. Write a CLI seed script using PDO and `backend/config.php`.
2. Insert or update rows into `modules`.
3. Store `tabs` as `tabs_json`.
4. Run against a local MariaDB instance or shared-host DB.
5. Verify `SELECT COUNT(*) FROM modules;` returns at least 45.

### Task 2: Add database connection and repository layer

**Objective:** Stop hardcoding API data in `index.php`.

**Files:**
- Create: `backend/src/Database.php`
- Create: `backend/src/Repositories/ModuleRepository.php`
- Create: `backend/src/Repositories/ProjectRepository.php`
- Modify: `backend/public/index.php`

**Steps:**
1. Add `Database::pdo()` using config DSN.
2. Move module fetch logic into `ModuleRepository`.
3. Move project fetch logic into `ProjectRepository`.
4. Keep JSON fixture fallback only for local dev if DB is not configured.
5. Re-run smoke tests and curl checks.

### Task 3: Wire frontend to API for registry and projects

**Objective:** Replace frontend-only demo registry reads with API-backed reads.

**Files:**
- Modify: `lib/api.ts`
- Modify: `app/page.tsx`
- Modify as needed: `components/views/DatumCanvas.tsx`, `components/views/ToolRegistryView.tsx`

**Steps:**
1. Add typed clients for `/modules-registry`, `/projects`, `/projects/{id}/datum`.
2. Add loading/error states in the shell.
3. Preserve demo fallback when `NEXT_PUBLIC_API_BASE_URL` is unavailable.
4. Run `npm run typecheck` and `npm run build`.

---

## Phase 2 — Auth, RBAC and audit foundation

### Task 4: Implement JWT login and `/me`

**Objective:** Replace demo `/me` with real authenticated identity.

**Files:**
- Create: `backend/src/Auth/Jwt.php`
- Create: `backend/src/Middleware/AuthMiddleware.php`
- Modify: `backend/public/index.php`
- Add migration if refresh-token persistence is required.

**Steps:**
1. Implement `POST /api/v1/auth/login` using `password_verify`.
2. Issue short-lived access token.
3. Validate bearer token for protected routes.
4. Return user/org/roles from `/api/v1/me`.
5. Add tests for missing token, invalid token and valid token.

### Task 5: Implement RBAC middleware

**Objective:** Enforce the PRD's role × module × action model.

**Files:**
- Create: `backend/src/Rbac/PermissionService.php`
- Create: `backend/database/seeds/002_seed_roles_permissions.php`
- Modify: route declarations in `backend/public/index.php`

**Steps:**
1. Seed 20 roles from the PRD.
2. Seed baseline permissions for `architect`, `client`, `contractor`, `platform_admin`.
3. Check permissions for module endpoints.
4. Audit denied access attempts.

### Task 6: Implement audit log helper

**Objective:** Ensure governed write-back is traceable.

**Files:**
- Create: `backend/src/Audit/AuditLogger.php`
- Modify endpoints that create/patch records.

**Steps:**
1. Add `AuditLogger::record(...)`.
2. Log entity type, entity ID, action, before/after JSON and actor.
3. Add `GET /api/v1/audit-log?entity_type=&entity_uuid=`.

---

## Phase 3 — Graduate foundation modules

### Task 7: Project Passport

**Objective:** Build the missing canonical project profile module.

**Why first:** Meetings, Documents, SpecForge, BoM and Municipal all depend on project context.

**Files likely to change:**
- Create: `components/modules/ProjectPassportModule.tsx`
- Backend: `project_module_records` endpoints
- DB: optional `project_passport_fields` table if JSON payload proves insufficient.

### Task 8: Documents & Drawings

**Objective:** Provide the shared document/drawing register used by multiple modules.

**Files likely to change:**
- Create: `components/modules/DocumentsDrawingsModule.tsx`
- Add backend endpoints under `/api/v1/projects/{uuid}/documents`
- Add tables: `documents`, `document_versions`, `drawing_register_items`.

### Task 9: Meetings API lifecycle

**Objective:** Back the flagship Meetings module with real API state.

**Endpoints:**
- `GET /meetings`
- `POST /meetings`
- `GET /meetings/{uuid}`
- `POST /meetings/{uuid}/publish`
- `POST /meetings/{uuid}/request-correction`

**Acceptance:** Published minutes are immutable; corrections create a new revision.

---

## Validation Gates

Run before marking each phase complete:

```bash
php backend/tests/smoke.php
php -l backend/public/index.php
npm run typecheck
npm run build
```

For API work, also run:

```bash
php -S 127.0.0.1:8080 -t backend/public
curl http://127.0.0.1:8080/api/v1/health
curl http://127.0.0.1:8080/api/v1/modules-registry
curl http://127.0.0.1:8080/api/v1/projects/proj-faerie-glen/datum
```

---

## Risks / Decisions

1. **Shared hosting + WebRTC:** use a managed video provider for Meetings.
2. **Shared hosting + AI jobs:** use `jobs` table + cPanel cron first; migrate to workers/VPS later.
3. **Payments/Escrow:** keep v1 as workflow/status tracking until legal review.
4. **Municipal overlap:** reconcile Municipal Approval Readiness, Council Drawing Navigator and Municipal Tracker before building all three.
5. **AI drawing intelligence:** one shared service should power SpecForge, BoM, Municipal and BIM extraction.
