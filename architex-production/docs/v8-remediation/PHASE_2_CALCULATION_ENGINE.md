# Phase 2 Calculation Engine And Persisted Contract Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans task by task. A calculator remains contained until its own signed manifest gate passes.

**Goal:** Replace unsafe V8 calculator behavior with unit-safe, validated, traceable contracts for all 17 calculators and freeze one persisted DTO consumed unchanged by Phases 3 and 4.

**Architecture:** Pure calculation definitions consume explicit quantities and return structured results. The registry is the sole formula/metadata mapping. Phase 0's `config/calculator-release-manifest.json` remains the sole editable release state and professional-evidence manifest; its generator emits TS and PHP policies. Immutable fixture files carry cases, while release entries carry owner, minimum count, formula version, and approval evidence IDs.

**Version basis:** `package.json` declares Next.js `^15.4.9`, React `^19.2.1`, Playwright `^1.62.1`, and exact TypeScript `5.9.3`; `package-lock.json` is installation authority. Vitest's declared range and exact lock resolution come from accepted Phase 0. Node.js 20+ and PHP 8.1+ are runtime prerequisites, not claims about an arbitrary workstation's active executable.

## Entry Gate And Constraints

- Signed, deployed Phase 0 evidence `P0-E05` is mandatory.
- Calculation definitions remain pure and independent from React, PHP, and persistence.
- Inputs have explicit units, dimensions, finite/range checks, and integer/option checks where applicable.
- Unknown IDs and invalid or dimensionally incompatible input return typed issues and no numeric output.
- Results include value/unit, pass state, criterion, formula version, derivation, references, assumptions, and limitations.
- Role access, Design/Comply/Build stage access, 19 engineering icon keys, 17 tab arguments/groups, and calculator types remain exact parity constraints.
- MariaDB and workflow implementation are out of scope; Phases 3 and 4 consume the frozen DTO without flattening or renaming it.
- No calculator becomes `validated` until its manifest-derived fixture minimum, professional evidence, parity, and containment-generation checks pass.

## Verification Command Policy

All multi-command gates use PowerShell 5.1 fail-fast execution or a checked-in named npm script. Double-ampersand shell chaining is prohibited:

```powershell
$ErrorActionPreference = 'Stop'
function Invoke-Checked([scriptblock]$Command) {
  & $Command
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

## Stable Finding Coverage

| Finding / V8 requirement | Current state | Stable task IDs | Stable evidence ID |
|---|---|---|---|
| `V8-C01`: concrete dimensional defect and stormwater 100x defect | Unsafe formulas can emit non-finite/wrong output | `P2-T01` to `P2-T04`, `P2-T09` | `P2-E01`, `P2-E02`, `P2-E03`, `P2-E08` |
| `V8-H01`: calculator switch retains prior state | React adapter initializes once | `P2-T08`, `P2-T09`; final workflow closure remains Phase 4 | `P2-E07`, `P2-E08` |
| `V8-H02`: edited input retains stale output/record identity | No typed invalidation boundary | `P2-T02`, `P2-T08`, `P2-T09`; final workflow closure remains Phase 4 | `P2-E01`, `P2-E07`, `P2-E08` |
| V8 Data/type layer | Unitless numeric maps and flattened persistence shape | `P2-T01`, `P2-T02` | `P2-E01` |
| V8 17 calculators and professional validation | Implementations exist without signed goldens | `P2-T03` to `P2-T07`, `P2-T09` | `P2-E02` to `P2-E06`, `P2-E08` |
| V8 role/stage/icon/tab/type parity | Present but duplicated | `P2-T08` | `P2-E07` |

Finding IDs appear in behavior test names/metadata, evidence entries, manifest approval IDs where applicable, and the exit record. Phase 2 contributes to `V8-H01/H02`; Phase 4 owns final workflow closure.

`V8-M02` maps to Tasks 3-7 method/reference review, professional fixture approval, contained/deferred outcomes, evidence `P2-E02` through `P2-E06`, and the Phase 2 exit manifest. No heuristic calculator is released without that program ID's disposition.

## Frozen Persisted DTO For Phases 3 And 4

This is the only persisted calculation payload. No flattened result map, display string, unitless input map, or alternate PHP DTO is permitted.

```ts
export type EngineeringCalculationSchemaVersion = 'engineering-calculation/v1';

export interface QuantityDto {
  value: number;
  unit: UnitCode;
}

export interface CalculationResultDto {
  key: string;
  label: string;
  quantity: QuantityDto;
  passes: boolean | null;
  criterion: string | null;
}

export interface StandardReferenceDto {
  id: string;
  title: string;
  edition: string;
  clause: string | null;
  url: string | null;
}

export interface EngineeringCalculationPayloadV1 {
  schemaVersion: 'engineering-calculation/v1';
  calculatorId: CalculatorId;
  formulaVersion: string;
  inputs: Record<string, QuantityDto>;
  results: CalculationResultDto[];
  derivation: string[];
  references: StandardReferenceDto[];
  assumptions: string[];
  limitations: string[];
}
```

`inputs` contains the validated normalized quantities actually used by the formula, never raw blank strings or display-formatted values. Every number must be finite. Array order is deterministic and meaningful. Derivation is persisted only as `string[]`; references remain structured and are not folded into derivation. Phase 3 wraps this payload with record identity, tenant/project, status, audit, and lock version. Phase 4 keeps working-copy/dirty/link state outside the payload. Both phases import/generate schemas from this exact envelope and round-trip it losslessly.

Contract changes after `P2-E01` require a versioned `engineering-calculation/v2` decision record; silently adding optional alternatives to V1 is prohibited.

## Runtime Calculation Interfaces

```ts
export type Dimension =
  | 'dimensionless' | 'length' | 'area' | 'volume' | 'force'
  | 'line-load' | 'pressure' | 'velocity' | 'flow' | 'power'
  | 'energy' | 'temperature-difference' | 'current' | 'voltage'
  | 'resistance-per-length' | 'time';

export interface Quantity<U extends UnitCode = UnitCode> { value: number; unit: U; }
export interface InputField {
  key: string;
  label: string;
  dimension: Dimension;
  canonicalUnit: UnitCode;
  allowedUnits: readonly UnitCode[];
  defaultValue: Quantity;
  min: Quantity;
  max: Quantity;
  integer?: boolean;
}
export interface ValidationIssue {
  field: string;
  code: 'required' | 'not-finite' | 'out-of-range' | 'wrong-unit'
    | 'wrong-dimension' | 'not-integer' | 'unsupported-option' | 'formula-domain';
  message: string;
}
export type CalculationRun =
  | { ok: true; payload: EngineeringCalculationPayloadV1 }
  | { ok: false; issues: ValidationIssue[] };
export function runCalculation(id: string, input: Record<string, Quantity>): CalculationRun;
```

The unit catalogue includes every used unit and groups conversions by dimension: `m`, `mm`, `m2`, `mm2`, `ha`, `m3`, `L`, `kN`, `N`, `kN/m`, `N/mm`, `Pa`, `kPa`, `MPa`, `m/s`, `L/s`, `L/min`, `m3/s`, `W`, `kW`, `kWh`, `K`, `A`, `V`, `mOhm/m`, `min`, `%`, `FU`, and `1`. ASCII codes are persisted; UI labels may render typographic symbols.

## Manifest-Derived Golden Minimum

| Calculator ID | Owner | Minimum |
|---|---|---:|
| `steel-beam` | Structural PrEng | 3 |
| `concrete-beam` | Structural PrEng | 4 |
| `timber-beam` | Structural PrEng with timber competence | 3 |
| `geo-bearing` | Geotechnical PrEng | 3 |
| `wind-load` | Civil/structural PrEng | 3 |
| `stormwater-rational` | Civil/stormwater PrEng | 4 |
| `duct-sizing` | Mechanical PrEng | 3 |
| `heat-gain` | Mechanical PrEng | 3 |
| `travel-distance` | Competent fire engineer | 3 |
| `fire-resistance` | Competent fire engineer | 3 |
| `fire-water` | Fire PrEng | 3 |
| `cable-sizing` | Electrical PrEng | 4 |
| `max-demand` | Electrical PrEng | 3 |
| `cold-water` | Wet-services PrEng | 3 |
| `drainage-fu` | Wet-services PrEng | 4 |
| `geyser-sizing` | Wet-services/mechanical PrEng | 3 |
| `unit-converter` | Engineering QA lead | 5 |
| **Manifest-derived minimum** | | **57** |

Tests compute `sum(minimumGoldenCases)` from the release manifest and require exactly 57 with current schema. They also require each fixture file to meet its entry's minimum. No independent lower total or duplicate minimum table in implementation code is allowed.

## Exact File Map

| Action | Path | Patch responsibility |
|---|---|---|
| Create | `lib/calculations/types.ts` | Runtime contracts and exact persisted V1 DTO |
| Create | `lib/calculations/units.ts` | Explicit unit catalogue, dimensions, conversion, validation |
| Create | `lib/calculations/core.ts` | Validate, normalize, calculate, and assemble V1 payload |
| Create | `lib/calculations/registry.ts` | Sole 17-definition registry and tab/icon/type/discipline metadata |
| Create | `lib/calculations/{structural,civil,mechanical,fire,electrical,wet-services,utilities}.ts` | Discipline formulas only |
| Modify | `lib/engineering-calculations.ts` | Compatibility re-export adapter; no formulas or duplicate ID map remain |
| Create | `lib/calculations/__tests__/*.test.ts` | Unit, DTO round-trip, formulas, boundaries, fixtures, parity |
| Create | `test/fixtures/calculations/<calculator-id>.json` | Immutable signed cases; one file per ID |
| Modify | `config/calculator-release-manifest.json` | Formula version, minimum, owner, approval IDs, release state |
| Regenerate | `lib/generated/calculator-release.ts`, `backend/generated/calculator_release.php` | Generated together from the one manifest |
| Modify | `components/modules/EngineeringCalcModule.tsx` | Typed quantities/issues/payload rendering and calculator isolation |
| Modify | `lib/types.ts` | Re-export/use exact V1 DTO; remove unitless persisted shape |
| Modify | `scripts/validate-foundation.mjs`, `backend/tests/smoke.php` | Exact parity and generated-policy assertions |
| Create | `e2e/engineering-calculations.spec.ts` | Isolation, validation, provenance, and containment/release behavior |

## Detailed Tasks

### P2-T01: Freeze Units, Validation, And Persisted V1

**Owner:** Calculation platform engineer and engineering QA lead  
**Estimate:** 2.50 person-days  
**Findings:** `V8-C01`, `V8-H02`

- [ ] After signed Phase 0 exit `P0-E05`, add behavior tests `V8-C01 line load conversion preserves dimension`, `V8-C01 pressure cannot satisfy length`, non-finite rejection, and `V8-H02 persisted V1 round-trips quantities and provenance without flattening`.
- [ ] Add compile-time fixtures constructing the exact DTO and `expectTypeOf<EngineeringCalculationPayloadV1>()`; add JSON round-trip equality for all fields and array order.
- [ ] Run units/contract tests. Expected RED: quantity/unit validation and exact V1 DTO do not exist; harness is already working.
- [ ] Implement `convert(quantity,targetUnit): Quantity`, `validateQuantity(quantity,field): ValidationIssue | null`, and `serializeCalculationPayload(payload): EngineeringCalculationPayloadV1` as identity validation, not display formatting.
- [ ] Run unit tests and typecheck separately. Freeze the schema and publish `P2-E01` for Phase 3/4 sign-off.

### P2-T02: Build Registry, Orchestrator, Fixtures, And Manifest Gate

**Owner:** Calculation platform engineer  
**Estimate:** 2.00 person-days  
**Findings:** `V8-C01`, `V8-H01`, `V8-H02`

- [ ] Add tests: unknown ID returns `unsupported-option`; missing/undeclared/wrong-unit fields prevent formula invocation; defaults return fresh quantities; successful output is exact V1; registry has 17 unique IDs; manifest IDs/order equal registry; fixture minima sum to 57.
- [ ] Run core tests. Expected RED: orchestrator/registry are absent and manifest does not yet prove fixture files.
- [ ] Implement `runCalculation`, `defaultInputs(id): Record<string,Quantity>`, `calculatorIdForTab(tabKey): CalculatorId`, and immutable definition lookup. Reject undeclared fields and normalize only after all fields pass.
- [ ] Extend the existing Phase 0 generator validation to require fixture counts/evidence when state is `validated`; do not add another release or signature manifest.
- [ ] Run core, manifest generation `--check`, and typecheck separately. Include result in `P2-E01`.

### P2-T03: Remediate Structural And Geotechnical Calculators

**Owner:** Structural and geotechnical PrEng; calculation engineer implements  
**Estimate:** 3.50 person-days  
**Finding:** `V8-C01`

- [ ] Add signed fixtures and named RED test `V8-C01 concrete K is dimensionless and finite`. Steel uses `M=wL^2/8`, `Md=fyZ/10^6`, and `delta=5wL^4/(384EI)` in consistent N/mm terms. Concrete uses `K=M_Nmm/(b_mm*d_mm^2*fcu_Nmm2)`. Timber uses `S=b*h^2/6`, `fb=M/S`. Bearing explicitly labels gross/service `q=P/(B*L)+gamma*D`.
- [ ] Expected RED: current concrete differs from signed `K` or emits non-finite lever arm.
- [ ] Patch `structural.ts`: add explicit `secondMoment_mm4`; reject `K<0`, `K>0.225`, and negative square-root domain with `formula-domain`; declare omitted shear, stability, detailing, settlement, and load combinations in limitations.
- [ ] Require 3 steel, 4 concrete including over-reinforced rejection, 3 timber, and 3 bearing cases. Run structural tests and record professional evidence IDs in the one release manifest. Publish `P2-E02`.

### P2-T04: Remediate Civil And Mechanical Calculators

**Owner:** Civil/stormwater and mechanical PrEng  
**Estimate:** 3.00 person-days  
**Finding:** `V8-C01`

- [ ] Add RED test `V8-C01 hectare coefficient returns 0.210168 m3/s`: `C=0.7`, `I=90 mm/hr`, `A=1.2 ha`, tolerance `1e-6`, formula `Q=0.00278*C*I*A`. Add coefficient `[0,1]`, positive intensity/area, and zero-area behavior.
- [ ] Expected RED: current result is near `21.0168 m3/s`.
- [ ] Patch `civil.ts` with coefficient/unit derivation and approved explicit wind method inputs; remove undocumented logarithmic factor unless signed. Patch `mechanical.ts`: duct rejects zero velocity and uses `A=Q/v`; heat uses explicit internal load and labels preliminary scope.
- [ ] Require 3 wind, 4 stormwater, 3 duct, and 3 heat cases. Run civil/mechanical tests, update evidence IDs in the one manifest, regenerate TS/PHP, and publish `P2-E03`.

### P2-T05: Remediate Fire Calculators

**Owner:** Competent fire engineer and Fire PrEng  
**Estimate:** 2.50 person-days  
**Finding link:** professional completion supporting `V8-C01` containment release

- [ ] Add behavior RED tests: travel accepts and independently evaluates `deadEndDistance` and `overallTravelDistance`; FRR accepts a discrete approved classification; fire-water uses every declared area/storey/occupancy input or omits it.
- [ ] Expected RED: overall travel is ignored and existing classification inputs are unused/heuristic.
- [ ] Patch `fire.ts` with fixture-keyed approved lookup rows, unsupported-classification rejection, and separate travel pass/fail results. Limitations name egress width, occupant load, exit capacity, hydrant spacing, pressure, duration, and municipal supply.
- [ ] Require 3 cases for each fire calculator; run tests, record professional IDs in the one manifest, regenerate, and publish `P2-E04`.

### P2-T06: Remediate Electrical Calculators

**Owner:** Electrical PrEng  
**Estimate:** 2.00 person-days  
**Finding link:** professional completion supporting `V8-C01` containment release

- [ ] Add RED fixtures for single phase `dV=2*I*L*(R*cosPhi+X*sinPhi)` and three phase `dV=sqrt(3)*I*L*(R*cosPhi+X*sinPhi)`. Maximum demand includes explicit voltage, phase, load categories, and signed demand factors.
- [ ] Expected RED: three-phase and non-230 V cases mismatch current hard-coded behavior.
- [ ] Patch `electrical.ts` to reject power factor outside `[0,1]`, negative length/current, unsupported phase, and non-positive voltage; return V and percent as separate structured results. Limitations name ampacity, derating, protection, fault level, and conductor selection.
- [ ] Require 4 cable and 3 demand cases; run tests, update the one manifest, regenerate, and publish `P2-E05`.

### P2-T07: Remediate Wet Services And Unit Converter

**Owner:** Wet-services PrEng and engineering QA lead  
**Estimate:** 2.50 person-days  
**Finding link:** professional completion supporting `V8-C01` containment release

- [ ] Add RED fixtures for L/min to m3/s and velocity diameter; drainage boundaries 10/11, 30/31, 60/61 FU; hot water `E=rho*V*c*dT/3.6e6`, solar fraction `[0,1]`, tank increment; five current conversion keys plus inverse/round-trip tolerance.
- [ ] Expected RED: typed quantities, lookup boundaries, and explicit conversion keys are absent.
- [ ] Patch wet/utilities modules with keys `ft-to-m`, `ftlb-to-Nm`, `kcal-to-kJ`, `psi-to-kPa`, `ft2-to-m2`; reject fractional fixture/occupant counts. Limitations name pressure loss, head, supply pressure, venting, gradient, diversity, and compliance.
- [ ] Require 3 cold-water, 4 drainage, 3 geyser, and 5 converter cases; run tests, update one manifest, regenerate, and publish `P2-E06`.

### P2-T08: Enforce Metadata Parity And Adapt The UI

**Owner:** Platform/React engineer and QA  
**Estimate:** 3.50 person-days  
**Findings:** `V8-H01`, `V8-H02`

- [ ] Add exact tuple test comparing 17 `(tab.key,tab.arg,tab.icon,tab.group)` values with registry `(tabKey,id,icon,discipline)`. Assert `engineering_calc` roles exactly `bep`, `engineer`, `energy_professional`, `fire_engineer`, `cpm`, `contractor`, `site_manager`, `platform_admin`; stages exactly Design/Comply/Build; all 19 engineering icon keys resolve; calculator type and backend generated IDs match.
- [ ] Add E2E `V8-H01 switching calculators clears prior input output and record identity` and `V8-H02 changed input invalidates output before persistence`. Expected RED: duplicate tab map and component-wide state leak remain.
- [ ] Remove `getCalcIdForTabKey`; use registry lookup. Key/reset all input, payload, issue, and record-display state by calculator ID. Blank remains required, never zero. Any input edit clears payload and record eligibility.
- [ ] Render structured results, string-array derivation, assumptions, limitations, references, and formula version. Controls require generated release state; never infer release from client payload.
- [ ] Run parity, foundation validation, PHP smoke, typecheck, and focused E2E separately. Publish `P2-E07`. This preserves, rather than broadens, role/stage/icon/type/tab parity.

### P2-T09: Verify 57 Cases And Release Per Calculator

**Owner:** Engineering safety lead, discipline owners, frontend/backend leads, QA  
**Estimate:** 2.50 person-days  
**Findings:** `V8-C01`, `V8-H01`, `V8-H02`

- [ ] Add release-gate tests deriving expected total from `minimumGoldenCases` and asserting current sum is exactly 57; fixture count per ID meets its manifest minimum; every fixture formula version equals payload and manifest; every validated entry has approval IDs.
- [ ] Expected RED before signatures: entries remain contained or evidence/count/version requirements fail. This is behavior-specific and must not be made green by weakening minima.
- [ ] For each signed calculator only, set formula version, approval IDs, and `validated/recordable:true` in the one release manifest; regenerate both artifacts. Unsigned calculators remain contained.
- [ ] Run all calculation tests, generator `--check`, typecheck, foundation parity, PHP smoke, engineering E2E, production build, app/rail/roles compatibility as separate fail-fast commands.
- [ ] Verify exactly 57 or more fixture cases are present, with the required manifest-derived floor per ID. Record the computed count and full bundle as `P2-E08`.

## Estimate

| Workstream | Person-days |
|---|---:|
| Unit/DTO freeze and core registry | 4.50 |
| Structural/geotechnical | 3.50 |
| Civil/mechanical | 3.00 |
| Fire | 2.50 |
| Electrical | 2.00 |
| Wet services/utilities | 2.50 |
| Parity and UI adapter | 3.50 |
| Release evidence and professional recheck | 2.50 |
| **Total** | **24.00** |

The total remains within the approved 15-25 person-day range. External reviewer scheduling latency is tracked separately from effort.

## Dependencies And Handoffs

- Phase 1 may run in parallel only after Phase 0 exit and with separate E2E files.
- `P2-E01` freezes V1 before Phase 3 schema/repository implementation begins.
- Phase 3 persists `EngineeringCalculationPayloadV1` unchanged and generates/validates PHP schema parity; it may wrap but not flatten it.
- Phase 4 uses V1 as the calculation working payload and keeps dirty/status/link UI state outside it; it consumes the Phase 1 navigation contract for guarded transitions.
- Phase 8 audits formula evidence, standards references, signatures, deployed manifest digest, and documentation counts.

## Test And Exit Evidence

| Evidence ID / findings | Required result |
|---|---|
| `P2-E01` / `V8-C01,V8-H02` | Unit/dimension tests and exact V1 JSON/TS round-trip pass; Phase 3/4 leads sign schema freeze |
| `P2-E02` / `V8-C01` | Structural/geotechnical signed values, boundaries, finite/domain guards pass |
| `P2-E03` / `V8-C01` | Stormwater equals `0.210168 m3/s`; civil/mechanical signed cases pass |
| `P2-E04` / professional release | Fire travel, lookup, unsupported classification, and limitations pass |
| `P2-E05` / professional release | Phase-aware electrical and non-230 V cases pass |
| `P2-E06` / professional release | Wet-service boundaries and five conversions pass |
| `P2-E07` / `V8-H01,V8-H02` | Exact role/stage/icon/tab/type parity and UI isolation/invalidation pass |
| `P2-E08` / `V8-C01,V8-H01,V8-H02` | Manifest-derived minimum is 57; TS/PHP generated policy parity; full build and compatibility pass |

## Risks And Rollback

| Risk | Control |
|---|---|
| Standard/method is misinterpreted | Named competent professional owns formula and fixture evidence |
| Units silently corrupt output | Dimension groups, finite checks, exact DTO, signed fixtures |
| Persistence consumer flattens payload | V1 freeze, round-trip fixtures, Phase 3/4 sign-off |
| Release policies drift | One manifest and deterministic TS/PHP generation |
| Metadata changes while fixing formulas | Exact role/stage/icon/type/tab tuple tests |
| Review is delayed | Release calculator by calculator; unsigned ID stays contained |

Rollback one calculator by changing only its release entry to `contained`, regenerating TS/PHP together, and deploying both. Never overwrite a signed fixture to fit code; introduce a new formula version and obtain new evidence. Existing formula versions remain identifiable in persisted V1 payloads.

## Phase Exit Gate

Phase 2 exits only when `P2-E01` through `P2-E08` link applicable work to `V8-C01`, `V8-H01`, and `V8-H02`; Phase 3 and 4 leads sign the exact `engineering-calculation/v1` freeze; the manifest-derived minimum is proven as 57; every ID is either signed, versioned, generated as `validated` in both TS/PHP or identically contained; concrete and stormwater critical cases pass; role/stage/icon/calculator-type/tab parity is exact; and the full fail-fast evidence suite passes. Phase 2 does not claim final closure of `V8-H01/H02`; Phase 4 must close the persisted workflow behaviors.
