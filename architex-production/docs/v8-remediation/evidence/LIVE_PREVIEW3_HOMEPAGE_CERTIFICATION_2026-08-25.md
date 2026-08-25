# Live Preview 3 homepage certification — 2026-08-25

## Certified scope

- Homepage source of truth: `E:\axis-1\preview(3).html`
- Live prototype: `https://test.architex.co.za`
- API: `https://api.architex.co.za/api/v1`
- Integration commit: `d159e66`
- Production apex `https://architex.co.za` was not changed.

## Exact-source proof

- Supplied HTML SHA-256: `c09cacf44f9a104d55aed03de3d17a5b6160aa71faeb2c43a35146bc5193ca74`
- Repository `public/preview3.html` SHA-256: `c09cacf44f9a104d55aed03de3d17a5b6160aa71faeb2c43a35146bc5193ca74`
- Live `https://test.architex.co.za/preview3.html` SHA-256: `c09cacf44f9a104d55aed03de3d17a5b6160aa71faeb2c43a35146bc5193ca74`
- Verified static build and live `index.html` SHA-256: `da56087e741b6df74f51e88b33277b66f4a34d490c086ae0ccbec522270efb69`

The supplied markup, CSS, embedded artwork, copy, and interaction runtime are preserved as the canonical public asset. The application mounts them in an isolated Shadow DOM so authenticated-application resets cannot alter the public page. Only Sign in and Sign up entry actions are intercepted and connected to the real authentication gateway.

## Source gates

- Preview 3 regression contract: 3 tests passed.
- Authentication suite: schema, PHP policy, session policy, and 6 Vitest tests passed.
- Data policy suite: environment, data-mode process, and production auth-boundary checks passed.
- TypeScript: `tsc --noEmit` passed.
- Next.js static production build passed.

## Browser fidelity certification

Playwright compared the standalone supplied page and the integrated application at:

- Desktop: 1440 × 1000
- Mobile: 390 × 844

For the header, hero, hero copy, Datum stage, feature rail, Marketplace, Wingman, Knowledge, and public-spaces sections, computed x/y coordinates, widths, heights, display, position, and background values matched exactly. Mobile horizontal overflow was absent. The supplied Datum animation, moving CTA, dialogs, Knowledge search, public Wingman, project brief, and public navigation runtime loaded successfully.

Live visual evidence:

- [Standalone desktop reference](../../../release/evidence/live-preview3/reference-desktop.png)
- [Integrated live desktop](../../../release/evidence/live-preview3/integrated-desktop.png)
- [Standalone mobile reference](../../../release/evidence/live-preview3/reference-mobile.png)
- [Integrated live mobile](../../../release/evidence/live-preview3/integrated-mobile.png)

## Live authentication continuity

The live browser journey passed:

1. Preview 3 homepage rendered.
2. Header Sign in opened the existing V8 secure sign-in screen.
3. MariaDB-backed login succeeded.
4. Command Centre and God Mode were available.
5. Refresh session restored after a full page reload.
6. Logout revoked the session.
7. The browser returned to the Preview 3 homepage.
8. No API 5xx response or unexpected console error occurred.

Live `/api/v1/db-health` returned HTTP 200 with MariaDB 11.4.13, 12 applied migrations, 5 users, 4 projects, 21 roles, and 47 modules.

## Deployment and rollback

- The verified static export was uploaded to an inert FTP candidate.
- The candidate was size-checked before the directory swap.
- Active test document root: `/public_html/architex.co.za/ai/public_html/test.architex.co.za`
- Rollback directory: `/public_html/architex.co.za/ai/public_html/test.architex.co.za.pre-preview3-20260825-163019`

## Result

The homepage supplied in `E:\axis-1\preview(3).html` is integrated and deployed on the test site with exact asset hashes, exact measured desktop/mobile geometry, working public interactions, and continuity into the real authenticated V8 application.
