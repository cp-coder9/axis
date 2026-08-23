# Architex OS — Production Readiness Log

**Target:** test.architex.co.za deployment readiness (configuration only — no deploy executed)
**Plan spec:** `docs/V8_ENGINEERING_GODMODE_INTEGRATION_PLAN.md`
**PRD:** `prd.txt` (E:\axis-1) · `docs/FOUNDATION_BUILD_STATUS.md` · `docs/DATABASE.md`
**Audit method:** agentic workflow — parallel audit subagents (backend structure, frontend V8-phase verification) + direct live validation.
**Log started:** 2026-08-23 03:45 SAST · **Last update:** 2026-08-23 06:05 SAST

---

## Executive summary

| Task requirement | State after this session |
|---|---|
| 1. Backend & persistence — MariaDB linked, project add/manage functional | ✅ DONE & live-verified (project CRUD on MariaDB write path, calculation records, db-health) |
| 2. Frontend & UX — menus/workflows consistent & operational | ✅ DONE & verified — 100/100 Playwright e2e tests pass, lint clean, build clean |
| 3. Deployment readiness — test.architex.co.za config (no deploy) | ✅ Config package delivered: `docs/DEPLOYMENT.md`, `backend/.env.example`, `.env.example`, `backend/public/.htaccess`; deploy itself intentionally NOT executed |
| 4. Agentic workflow (context management) | ✅ Used explore subagents for backend/frontend audits |
| 5. Continuous log | ✅ this file |

**Validation evidence (2026-08-23):**
- `php -l` clean (index.php, seed.php, db.php) · `php backend/tests/smoke.php` passed (46 canonical modules)
- `npm run typecheck` clean · `npm run lint` clean (0 errors after 3 fixes) · `npm run build` succeeded (standalone output, 223 kB First Load)
- Live API: project create 201 / duplicate 409 / RBAC 403 / PATCH verified in DB / stage history rows; calculations create→review verified; all also re-verified through the Next.js `/api/*` rewrite proxy (the deployed path)
- **Playwright: 100 passed, 0 failed** (rail repair 8, God Mode 2, 47 module opens, meetings workflows, approvals RBAC, 40 role-dashboard tests)
- `npm run test` green — foundation validation + smoke at **47 canonical modules** with tools.json ↔ modules.json ↔ MariaDB parity

---

## Change log

### Environment & infrastructure

| # | Change | Detail | Status |
|---|--------|--------|--------|
| E1 | MariaDB InnoDB startup failure fixed | Portable MariaDB 11.4.3 aborted on boot: `InnoDB: Unable to create temporary file; errno: 0`. Root cause: no explicit `tmpdir` for the Windows portable install. Created `E:\Hermes\mariadb\tmp`, set `tmpdir=E:/Hermes/mariadb/tmp` in `my-architex.ini`. | DONE |
| E2 | MariaDB running (persistent background) | Port 3306; `architex_os` at 34 tables; `architex_user` ALL PRIVILEGES (localhost + 127.0.0.1). | RUNNING |
| E3 | Migration 009 applied | `009_calculation_records.sql` (V8 plan Phase 6A, renumbered because 007/008 were taken). `php backend/database/migrate.php` idempotent. | DONE |
| E4 | Database re-seeded | 4 projects (frontend parity), refreshed RBAC matrix incl. `projects.edit` grants, UTF-8 literals fixed. | DONE |
| E5 | API + frontend servers running | PHP dev server :8080 and Next production server :3000 (persistent background sessions) for validation. | RUNNING |

### Backend & persistence (requirement 1)

| # | Change | Detail | Status |
|---|--------|--------|--------|
| B1 | `projects()` DB-backed | MariaDB `projects` now the source of truth (API-shape column mapping + `ProjectsCache` + fixture fallback when DB unreachable). Added `GET /api/v1/projects/{id}`. | DONE |
| B2 | `POST /api/v1/projects` | Validation (name/code/stage enum/progress range), unique-code 409, `project_stage_history` initial row, audit `project.created`, RBAC-gated `projects.edit`, 201 `{project}`. DB-durable. | DONE |
| B3 | `PATCH /api/v1/projects/{id}` | Allow-listed 10 fields, enum/range validation, 409 on code collision, stage history on stage change, audit `project.updated`. | DONE |
| B4 | RBAC wiring for project management | New `projects.edit` permission granted to architect/cpm/firm_admin/developer/admin (and platform_admin via `*`) in (a) `PERMISSIONS` constant, (b) `permissions_for_role()` module map (`practice`→`projects`), (c) seed matrix. Client role → 403 verified. | DONE |
| B5 | `db_health()` extended | Row counts now include `feedback_submissions`, `drawing_register`, `jobs`, `calculation_records`. | DONE |
| B6 | Engineering Calculation endpoints verified | `GET/POST /engineering/calculations`, `GET/POST .../review` — create→`saved`→`under_review` lifecycle audited; `require_collection_scope` project scoping works. (Routes + client + migration existed at audit time; this session live-verified and wired the frontend.) | VERIFIED |

### Frontend & UX (requirement 2)

| # | Change | Detail | Status |
|---|--------|--------|--------|
| F1 | Live project management UI | `app/page.tsx` hydrates the project register from `GET /projects` (seeded fallback if API down); `handleCreateProject` posts to the API, adds to local state, and switches the datum. `ContextNavigator` renders the live list + inline **Add project** form (name/code/location/client/stage) with client-side validation, busy state, and API error surfacing; form gated to roles with `projects.edit` parity. | DONE |
| F2 | `ApiProject` / `CreateProjectPayload` + `architexApi.projects.{list,get,create,update}` | typed client added to `lib/api.ts` | DONE |
| F3 | Engineering Calc persistence wired | `EngineeringCalcModule` Save/Send-to-review now call `architexApiEngineering.create()` / `.sendToReview()` with real record id feedback, saving/review/error states; removed `alert()` stub. | DONE |
| F4 | API base URL deployment-ready | `lib/api.ts` default changed from `http://localhost:8080/api/v1` → `/api/v1` (same-origin; Next rewrite in dev, reverse proxy when deployed). | DONE |
| F5 | God Mode toggle placement | Moved between project chip and role switcher in `TopBar` (per plan 5B); removed duplicate. | DONE |
| F6 | Command Centre routing fix | "Datum Project Space" / "Workspace Tool Registry" cards now navigate via the `GLOBAL_DESTINATIONS` contract (`onSelectGlobal`) instead of mis-opening the practice tool. | DONE |
| F7 | Lint errors fixed | 0 ESLint errors: removed setState-in-effect in `WingmanModule` (draft init on panel open), unescaped apostrophe in `GodModeView`, documented async load effect in `UserManagementSection`; added flat-config `ignores` (.next/out/node_modules/etc.) that were making `npm run lint` scan build output. | DONE |
| F8 | Playwright config hardened | `webServer` block (auto-start `npm run dev`, skip when `E2E_BASE_URL` set); stale "46 modules" text corrected to 47 in `app.spec.ts`. | DONE |
| F9 | Stale rail e2e locators repaired | rail-spec tests fixed for the repaired navigation contract: mode-switch inside a tool stays inside the tool (returns via back guard first), strict-mode `.first()` on duplicate project headings, active-tab assertion scoped to navigator `aside`. | DONE |
| F10 | E2e suite green | Earlier run: 93/100. After fixes: **100/100 passed** including all 20 roles × 2 dashboard suites and the 47 module-open matrix. | DONE |
| F11 | God Mode verification | Phase 5 complete: state, TopBar toggle, GodModeView (hero/lifecycle/role grid/tool groups), OsRail conditional god item, Inspector note, ContextNavigator god branch — all verified by tests. | VERIFIED |
| F12 | Registry parity → 47 modules | `engineering_calc` was missing from the canonical registries while the frontend rendered 47. Added full definition to `tools.json` + `backend/data/modules.json` (position after `wingman`, matching the e2e/frontend order), re-seeded DB (modules table now 47), updated counters in `scripts/validate-foundation.mjs` (47, engineering_calc assertion) and `backend/tests/smoke.php` (47 + engineering_calc check). API `/health` and `/modules-registry` now report **canonical_modules: 47**; `npm run test` green. | DONE |

### Deployment readiness (requirement 3 — config only)

| # | Change | Detail | Status |
|---|--------|--------|--------|
| D1 | `docs/DEPLOYMENT.md` | Target architecture, MariaDB/API/frontend roll-out, cron worker, verification run-book (health→db-health→login→project create→Playwright), secrets & hardening checklist for test.architex.co.za. | DONE |
| D2 | `backend/.env.example` | APP_ENV/JWT_SECRET/DB_*/CORS_ORIGIN with prod notes (API fails closed on placeholder secret; header identity local-only). | DONE |
| D3 | `.env.example` extended | `NEXT_PUBLIC_API_BASE_URL` guidance for test.architex.co.za. | DONE |
| D4 | `backend/public/.htaccess` | Apache rewrite (cPanel) routing every request through `index.php`. | DONE |
| D5 | Rewritten-proxy path verified | `POST /api/v1/projects` through Next's `/api/*` rewrite succeeded end-to-end (`proj-ad1320a5c9a0`) — the deployed traffic path works. | VERIFIED |
| D6 | Build mode confirmed | `next build` → `output: 'standalone'`, page `/` 116 kB (223 kB First Load) — within PRD §8.3 budget envelope. | VERIFIED |

---

## Prioritized remaining work (full production)

### P0 — security before any external exposure
1. **D4 (D-series in DEPLOYMENT.md §5):** set real `JWT_SECRET` (API currently 503s on JWT routes with placeholder — correct fail-closed behavior) and restrict `CORS_ORIGIN` from `*` to `https://test.architex.co.za` when the domain is provisioned.
2. Set non-empty `DB_PASS` on shared hosting; keep `backend/data/*.json` writable but outside docroot.

### P1 — complete the PDO repository milestone (PRD §12, `docs/DATABASE.md`)
3. Migrate the remaining JSON-store write paths to MariaDB tables (documents, approvals, meetings outcomes, audit entries currently dual-written to `foundation.json`; calculations currently in both `foundation.json` and the `calculation_records` table — pick one canonical store and migrate).
4. Add an integration test that asserts projects visible on the frontend come from MariaDB (currently hydration is silent-fallback).

### P2 — deployment execution (deliberately out of scope here)
5. Provision test.architex.co.za (DNS + TLS), upload `backend/` + create cPanel DB, run migrate/seed, deploy Next standalone via PM2, cron `worker.php */2`.
6. Wire real AI providers for the 5 stub job handlers (`transcribe_meeting`, `draft_minutes`, `ai_drawing_scan`, `ai_feature_brief`, `cluster_feedback`).

### P3 — hardening/polish
7. Worker claim race (two cron workers could process one job); no max-attempt/requeue for `processing`-stuck jobs.
8. `GET /me` serves demo profile; connect it to the JWT identity for production sessions.
9. Delete unreachable `{activeGlobal} Module` fallback branch (`app/page.tsx`) once all globals are proven; use or remove `resolveToolTabKey`.
10. Optional: DELETE + PATCH project UI (API has all but DELETE; DELETE would need CORS methods line update).

---

## Known operational notes

- **PHP dev server is single-threaded:** an aborted client request can wedge `php -S` (observed once); restart with the tracked background process. Not relevant on Apache for deployment.
- **Next e2e webServer** compiles on first cold run (~2–4 min); reuse the running production/dev server (`reuseExistingServer`) for fast suites.
- Background processes for this session: MariaDB (`E:\Hermes\mariadb\bin\mysqld.exe`), PHP API (`php -S 127.0.0.1:8080`), Next server (`npm run start --port 3000`).
