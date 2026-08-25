# Preview 3 Homepage Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the simplified unauthenticated page with a faithful React port of `E:\axis-1\preview(3).html` while preserving real authentication and the V8 application.

**Architecture:** A dedicated public landing component owns the reference markup and interactions, a focused hook owns the Datum canvas lifecycle, and `AccessGateway` owns only authentication/view transitions. Landing CSS is namespaced to prevent leakage into the authenticated shell.

**Tech Stack:** Next.js 15 static export, React 19, TypeScript, CSS, Canvas 2D, Vitest, Testing Library, Playwright

## Global Constraints

- `E:\axis-1\preview(3).html` is the exact homepage source of truth.
- Do not iframe, simplify, or redesign the supplied page.
- Preserve real authentication, MariaDB sessions, RBAC, dashboard shell, and God Mode.
- Deploy only to `https://test.architex.co.za`; do not mutate the production apex.
- Preserve unrelated dirty worktree files.

---

### Task 1: Lock the landing-page regression contract

**Files:**
- Create: `components/access/PublicLandingPage.test.tsx`

**Interfaces:**
- Consumes: `PublicLandingPage({ onSignIn, onSignUp })`
- Produces: a deterministic contract for canonical content and auth transitions

- [ ] **Step 1: Write the failing component test**

Assert that the render contains “Explore Architex public spaces”, the public Wingman statement, the Datum canvas label, Marketplace and Knowledge navigation, and interactive Sign in/Sign up buttons.

- [ ] **Step 2: Run the red test**

Run: `npx vitest run components/access/PublicLandingPage.test.tsx`

Expected: FAIL because `PublicLandingPage` does not exist.

- [ ] **Step 3: Commit the red contract**

Run: `git add components/access/PublicLandingPage.test.tsx && git commit -m "test: lock preview 3 homepage contract"`

### Task 2: Port the canonical landing structure and styling

**Files:**
- Create: `components/access/PublicLandingPage.tsx`
- Create: `components/access/public-landing.css`
- Modify: `components/access/AccessGateway.tsx`

**Interfaces:**
- Consumes: `onSignIn: () => void`, `onSignUp: () => void`
- Produces: `PublicLandingPage` with the full supplied page structure

- [ ] **Step 1: Port every visible reference section**

Translate the header, hero, Datum stage, feature rail, Marketplace, public Wingman, Knowledge catalogue, public spaces, dialogs, toast region, and footer into semantic JSX without changing supplied copy.

- [ ] **Step 2: Port and namespace the reference CSS**

Move the reference tokens, typography, geometry, responsive rules, focus states, and reduced-motion rules under `.public-landing`.

- [ ] **Step 3: Wire authentication entry points**

Render `<PublicLandingPage onSignIn={() => setView('signin')} onSignUp={() => setView('roles')} />` for the unauthenticated landing state.

- [ ] **Step 4: Run the component contract**

Run: `npx vitest run components/access/PublicLandingPage.test.tsx`

Expected: PASS with callback assertions green.

- [ ] **Step 5: Commit the structural port**

Run: `git add components/access && git commit -m "feat: integrate preview 3 public homepage"`

### Task 3: Port the interactive Datum and public controls

**Files:**
- Create: `components/access/useDatumCanvas.ts`
- Modify: `components/access/PublicLandingPage.tsx`
- Modify: `components/access/PublicLandingPage.test.tsx`

**Interfaces:**
- Consumes: canvas and CTA refs plus the supplied node/action model
- Produces: pointer-responsive canvas animation with deterministic cleanup

- [ ] **Step 1: Add lifecycle tests**

Mock Canvas 2D and animation frames; assert listener registration, CTA changes, reduced-motion handling, and unmount cleanup.

- [ ] **Step 2: Run the expanded test red**

Run: `npx vitest run components/access/PublicLandingPage.test.tsx`

Expected: FAIL on missing canvas lifecycle behaviour.

- [ ] **Step 3: Implement the reference interaction**

Port the supplied node geometry, pointer smoothing, hover selection, moving CTA, resize handling, and action dispatch into `useDatumCanvas`.

- [ ] **Step 4: Implement dialogs, toast, navigation, and public Wingman state**

Use React state and accessible dialog/button semantics while preserving the supplied visible behaviour and copy.

- [ ] **Step 5: Run the focused tests and commit**

Run: `npx vitest run components/access/PublicLandingPage.test.tsx`

Expected: PASS.

Run: `git add components/access && git commit -m "feat: restore preview 3 landing interactions"`

### Task 4: Certify the complete local application flow

**Files:**
- Create: `.tmp-release/live-preview3.spec.ts`
- Modify: only implementation files required by observed failures

**Interfaces:**
- Consumes: static build and live-compatible prototype API configuration
- Produces: browser evidence for homepage fidelity and authentication continuity

- [ ] **Step 1: Run all source gates**

Run: `npm run test:auth && npm run test:data-policy && npm run typecheck`

Expected: all commands exit 0.

- [ ] **Step 2: Build the exact test artifact**

Run with `ARCHITEX_STATIC_EXPORT=1`, `NEXT_PUBLIC_API_BASE_URL=https://api.architex.co.za/api/v1`, `NEXT_PUBLIC_ARCHITEX_DATA_MODE=prototype`, and `NEXT_PUBLIC_GOD_MODE_ENABLED=true`.

Expected: static export completes successfully.

- [ ] **Step 3: Browser-test desktop and mobile homepage states**

Assert the canonical sections, working navigation/dialogs/Wingman, canvas presence, no horizontal overflow, and no unexpected console or API 5xx errors.

- [ ] **Step 4: Browser-test authentication continuity**

Execute homepage → sign in → dashboard → reload → God Mode → logout → canonical homepage.

- [ ] **Step 5: Capture and inspect screenshots**

Save desktop, mobile, sign-in, and authenticated screenshots under `release/evidence/live-preview3/` and visually compare the first two with the supplied HTML.

### Task 5: Atomically deploy and certify test.architex.co.za

**Files:**
- Create: `docs/v8-remediation/evidence/LIVE_PREVIEW3_HOMEPAGE_CERTIFICATION_2026-08-25.md`

**Interfaces:**
- Consumes: verified static export
- Produces: live test deployment with rollback and certification evidence

- [ ] **Step 1: Upload to an inert FTP candidate directory**

Verify file count and byte count before any directory rename.

- [ ] **Step 2: Atomically swap the test document root**

Retain the prior test directory as a timestamped rollback point.

- [ ] **Step 3: Verify the live artifact and API**

Hash-check live `index.html`, verify `/api/v1/db-health` returns HTTP 200 with 12 migrations, and confirm authenticated endpoints retain their expected boundaries.

- [ ] **Step 4: Run the Playwright suite against the live URL**

Expected: desktop/mobile homepage and full authentication journey pass with no unexpected console errors or API 5xx responses.

- [ ] **Step 5: Record evidence and commit**

Document hashes, rollback path, API health, browser results, screenshot paths, and the unchanged production apex.

Run: `git add docs/v8-remediation/evidence/LIVE_PREVIEW3_HOMEPAGE_CERTIFICATION_2026-08-25.md && git commit -m "docs: certify preview 3 live homepage"`
