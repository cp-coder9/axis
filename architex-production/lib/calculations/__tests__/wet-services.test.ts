import { describe, expect, it } from 'vitest';
import { defaultInputs, runCalculation } from '@/lib/calculations/core';

describe('Phase 2 wet-services and conversion formulas', () => {
  it('converts L/min to m3/s before sizing cold-water diameter', () => {
    const result = runCalculation('cold-water', defaultInputs('cold-water'));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.results.find(({ key }) => key === 'peak-flow')?.quantity.unit).toBe('L/s');
    expect(result.payload.results.find(({ key }) => key === 'diameter')?.quantity.value).toBeGreaterThan(0);
  });

  it.each([[10, 50], [11, 75], [30, 75], [31, 100], [60, 100], [61, 150]])('uses drainage boundary %i FU -> %i mm', (fu, diameter) => {
    const inputs = defaultInputs('drainage-fu');
    inputs.total_fu.value = fu;
    const result = runCalculation('drainage-fu', inputs);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.results.find(({ key }) => key === 'diameter')?.quantity.value).toBe(diameter);
  });

  it('rejects fractional occupants and supports an explicit converter key', () => {
    const hotWater = defaultInputs('geyser-sizing');
    hotWater.occupants.value = 2.5;
    expect(runCalculation('geyser-sizing', hotWater)).toMatchObject({ ok: false, issues: [{ field: 'occupants', code: 'not-integer' }] });
    const converter = defaultInputs('unit-converter');
    converter.conversion_key.value = 4;
    const result = runCalculation('unit-converter', converter);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.results[0].quantity.unit).toBe('kPa');
  });
});
