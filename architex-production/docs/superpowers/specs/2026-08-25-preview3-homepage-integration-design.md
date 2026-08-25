# Preview 3 Homepage Integration Design

## Source of truth

`E:\axis-1\preview(3).html` is the canonical visual, content, layout, iconography, responsive, and interaction reference for the unauthenticated Architex homepage. The existing simplified `access-landing` screen is not an acceptable substitute.

## Architecture

Port the reference into a dedicated client-side React landing component. Preserve the reference's sections, styling, canvas Datum interaction, modals, public Wingman interaction, navigation, responsive states, and reduced-motion behaviour. Keep `AccessGateway` responsible for authentication state and view transitions only.

The landing component receives `onSignIn` and `onSignUp` callbacks. Reference actions that enter the private product use these callbacks instead of prototype-only modal copy. Existing `V8SignIn`, registration, session restoration, MariaDB persistence, RBAC, dashboard shell, and God Mode remain unchanged.

## Component boundaries

- `components/access/PublicLandingPage.tsx`: semantic page structure and callback wiring.
- `components/access/public-landing.css`: namespaced, faithful reference styles and responsive rules.
- `components/access/useDatumCanvas.ts`: canvas lifecycle, pointer interaction, resize handling, and cleanup.
- `components/access/AccessGateway.tsx`: renders `PublicLandingPage` while unauthenticated and owns transitions to sign-in/registration.
- `components/access/PublicLandingPage.test.tsx`: regression contract for canonical sections and authentication callbacks.

## Interaction requirements

- Primary and header Sign in controls open the existing real V8 sign-in view.
- Sign up controls open the existing role/registration path.
- Datum nodes and CTA preserve the supplied interactive behaviour.
- Marketplace, Knowledge, public spaces, information dialogs, toast messaging, and public Wingman remain usable before authentication.
- Internal hash navigation remains keyboard accessible.
- Canvas and event listeners are cleaned up on unmount.

## Fidelity requirements

- Reuse the supplied copy, geometry, spacing, colors, typography, icon treatments, and responsive breakpoints.
- Do not reinterpret, simplify, iframe, or visually blend the page into the dashboard shell.
- Keep all landing styles under a dedicated namespace so they cannot alter authenticated V8 screens.
- Preserve visible focus states and respect `prefers-reduced-motion`.

## Verification

1. A component test must fail against the current simplified landing and pass only when canonical Preview 3 markers and authentication callbacks are present.
2. Existing authentication and data-policy suites must remain green.
3. Typecheck and static production build must pass.
4. Browser certification must compare the rendered homepage to the reference at desktop and mobile widths.
5. Browser certification must execute homepage to sign-in, authenticated dashboard, reload persistence, logout, and return to the Preview 3 homepage.
6. The deployed live HTML/assets must be hash-checked and the API must remain healthy.

## Release boundary

Deploy first to `https://test.architex.co.za`. Do not modify the production apex `https://architex.co.za` as part of this integration.
