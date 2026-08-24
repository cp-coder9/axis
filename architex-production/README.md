# Architex OS — Production Starter

This folder is the next working continuation of the Architex project. It turns the prototype/PRD package into a runnable production-oriented starter:

- **Frontend:** Next.js Datum UI shell with the 4-layer Architex OS layout and flagship module prototypes.
- **Backend:** shared-hosting-compatible PHP REST API skeleton.
- **Database:** MariaDB core migration for organizations, users, roles, projects, module registry, project records, meetings, action items, audit log, and cron-driven jobs.

## Run the frontend

```bash
npm install
npm run build
npm run dev
```

## Run the PHP API locally

```bash
php -S 127.0.0.1:8080 -t backend/public
```

Smoke-check endpoints:

```bash
curl http://127.0.0.1:8080/api/v1/health
curl http://127.0.0.1:8080/api/v1/modules-registry
curl http://127.0.0.1:8080/api/v1/projects/proj-faerie-glen/datum
```

## Validate backend starter

```bash
php backend/tests/smoke.php
php -l backend/public/index.php
```

## Production target

- Next.js deployed as a cPanel Node app when available, or static export fallback.
- PHP API deployed under Apache/LiteSpeed/PHP-FPM.
- MariaDB migration in `backend/database/migrations/001_core_schema.sql`.
- Async AI/video/drawing jobs represented by the `jobs` table and processed by cPanel cron, matching the PRD constraints.

## Foundation modules now implemented

- Project Passport
- Documents & Drawings with controlled revisions
- Action Centre
- Role-gated Approvals
- RBAC and immutable audit logging
- Human-governed AI candidate review
- Shared drawing-intelligence jobs for SpecForge, BoM, Municipal and BIM/IFC
- Meetings publish governance with consent, pending-outcome gates and idempotent revision issue

The canonical registry is exactly **47 modules**, including native Architex Meetings and the Engineering Calculation Hub. Payments remain workflow-only; actual fund holding is disabled pending legal review and a licensed partner.

See `docs/FOUNDATION_BUILD_STATUS.md` for routes, schema and verification evidence.

## Next implementation slice

1. Complete the Phase 3 isolated MariaDB lifecycle, tenancy, RBAC, and recovery evidence suite.
2. Complete Phase 8 release orchestration, documentation parity, visual, performance, and rollback evidence.
3. Keep all 17 engineering calculators contained until independent professional approval is recorded.
