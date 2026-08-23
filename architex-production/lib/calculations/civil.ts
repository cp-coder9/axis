import type { CalculatorDefinition, FormulaOutput } from './registry';
import type { InputField, Quantity, ValidationIssue } from './types';

const field = (key: string, label: string, value: number, min: number, max: number, unit: '1' | 'ha'): InputField => Object.freeze({
  key, label, dimension: unit === 'ha' ? 'area' : 'dimensionless', canonicalUnit: unit,
  allowedUnits: Object.freeze([unit]), defaultValue: Object.freeze({ value, unit }),
  min: Object.freeze({ value: min, unit }), max: Object.freeze({ value: max, unit }),
});

const stormwater: CalculatorDefinition = Object.freeze({
  id: 'stormwater-rational', title: 'Rational Method Stormwater Flow', icon: 'eng_storm', formulaVersion: 'stormwater-rational/1.0.0',
  fields: Object.freeze([
    field('C', 'Runoff coefficient', 0.7, 0, 1, '1'),
    field('I_mm_hr', 'Rainfall intensity (mm/h)', 90, 0, 5000, '1'),
    field('A_ha', 'Catchment area', 1.2, 0, 1_000_000, 'ha'),
  ]),
  calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput | ValidationIssue[] {
    const coefficient = inputs.C.value;
    const intensityMmHr = inputs.I_mm_hr.value;
    const areaHa = inputs.A_ha.value;
    const flowM3s = 0.00278 * coefficient * intensityMmHr * areaHa;
    return {
      results: [{ key: 'peak-flow', label: 'Peak stormwater flow', quantity: { value: flowM3s, unit: 'm3/s' }, passes: null, criterion: 'Q = 0.00278 C I A for I in mm/h and A in ha' }],
      derivation: ['Q = 0.00278 C I_mm/h A_ha', `Q = 0.00278 x ${coefficient} x ${intensityMmHr} x ${areaHa} = ${flowM3s} m3/s`],
      references: [{ id: 'rational-method', title: 'Rational method', edition: 'unverified-advisory', clause: null, url: null }],
      assumptions: ['Rainfall intensity is uniform over the catchment and duration equals time of concentration.'],
      limitations: ['Time of concentration, return period, storage, routing, inlet capacity, and municipal criteria are omitted.', 'Contained pending independent civil/stormwater professional approval.'],
    };
  },
});

export const CIVIL_DEFINITIONS = Object.freeze({
  'stormwater-rational': stormwater,
} satisfies Partial<Record<CalculatorDefinition['id'], CalculatorDefinition>>);
