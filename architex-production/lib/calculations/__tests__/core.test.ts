import { describe, expect, it } from 'vitest';
import releaseManifest from '@/config/calculator-release-manifest.json';
import { calculatorIdForTab, defaultInputs, runCalculation } from '@/lib/calculations/core';
import { CALC_REGISTRY } from '@/lib/calculations/registry';
import { CALCULATOR_IDS } from '@/lib/calculations/types';

describe('Phase 2 calculation registry and orchestrator', () => {
  it('returns unsupported-option for an unknown calculator', () => {
    expect(runCalculation('unknown-calculator', {})).toEqual({
      ok: false,
      issues: [{
        field: 'calculatorId',
        code: 'unsupported-option',
        message: 'Unsupported calculator: unknown-calculator.',
      }],
    });
  });

  it.each([
    ['missing', {}],
    ['undeclared', { ...defaultInputs('steel-beam'), surprise: { value: 1, unit: '1' as const } }],
    ['wrong unit', { ...defaultInputs('steel-beam'), span_m: { value: 6, unit: 'kPa' as const } }],
  ])('rejects %s input before running the formula', (_case, inputs) => {
    const result = runCalculation('steel-beam', inputs);
    expect(result.ok).toBe(false);
  });

  it('returns fresh defaults and an exact V1 payload', () => {
    const first = defaultInputs('steel-beam');
    const second = defaultInputs('steel-beam');
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first.span_m).not.toBe(second.span_m);

    first.span_m.value = 99;
    expect(second.span_m.value).toBe(6);

    const result = runCalculation('steel-beam', second);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload).toMatchObject({
      schemaVersion: 'engineering-calculation/v1',
      calculatorId: 'steel-beam',
      formulaVersion: 'steel-beam/1.0.0',
      inputs: second,
    });
    expect(result.payload.results.length).toBeGreaterThan(0);
    expect(result.payload.results.every(({ quantity }) => Number.isFinite(quantity.value))).toBe(true);
    expect(Array.isArray(result.payload.derivation)).toBe(true);
    expect(Array.isArray(result.payload.references)).toBe(true);
    expect(Array.isArray(result.payload.assumptions)).toBe(true);
    expect(Array.isArray(result.payload.limitations)).toBe(true);
  });

  it('has 17 immutable unique definitions in manifest order and a 57-case floor', () => {
    const registryIds = Object.keys(CALC_REGISTRY);
    expect(registryIds).toEqual([...CALCULATOR_IDS]);
    expect(new Set(registryIds).size).toBe(17);
    expect(releaseManifest.calculators.map(({ id }) => id)).toEqual(registryIds);
    expect(releaseManifest.calculators.reduce((sum, entry) => sum + entry.minimumGoldenCases, 0)).toBe(57);
    expect(Object.isFrozen(CALC_REGISTRY)).toBe(true);
  });

  it('maps every engineering tab key to its canonical calculator ID', () => {
    expect(calculatorIdForTab('steel')).toBe('steel-beam');
    expect(calculatorIdForTab('stormwater')).toBe('stormwater-rational');
    expect(calculatorIdForTab('converter')).toBe('unit-converter');
    expect(() => calculatorIdForTab('not-a-tab')).toThrow(/unsupported/i);
  });
});
