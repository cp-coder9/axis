# Production Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace simulated browser access with MariaDB-backed registration, organisation onboarding, expiring invitations, rotating refresh sessions, logout/revocation, and authenticated API requests.

**Architecture:** MariaDB stores verification, invitation, and refresh-session records; only hashed opaque credentials are persisted. The PHP API issues short-lived signed access JWTs and a rotating opaque refresh cookie. A client auth store keeps access credentials in memory, restores sessions through the cookie, and supplies bearer authentication to all API helpers.

**Tech Stack:** PHP 8.3, MariaDB, Next.js 15/React 19, TypeScript, Node contract tests, Vitest.

## Global Constraints

- Production never accepts `X-Architex-*` identity headers or demo credentials.
- Refresh credentials use `Secure`, `HttpOnly`, `SameSite=None`, scoped to `/api/v1/auth`, and are stored only as SHA-256 hashes.
- Registration creates an inactive account until email verification succeeds.
- The first verified registration creates its organisation and receives `organisation_admin`; later access is invitation-only.
- Invitations are single-use, hashed, audited, organisation-scoped, and expire after 72 hours.
- God Mode never changes the signed role or record-level authorization.
- No live database migration is run by this plan; migration execution requires the deployment gate and backup record.

---

### Task 1: Authentication persistence schema

**Files:**

- Create: `backend/database/migrations/012_authentication_sessions.sql`
- Create: `backend/tests/auth-schema.mjs`
- Modify: `backend/tests/smoke.php`

**Interfaces:**

- Produces `email_verification_tokens`, `organization_invitations`, and `auth_sessions` tables.
- Adds `pending_verification` to `users.status`.
- Adds the `organisation_admin` role and MariaDB permission grants.

- [ ] **Step 1: Write the failing schema contract**

Create `backend/tests/auth-schema.mjs` to read migration 012 and assert table names, token hash uniqueness, expiry/revocation columns, foreign keys, and the `organisation_admin` role grant. It must fail while migration 012 is absent.

- [ ] **Step 2: Run RED**

Run: `node backend/tests/auth-schema.mjs`

Expected: failure stating migration 012 is missing.

- [ ] **Step 3: Add the migration**

The migration must:

```sql
ALTER TABLE users MODIFY status ENUM('pending_verification','active','invited','disabled') NOT NULL DEFAULT 'pending_verification';
INSERT IGNORE INTO roles (role_key, label, description) VALUES ('organisation_admin', 'Organisation Administrator', 'Manages organisation users, roles, projects, and governance settings.');
CREATE TABLE email_verification_tokens (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_email_verification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE organization_invitations (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  email VARCHAR(190) NOT NULL,
  name VARCHAR(160) NOT NULL,
  role_key VARCHAR(64) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  invited_by CHAR(36) NOT NULL,
  expires_at DATETIME NOT NULL,
  accepted_at DATETIME NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_invitation_org_email (organization_id, email),
  CONSTRAINT fk_invitation_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_invitation_role FOREIGN KEY (role_key) REFERENCES roles(role_key),
  CONSTRAINT fk_invitation_actor FOREIGN KEY (invited_by) REFERENCES users(id)
);
CREATE TABLE auth_sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  last_used_at DATETIME NULL,
  revoked_at DATETIME NULL,
  replaced_by CHAR(36) NULL,
  created_ip VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_auth_session_user (user_id, expires_at),
  CONSTRAINT fk_auth_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_auth_session_replacement FOREIGN KEY (replaced_by) REFERENCES auth_sessions(id)
);
```

Grant `organisation_admin` the same database-backed module actions as `admin`, excluding platform-only behavior.

- [ ] **Step 4: Run GREEN and smoke**

Run: `node backend/tests/auth-schema.mjs && php backend/tests/smoke.php`

Expected: both exit 0.

- [ ] **Step 5: Commit**

```powershell
git add backend/database/migrations/012_authentication_sessions.sql backend/tests/auth-schema.mjs backend/tests/smoke.php
git commit -m "feat: add authentication persistence schema"
```

### Task 2: Registration, verification, and invitation domain helpers

**Files:**

- Create: `backend/lib/authentication.php`
- Create: `backend/tests/authentication-policy.php`
- Modify: `backend/public/index.php`

**Interfaces:**

- Produces `auth_normalize_email(string): string`, `auth_validate_password(string): array`, `auth_new_opaque_token(): string`, `auth_token_hash(string): string`, and `auth_cookie_header(string, int): string`.
- Produces `POST /api/v1/auth/register`, `POST /api/v1/auth/verify-email`, `POST /api/v1/invitations/{token}/accept`, and audited `POST /api/v1/users/invitations`.

- [ ] **Step 1: Write policy and source-contract tests**

Test normalized email, 12-character password minimum, mixed character classes, 64-character token hashes, secure cookie attributes, and required API routes. Tests must initially fail because the helper file and routes do not exist.

- [ ] **Step 2: Run RED**

Run: `php backend/tests/authentication-policy.php`

Expected: missing `backend/lib/authentication.php`.

- [ ] **Step 3: Implement helpers and transactional routes**

Registration validates name, organisation name, email, and password; in one transaction it refuses registration when a production organisation already exists, inserts the organisation and pending user, assigns `organisation_admin`, stores a hashed 24-hour verification token, and audits `auth.registration.requested`. Verification consumes the token under `SELECT ... FOR UPDATE`, activates the user, and audits `auth.email.verified`. Invitation creation requires `users.manage`, stores a hashed 72-hour token, and audits creation. Acceptance validates email/password, atomically consumes the invitation, creates or activates the invited user, assigns its role, and audits acceptance.

- [ ] **Step 4: Run GREEN and regressions**

Run: `php backend/tests/authentication-policy.php && node backend/tests/auth-boundary-api.mjs && php backend/tests/smoke.php`

Expected: all exit 0.

- [ ] **Step 5: Commit**

```powershell
git add backend/lib/authentication.php backend/tests/authentication-policy.php backend/public/index.php
git commit -m "feat: add verified organisation onboarding"
```

### Task 3: Rotating refresh sessions and logout

**Files:**

- Modify: `backend/lib/authentication.php`
- Modify: `backend/public/index.php`
- Create: `backend/tests/auth-session-policy.php`

**Interfaces:**

- Produces refresh-cookie parsing and clearing helpers.
- Changes login to insert `auth_sessions` and set an opaque refresh cookie.
- Changes refresh to rotate the database record atomically and reject replay.
- Produces `POST /api/v1/auth/logout` that revokes the active session and clears the cookie.

- [ ] **Step 1: Write failing cookie/session contracts**

Assert that access JWT responses contain no `refresh_token`, login uses `auth_sessions`, refresh requires the cookie hash, rotation revokes the previous row, and logout emits an expired cookie.

- [ ] **Step 2: Run RED**

Run: `php backend/tests/auth-session-policy.php`

Expected: failure because login still returns a bearer refresh token.

- [ ] **Step 3: Implement session rotation**

Create 32-byte opaque tokens with `random_bytes`, store only `hash('sha256', $token)`, set the cookie through `Set-Cookie`, and rotate with a transaction and row lock. A revoked/expired token returns 401 and clears the cookie. Logout is idempotent and revokes the matching live row when present.

- [ ] **Step 4: Run GREEN and API regressions**

Run: `php backend/tests/auth-session-policy.php && node backend/tests/auth-boundary-api.mjs && npm run test:data-policy`

Expected: all exit 0.

- [ ] **Step 5: Commit**

```powershell
git add backend/lib/authentication.php backend/public/index.php backend/tests/auth-session-policy.php
git commit -m "feat: rotate and revoke refresh sessions"
```

### Task 4: Authenticated frontend API client

**Files:**

- Create: `lib/auth-session.ts`
- Create: `lib/auth-session.test.ts`
- Modify: `lib/api.ts`

**Interfaces:**

- Produces `setAccessToken(token: string | null): void`, `authenticatedHeaders(): Record<string,string>`, `refreshAccessToken(): Promise<boolean>`, and `logout(): Promise<void>`.
- All API requests use `credentials: 'include'` and bearer authentication when a live token exists.
- `demoIdentity()` remains usable only when `NEXT_PUBLIC_ARCHITEX_DATA_MODE=local`.

- [ ] **Step 1: Write failing client tests**

Test in-memory token headers, token clearing, `credentials: 'include'`, and rejection of `demoIdentity()` outside local mode.

- [ ] **Step 2: Run RED**

Run: `npx vitest run lib/auth-session.test.ts`

Expected: module-not-found failure.

- [ ] **Step 3: Implement the shared client**

Centralize fetch configuration, attach bearer tokens without persisting them to local/session storage, retry one 401 after cookie refresh, and preserve explicit local-demo headers only in local builds.

- [ ] **Step 4: Run GREEN and typecheck**

Run: `npx vitest run lib/auth-session.test.ts && npm run typecheck`

Expected: both exit 0.

- [ ] **Step 5: Commit**

```powershell
git add lib/auth-session.ts lib/auth-session.test.ts lib/api.ts
git commit -m "feat: authenticate frontend API requests"
```

### Task 5: Replace AccessGateway bypass with real session state

**Files:**

- Create: `components/providers/AuthProvider.tsx`
- Create: `components/providers/AuthProvider.test.tsx`
- Modify: `components/access/AccessGateway.tsx`
- Modify: `app/page.tsx`

**Interfaces:**

- Produces `useAuth()` with `status`, `profile`, `login`, `register`, `logout`, and `restore`.
- `AccessGateway` renders protected children only when `status === 'authenticated'`.
- Removes `architex-v8-access` and the `?workspace=v8` bypass.

- [ ] **Step 1: Write failing gateway contracts**

Assert that session storage and query parameters cannot mount protected children, valid login calls `/auth/login` then `/me`, failed login renders the API error, and logout unmounts protected content.

- [ ] **Step 2: Run RED**

Run: `npx vitest run components/providers/AuthProvider.test.tsx`

Expected: provider module missing and the bypass source contract failing.

- [ ] **Step 3: Implement provider and gateway wiring**

Restore via refresh cookie on mount; submit actual email/password/organisation fields; render a neutral loading boundary during restore; select the active viewing role only from the authenticated profile; remove every write/read of `architex-v8-access`.

- [ ] **Step 4: Run full slice gate**

Run:

```powershell
npx vitest run lib/auth-session.test.ts components/providers/AuthProvider.test.tsx
npm run test:data-policy
npm run typecheck
npm run build
git diff --check
```

Expected: all exit 0.

- [ ] **Step 5: Commit**

```powershell
git add components/providers/AuthProvider.tsx components/providers/AuthProvider.test.tsx components/access/AccessGateway.tsx app/page.tsx
git commit -m "feat: require authenticated workspace sessions"
```
