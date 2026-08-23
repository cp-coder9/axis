import { CALC_REGISTRY as LEGACY_REGISTRY, type CalcDefinition } from '../engineering-calculations';
import { dimensionForUnit } from './units';
import { STRUCTURAL_DEFINITIONS } from './structural';
import { CIVIL_DEFINITIONS } from './civil';
import { MECHANICAL_DEFINITIONS } from './mechanical';
import { FIRE_DEFINITIONS } from './fire';
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

const LEGACY_UNIT_MAP: Readonly<Record<string, UnitCode>> = Object.freeze({
  '—': '1',
  'm': 'm',
  'mm': 'mm',
  'm²': 'm2',
  'mm²': 'mm2',
  'ha': 'ha',
  'm³': 'm3',
  'L': 'L',
  'kN': 'kN',
  'N': 'N',
  'kN/m': 'kN/m',
  'kPa': 'kPa',
  'MPa': 'MPa',
  'm/s': 'm/s',
  'L/s': 'L/s',
  'L/min': 'L/min',
  'm³/s': 'm3/s',
  'W': 'W',
  'kW': 'kW',
  'kWh': 'kWh',
  'K': 'K',
  'A': 'A',
  'V': 'V',
  'mΩ/m': 'mOhm/m',
  'min': 'min',
  '%': '%',
  'FU': 'FU',
});

function unitForLegacy(unit: string): UnitCode {
  return LEGACY_UNIT_MAP[unit] ?? '1';
}

function fieldFromLegacy(field: CalcDefinition['fields'][number]): InputField {
  const canonicalUnit = unitForLegacy(field.unit);
  return Object.freeze({
    key: field.key,
    label: field.label,
    dimension: dimensionForUnit(canonicalUnit),
    canonicalUnit,
    allowedUnits: Object.freeze([canonicalUnit]),
    defaultValue: Object.freeze({ value: field.default, unit: canonicalUnit }),
    min: Object.freeze({ value: field.min ?? -Number.MAX_VALUE, unit: canonicalUnit }),
    max: Object.freeze({ value: field.max ?? Number.MAX_VALUE, unit: canonicalUnit }),
  });
}

function referenceFromLegacy(reference: string, id: CalculatorId): StandardReferenceDto {
  const [title, clause] = reference.split(/\s+§/, 2);
  return {
    id: `${id}-legacy-reference`,
    title: title || 'Legacy advisory method',
    edition: 'unverified',
    clause: clause ?? null,
    url: null,
  };
}

function definitionFromLegacy(id: CalculatorId): CalculatorDefinition {
  const legacy = LEGACY_REGISTRY[id];
  if (!legacy) throw new Error(`Legacy calculator definition missing for ${id}.`);
  const fields = Object.freeze(legacy.fields.map(fieldFromLegacy));
  return Object.freeze({
    id,
    title: legacy.title,
    icon: legacy.icon,
    formulaVersion: `${id}/1.0.0`,
    fields,
    calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput | ValidationIssue[] {
      const numericInputs = Object.fromEntries(Object.entries(inputs).map(([key, quantity]) => [key, quantity.value]));
      const output = legacy.calculate(numericInputs);
      const nonFinite = output.results.find(({ value }) => !Number.isFinite(value));
      if (nonFinite) {
        return [{
          field: 'formula',
          code: 'formula-domain',
          message: `${legacy.title} produced a non-finite ${nonFinite.label} result.`,
        }];
      }
      return {
        results: output.results.map((result, index) => ({
          key: `result-${index + 1}`,
          label: result.label,
          quantity: { value: result.value, unit: unitForLegacy(result.unit) },
          passes: result.passes,
          criterion: result.reference || null,
        })),
        derivation: output.derivation.split('\n').filter(Boolean),
        references: output.results
          .map(({ reference }) => reference)
          .filter((reference, index, all) => Boolean(reference) && all.indexOf(reference) === index)
          .map((reference) => referenceFromLegacy(reference, id)),
        assumptions: ['Legacy V8 advisory inputs are treated as service values unless the derivation states otherwise.'],
        limitations: [...output.disclaimers, 'Contained pending independent professional method and fixture approval.'],
      };
    },
  });
}

export const CALC_REGISTRY: Readonly<Record<CalculatorId, CalculatorDefinition>> = Object.freeze(
  Object.fromEntries(CALCULATOR_IDS.map((id) => [
    id,
    STRUCTURAL_DEFINITIONS[id as keyof typeof STRUCTURAL_DEFINITIONS]
      ?? CIVIL_DEFINITIONS[id as keyof typeof CIVIL_DEFINITIONS]
      ?? MECHANICAL_DEFINITIONS[id as keyof typeof MECHANICAL_DEFINITIONS]
      ?? FIRE_DEFINITIONS[id as keyof typeof FIRE_DEFINITIONS]
      ?? definitionFromLegacy(id),
  ])) as Record<CalculatorId, CalculatorDefinition>,
);

export function calculatorDefinition(id: string): CalculatorDefinition | undefined {
  return CALC_REGISTRY[id as CalculatorId];
}
