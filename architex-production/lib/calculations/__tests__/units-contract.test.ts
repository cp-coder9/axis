import { describe, expect, it } from 'vitest';
import { convert, dimensionForUnit, validateQuantity } from '@/lib/calculations/units';
import { serializeCalculationPayload } from '@/lib/calculations/core';
import type { EngineeringCalculationPayloadV1, InputField, Quantity } from '@/lib/calculations/types';

const lengthField: InputField = {
  key: 'span',
  label: 'Span',
  dimension: 'length',
  canonicalUnit: 'm',
  allowedUnits: ['m', 'mm'],
  defaultValue: { value: 6, unit: 'm' },
  min: { value: 0, unit: 'm' },
  max: { value: 1000, unit: 'm' },
};

describe('Phase 2 unit and persisted V1 contract', () => {
  it('V8-C01 line load conversion preserves dimension', () => {
    expect(dimensionForUnit('kN/m')).toBe('line-load');
    expect(convert({ value: 2.5, unit: 'kN/m' }, 'N/mm')).toEqual({ value: 2.5, unit: 'N/mm' });
    expect(convert({ value: 1200, unit: 'mm' }, 'm')).toEqual({ value: 1.2, unit: 'm' });
  });

  it('V8-C01 pressure cannot satisfy length', () => {
    expect(validateQuantity({ value: 10, unit: 'kPa' }, lengthField)).toMatchObject({
      field: 'span',
      code: 'wrong-dimension',
    });
    expect(() => convert({ value: 10, unit: 'kPa' }, 'm')).toThrow(/dimension/i);
  });

  it('V8-C01 rejects non-finite and out-of-range values', () => {
    expect(validateQuantity({ value: Number.NaN, unit: 'm' }, lengthField)?.code).toBe('not-finite');
    expect(validateQuantity({ value: 1001, unit: 'm' }, lengthField)?.code).toBe('out-of-range');
    expect(validateQuantity({ value: 6000, unit: 'mm' }, lengthField)).toBeNull();
  });

  it('V8-H02 persisted V1 round-trips quantities and provenance without flattening', () => {
    const payload: EngineeringCalculationPayloadV1 = {
      schemaVersion: 'engineering-calculation/v1',
      calculatorId: 'steel-beam',
      formulaVersion: 'steel-beam/1.0.0',
      inputs: { span: { value: 6, unit: 'm' } },
      results: [{ key: 'moment', label: 'Bending moment', quantity: { value: 54, unit: 'kN' }, passes: null, criterion: null }],
      derivation: ['M = wL^2/8', 'M = 54 kN.m'],
      references: [{ id: 'sans-10162-1', title: 'SANS 10162-1', edition: '2011', clause: '13.5', url: null }],
      assumptions: ['Simply supported beam'],
      limitations: ['Load combinations require professional review'],
    };
    const serialized = serializeCalculationPayload(payload);
    expect(serialized).toEqual(payload);
    expect(JSON.parse(JSON.stringify(serialized))).toEqual(payload);
    expect(Array.isArray(serialized.derivation)).toBe(true);
    expect(serialized.results[0].quantity).toEqual({ value: 54, unit: 'kN' });
  });

  it('quantity type carries an explicit persisted unit', () => {
    const quantity: Quantity<'mm'> = { value: 300, unit: 'mm' };
    expect(quantity.unit).toBe('mm');
  });
});
