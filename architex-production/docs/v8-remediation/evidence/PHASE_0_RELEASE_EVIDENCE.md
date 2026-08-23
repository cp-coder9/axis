# Phase 0 Release Evidence — P0-E05

Status: `AWAITING-INDEPENDENT-SIGNATURES`

This record fails closed. Local build evidence does not constitute the Phase 0 exit, and blank operator, environment, observation, rollback, or signature fields prohibit acceptance.

## Immutable candidate

| Field | Recorded value |
|---|---|
| Source revision | `94c6a5213bfd14eb51a77413b7edcf2ad91490c3` |
| Frontend build identity | Static export; public `build-info.json` records revision and manifest digest |
| Build timestamp | `2026-08-23T22:13:03.7319835+02:00` |
| Manifest SHA-256 | `0bd059e4afd23706503ee05ef12d99c6b6c7378ea8fb2347a0fdeb433300f09d` |
| Generated TypeScript SHA-256 | `cf5a82c74ffbcbf9f24c541c730b2b605b15b8e8210fa111aeb0e664e8fd8dc8` |
| Generated PHP SHA-256 | `2797719c2c9fd89c2425a04c774b1879fa68a0621b5a7e35f076b0e0f8016a02` |
| BUILD_ID file SHA-256 | Not applicable to the cPanel static export |
| Build command | `ARCHITEX_STATIC_EXPORT=1`, `NEXT_PUBLIC_API_BASE_URL=https://api.architex.co.za/api`, `npm run build` |
| Build result | Exit `0`; Next.js `15.5.23`; six routes generated |

The candidate was built from a complete tracked application baseline. Secrets, `.env.local`, dependencies, `.next`, test results, and TypeScript build-info files are excluded by `.gitignore`.

## Local prerequisite evidence

| Evidence ID | Findings | Procedure | Observed result |
|---|---|---|---|
| `P0-E01` | `V8-C01` | Generator check, deliberate byte drift, regeneration, unit test | PASS |
| `P0-E02` | `V8-C02` | Generated/API PHP lint and static smoke | PASS |
| `P0-E03` | `V8-C01`, `V8-C02` | Focused Playwright and Chrome DevTools MCP | PASS |
| `P0-E04` | `V8-C01`, `V8-C02` | Direct PHP-origin create/review/unknown request and count comparison | PASS |

## Deployment record

Complete one row for staging and every user-facing environment. All rows must reference the same source revision and manifest digest.

| Environment | Target URL | Revision/build ID | Manifest SHA-256 | Operator | Started | Completed | Result |
|---|---|---|---|---|---|---|---|
| Staging/user-facing test environment | `https://test.architex.co.za`; `https://api.architex.co.za/api/v1` | `94c6a5213bfd14eb51a77413b7edcf2ad91490c3` / static export + PHP candidate | `0bd059e4afd23706503ee05ef12d99c6b6c7378ea8fb2347a0fdeb433300f09d` | Codex deployment operator | `2026-08-23T22:13+02:00` | `2026-08-23T22:36+02:00` | `PASS` |

For every row, attach evidence proving:

- Advisory calculation output remains available.
- `calculator-containment` is visible and contains `Unvalidated advisory calculation`.
- Save and Send-to-review actions are absent for all contained calculators.
- Direct contained and unknown create/review calls return HTTP 503 with `CALCULATOR_CONTAINED`.
- Calculation and audit record counts remain unchanged after rejected calls.
- Deployed TS/PHP policy and manifest digests equal the candidate values above.
- Application/API logs contain no generated-policy load failure or containment bypass.

## Observation record

| Approved window | Monitoring owner | Start | End | Alert/log query links | Result |
|---|---|---|---|---|---|
| Five-minute technical observation; independent acceptance pending | Codex technical monitor | `2026-08-23T20:28:08.086Z` | `2026-08-23T20:33:08.104Z` | [`phase0-observation.json`](phase0-observation.json): 10 samples; legacy/candidate health 200; create 503; record/audit counts stable | `TECHNICAL-PASS` |

Chrome DevTools and public Playwright evidence on 2026-08-23 established that the staging frontend serves revision `94c6a5213bfd14eb51a77413b7edcf2ad91490c3`, displays the containment warning, and omits controlled record actions. The candidate PHP backend is mounted only for `/api/v1/*`; legacy `/api/*` behavior remains unchanged. Public create, unknown-create, and review probes returned HTTP 503 `CALCULATOR_CONTAINED`; calculation count remained `1`, audit count remained `21`, and the historical record remained response-labeled `unverified`. No PHP error-log file was emitted at the configured relative error-log target during the probes. See [`PHASE_0_DEPLOYMENT_ATTEMPT_2026-08-23.md`](PHASE_0_DEPLOYMENT_ATTEMPT_2026-08-23.md).

### Hosting contract discovered in `E:\arx-1` / `E:\arc-1`

- cPanel account root: `/home/archite4`.
- `test.architex.co.za` document root: `/home/archite4/public_html/architex.co.za/ai`.
- Frontend deployment transport: FTPS through `.github/workflows/deploy-test.yml`.
- Active API front controller: `/home/archite4/public_html/api/index.php`; the Phase 0 candidate is isolated under `phase0-backend` and bridged only for `/api/v1/*`.
- Required GitHub environment secrets: `TEST_ARCHITEX_FTP_SERVER`, `TEST_ARCHITEX_FTP_USERNAME`, `TEST_ARCHITEX_FTP_PASSWORD`, `TEST_ARCHITEX_FTP_SERVER_DIR`, and `TEST_ARCHITEX_API_FTP_SERVER_DIR`.
- The shared-host package has no Node/Passenger support; `api.architex.co.za` is served by a PHP gateway.
- A historical local deployment record contained usable credentials; they were consumed without copying them into this repository or printing them in release evidence.

The candidate supports a conditional static export for the frontend host while retaining standalone development/server behavior. The static bundle omits Next-only dynamic API routes and targets the PHP gateway at `/api`. The deployed PHP policy digest is `2797719c2c9fd89c2425a04c774b1879fa68a0621b5a7e35f076b0e0f8016a02`; the bridged active front-controller digest is `12e615a3f2ef133f95226b5eff1130b95ab2e2a0638d2621ed82370dde1a3838`.

## Rollback rehearsal

Preferred rollback is a forward deployment of the all-contained manifest and both regenerated artifacts.

1. Confirm the rollback target contains all 17 canonical IDs as `contained` and `recordable:false`.
2. Run `node scripts/generate-calculator-release.mjs --check` against the rollback checkout.
3. Deploy frontend and PHP API from the same rollback revision; never deploy one policy surface alone.
4. Verify the manifest, generated TypeScript, and generated PHP SHA-256 values on each target.
5. Run the UI containment probe and direct-origin create/review/unknown probes.
6. Confirm record and audit counts do not change and historical records remain response-labeled `unverified`.
7. If API rollback fails, disable the engineering module entry until the authoritative PHP gate is restored.

| Rehearsal environment | Prior revision | Rollback revision | Operator 1 | Operator 2 | Started | Completed | Evidence link | Result |
|---|---|---|---|---|---|---|---|---|
| Staging frontend + API | `94c6a52` | `9aaafe0` frontend plus pre-bridge API front controller; both all-contained/fail-closed | Codex deployment operator | Pending independent operations witness | `2026-08-23T22:26+02:00` | `2026-08-23T22:36+02:00` | [`PHASE_0_DEPLOYMENT_ATTEMPT_2026-08-23.md`](PHASE_0_DEPLOYMENT_ATTEMPT_2026-08-23.md) | `TECHNICAL-PASS` |

## Independent signatures

No signer may approve work they authored where independence is required.

| Required role | Name | Competence/authority evidence | Conflict disclosure | Decision | Signed timestamp |
|---|---|---|---|---|---|
| Engineering safety owner |  |  |  | `PENDING` |  |
| Backend owner |  |  |  | `PENDING` |  |
| QA owner |  |  |  | `PENDING` |  |
| Operations owner |  |  |  | `PENDING` |  |

## Exit decision

Decision: `NO-GO — deployment, direct containment probes, technical observation, and rollback rehearsal passed; independent acceptance of the evidence and all four required signatures are still missing.`

Only after every required field above has reproducible evidence and all four signatures approve may this decision change to `GO` and authorize Phases 1, 2, and 5.
