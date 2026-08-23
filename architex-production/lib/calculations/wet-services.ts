import type { CalculatorDefinition, FormulaOutput } from './registry';
import type { Dimension, InputField, Quantity, UnitCode } from './types';

const field = (key: string, label: string, unit: UnitCode, dimension: Dimension, value: number, min = 0, max = Number.MAX_VALUE, integer = false): InputField => Object.freeze({ key, label, dimension, canonicalUnit: unit, allowedUnits: Object.freeze([unit]), defaultValue: Object.freeze({ value, unit }), min: Object.freeze({ value: min, unit }), max: Object.freeze({ value: max, unit }), integer });
const refs = (id: string) => [{ id, title: 'SANS wet-services advisory method', edition: 'unverified-advisory', clause: null, url: null }];

const coldWater: CalculatorDefinition = Object.freeze({
  id: 'cold-water', title: 'Cold Water Pipe Sizing', icon: 'eng_water', formulaVersion: 'cold-water/1.0.0',
  fields: Object.freeze([field('fixtures', 'Fixture count', '1', 'dimensionless', 12, 0, 10000, true), field('peak_factor', 'Peak factor', '1', 'dimensionless', 0.6, 0, 10), field('avg_flow_L_min', 'Average fixture flow', 'L/min', 'flow', 8), field('velocity_m_s', 'Maximum velocity', 'm/s', 'velocity', 2.4)]),
  calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput {
    const peakLMin = inputs.fixtures.value * inputs.peak_factor.value * inputs.avg_flow_L_min.value; const peakLs = peakLMin / 60; const flowM3s = peakLs / 1000; const area = flowM3s / inputs.velocity_m_s.value; const diameter = Math.sqrt(4 * area / Math.PI) * 1000;
    return { results: [{ key: 'peak-flow', label: 'Peak flow', quantity: { value: peakLs, unit: 'L/s' }, passes: null, criterion: 'L/min divided by 60' }, { key: 'diameter', label: 'Minimum velocity diameter', quantity: { value: diameter, unit: 'mm' }, passes: null, criterion: 'A = Q/v' }], derivation: ['Peak flow L/s = fixtures x peak factor x L/min / 60', 'A = Q_m3/s / v'], references: refs('sans-10252-1'), assumptions: ['Declared fixture diversity factor.'], limitations: ['Pressure loss, head, supply pressure, valves, and pipe material are omitted.', 'Contained pending Wet-services PrEng approval.'] };
  },
});

const drainage: CalculatorDefinition = Object.freeze({
  id: 'drainage-fu', title: 'Drainage Fixture Units', icon: 'eng_drain', formulaVersion: 'drainage-fu/1.0.0',
  fields: Object.freeze([field('total_fu', 'Total fixture units', 'FU', 'dimensionless', 30, 0, 100000, true)]),
  calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput {
    const fu = inputs.total_fu.value; const diameter = fu <= 10 ? 50 : fu <= 30 ? 75 : fu <= 60 ? 100 : 150;
    return { results: [{ key: 'total-fixture-units', label: 'Total fixture units', quantity: { value: fu, unit: 'FU' }, passes: null, criterion: 'Declared fixture-unit total' }, { key: 'diameter', label: 'Advisory drain diameter', quantity: { value: diameter, unit: 'mm' }, passes: null, criterion: '10/30/60 FU boundaries' }], derivation: ['Diameter lookup uses inclusive 10, 30, and 60 FU boundaries.'], references: refs('sans-10252-2'), assumptions: ['Fixture units are supplied from the approved schedule.'], limitations: ['Gradient, venting, stack loading, storm separation, and compliance are omitted.', 'Contained pending Wet-services PrEng approval.'] };
  },
});

const geyser: CalculatorDefinition = Object.freeze({
  id: 'geyser-sizing', title: 'Hot Water System Sizing', icon: 'eng_hotwater', formulaVersion: 'geyser-sizing/1.0.0',
  fields: Object.freeze([field('occupants', 'Occupants', '1', 'dimensionless', 4, 0, 1000, true), field('litres_per_person', 'Litres per person', 'L', 'volume', 50), field('dT', 'Temperature rise', 'K', 'temperature-difference', 50), field('solar_fraction', 'Solar fraction', '1', 'dimensionless', 0, 0, 1)]),
  calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput {
    const volume = inputs.occupants.value * inputs.litres_per_person.value; const energy = volume * 4.186 * inputs.dT.value / 3600; const net = energy * (1 - inputs.solar_fraction.value); const tank = Math.ceil(volume / 50) * 50;
    return { results: [{ key: 'volume', label: 'Daily hot water', quantity: { value: volume, unit: 'L' }, passes: null, criterion: 'Occupants x litres/person' }, { key: 'energy', label: 'Daily heating energy', quantity: { value: energy, unit: 'kWh' }, passes: null, criterion: 'rho V c deltaT / 3.6e6' }, { key: 'net-energy', label: 'Net energy after solar', quantity: { value: net, unit: 'kWh' }, passes: null, criterion: 'Solar fraction [0,1]' }, { key: 'tank', label: 'Tank increment', quantity: { value: tank, unit: 'L' }, passes: null, criterion: '50 L increment' }], derivation: ['E = rho V c deltaT / 3.6e6', 'Tank rounds up to the next 50 L.'], references: refs('sans-10400-xa'), assumptions: ['Water density 1 kg/L and heat capacity 4.186 kJ/kgK.'], limitations: ['Recovery time, draw profile, heat pump/solar design, storage losses, and compliance are omitted.', 'Contained pending Wet-services/mechanical PrEng approval.'] };
  },
});

export const WET_SERVICES_DEFINITIONS = Object.freeze({ 'cold-water': coldWater, 'drainage-fu': drainage, 'geyser-sizing': geyser } satisfies Partial<Record<CalculatorDefinition['id'], CalculatorDefinition>>);
