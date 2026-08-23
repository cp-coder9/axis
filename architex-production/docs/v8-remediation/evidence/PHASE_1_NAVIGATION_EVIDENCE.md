# Phase 1 Navigation Evidence

Status: `PASS`

Completed: 2026-08-23 (Africa/Johannesburg)

## Contract

- One writable `NavigationState` is owned by `app/page.tsx`.
- Every shell mutation is represented by `NavigationEvent` and reduced through `transitionNavigation`.
- The ten global destinations, exact God metadata, visibility, tab resolution, Back origins, and invalid-event identity are canonical in `lib/navigation.ts`.
- Global content, demo labels, and quick-link event origins are canonical presentation data rather than a second routing map.
- Phase 4 dirty guards and Phase 7 God navigation consume the same exported state/event contract.

## Evidence

| Evidence | Findings | Result |
|---|---|---|
| `P1-E01` | `V8-H07`, `V8-H08` pure matrix: initial state, 10 destinations, 47 tools, tabs, modes, origins, invalid identity, God session | PASS: 9 navigation tests |
| `P1-E02` | `V8-H07` single shell state and typed child dispatch source contract; typecheck | PASS: 3 ownership tests; typecheck exit 0 |
| `P1-E03` | `V8-H05`, `V8-M03`, `V8-M05`, `V8-M06` God visibility, canonical rail metadata, `aria-current`, global copy/actions/origins and demo labels | PASS: unit/static tests and 3 focused public-surface journeys |
| `P1-E04` | Full rail, access, app, all-47-module, 20-role, and datum-role parity; Phase 4/7 compile handoff | PASS: 20 rail tests plus 94 access/app/role tests; typecheck exit 0 |

## Commands

```text
npm run test:unit -- lib/__tests__/navigation.test.ts lib/__tests__/navigation-shell-contract.test.ts
npm run typecheck
E2E_BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/rail.spec.ts --project=chromium
E2E_BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/app.spec.ts e2e/roles.spec.ts e2e/access.spec.ts --project=chromium
```

The first browser attempt exposed a stale Next dev process whose `.next` assets had been overwritten by the earlier static export. Missing client chunks prevented hydration. The verified workspace server tree was restarted; direct browser diagnostics then proved hydration before the recorded runs. No product behavior was changed to mask the infrastructure fault.

## Parity and handoff

- `lib/data.ts` was not changed by Phase 1, preserving role, stage, icon, calculator-type, and tab-argument registry data.
- `type-tests/navigation-handoff.ts` proves a Phase 4 guard accepts and redispatches a complete `NavigationEvent`, and Phase 7 consumes the frozen God variants and `NavigationState`.
- `V8-H05` remains behaviorally open for Phase 7, as required; Phase 1 provides its sole navigation contract.

## Exit decision

`GO`: P1-E01 through P1-E04 satisfy the Phase 1 exit gate. Phase 4 and Phase 7 must extend or consume this contract and may not introduce competing writable shell navigation state.
