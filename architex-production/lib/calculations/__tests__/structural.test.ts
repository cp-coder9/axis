import { describe, expect, it } from 'vitest';
import { defaultInputs, runCalculation } from '@/lib/calculations/core';

describe('Phase 2 structural and geotechnical formulas', () => {
  it('V8-C01 concrete K is dimensionless and finite', () => {
    const result = runCalculation('concrete-beam', defaultInputs('concrete-beam'));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const k = result.payload.results.find(({ key }) => key === 'k-factor');
    expect(k?.quantity).toEqual({ value: expect.closeTo(0.0661157, 6), unit: '1' });
    expect(Number.isFinite(k?.quantity.value)).toBe(true);
    expect(result.payload.results.every(({ quantity }) => Number.isFinite(quantity.value))).toBe(true);
  });

  it('rejects concrete values outside the formula domain instead of emitting NaN', () => {
    const inputs = defaultInputs('concrete-beam');
    inputs.M_kNm.value = 700;
    const result = runCalculation('concrete-beam', inputs);
    expect(result).toMatchObject({
      ok: false,
      issues: [{ field: 'M_kNm', code: 'formula-domain' }],
    });
  });

  it('uses consistent N/mm terms for steel moment, capacity and deflection', () => {
    const result = runCalculation('steel-beam', defaultInputs('steel-beam'));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.results.find(({ key }) => key === 'moment')?.quantity.value).toBeCloseTo(54, 8);
    expect(result.payload.results.find(({ key }) => key === 'capacity')?.quantity.value).toBeCloseTo(319.5, 8);
    expect(result.payload.results.find(({ key }) => key === 'deflection')?.quantity.value).toBeCloseTo(18.75, 2);
  });

  it('labels the bearing result as gross service pressure', () => {
    const result = runCalculation('geo-bearing', defaultInputs('geo-bearing'));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.results.find(({ key }) => key === 'gross-service-bearing')).toMatchObject({
      label: 'Gross service bearing pressure',
      quantity: { unit: 'kPa' },
    });
  });
});
