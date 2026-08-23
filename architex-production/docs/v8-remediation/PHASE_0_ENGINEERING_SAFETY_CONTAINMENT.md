# Phase 0 Engineering Safety Containment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans task by task. Checkbox state is implementation tracking, not acceptance evidence.

**Goal:** Prevent unvalidated V8 calculations from being represented, persisted, reviewed, or advanced as controlled engineering evidence while remediation proceeds.

**Architecture:** `config/calculator-release-manifest.json` is the sole editable release-state source for all 17 calculators. A checked generator emits deterministic TypeScript and PHP artifacts. React consumes the TypeScript artifact and PHP consumes the PHP artifact; neither runtime maintains a duplicate safety list. Server enforcement is authoritative.

**Version basis:** `package.json` declares Next.js `^15.4.9`, React `^19.2.1`, Playwright `^1.62.1`, and exact TypeScript `5.9.3`. `package-lock.json` is installation authority and currently resolves Next.js `15.5.23`, React `19.2.8`, Playwright `1.62.1`, and TypeScript `5.9.3`. Node.js 20+ and PHP 8.1+ are required runtimes. Vitest is added by range and its installed resolution is reported only from the resulting lockfile.

## Safety Gate

- All 17 calculators begin `contained` and `recordable:false`; unknown IDs fail closed.
- Containment is enforced in both client and PHP before any record mutation.
- Historical records remain readable but are response-labeled unverified; stored data is not rewritten.
- No formula, role, stage, icon, calculator type, tab, or navigation behavior changes in this phase.
- A merged harness or source patch is not containment. Phase 0 must be fully deployed, directly bypass-tested, monitored, rollback-proven, and signed before any Phase 1, 2, 3, 5, or other parallel implementation starts.

## Stable Finding Coverage

| Finding / source requirement | Current state | Stable task IDs | Stable evidence ID |
|---|---|---|---|
| `V8-C01`: concrete can produce `NaN`; stormwater is about 100 times high | Seventeen formulas exist without professional approval | `P0-T02` to `P0-T05` | `P0-E01`, `P0-E03`, `P0-E04`, `P0-E05` |
| `V8-C02`: writable JSON API while UI claims MariaDB | Temporary store is writable and copy overstates persistence | `P0-T03` to `P0-T05` | `P0-E02`, `P0-E03`, `P0-E04`, `P0-E05` |
| V8 Phase 3 disclaimer and record actions | Warning is ambiguous; Save and Send remain available | `P0-T03` | `P0-E03` |
| V8 Phase 6 direct API path | Client can be bypassed | `P0-T04` | `P0-E04` |
| V8 Phase 7 validation claim | Existing build/smoke evidence is insufficient | `P0-T05` | `P0-E05` |

Finding IDs must appear in test names or metadata, evidence-manifest entries, and the signed exit record. Code inspection alone closes neither critical finding.

## Scope

- One release manifest, deterministic TS/PHP generation, and byte-check/parity tests.
- Contained-result warning, truthful persistence copy, and action suppression.
- Authoritative API create/review gates and historical-read warning metadata.
- Vitest harness for this and later phases.
- Direct-PHP behavioral tests, focused UI tests, deployment, monitoring, and rollback evidence.

## Non-Scope

- Formula correction or professional approval.
- MariaDB migration or workflow redesign.
- New permissions, roles, stages, icons, calculator types, tabs, or navigation.
- Visual redesign beyond minimum warning treatment.

## Dependencies And Parallelization

- No earlier remediation phase is required.
- Baseline commands run separately and stop on first failure: `npm run typecheck`; `php -l backend/public/index.php`; `npm run test:e2e -- e2e/rail.spec.ts`.
- Phase 2 may change a calculator to `validated` only through the same manifest and generator after signed evidence.
- Phase 3 must retain the generated authoritative gate around MariaDB writes.
- Every parallel lane depends on signed `P0-E05`, not `P0-T01` or a source-only merge.

## Verification Command Policy

Commands are PowerShell 5.1 compatible. Multi-command gates use this fail-fast wrapper, or a checked-in named npm script with equivalent stop-on-first-failure behavior; double-ampersand shell chaining is prohibited:

```powershell
$ErrorActionPreference = 'Stop'
function Invoke-Checked([scriptblock]$Command) {
  & $Command
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

Each command listed as a separate gate is invoked through `Invoke-Checked { ... }` in the documented order.

## Canonical Release Manifest

The JSON root is exactly:

```ts
interface CalculatorReleaseManifestV1 {
  schemaVersion: 1;
  calculators: Array<{
    id: CalculatorId;
    releaseState: 'contained' | 'validated';
    recordable: boolean;
    message: string;
    formulaVersion: string | null;
    professionalOwner: string;
    minimumGoldenCases: number;
    approvalEvidenceIds: string[];
  }>;
}
```

The manifest contains each canonical ID exactly once and in registry order. Initially every entry is `contained`, `recordable:false`, `formulaVersion:null`, and `approvalEvidenceIds:[]`. The known minimum fixture counts are recorded now and sum to 57. The generator rejects missing, duplicate, or unknown IDs; a state/recordable mismatch; fewer than the declared minimum; and `validated` without a formula version and approval evidence. `--check` compares generated bytes without writing.

## Exact File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `config/calculator-release-manifest.json` | Sole editable release state, owner, fixture minimum, version, and approval evidence |
| Create | `scripts/generate-calculator-release.mjs` | Validate and deterministically generate both runtime artifacts; implement `--check` |
| Create | `lib/generated/calculator-release.ts` | Generated TypeScript policy; never hand-edited |
| Create | `backend/generated/calculator_release.php` | Generated PHP policy; never hand-edited |
| Create | `lib/engineering-safety.ts` | Fail-closed selectors over generated TS data |
| Create | `lib/__tests__/engineering-safety.test.ts` | Exact manifest, generation, and unknown-ID behavior |
| Create | `vitest.config.ts` | Node environment and `@` alias |
| Modify | `package.json`, `package-lock.json` | Declared Vitest range, resolved lock entry, `test:unit` |
| Modify | `components/modules/EngineeringCalcModule.tsx` | Warning and action suppression; remove false MariaDB/controlled claims |
| Modify | `backend/public/index.php` | Generated-policy create/review gate and response-only read warning |
| Modify | `backend/tests/smoke.php` | Generated include and gate-before-mutation assertions |
| Create | `backend/tests/containment-api.mjs` | Readiness-checked direct-PHP behavior and mutation-count test |
| Modify | `e2e/rail.spec.ts` | Visible containment regression |

## Detailed Tasks

### P0-T01: Establish The Unit Harness

**Owner:** Frontend platform engineer  
**Estimate:** 0.25 person-day  
**Finding link:** prerequisite only; does not close or gate a finding

- [ ] Install `vitest@^3.2.4`, add `"test:unit": "vitest run"`, create `vitest.config.ts` with Node environment and `@` resolving to repository root, and retain the exact installed version only in `package-lock.json`.
- [ ] Create temporary `lib/__tests__/vitest-harness.test.ts` with `it('resolves the project alias', async () => expect(await import('@/lib/navigation')).toBeDefined())`.
- [ ] Run `npm run test:unit -- lib/__tests__/vitest-harness.test.ts`. Expected: PASS. Harness installation/configuration failure is resolved before product RED tests begin.
- [ ] Remove the temporary harness test after `P0-T02` produces its behavior-specific RED result.
- [ ] Stage only harness files; then commit `test: add TypeScript unit test harness` if staging succeeds. Do not use command chaining that can continue after failure.

### P0-T02: Generate One Fail-Closed Policy

**Owner:** Engineering safety lead and frontend platform engineer  
**Estimate:** 0.50 person-day  
**Findings:** `V8-C01`, `V8-C02`  
**Produces:** `calculatorRelease(id)`, `isCalculatorRecordable(id)`, generated `CALCULATOR_RELEASE_POLICY` in TS and equivalent PHP array

- [ ] Add behavior test `V8-C01 manifest contains exactly 17 contained calculators` asserting ordered ID equality, all `recordable:false`, and a declared minimum sum of 57. Add `V8-C01 unknown calculator fails closed`.
- [ ] Run `npm run test:unit -- lib/__tests__/engineering-safety.test.ts`. Expected RED: the canonical manifest/generated exports are missing; Vitest itself is already green.
- [ ] Implement the exact manifest and generator contract above. TS selector signature is `calculatorRelease(id: string): CalculatorRelease`; `isCalculatorRecordable(id: string): boolean` returns true only for a generated `validated` and `recordable:true` entry. PHP exposes the same fields by ID.
- [ ] Run separately, stopping at first nonzero exit: `node scripts/generate-calculator-release.mjs --check`; policy unit test; `npm run typecheck`; `php -l backend/generated/calculator_release.php`.
- [ ] Verify changing either generated file by one byte makes `--check` fail, regenerate it, and record this test as `P0-E01` linked to `V8-C01`.

### P0-T03: Contain The Engineering UI

**Owner:** Frontend engineer; safety copy approved by engineering safety lead  
**Estimate:** 0.50 person-day  
**Findings:** `V8-C01`, `V8-C02`

- [ ] Add E2E test `V8-C01 V8-C02 contained calculator cannot create controlled evidence`: open `engineering_calc`, calculate, assert `data-testid="calculator-containment"` contains `Unvalidated advisory calculation`, Save and Send have count zero, and MariaDB/controlled-working-record claims have count zero.
- [ ] Run its focused Playwright grep. Expected RED: containment test ID is absent, controls are visible, and copy overstates persistence.
- [ ] In `EngineeringCalcModule`, compute `const release = calculatorRelease(calcId)`, render `release.message`, keep Calculate advisory-only, and render record actions only when `release.recordable`. Remove `Original logic preserved`, MariaDB-backed, and controlled-record success wording from contained state.
- [ ] Re-run the focused test. Expected: PASS and trace captured as `P0-E03` with both finding IDs.

### P0-T04: Enforce And Directly Test The PHP Gate

**Owner:** Backend engineer  
**Estimate:** 0.75 person-day  
**Findings:** `V8-C01`, `V8-C02`

- [ ] Extend `backend/tests/smoke.php` to require the generated PHP policy and verify markers `engineering-create-containment-gate` and `engineering-review-containment-gate` precede every relevant `mutate_json_file` call.
- [ ] Create `backend/tests/containment-api.mjs`. It starts `php -S 127.0.0.1:8081 -t backend/public`, polls `http://127.0.0.1:8081/api/v1/health` until HTTP 200 or a bounded timeout, calls that PHP origin explicitly with demo identity headers, tests contained create and review, compares record count before/after, and terminates the child in `finally`.
- [ ] Run static smoke, then the direct API test only if static smoke passes. Expected behavior-specific RED: generated policy is not consumed or HTTP denial/mutation invariant fails. An unstarted server is not an acceptable RED result.
- [ ] Require `backend/generated/calculator_release.php`. Create rejects contained and unknown `calc_type` before reading client result/status. Review loads the record, resolves its type through generated policy, and rejects before mutation. GET list/detail add response-only `evidence_state:'unverified'` and `safety_message`; no stored record is rewritten.
- [ ] Run generator `--check`, PHP lint, PHP smoke, and the direct API script separately with stop-on-first-failure behavior. Expected: create and review return HTTP 503 with `CALCULATOR_CONTAINED`, and count is unchanged. Record `P0-E02` and `P0-E04`.

### P0-T05: Deploy, Observe, And Sign The Gate

**Owner:** QA and operations; engineering safety and backend leads approve  
**Estimate:** 0.75 person-day  
**Findings:** `V8-C01`, `V8-C02`

- [ ] Run generator check, policy unit test, typecheck, PHP lint/smoke, readiness-checked direct API test, and focused Playwright tests as separate fail-fast steps.
- [ ] Deploy the same immutable revision of manifest, generated artifacts, PHP gate, and UI suppression to staging. Record revision/build ID, manifest SHA-256, target, timestamp, and operator. Run UI plus direct-origin probes.
- [ ] Deploy that complete revision to every user-facing environment using normal change control. An API-only or UI-only deployment is not acceptable.
- [ ] In every environment, prove advisory output remains available, record actions are absent, direct create/review returns 503, record/audit counts do not change, generated manifest digest matches, and logs contain no policy-load or bypass failures.
- [ ] Complete the approved observation window, prove rollback to an all-contained artifact, and attach deployment, monitoring, and rollback records as `P0-E05`.
- [ ] Engineering safety, backend, QA, and operations owners sign `P0-E05`. Only this signature authorizes parallel remediation work.

## Milestones And Estimate

| Milestone | Exit condition |
|---|---|
| M0.1 | One manifest generates byte-checked TS/PHP policy for exactly 17 contained IDs |
| M0.2 | UI labels advisory output and omits controlled actions/claims |
| M0.3 | Direct PHP create/review bypass returns 503 before mutation |
| M0.4 | Complete revision is deployed, probed, observed, rollback-proven, and signed |

| Workstream | Person-days |
|---|---:|
| Harness | 0.25 |
| Manifest and generated policy | 0.50 |
| UI containment | 0.50 |
| API containment and direct test | 0.75 |
| Deployment, verification, evidence | 0.75 |
| **Total** | **2.75** |

## Test And Exit Evidence

| Evidence ID / findings | Procedure | Required result |
|---|---|---|
| `P0-E01` / `V8-C01` | generator `--check`; policy unit test | One source, TS/PHP parity, 17 contained IDs, unknown fail-closed, minimum sum 57 |
| `P0-E02` / `V8-C02` | PHP lint and smoke | Generated policy included; gate precedes mutation; false MariaDB wording removed |
| `P0-E03` / `V8-C01,V8-C02` | focused Playwright test and trace | Warning visible; actions and controlled/MariaDB claims absent |
| `P0-E04` / `V8-C01,V8-C02` | `node backend/tests/containment-api.mjs` | PHP readiness; direct create/review 503; no mutation |
| `P0-E05` / `V8-C01,V8-C02` | deploy/probe/monitor/rollback record | Same revision and manifest digest everywhere; four-owner sign-off |

## Risks And Rollback

| Risk | Control |
|---|---|
| UI-only control is bypassed | Generated server rejection before mutation plus direct-origin test |
| Runtime policies drift | One manifest, deterministic generation, `--check`, deployed digest |
| Historical records disappear | GET remains readable; response annotation only |
| Partial deployment creates a safety gap | Complete-revision deployment and environment-by-environment gate |
| Phase 2 releases only one runtime | Generator makes TS/PHP artifacts together; release test checks both |

Preferred rollback is forward to an all-contained manifest and regenerated artifacts. If UI deployment fails, retain the API gate. If API deployment fails, disable the engineering module entry until the server gate is restored. Never roll back by enabling unvalidated record creation.

## Phase Exit Gate

Phase 0 exits only when signed `P0-E05` links `V8-C01` and `V8-C02` to `P0-E01` through `P0-E04`, proves one manifest generated the deployed TS/PHP artifacts, confirms all 17 and unknown IDs fail closed, shows direct bypass cannot mutate storage, preserves historical audit reads, records clean monitoring for the approved window, and proves rollback. Before that deployed exit record is accepted, no parallel phase implementation may start.
