# Phase 0 Deployment Attempt — 2026-08-23

## Candidate

- Revision: `94c6a5213bfd14eb51a77413b7edcf2ad91490c3`
- Manifest SHA-256: `0bd059e4afd23706503ee05ef12d99c6b6c7378ea8fb2347a0fdeb433300f09d`
- Generated PHP SHA-256: `2797719c2c9fd89c2425a04c774b1879fa68a0621b5a7e35f076b0e0f8016a02`
- Frontend: Next.js static export targeting `https://api.architex.co.za/api`

## Successful staging frontend evidence

- `https://test.architex.co.za/build-info.json` returned revision `94c6a5213bfd14eb51a77413b7edcf2ad91490c3` and the manifest digest above.
- The public focused Playwright test `V8-C01 V8-C02 contained calculator cannot create controlled evidence` passed.
- Chrome DevTools MCP opened the public Engineering Calculation Hub and observed `Unvalidated advisory calculation — controlled record actions are unavailable until independent professional approval is recorded.`
- The public landing, role gate, V8 sign-in, and V8 shell mount were verified previously on the same frontend line.

## Complete rollback rehearsal

1. The active `94c6a52` directory was atomically held through FTP rename.
2. The previous all-contained frontend revision `9aaafe06455ae78cf877bba18c041592d6f11735` was promoted.
3. Public `build-info.json` returned `9aaafe0` and the focused containment test passed.
4. Revision `94c6a52` was restored atomically.
5. Public `build-info.json` again returned `94c6a52`; `/api/health` remained HTTP 200.

6. The active API front controller was restored to its pre-bridge digest, legacy health remained HTTP 200, and `/api/v1/health` became HTTP 404 as expected.
7. The Phase 0 bridge was restored, both health routes returned HTTP 200, and the full direct mutation invariant passed again.
8. During the frontend rollback to `9aaafe0`, the live authoritative API still rejected a contained create with HTTP 503 and the public focused containment test passed. The `94c6a52` frontend was then restored and the full public invariant passed.

The pre-bridge rollback copy remains at `/home/archite4/public_html/api/.phase0-index.pre-94c6a52.php`. Its SHA-256 is `ef32cdc12296c0b4c140a3e9b7888a12275ac1c81ebdb2fb4a88bbea9255ff4f`; the restored bridged front controller is `12e615a3f2ef133f95226b5eff1130b95ab2e2a0638d2621ed82370dde1a3838`.

## API deployment evidence

- The live gateway remained healthy at `https://api.architex.co.za/api/health` throughout.
- `https://api.architex.co.za/api/version` reports active gateway build `7fc3dcb33d7b9737de85acf30aa0412e2d9d7479`.
- A short-lived token-protected diagnostic positively located the active front controller at `/home/archite4/public_html/api/index.php`. It and all temporary deployment utilities were removed after use.
- The candidate backend was deployed under `/home/archite4/public_html/api/phase0-backend`; an atomic bridge routes only `/api/v1/*` into it, preserving legacy `/api/*` behavior.
- A reproducible atomic packager and FTPS deployment script were added in revision `94c6a52`.
- Repository `cp-coder9/axis` was created from the immutable candidate.
- `cp-coder9/arx-1` workflow run `32663606214` checked out and verified the candidate package, then failed closed before connecting because all required `test` environment secrets were empty.
- `gh secret list` confirmed the repository and `test` environment contain no deployment secrets.
- `/api/health` and `/api/v1/health` both return HTTP 200. Direct public create, unknown-create, and review return HTTP 503 `CALCULATOR_CONTAINED`; calculation count remained `1`, audit count remained `21`, and historical evidence remained `unverified`.
- A five-minute observation collected 10 passing samples in [`phase0-observation.json`](phase0-observation.json). No PHP error-log file was emitted at the configured relative error-log target during deployment and probes.

## Current exit disposition

`NO-GO`: all technically executable Phase 0 deployment, observation, containment, persistence-invariant, and rollback checks pass. Exit still requires independent acceptance and signatures from the engineering-safety, backend, QA, and operations owners; Codex cannot self-approve those roles.
