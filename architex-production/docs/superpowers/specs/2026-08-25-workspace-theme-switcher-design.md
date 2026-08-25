# Workspace theme switcher

## Goal

Make the existing light/dark preference available in every authenticated Architex OS dashboard without duplicating controls across modules.

## Design

- A single client-side theme provider owns the `light` or `dark` preference.
- The preference is read from browser storage after mount, defaults to light, and is saved whenever the user changes it.
- The provider applies the selected value as a `data-theme` attribute on the workspace root.
- The shared `TopBar` renders the existing accessible sun/moon button with an explicit label and pressed state.
- Landing-page theme behavior remains available, but it uses the same visual language rather than a module-local dashboard implementation.

## Boundaries

- No API call, account preference, or database schema change is included.
- No module may own its own theme state.
- The existing dashboard layout and navigation behavior remain unchanged.

## Verification

- Unit test: theme selection persists and restores after remount.
- Browser test: the top bar switcher is present, updates `data-theme`, and is keyboard accessible.
- Typecheck and targeted tests pass.
