import type { CalculatorDefinition, FormulaOutput } from './registry';
import type { Dimension, InputField, Quantity, UnitCode, ValidationIssue } from './types';

const field = (key: string, label: string, unit: UnitCode, dimension: Dimension, value: number, min = 0, max = Number.MAX_VALUE): InputField => Object.freeze({
  key, label, dimension, canonicalUnit: unit, allowedUnits: Object.freeze([unit]),
  defaultValue: Object.freeze({ value, unit }), min: Object.freeze({ value: min, unit }), max: Object.freeze({ value: max, unit }),
});
const fail = (fieldName: string, message: string): ValidationIssue[] => [{ field: fieldName, code: 'formula-domain', message }];
const ref = (id: string, title: string) => [{ id, title, edition: 'unverified-advisory', clause: null, url: null }];

const duct: CalculatorDefinition = Object.freeze({
  id: 'duct-sizing', title: 'Duct Sizing by Velocity', icon: 'eng_duct', formulaVersion: 'duct-sizing/1.0.0',
  fields: Object.freeze([
    field('flow_m3_s', 'Airflow', 'm3/s', 'flow', 0.8), field('velocity_m_s', 'Design velocity', 'm/s', 'velocity', 6),
  ]),
  calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput | ValidationIssue[] {
    const flow = inputs.flow_m3_s.value; const velocity = inputs.velocity_m_s.value;
    if (velocity <= 0) return fail('velocity_m_s', 'Design velocity must be greater than zero.');
    if (flow < 0) return fail('flow_m3_s', 'Airflow cannot be negative.');
    const area = flow / velocity; const diameterMm = Math.sqrt(4 * area / Math.PI) * 1000;
    return { results: [
      { key: 'area', label: 'Required duct area', quantity: { value: area, unit: 'm2' }, passes: null, criterion: 'A = Q/v' },
      { key: 'diameter', label: 'Equivalent circular diameter', quantity: { value: diameterMm, unit: 'mm' }, passes: null, criterion: 'D = sqrt(4A/pi)' },
    ], derivation: ['A = Q/v', 'D = sqrt(4A/pi)'], references: ref('ashrae-duct-velocity', 'ASHRAE / SANS 10400-O'),
    assumptions: ['Circular-equivalent duct section.'], limitations: ['Pressure drop, fitting losses, fan selection, acoustic performance, and fire/smoke requirements are omitted.', 'Contained pending independent mechanical professional approval.'] };
  },
});

const heat: CalculatorDefinition = Object.freeze({
  id: 'heat-gain', title: 'Sensible Heating/Cooling Load', icon: 'eng_heat', formulaVersion: 'heat-gain/1.0.0',
  fields: Object.freeze([
    field('floor_m2', 'Floor area', 'm2', 'area', 120), field('u_factor_W_m2K', 'Glazing U-value (W/m2K)', '1', 'dimensionless', 2.8),
    field('glass_m2', 'Glazing area', 'm2', 'area', 18), field('dT', 'Design temperature difference', 'K', 'temperature-difference', 12),
    field('solar_factor', 'Solar heat gain coefficient', '1', 'dimensionless', 0.45, 0, 1), field('solar_w_m2', 'Peak solar irradiance (W/m2)', '1', 'dimensionless', 600),
    field('internal_load_W', 'Declared internal sensible load', 'W', 'power', 1200),
  ]),
  calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput | ValidationIssue[] {
    const conduction = inputs.u_factor_W_m2K.value * inputs.glass_m2.value * inputs.dT.value;
    const solar = inputs.solar_factor.value * inputs.glass_m2.value * inputs.solar_w_m2.value;
    const internal = inputs.internal_load_W.value; const total = conduction + solar + internal;
    return { results: [
      { key: 'conduction-gain', label: 'Conduction gain', quantity: { value: conduction, unit: 'W' }, passes: null, criterion: 'U A deltaT' },
      { key: 'solar-gain', label: 'Solar gain', quantity: { value: solar, unit: 'W' }, passes: null, criterion: 'SHGC A I' },
      { key: 'internal-gain', label: 'Declared internal gain', quantity: { value: internal, unit: 'W' }, passes: null, criterion: 'Explicit input' },
      { key: 'total-load', label: 'Preliminary total sensible load', quantity: { value: total / 1000, unit: 'kW' }, passes: null, criterion: 'Sum of declared components' },
    ], derivation: ['Conduction = U A deltaT', 'Solar = SHGC A I', 'Total = conduction + solar + declared internal load'], references: ref('sans-10400-xa', 'SANS 10400-XA / ASHRAE'),
    assumptions: ['Steady-state sensible gain estimate.'], limitations: ['Ventilation, latent load, thermal mass, schedules, orientation, shading, and equipment selection are omitted.', 'Preliminary scope only; contained pending independent mechanical professional approval.'] };
  },
});

export const MECHANICAL_DEFINITIONS = Object.freeze({ 'duct-sizing': duct, 'heat-gain': heat } satisfies Partial<Record<CalculatorDefinition['id'], CalculatorDefinition>>);
