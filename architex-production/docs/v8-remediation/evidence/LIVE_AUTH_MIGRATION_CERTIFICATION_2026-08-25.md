# Live authentication migration certification — 2026-08-25

## Certified scope

- Prototype frontend: `https://test.architex.co.za`
- Shared API endpoint: `https://api.architex.co.za/api/v1`
- Deployed source revision: `81516fdb72e12ad8e1550e67c1fdb449e56fa12d`
- Production apex `https://architex.co.za` was not changed by this release.

## MariaDB migration and recovery evidence

- Pre-migration health returned HTTP 200 against MariaDB 11.4.13.
- Before migration: 11 applied migrations, 1 organisation, 5 users, 4 projects, and 20 role records.
- A logical backup of 169 tables was created before mutation and downloaded to
  `release/live-backups/20260825-auth-migration/pre-012-20260825-111615.json.gz`.
- Backup size: 224,832 bytes.
- Backup SHA-256: `eccaccf20973703fe5b1f94c83b982ecf4394941ac9bff9ce44463bdb4cc3c7a`.
- Migration `012_authentication_sessions.sql` applied successfully (6 statements).
- After migration: 12 applied migrations, 1 organisation, 5 users, 4 projects, and 21 role records.
- The temporary protected migration endpoint was removed and returns HTTP 404.

The backup contains sensitive application data. It is retained locally as a recovery artifact and is intentionally excluded from version control and deployment packages.

## API deployment and verification

- The Phase 0 API package was atomically deployed at `/public_html/api/phase0-backend`.
- Server-only database and JWT configuration was carried into the inert candidate before the directory swap; it was not added to source control or release artifacts.
- `/health` returned HTTP 200.
- `/db-health` returned HTTP 200 with 12 migrations.
- Unauthenticated `/projects` returned HTTP 401.
- The test-origin CORS preflight returned HTTP 204 and allowed credentials, Authorization, Content-Type, and the required X-Architex headers.
- The allowed origin was exactly `https://test.architex.co.za`.

Authenticated lifecycle verified against live MariaDB:

1. Login returned HTTP 200 and established a Secure, HttpOnly refresh cookie scoped to `/api/v1/auth`.
2. `/me` returned the persisted user, organisation, role, and 15 permissions.
3. `/projects` returned the four persisted prototype projects.
4. Refresh returned HTTP 200 and rotated the refresh-token hash.
5. Reuse of the prior refresh token returned HTTP 401.
6. Logout returned HTTP 200 and revoked the session.
7. Refresh after logout returned HTTP 401.
8. Duplicate registration returned HTTP 409.
9. An architect attempting an invitation returned HTTP 403, confirming the RBAC boundary.

## Frontend deployment and browser certification

- The static frontend was built with the `/api/v1` base URL, prototype data mode, and God Mode enabled.
- It was atomically deployed to `/public_html/architex.co.za/ai/public_html/test.architex.co.za`.
- Local and live `index.html` SHA-256 matched:
  `7a4298b89040d1b4e73dab78cf8edd85f2c4f36bef6d2fcc7fc537f9ad763189`.
- LiteSpeed rejected the explicit `PURGE` request with HTTP 405; a cache-busted live request nevertheless returned the exact deployed artifact hash.

The configured in-app browser control surface was unavailable in this session, so certification used the repository's installed Playwright browser runner. The final live test passed in 35.5 seconds and verified:

- real login and dashboard mount;
- authenticated `/me` and `/projects` responses;
- refresh-token persistence across a full page reload;
- God Mode Ecosystem Explorer with 47 tools, 8 stages, and 21 role lenses;
- logout and return to the signed-out landing page;
- no API 5xx responses and no unexpected browser console errors.

Visual evidence:

- [Authenticated dashboard](../../../release/evidence/live-auth/authenticated-dashboard.png)
- [Restored God Mode](../../../release/evidence/live-auth/restored-god-mode.png)
- [Signed-out landing page](../../../release/evidence/live-auth/signed-out.png)

## Rollback points

- API router: `.htaccess.pre-phase0-81516fdb72e1`
- Prior API candidate: `.phase0-backend-prior-81516fdb72e1`
- Prior frontend: `/public_html/architex.co.za/ai/public_html/test.architex.co.za.pre-god-20260825-1304`

## Certification result

The requested prototype live migration and browser certification passed. This certifies the test deployment and its live MariaDB authentication/session/RBAC path; it does not certify or mutate the production apex release.
