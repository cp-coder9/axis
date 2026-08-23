# Phase 0 Independent Sign-off Packet

Prepared: 2026-08-23 (Africa/Johannesburg)

Candidate revision: `94c6a5213bfd14eb51a77413b7edcf2ad91490c3`

Evidence commit: `75220148984e8862af0a737222b5198f499b040d`

Manifest SHA-256: `0bd059e4afd23706503ee05ef12d99c6b6c7378ea8fb2347a0fdeb433300f09d`

This packet requests the four independent approvals required by `P0-T05`. It does not authorize a reviewer to approve work they authored or a role for which they lack authority. A rejection must identify the failed requirement and evidence needed to reconsider it.

Review coordination: [`cp-coder9/axis#1`](https://github.com/cp-coder9/axis/issues/1)

## Common evidence

- Exit contract: [`../PHASE_0_ENGINEERING_SAFETY_CONTAINMENT.md`](../PHASE_0_ENGINEERING_SAFETY_CONTAINMENT.md)
- Operator record and signature table: [`PHASE_0_RELEASE_EVIDENCE.md`](PHASE_0_RELEASE_EVIDENCE.md)
- Deployment and rollback detail: [`PHASE_0_DEPLOYMENT_ATTEMPT_2026-08-23.md`](PHASE_0_DEPLOYMENT_ATTEMPT_2026-08-23.md)
- Monitoring samples: [`phase0-observation.json`](phase0-observation.json)
- Public containment screenshot: [`../screenshots/phase-0-containment.png`](../screenshots/phase-0-containment.png)
- Live frontend: `https://test.architex.co.za`
- Live legacy health: `https://api.architex.co.za/api/health`
- Live candidate health: `https://api.architex.co.za/api/v1/health`

The complete fail-fast suite was rerun on 2026-08-23 after deployment and rollback restoration. Generator parity, two policy unit tests, TypeScript typecheck, both PHP lints, backend smoke, direct PHP containment, and the focused public Playwright test all exited `0`.

## Engineering safety owner

Confirm that:

- all 17 calculators and unknown IDs remain contained and non-recordable;
- advisory output is labeled `Unvalidated advisory calculation`;
- the UI does not offer Save or Send to review and does not claim controlled evidence;
- the wording and containment boundary are acceptable for engineering safety.

Record the reviewer's name, competence/authority evidence, conflict disclosure, decision, and timestamp in the engineering-safety row of [`PHASE_0_RELEASE_EVIDENCE.md`](PHASE_0_RELEASE_EVIDENCE.md).

## Backend owner

Confirm that:

- generated PHP policy digest is `2797719c2c9fd89c2425a04c774b1879fa68a0621b5a7e35f076b0e0f8016a02`;
- contained create, unknown create, and review fail before mutation with HTTP 503 `CALCULATOR_CONTAINED`;
- calculation count stays `1`, audit count stays `21`, and historical reads remain labeled `unverified`;
- the `/api/v1/*` bridge preserves legacy `/api/*` behavior and the rollback copy is sufficient.

Record the reviewer's name, backend authority, conflict disclosure, decision, and timestamp in the backend row of [`PHASE_0_RELEASE_EVIDENCE.md`](PHASE_0_RELEASE_EVIDENCE.md).

## QA owner

Confirm that:

- `P0-E01` through `P0-E04` cover both `V8-C01` and `V8-C02`;
- the fail-fast suite and focused public browser flow are reproducible;
- the screenshot, direct API results, count invariants, and observation JSON support the recorded claims;
- no required Phase 0 scenario is omitted or supported only by indirect evidence.

Record the reviewer's name, QA authority, conflict disclosure, decision, and timestamp in the QA row of [`PHASE_0_RELEASE_EVIDENCE.md`](PHASE_0_RELEASE_EVIDENCE.md).

## Operations owner

Confirm that:

- frontend revision `94c6a52` and both health endpoints are live;
- the five-minute, ten-sample technical observation is an approved observation window, or specify the required replacement duration and monitoring source;
- no generated-policy load or containment-bypass failure is present in the available PHP error-log evidence;
- the rehearsed frontend and API rollback procedure, retained artifacts, and restoration checks are operationally acceptable.

Record the reviewer's name, operations authority, conflict disclosure, decision, and timestamp in the operations row of [`PHASE_0_RELEASE_EVIDENCE.md`](PHASE_0_RELEASE_EVIDENCE.md).

## Final acceptance rule

Phase 0 remains `NO-GO` unless all four rows contain independent `APPROVED` decisions. After the fourth approval, update the P0-E05 status and exit decision to `GO`, commit the signed record, verify the live revision and health endpoints once more, and only then authorize dependent phases.
