import type { CalculatorDefinition, FormulaOutput } from './registry';
import type { Dimension, InputField, Quantity, UnitCode, ValidationIssue } from './types';

const field = (key: string, label: string, unit: UnitCode, dimension: Dimension, value: number, min = 0, max = Number.MAX_VALUE, integer = false): InputField => Object.freeze({ key, label, dimension, canonicalUnit: unit, allowedUnits: Object.freeze([unit]), defaultValue: Object.freeze({ value, unit }), min: Object.freeze({ value: min, unit }), max: Object.freeze({ value: max, unit }), integer });
const issue = (fieldName: string, message: string): ValidationIssue[] => [{ field: fieldName, code: 'formula-domain', message }];
const refs = (id: string) => [{ id, title: 'SANS 10142-1', edition: 'unverified-advisory', clause: null, url: null }];

const cable: CalculatorDefinition = Object.freeze({
  id: 'cable-sizing', title: 'Cable Voltage Drop', icon: 'eng_cable', formulaVersion: 'cable-sizing/1.0.0',
  fields: Object.freeze([
    field('phase', 'System phase', '1', 'dimensionless', 1, 1, 3, true), field('current_A', 'Design current', 'A', 'current', 32),
    field('length_m', 'Cable length', 'm', 'length', 25), field('voltage_V', 'System voltage', 'V', 'voltage', 230),
    field('resistance_mOhm_m', 'Resistance', 'mOhm/m', 'resistance-per-length', 7.4), field('reactance_mOhm_m', 'Reactance', 'mOhm/m', 'resistance-per-length', 0),
    field('power_factor', 'Power factor', '1', 'dimensionless', 0.95, 0, 1),
  ]),
  calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput | ValidationIssue[] {
    const phase = inputs.phase.value; const current = inputs.current_A.value; const length = inputs.length_m.value; const voltage = inputs.voltage_V.value;
    if (phase !== 1 && phase !== 3) return issue('phase', 'Only single- and three-phase systems are supported.');
    if (voltage <= 0) return issue('voltage_V', 'System voltage must be greater than zero.');
    const cosPhi = inputs.power_factor.value; const sinPhi = Math.sqrt(1 - cosPhi ** 2);
    const impedanceTerm = (inputs.resistance_mOhm_m.value * cosPhi + inputs.reactance_mOhm_m.value * sinPhi) / 1000;
    const multiplier = phase === 1 ? 2 : Math.sqrt(3);
    const drop = multiplier * current * length * impedanceTerm; const percent = drop / voltage * 100;
    return { results: [
      { key: 'voltage-drop', label: 'Voltage drop', quantity: { value: drop, unit: 'V' }, passes: null, criterion: phase === 1 ? '2 I L (R cosPhi + X sinPhi)' : 'sqrt(3) I L (R cosPhi + X sinPhi)' },
      { key: 'voltage-drop-percent', label: 'Voltage drop percentage', quantity: { value: percent, unit: '%' }, passes: percent <= 5, criterion: '<= 5% advisory limit' },
    ], derivation: [phase === 1 ? 'dV = 2 I L (R cosPhi + X sinPhi)' : 'dV = sqrt(3) I L (R cosPhi + X sinPhi)'], references: refs('sans-10142-1-voltage-drop'), assumptions: ['Balanced conductor impedance and declared power factor.'], limitations: ['Ampacity, derating, protection, fault level, conductor selection, and installation method are omitted.', 'Contained pending Electrical PrEng approval.'] };
  },
});

const demand: CalculatorDefinition = Object.freeze({
  id: 'max-demand', title: 'Maximum Demand & DB Sizing', icon: 'eng_db', formulaVersion: 'max-demand/1.0.0',
  fields: Object.freeze([
    field('phase', 'System phase', '1', 'dimensionless', 1, 1, 3, true), field('voltage_V', 'System voltage', 'V', 'voltage', 230),
    field('lighting_W', 'Lighting load', 'W', 'power', 3000), field('socket_W', 'Socket load', 'W', 'power', 5000), field('appliance_W', 'Appliance load', 'W', 'power', 4000),
    field('demand_factor', 'Demand factor', '1', 'dimensionless', 0.75, 0, 1),
  ]),
  calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput | ValidationIssue[] {
    const phase = inputs.phase.value; const voltage = inputs.voltage_V.value;
    if (phase !== 1 && phase !== 3) return issue('phase', 'Only single- and three-phase systems are supported.');
    if (voltage <= 0) return issue('voltage_V', 'System voltage must be greater than zero.');
    const demandW = (inputs.lighting_W.value + inputs.socket_W.value + inputs.appliance_W.value) * inputs.demand_factor.value;
    const current = demandW / (voltage * (phase === 3 ? Math.sqrt(3) : 1));
    return { results: [{ key: 'maximum-demand', label: 'Maximum demand', quantity: { value: demandW, unit: 'W' }, passes: null, criterion: 'Declared categories times demand factor' }, { key: 'design-current', label: 'Design current', quantity: { value: current, unit: 'A' }, passes: null, criterion: phase === 3 ? 'P/(sqrt(3)V)' : 'P/V' }], derivation: ['Maximum demand = sum(declared categories) x demand factor.'], references: refs('sans-10142-1-demand'), assumptions: ['Declared demand factor is professionally selected.'], limitations: ['Final DB rating, diversity, protection, fault level, and consumer mains sizing are omitted.', 'Contained pending Electrical PrEng approval.'] };
  },
});

export const ELECTRICAL_DEFINITIONS = Object.freeze({ 'cable-sizing': cable, 'max-demand': demand } satisfies Partial<Record<CalculatorDefinition['id'], CalculatorDefinition>>);
