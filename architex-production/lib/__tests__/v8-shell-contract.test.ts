import { describe, expect, it } from 'vitest';
import { V8_SHELL_CONTRACT } from '@/lib/v8-shell-contract';

describe('V8 shared shell contract', () => {
  it('defines the five desktop regions and canonical top-bar actions', () => {
    expect(V8_SHELL_CONTRACT.regions).toMatchObject({
      rail: { width: 74 },
      navigator: { width: 306 },
      topbar: { height: 66 },
      inspector: { width: 344 },
    });
    expect(V8_SHELL_CONTRACT.controls).toEqual(expect.arrayContaining(['theme', 'god-mode', 'role']));
    expect(V8_SHELL_CONTRACT.referenceToolCount).toBe(47);
    expect(V8_SHELL_CONTRACT.colours.canvas).toBe('rgb(245, 250, 249)');
    expect(V8_SHELL_CONTRACT.regionStyles.rail).toMatchObject({ backgroundColor: 'rgb(22, 126, 121)' });
    expect(V8_SHELL_CONTRACT.regionStyles.topbar).toMatchObject({ borderBottomColor: 'rgba(16, 32, 51, 0.09)' });
  });

  it('is generated from the sole 47-tool reference with exact region ordering', () => {
    expect(V8_SHELL_CONTRACT.referenceToolCount).toBe(47);
    expect(V8_SHELL_CONTRACT.regionOrder).toEqual(['rail', 'navigator', 'topbar', 'canvas', 'inspector']);
    expect(V8_SHELL_CONTRACT.breakpoints).toEqual([760, 1050, 1260, 1400]);
    expect(V8_SHELL_CONTRACT.referenceDarkTheme).toBe(false);
  });
});
