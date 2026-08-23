# Phase 0 Release Evidence — P0-E05

Status: `AWAITING-DEPLOYMENT-AND-SIGNATURES`

This record fails closed. Local build evidence does not constitute the Phase 0 exit, and blank operator, environment, observation, rollback, or signature fields prohibit acceptance.

## Immutable candidate

| Field | Recorded value |
|---|---|
| Source revision | `ec5a24e47fedec9d05f9a53b1310179ae8ffed72` |
| Next.js build ID | `-FYCfrAo4lswcUhhGMTyG` |
| Build timestamp | `2026-08-23T20:15:00.6607632+02:00` |
| Manifest SHA-256 | `0bd059e4afd23706503ee05ef12d99c6b6c7378ea8fb2347a0fdeb433300f09d` |
| Generated TypeScript SHA-256 | `cf5a82c74ffbcbf9f24c541c730b2b605b15b8e8210fa111aeb0e664e8fd8dc8` |
| Generated PHP SHA-256 | `2797719c2c9fd89c2425a04c774b1879fa68a0621b5a7e35f076b0e0f8016a02` |
| BUILD_ID file SHA-256 | `7311eef42edf52a35b20f9467f68423ae0b5f81d524c4eb5e7e2f1b15f21321f` |
| Build command | `npm run build` |
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
| Staging frontend | `https://test.architex.co.za` | `9aaafe06455ae78cf877bba18c041592d6f11735` / static export | `0bd059e4afd23706503ee05ef12d99c6b6c7378ea8fb2347a0fdeb433300f09d` (source manifest; remote PHP digest not available) | Codex FTP operator | `2026-08-23T21:17+02:00` | `2026-08-23T21:25+02:00` | `FRONTEND-PASS / BACKEND-NOT-DEPLOYED` |
| User-facing environment 1 |  |  |  |  |  |  | `NOT-RUN` |

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
|  |  |  |  |  | `NOT-RUN` |

Chrome DevTools evidence on 2026-08-23 established that the staging frontend now serves revision `9aaafe06455ae78cf877bba18c041592d6f11735`: landing, registration role gate, upgraded V8 sign-in, and V8 shell mount all passed. The valid existing gateway probe is `https://api.architex.co.za/api/health` (HTTP 200). Its project endpoint requires a Firebase bearer token and rejects the candidate's local identity headers, so this is frontend deployment evidence only and does not satisfy the PHP containment, persistence, observation, rollback-rehearsal, or signature gates.

### Hosting contract discovered in `E:\arx-1` / `E:\arc-1`

- cPanel account root: `/home/archite4`.
- `test.architex.co.za` document root: `/home/archite4/public_html/architex.co.za/ai`.
- Frontend deployment transport: FTPS through `.github/workflows/deploy-test.yml`.
- API deployment transport: FTPS to the separate `api.architex.co.za` document root.
- Required GitHub environment secrets: `TEST_ARCHITEX_FTP_SERVER`, `TEST_ARCHITEX_FTP_USERNAME`, `TEST_ARCHITEX_FTP_PASSWORD`, `TEST_ARCHITEX_FTP_SERVER_DIR`, and `TEST_ARCHITEX_API_FTP_SERVER_DIR`.
- The shared-host package has no Node/Passenger support; `api.architex.co.za` is served by a PHP gateway.
- A historical local deployment record contained usable credentials; they were consumed without copying them into this repository or printing them in release evidence.

The candidate now supports a conditional static export for the frontend host while retaining standalone development/server behavior. The static bundle omits Next-only dynamic API routes and targets the separately hosted PHP gateway at `/api`. The candidate PHP containment gateway itself remains undeployed.

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
|  |  |  |  |  |  |  |  | `NOT-RUN` |

## Independent signatures

No signer may approve work they authored where independence is required.

| Required role | Name | Competence/authority evidence | Conflict disclosure | Decision | Signed timestamp |
|---|---|---|---|---|---|
| Engineering safety owner |  |  |  | `PENDING` |  |
| Backend owner |  |  |  | `PENDING` |  |
| QA owner |  |  |  | `PENDING` |  |
| Operations owner |  |  |  | `PENDING` |  |

## Exit decision

Decision: `NO-GO — P0-T05 deployment, observation, rollback, and signatures are missing; the candidate runtime is incompatible with the discovered static/PHP host contract.`

Only after every required field above has reproducible evidence and all four signatures approve may this decision change to `GO` and authorize Phases 1, 2, and 5.
