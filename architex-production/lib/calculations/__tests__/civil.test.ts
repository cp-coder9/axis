import { describe, expect, it } from 'vitest';
import { defaultInputs, runCalculation } from '@/lib/calculations/core';

describe('Phase 2 civil formulas', () => {
  it('V8-C01 rational stormwater uses the hectare coefficient exactly once', () => {
    const result = runCalculation('stormwater-rational', defaultInputs('stormwater-rational'));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.results.find(({ key }) => key === 'peak-flow')?.quantity).toEqual({
      value: expect.closeTo(0.210168, 9), unit: 'm3/s',
    });
  });

  it('rejects runoff coefficients outside zero to one', () => {
    const inputs = defaultInputs('stormwater-rational');
    inputs.C.value = 1.1;
    expect(runCalculation('stormwater-rational', inputs)).toMatchObject({
      ok: false, issues: [{ field: 'C', code: 'out-of-range' }],
    });
  });
});
