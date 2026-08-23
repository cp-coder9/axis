import { describe, expect, it } from 'vitest';
import { defaultInputs, runCalculation } from '@/lib/calculations/core';

describe('Phase 2 mechanical formulas', () => {
  it('sizes duct area from airflow and velocity and rejects zero velocity', () => {
    const result = runCalculation('duct-sizing', defaultInputs('duct-sizing'));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.results.find(({ key }) => key === 'area')?.quantity).toEqual({ value: expect.closeTo(0.133333333, 8), unit: 'm2' });

    const invalid = defaultInputs('duct-sizing');
    invalid.velocity_m_s.value = 0;
    expect(runCalculation('duct-sizing', invalid)).toMatchObject({ ok: false, issues: [{ field: 'velocity_m_s', code: 'formula-domain' }] });
  });

  it('uses the declared internal load rather than an implicit floor-area heuristic', () => {
    const inputs = defaultInputs('heat-gain');
    inputs.internal_load_W.value = 2500;
    const result = runCalculation('heat-gain', inputs);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.results.find(({ key }) => key === 'internal-gain')?.quantity).toEqual({ value: 2500, unit: 'W' });
  });
});
