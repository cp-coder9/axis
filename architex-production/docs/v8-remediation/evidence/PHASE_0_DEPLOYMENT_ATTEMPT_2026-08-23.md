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

## Frontend rollback rehearsal

1. The active `94c6a52` directory was atomically held through FTP rename.
2. The previous all-contained frontend revision `9aaafe06455ae78cf877bba18c041592d6f11735` was promoted.
3. Public `build-info.json` returned `9aaafe0` and the focused containment test passed.
4. Revision `94c6a52` was restored atomically.
5. Public `build-info.json` again returned `94c6a52`; `/api/health` remained HTTP 200.

This proves frontend rollback mechanics and containment continuity. It is not the required complete frontend-plus-PHP rollback rehearsal.

## API deployment evidence and blocker

- The live gateway remained healthy at `https://api.architex.co.za/api/health` throughout.
- `https://api.architex.co.za/api/version` reports active gateway build `7fc3dcb33d7b9737de85acf30aa0412e2d9d7479`.
- The active gateway build fingerprint is absent from every reachable historical FTP-jail candidate. Two probed historical paths contained older build `c8b52535...`; router experiments there had no public effect and were fully restored, including removal of inert candidate directories.
- A reproducible atomic packager and FTPS deployment script were added in revision `94c6a52`.
- Repository `cp-coder9/axis` was created from the immutable candidate.
- `cp-coder9/arx-1` workflow run `32663606214` checked out and verified the candidate package, then failed closed before connecting because all required `test` environment secrets were empty.
- `gh secret list` confirmed the repository and `test` environment contain no deployment secrets.
- Consequently `/api/v1/health` and `/api/v1/engineering/calculations` still reach the legacy gateway and return 404. No deployed direct-origin 503 or remote mutation invariant can be claimed.

## Current exit disposition

`NO-GO`: frontend containment and frontend rollback are proven, but the authoritative PHP gate is not mounted in the active API document root. An operations owner must provide the active API FTPS account/server directory (or populate the four documented GitHub environment secrets), then rerun the prepared workflow. Observation and four independent signatures remain required afterward.
