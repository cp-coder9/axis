import { describe, expect, it } from 'vitest';
import { defaultInputs, runCalculation } from '@/lib/calculations/core';

describe('Phase 2 electrical formulas', () => {
  it('calculates distinct single- and three-phase voltage drops', () => {
    const single = defaultInputs('cable-sizing');
    single.phase.value = 1;
    const three = defaultInputs('cable-sizing');
    three.phase.value = 3;
    const oneResult = runCalculation('cable-sizing', single);
    const threeResult = runCalculation('cable-sizing', three);
    expect(oneResult.ok && threeResult.ok).toBe(true);
    if (!oneResult.ok || !threeResult.ok) return;
    const oneV = oneResult.payload.results.find(({ key }) => key === 'voltage-drop')?.quantity.value;
    const threeV = threeResult.payload.results.find(({ key }) => key === 'voltage-drop')?.quantity.value;
    expect(threeV).toBeCloseTo(oneV! * Math.sqrt(3) / 2, 8);
  });

  it('rejects invalid power factor and non-positive voltage', () => {
    const invalidPf = defaultInputs('cable-sizing');
    invalidPf.power_factor.value = 1.1;
    expect(runCalculation('cable-sizing', invalidPf)).toMatchObject({ ok: false, issues: [{ field: 'power_factor', code: 'out-of-range' }] });
    const invalidVoltage = defaultInputs('cable-sizing');
    invalidVoltage.voltage_V.value = 0;
    expect(runCalculation('cable-sizing', invalidVoltage)).toMatchObject({ ok: false, issues: [{ field: 'voltage_V', code: 'formula-domain' }] });
  });
});
