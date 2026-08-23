# V8 Remediation Completion Record

Updated: 2026-08-23 (Africa/Johannesburg)
Branch: `codex/v8-remediation`

This is a living evidence record. A task is listed as complete only when its required current-state evidence has been observed. External deployment, observation, professional review, and sign-off are never inferred or self-approved.

## Phase 0 — Engineering Safety Containment

### Completed local implementation

- [x] `P0-T01` installed Vitest 3.2.7, configured the `@` alias, and proved the temporary harness test passed before removal.
- [x] `P0-T02` created the sole 17-calculator release manifest, deterministic TypeScript/PHP generation, fail-closed selectors, ordered-ID/minimum-total tests, and byte-drift detection.
- [x] `P0-T03` added the visible `Unvalidated advisory calculation` containment status and suppressed Save/Send actions and controlled-record/MariaDB claims for contained calculators.
- [x] `P0-T04` made PHP authoritative for contained and unknown create/review requests, response-labeled historical reads as unverified, and proved the JSON record count does not change.

### Evidence observed

| Evidence | Result |
|---|---|
| `P0-E01` generator `--check`, policy tests, deliberate one-byte drift | PASS; drift failed as required, regeneration restored parity |
| `P0-E02` generated PHP lint, API lint, backend smoke | PASS |
| `P0-E03` focused Playwright containment flow | PASS; advisory banner present, Save/Send absent |
| `P0-E04` direct PHP-origin create/review/unknown probes | PASS; HTTP 503 `CALCULATOR_CONTAINED`, record count unchanged |
| Chrome DevTools MCP live interaction | PASS; local page calculated advisory results with containment banner and no record controls |
| Reproducible application baseline | PASS; complete tracked baseline committed as `ec5a24e` |
| Immutable production build | PASS; build ID `-FYCfrAo4lswcUhhGMTyG` |

Commands executed successfully:

```text
node scripts/generate-calculator-release.mjs --check
npm run test:unit -- lib/__tests__/engineering-safety.test.ts
npm run typecheck
php -l backend/generated/calculator_release.php
php -l backend/public/index.php
php backend/tests/smoke.php
node backend/tests/containment-api.mjs
npm run test:e2e -- e2e/rail.spec.ts --grep "V8-C01 V8-C02"
```

Screenshot: [`screenshots/phase-0-containment.png`](screenshots/phase-0-containment.png)

## Public access and staging deployment

- [x] Cloned the existing `test.architex.co.za` landing page and six-role registration entry.
- [x] Upgraded the direct sign-in screen to the V8 access-console visual language.
- [x] Added a static-export deployment mode for the cPanel/LiteSpeed frontend target while retaining standalone mode for local/server builds.
- [x] Verified landing, role gate, registration form, V8 sign-in, and V8 OS mount with Chrome DevTools MCP on the public host.
- [x] Deployed immutable revision `94c6a5213bfd14eb51a77413b7edcf2ad91490c3` to `https://test.architex.co.za` on 2026-08-23.
- [x] Preserved the pre-deployment frontend as `/public_html/test.architex.co.za.backup-20260823-2117` for rollback.
- [x] Rehearsed frontend rollback to all-contained revision `9aaafe0`, reran the public containment test, and restored `94c6a52`.

Release screenshots:

- [`screenshots/v8-access-landing.png`](screenshots/v8-access-landing.png)
- [`screenshots/v8-access-sign-in.png`](screenshots/v8-access-sign-in.png)

Verification: static build passed; access plus all 47 module browser tests passed (`54/54`); public browser console was clean. The deployed frontend calls the confirmed gateway mount at `https://api.architex.co.za/api`.

The deployed access forms currently mount the V8 shell client-side and are not a claim of production authentication. The candidate PHP backend is live behind an isolated `/api/v1/*` bridge. Public create, unknown-create, and review probes return HTTP 503 `CALCULATOR_CONTAINED`; calculation and audit counts remain unchanged and historical evidence remains `unverified`. Detailed evidence: [`evidence/PHASE_0_DEPLOYMENT_ATTEMPT_2026-08-23.md`](evidence/PHASE_0_DEPLOYMENT_ATTEMPT_2026-08-23.md).

Approved P0-E05 operator record: [`evidence/PHASE_0_RELEASE_EVIDENCE.md`](evidence/PHASE_0_RELEASE_EVIDENCE.md). It records the candidate revision, SHA-256 values, deployment, observation, rollback evidence, and the repository owner's explicit Phase 0 signature waiver.

Independent reviewer packet: [`evidence/PHASE_0_SIGNOFF_PACKET.md`](evidence/PHASE_0_SIGNOFF_PACKET.md).

### Phase 0 exit work

- [x] `P0-T05` deploy the complete immutable revision to the staging/user-facing test environment.
- [x] Record revision/build ID, manifest SHA-256, target, operator, and timestamps.
- [x] Complete a five-minute technical observation with ten clean samples; independent acceptance remains pending.
- [x] Rehearse and prove frontend plus API rollback to all-contained/fail-closed artifacts, then restore the candidate.
- [x] Record repository-owner approval and the explicit Phase 0-only waiver of the planned four-person signature split in `P0-E05`.

Phase 0 exited on 2026-08-23 after all technical evidence passed and the repository owner explicitly accepted the evidence and waived the planned four-person signature split. The waiver does not validate formulas or remove later professional-review requirements.

## Phases 1–8

### Phase 1 — Navigation Contract

- [x] Replaced five writable shell navigation values and ad hoc God state with one `NavigationState` and pure typed reducer.
- [x] Canonicalized ten destinations, all 47 tool/tab transitions, Back origins, exact God metadata, conditional visibility, and invalid-event identity preservation.
- [x] Derived the rail and global destination copy/actions from canonical metadata, including `aria-current` and explicit demo/static labeling.
- [x] Migrated shell, God, and global content consumers to typed navigation events and published Phase 4/7 compile-time handoffs.
- [x] Passed 12 unit/static tests, 20 rail journeys, 94 access/app/role journeys, and TypeScript typecheck.

Evidence: [`evidence/PHASE_1_NAVIGATION_EVIDENCE.md`](evidence/PHASE_1_NAVIGATION_EVIDENCE.md).

Phase 1 exit: `GO`. `V8-H05` remains intentionally open for Phase 7 behavioral closure.

### Phases 2–8

- [ ] In progress. Phase 2 calculation-engine remediation is next in dependency order.

## Known verification observations

- `npm install` reported three high-severity dependency audit findings; no breaking `npm audit fix --force` was applied.
- Vitest/Next development output reports Node `DEP0205` (`module.register()` deprecation).
- Chrome DevTools reported unlabeled/form-field accessibility issues in the current engineering form; these remain in scope for Phases 4–8.
- The frontend candidate is live at `https://test.architex.co.za`; `build-info.json` confirms revision `94c6a52`.
- Both `https://api.architex.co.za/api/health` and `https://api.architex.co.za/api/v1/health` return HTTP 200; the bridge preserves the older gateway outside `/api/v1/*`.
- The Phase 0 JSON-backed containment candidate is live only as a safety gate. It is not a claim that later-phase MariaDB persistence or production authentication is complete.
