# Deployment Guide — test.architex.co.za

**Stack:** Next.js 15 (standalone Node server) · PHP 8.3 REST API · MariaDB 10/11 (InnoDB).
**Strategy (task 3):** configuration-only readiness — this document plus the env
templates are the deploy contract. No deployment is executed from this workspace.

---

## Target architecture

| Layer | Host | Technology |
|---|---|---|
| Frontend | `https://test.architex.co.za` | Next.js 15 `output: 'standalone'`, Node 20+, PM2/systemd (or a VPS/Docker host) |
| API | `https://api.architex.co.za` (or `test.architex.co.za/api` subpath) | Apache + PHP 8.3 (cPanel shared hosting OK) |
| Database | MariaDB 11 | cPanel MySQL/MariaDB, database `architex_os`, user `architex_user` |
| Async jobs | `backend/worker.php` | cPanel cron, `*/2 * * * *` |

The Next.js app proxies `/api/*` to the API via `next.config.ts` rewrites
(`http://127.0.0.1:8080/api/:path*`). For deployed hosting set the rewrite
destination to the internal API URL **or** call the API directly through
`NEXT_PUBLIC_API_BASE_URL` — see §4.

---

## 1. MariaDB

```bash
# On the database host:
mysql -u root -p < backend/database/migrations/001_core_schema.sql   # or use migrate.php
php backend/database/migrate.php   # applies all unapplied migrations (idempotent)
ARCHITEX_DATA_MODE=prototype ARCHITEX_ENABLE_DEMO_SEED=1 php backend/database/seed.php
# Explicit prototype/local operation only; clears + reseeds demo data idempotently.
```

Verification: `SELECT COUNT(*) FROM projects;` → 4 (seeded demo register).
The seeder fails closed in production data mode and also requires the explicit
`ARCHITEX_ENABLE_DEMO_SEED=1` flag. Never set that flag on a production host.

The `calculation_records` table and Phase 3 hardening migrations are part of
this sequence. Engineering calculation writes are governed by the MariaDB
repository and all unvalidated calculators remain API-contained.

---

## 2. PHP API (cPanel / Apache)

1. Upload `backend/` into a non-web-root directory (e.g. `~/apps/architex-api`).
2. Point the API domain/subpath document root at `~/apps/architex-api/public/`
   and ensure `public/.htaccess` rewrite is active (provisioned in this repo).
3. Copy `backend/.env.example` → configure:
   - `APP_ENV="production"`
   - `JWT_SECRET="<strong-random-64-hex>"` — the API returns 503 on JWT routes
     with the placeholder; header-identity (`X-Architex-*`) is ONLY accepted
     when `APP_ENV=local`.
   - `DB_*` — cPanel database credentials.
   - `CORS_ORIGIN="https://test.architex.co.za"` — restrict from the dev `*`.
4. Cron (cPanel → Cron Jobs):
   ```
   */2 * * * *  php /home/<user>/apps/architex-api/worker.php >> /home/<user>/logs/architex-worker.log 2>&1
   ```

Health checks:
- `GET /api/v1/health`
- `GET /api/v1/db-health` — returns counts incl. `calculation_records`, `projects`.

---

## 3. Next.js frontend

```bash
# Root of repository
npm ci
npm run build            # produces .next/standalone (output: 'standalone')
```

Run the standalone server (PM2 example):
```bash
NODE_ENV=production \
NEXT_PUBLIC_API_BASE_URL="https://api.architex.co.za/api/v1" \
node .next/standalone/server.js
```
Default port 3000. Front with Nginx/Apache reverse-proxy for TLS.

> **CORS note:** when the frontend calls a separate origin (api.*), the API must
> return `Access-Control-Allow-Origin: https://test.architex.co.za` — set
> `CORS_ORIGIN` above. When using the Next.js rewrite proxy (`/api/*`), CORS is
> not involved and `NEXT_PUBLIC_API_BASE_URL` may stay unset.

Environment variables (`.env.local` or host secrets panel):

| Var | Value for test.architex.co.za | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.architex.co.za/api/v1` or unset (rewrite) | served client-side |
| `GEMINI_API_KEY` | per-key | optional Wingman engine |
| `OPENAI_API_KEY` / `NVIDIA_API_KEY` | per-key | optional Wingman BYOAPI |
| `DISABLE_HMR` | `true` on shared filesystems | disables dev watch |

---

## 4. Verification run-book (pre-live)

```
1. GET  https://api.architex.co.za/api/v1/health        → {status:ok}
2. GET  https://api.architex.co.za/api/v1/db-health     → connected:true, projects:4+
3. GET  https://test.architex.co.za/                    → shell renders, role switcher visible
4. POST https://api.architex.co.za/api/v1/auth/login    → access + refresh JWT
5. POST /api/v1/projects (role architect)               → 201 project in MariaDB
6. Playwright: npx playwright test (E2E_BASE_URL=https://test.architex.co.za)
```

---

## 5. Secrets & hardening checklist

- [ ] `JWT_SECRET` rotated to a strong random value (never commit).
- [ ] `APP_ENV=production` (disables header-identity demo mode).
- [ ] `CORS_ORIGIN` restricted to the deployed frontend origin.
- [ ] `DB_PASS` set to a non-empty cPanel password.
- [ ] No engineering calculation file-backed persistence path is enabled; the MariaDB
      credentials have been verified against the release-candidate schema.
- [ ] MariaDB backups: nightly `mysqldump architex_os` retained per POPIA retention policy.
- [ ] TLS certificates valid for both domains; HSTS enabled on the frontend proxy.
