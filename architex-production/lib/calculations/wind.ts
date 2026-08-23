import type { CalculatorDefinition, FormulaOutput } from './registry';
import type { InputField, Quantity } from './types';
const field = (key: string, label: string, unit: 'm/s' | 'm' | 'Pa' | '1', dimension: InputField['dimension'], value: number, min = 0, max = Number.MAX_VALUE): InputField => Object.freeze({ key, label, dimension, canonicalUnit: unit, allowedUnits: Object.freeze([unit]), defaultValue: Object.freeze({ value, unit }), min: Object.freeze({ value: min, unit }), max: Object.freeze({ value: max, unit }) });
const wind: CalculatorDefinition = Object.freeze({
  id: 'wind-load', title: 'Design Wind Pressure', icon: 'eng_wind', formulaVersion: 'wind-load/1.0.0',
  fields: Object.freeze([field('reference_speed_m_s', 'Reference wind speed', 'm/s', 'velocity', 28), field('exposure_factor', 'Declared exposure factor', '1', 'dimensionless', 1), field('pressure_coefficient', 'Declared pressure coefficient', '1', 'dimensionless', 1.2), field('air_density_kg_m3', 'Air density (kg/m3)', '1', 'dimensionless', 1.22)]),
  calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput {
    const dynamic = 0.5 * inputs.air_density_kg_m3.value * inputs.reference_speed_m_s.value ** 2; const pressure = dynamic * inputs.exposure_factor.value * inputs.pressure_coefficient.value;
    return { results: [{ key: 'dynamic-pressure', label: 'Dynamic pressure', quantity: { value: dynamic, unit: 'Pa' }, passes: null, criterion: '0.5 rho v^2' }, { key: 'design-pressure', label: 'Declared-factor design pressure', quantity: { value: pressure, unit: 'Pa' }, passes: null, criterion: 'q x exposure x pressure coefficient' }], derivation: ['q = 0.5 rho v^2', 'Design pressure = q x explicitly declared factors.'], references: [{ id: 'sans-10160-3', title: 'SANS 10160-3', edition: 'unverified-advisory', clause: null, url: null }], assumptions: ['Exposure and pressure coefficients are independent professional inputs.'], limitations: ['No undocumented height/logarithmic factor is applied. Local coefficients, internal pressure, dynamic response, and zoning are omitted.', 'Contained pending Civil/structural PrEng approval.'] };
  },
});
export const WIND_DEFINITIONS = Object.freeze({ 'wind-load': wind } satisfies Partial<Record<CalculatorDefinition['id'], CalculatorDefinition>>);
