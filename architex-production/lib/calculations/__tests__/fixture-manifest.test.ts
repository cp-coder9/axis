import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import releaseManifest from '@/config/calculator-release-manifest.json';

type AdvisoryFixture = { calculatorId: string; cases: Array<{ formulaVersion: string; classification: string }> };

describe('Phase 2 manifest-derived advisory fixture corpus', () => {
  it('contains the exact 57-case floor with a file and matching formula version per calculator', async () => {
    const root = resolve(process.cwd(), 'test', 'fixtures', 'calculations');
    const fixtures = await Promise.all(releaseManifest.calculators.map(async (entry) => {
      const fixture = JSON.parse(await readFile(resolve(root, `${entry.id}.json`), 'utf8')) as AdvisoryFixture;
      return { entry, fixture };
    }));
    expect(fixtures.reduce((total, { fixture }) => total + fixture.cases.length, 0)).toBe(57);
    for (const { entry, fixture } of fixtures) {
      expect(fixture.calculatorId).toBe(entry.id);
      expect(fixture.cases.length).toBeGreaterThanOrEqual(entry.minimumGoldenCases);
      expect(fixture.cases.every((testCase) => testCase.formulaVersion === `${entry.id}/1.0.0`)).toBe(true);
      expect(fixture.cases.every((testCase) => testCase.classification === 'advisory-contained')).toBe(true);
      expect(entry.releaseState).toBe('contained');
    }
  });
});
