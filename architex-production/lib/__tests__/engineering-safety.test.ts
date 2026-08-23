import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { calculatorRelease, isCalculatorRecordable } from '@/lib/engineering-safety';

const EXPECTED_IDS = [
  'steel-beam',
  'concrete-beam',
  'timber-beam',
  'geo-bearing',
  'wind-load',
  'stormwater-rational',
  'duct-sizing',
  'heat-gain',
  'travel-distance',
  'fire-resistance',
  'fire-water',
  'cable-sizing',
  'max-demand',
  'cold-water',
  'drainage-fu',
  'geyser-sizing',
  'unit-converter',
] as const;

interface Manifest {
  schemaVersion: number;
  calculators: Array<{
    id: string;
    releaseState: string;
    recordable: boolean;
    minimumGoldenCases: number;
  }>;
}

describe('engineering calculation containment', () => {
  it('V8-C01 manifest contains exactly 17 contained calculators', async () => {
    const contents = await readFile(
      new URL('../../config/calculator-release-manifest.json', import.meta.url),
      'utf8',
    );
    const manifest = JSON.parse(contents) as Manifest;

    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.calculators.map(({ id }) => id)).toEqual(EXPECTED_IDS);
    expect(manifest.calculators).toHaveLength(17);
    expect(manifest.calculators.every(({ releaseState }) => releaseState === 'contained')).toBe(true);
    expect(manifest.calculators.every(({ recordable }) => recordable === false)).toBe(true);
    expect(manifest.calculators.reduce((sum, entry) => sum + entry.minimumGoldenCases, 0)).toBe(57);
  });

  it('V8-C01 unknown calculator fails closed', () => {
    expect(calculatorRelease('not-a-calculator')).toMatchObject({
      id: 'not-a-calculator',
      releaseState: 'contained',
      recordable: false,
    });
    expect(isCalculatorRecordable('not-a-calculator')).toBe(false);
  });
});
