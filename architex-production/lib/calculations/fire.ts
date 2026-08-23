import type { CalculatorDefinition, FormulaOutput } from './registry';
import type { Dimension, InputField, Quantity, UnitCode, ValidationIssue } from './types';

const field = (key: string, label: string, unit: UnitCode, dimension: Dimension, value: number, min = 0, max = Number.MAX_VALUE, integer = false): InputField => Object.freeze({ key, label, dimension, canonicalUnit: unit, allowedUnits: Object.freeze([unit]), defaultValue: Object.freeze({ value, unit }), min: Object.freeze({ value: min, unit }), max: Object.freeze({ value: max, unit }), integer });
const refs = (id: string) => [{ id, title: 'SANS 10400-T / SANS 10089-2', edition: 'unverified-advisory', clause: null, url: null }];

const travel: CalculatorDefinition = Object.freeze({
  id: 'travel-distance', title: 'Escape Route Travel Distance', icon: 'eng_escape', formulaVersion: 'travel-distance/1.0.0',
  fields: Object.freeze([field('dead_end_m', 'Dead-end distance', 'm', 'length', 6), field('overall_travel_m', 'Overall travel distance', 'm', 'length', 30), field('max_dead_end_m', 'Dead-end limit', 'm', 'length', 15), field('max_overall_travel_m', 'Overall travel limit', 'm', 'length', 45)]),
  calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput | ValidationIssue[] {
    const deadEnd = inputs.dead_end_m.value; const overall = inputs.overall_travel_m.value; const deadLimit = inputs.max_dead_end_m.value; const overallLimit = inputs.max_overall_travel_m.value;
    return { results: [
      { key: 'dead-end', label: 'Dead-end travel distance', quantity: { value: deadEnd, unit: 'm' }, passes: deadEnd <= deadLimit, criterion: `<= ${deadLimit} m` },
      { key: 'overall-travel', label: 'Overall travel distance', quantity: { value: overall, unit: 'm' }, passes: overall <= overallLimit, criterion: `<= ${overallLimit} m` },
    ], derivation: ['Dead-end and overall travel are independent checks.'], references: refs('sans-10400-t-travel'), assumptions: ['Distances are measured on the approved escape-route plan.'], limitations: ['Egress width, occupant load, exit capacity, door swing, smoke control, and final layout are omitted.', 'Contained pending competent fire-engineer approval.'] };
  },
});

const frr: CalculatorDefinition = Object.freeze({
  id: 'fire-resistance', title: 'Fire Resistance Rating', icon: 'eng_fire', formulaVersion: 'fire-resistance/1.0.0',
  fields: Object.freeze([field('classification', 'Approved advisory classification', '1', 'dimensionless', 1, 1, 3, true)]),
  calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput | ValidationIssue[] {
    const classification = inputs.classification.value; const ratings = [30, 60, 120];
    if (!Number.isInteger(classification) || !ratings[classification - 1]) return [{ field: 'classification', code: 'unsupported-option', message: 'Unsupported advisory fire-resistance classification.' }];
    const rating = ratings[classification - 1];
    return { results: [{ key: 'frr', label: 'Advisory fire resistance rating', quantity: { value: rating, unit: 'min' }, passes: null, criterion: `Classification ${classification} lookup` }], derivation: [`Advisory classification ${classification} maps to ${rating} minutes.`], references: refs('sans-10400-t-frr'), assumptions: ['Classification must be independently confirmed for the project.'], limitations: ['This is not a prescriptive classification engine; construction, occupancy, height, compartmentation, and rational design are omitted.', 'Contained pending competent fire-engineer approval.'] };
  },
});

const water: CalculatorDefinition = Object.freeze({
  id: 'fire-water', title: 'Fire Hydrant Flow Requirement', icon: 'eng_hydrant', formulaVersion: 'fire-water/1.0.0',
  fields: Object.freeze([field('floor_area_m2', 'Floor area', 'm2', 'area', 2500), field('storeys', 'Storeys', '1', 'dimensionless', 2, 1, 200, true), field('occupancy_factor', 'Occupancy factor', '1', 'dimensionless', 1, 0, 10)]),
  calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput | ValidationIssue[] {
    const area = inputs.floor_area_m2.value; const storeys = inputs.storeys.value; const occupancy = inputs.occupancy_factor.value;
    const flow = (25 + Math.floor(area / 500) * 5 + Math.max(0, storeys - 1) * 2) * occupancy;
    return { results: [{ key: 'fire-flow', label: 'Advisory fire-water flow', quantity: { value: flow, unit: 'L/s' }, passes: null, criterion: 'All declared input factors applied' }], derivation: ['Flow = (area increment + storey increment) x occupancy factor.'], references: refs('sans-10089-2'), assumptions: ['Preliminary advisory screening only.'], limitations: ['Hydrant spacing, pressure, duration, municipal supply, hose reach, and fire-brigade requirements are omitted.', 'Contained pending Fire PrEng approval.'] };
  },
});

export const FIRE_DEFINITIONS = Object.freeze({ 'travel-distance': travel, 'fire-resistance': frr, 'fire-water': water } satisfies Partial<Record<CalculatorDefinition['id'], CalculatorDefinition>>);
