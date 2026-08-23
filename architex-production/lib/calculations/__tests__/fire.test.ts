import { describe, expect, it } from 'vitest';
import { defaultInputs, runCalculation } from '@/lib/calculations/core';

describe('Phase 2 fire calculations', () => {
  it('evaluates dead-end and overall travel independently', () => {
    const inputs = defaultInputs('travel-distance');
    inputs.dead_end_m.value = 10;
    inputs.overall_travel_m.value = 50;
    const result = runCalculation('travel-distance', inputs);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.results.find(({ key }) => key === 'dead-end')?.passes).toBe(true);
    expect(result.payload.results.find(({ key }) => key === 'overall-travel')?.passes).toBe(false);
  });

  it('uses every declared fire-water input', () => {
    const base = runCalculation('fire-water', defaultInputs('fire-water'));
    const changed = defaultInputs('fire-water');
    changed.storeys.value = 5;
    changed.occupancy_factor.value = 2;
    const varied = runCalculation('fire-water', changed);
    expect(base.ok && varied.ok).toBe(true);
    if (!base.ok || !varied.ok) return;
    expect(varied.payload.results[0].quantity.value).toBeGreaterThan(base.payload.results[0].quantity.value);
  });
});
