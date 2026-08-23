import {
  CALCULATOR_RELEASE_POLICY,
  type CalculatorRelease,
} from '@/lib/generated/calculator-release';

const policyById = new Map<string, CalculatorRelease>(
  CALCULATOR_RELEASE_POLICY.map((entry) => [entry.id, entry]),
);

export function calculatorRelease(id: string): CalculatorRelease {
  return policyById.get(id) ?? {
    id,
    releaseState: 'contained',
    recordable: false,
    message: 'Unvalidated advisory calculation — this calculator is unknown and controlled record actions are unavailable.',
    formulaVersion: null,
    professionalOwner: 'Unassigned',
    minimumGoldenCases: 0,
    approvalEvidenceIds: [],
  };
}

export function isCalculatorRecordable(id: string): boolean {
  const release = calculatorRelease(id);
  return release.releaseState === 'validated' && release.recordable === true;
}
