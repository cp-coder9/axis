import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('V8 Project Datum contract', () => {
  it('binds the supplied reference and complete Datum inventory', () => {
    const fixturePath = resolve('fixtures/v8-project-datum-contract.json');
    expect(existsSync(fixturePath), 'Project Datum reference fixture exists').toBe(true);

    const contract = JSON.parse(readFileSync(fixturePath, 'utf8')) as {
      source: string;
      labels: { stages: string[] };
      controlOrder: string[];
      regions: Record<string, unknown>;
      computedStyles: { datumLine: { backgroundImage: string } };
    };
    expect(contract.source).toBe('E:/Downloads/architex_datum_os_integrated_modules_v8_engineering_godmode.html');
    expect(contract.labels.stages).toEqual(['Brief', 'Appoint', 'Design', 'Comply', 'Procure', 'Build', 'Pay', 'Close-out']);
    expect(contract.controlOrder).toEqual(['plan-project', 'engineering', 'meetings', 'give-feedback']);
    expect(Object.keys(contract.regions)).toEqual(['pageHead', 'roleBanner', 'projectHero', 'datumViewport']);
    expect(contract.computedStyles.datumLine.backgroundImage).toContain('linear-gradient');
  });
});
