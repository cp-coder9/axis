import { STRUCTURAL_DEFINITIONS } from './structural';
import { CIVIL_DEFINITIONS } from './civil';
import { MECHANICAL_DEFINITIONS } from './mechanical';
import { FIRE_DEFINITIONS } from './fire';
import { ELECTRICAL_DEFINITIONS } from './electrical';
import { WET_SERVICES_DEFINITIONS } from './wet-services';
import { UTILITY_DEFINITIONS } from './utilities';
import { WIND_DEFINITIONS } from './wind';
import {
  CALCULATOR_IDS,
  type CalculatorId,
  type CalculationResultDto,
  type InputField,
  type Quantity,
  type StandardReferenceDto,
  type UnitCode,
  type ValidationIssue,
} from './types';

export interface FormulaOutput {
  results: CalculationResultDto[];
  derivation: string[];
  references: StandardReferenceDto[];
  assumptions: string[];
  limitations: string[];
}

export interface CalculatorDefinition {
  readonly id: CalculatorId;
  readonly title: string;
  readonly icon: string;
  readonly formulaVersion: string;
  readonly fields: readonly InputField[];
  readonly calculate: (inputs: Readonly<Record<string, Quantity>>) => FormulaOutput | ValidationIssue[];
}

export const CALC_REGISTRY: Readonly<Record<CalculatorId, CalculatorDefinition>> = Object.freeze(
  Object.fromEntries(CALCULATOR_IDS.map((id) => [
    id,
    STRUCTURAL_DEFINITIONS[id as keyof typeof STRUCTURAL_DEFINITIONS]
      ?? CIVIL_DEFINITIONS[id as keyof typeof CIVIL_DEFINITIONS]
      ?? MECHANICAL_DEFINITIONS[id as keyof typeof MECHANICAL_DEFINITIONS]
      ?? FIRE_DEFINITIONS[id as keyof typeof FIRE_DEFINITIONS]
      ?? ELECTRICAL_DEFINITIONS[id as keyof typeof ELECTRICAL_DEFINITIONS]
      ?? WET_SERVICES_DEFINITIONS[id as keyof typeof WET_SERVICES_DEFINITIONS]
      ?? UTILITY_DEFINITIONS[id as keyof typeof UTILITY_DEFINITIONS]
      ?? WIND_DEFINITIONS[id as keyof typeof WIND_DEFINITIONS],
  ])) as Record<CalculatorId, CalculatorDefinition>,
);

export function calculatorDefinition(id: string): CalculatorDefinition | undefined {
  return CALC_REGISTRY[id as CalculatorId];
}
