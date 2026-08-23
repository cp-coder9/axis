import type { Dimension, InputField, Quantity, UnitCode, ValidationIssue } from './types';

interface UnitDefinition {
  dimension: Dimension;
  factor: number;
}

const UNITS: Record<UnitCode, UnitDefinition> = {
  m: { dimension: 'length', factor: 1 },
  mm: { dimension: 'length', factor: 0.001 },
  m2: { dimension: 'area', factor: 1 },
  mm2: { dimension: 'area', factor: 0.000001 },
  ha: { dimension: 'area', factor: 10000 },
  m3: { dimension: 'volume', factor: 1 },
  L: { dimension: 'volume', factor: 0.001 },
  N: { dimension: 'force', factor: 1 },
  kN: { dimension: 'force', factor: 1000 },
  'kN/m': { dimension: 'line-load', factor: 1000 },
  'N/mm': { dimension: 'line-load', factor: 1000 },
  Pa: { dimension: 'pressure', factor: 1 },
  kPa: { dimension: 'pressure', factor: 1000 },
  MPa: { dimension: 'pressure', factor: 1000000 },
  'm/s': { dimension: 'velocity', factor: 1 },
  'm3/s': { dimension: 'flow', factor: 1 },
  'L/s': { dimension: 'flow', factor: 0.001 },
  'L/min': { dimension: 'flow', factor: 0.001 / 60 },
  W: { dimension: 'power', factor: 1 },
  kW: { dimension: 'power', factor: 1000 },
  kWh: { dimension: 'energy', factor: 1 },
  K: { dimension: 'temperature-difference', factor: 1 },
  A: { dimension: 'current', factor: 1 },
  V: { dimension: 'voltage', factor: 1 },
  'mOhm/m': { dimension: 'resistance-per-length', factor: 1 },
  min: { dimension: 'time', factor: 1 },
  '%': { dimension: 'dimensionless', factor: 0.01 },
  FU: { dimension: 'dimensionless', factor: 1 },
  '1': { dimension: 'dimensionless', factor: 1 },
};

export function dimensionForUnit(unit: UnitCode): Dimension {
  return UNITS[unit].dimension;
}

export function convert<U extends UnitCode>(quantity: Quantity, targetUnit: U): Quantity<U> {
  const source = UNITS[quantity.unit];
  const target = UNITS[targetUnit];
  if (source.dimension !== target.dimension) {
    throw new Error(`Cannot convert ${source.dimension} to ${target.dimension}: incompatible dimension`);
  }
  return { value: quantity.value * source.factor / target.factor, unit: targetUnit };
}

export function validateQuantity(quantity: Quantity | undefined, field: InputField): ValidationIssue | null {
  if (!quantity) return { field: field.key, code: 'required', message: `${field.label} is required.` };
  if (!Number.isFinite(quantity.value)) return { field: field.key, code: 'not-finite', message: `${field.label} must be finite.` };
  if (dimensionForUnit(quantity.unit) !== field.dimension) {
    return { field: field.key, code: 'wrong-dimension', message: `${field.label} requires ${field.dimension}.` };
  }
  if (!field.allowedUnits.includes(quantity.unit)) {
    return { field: field.key, code: 'wrong-unit', message: `${quantity.unit} is not allowed for ${field.label}.` };
  }
  const normalized = convert(quantity, field.canonicalUnit).value;
  const minimum = convert(field.min, field.canonicalUnit).value;
  const maximum = convert(field.max, field.canonicalUnit).value;
  if (normalized < minimum || normalized > maximum) {
    return { field: field.key, code: 'out-of-range', message: `${field.label} is outside the supported range.` };
  }
  if (field.integer && !Number.isInteger(normalized)) {
    return { field: field.key, code: 'not-integer', message: `${field.label} must be an integer.` };
  }
  return null;
}
