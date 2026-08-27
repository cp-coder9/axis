import { describe, expect, it } from 'vitest';

import { REFERENCE_TOOLS } from './godmode-reference';
import {
  SPECFORGE_PROCUREMENT_PIPELINE,
  SPECFORGE_REFERENCE_CONTRACT,
  SPECFORGE_REFERENCE_VIEWS,
} from './specforge-reference-contract';

describe('SpecForge reference contract', () => {
  it('matches the sole reference tool navigation exactly', () => {
    expect(SPECFORGE_REFERENCE_VIEWS.map(({ id, label }) => ({ id, label }))).toEqual(
      REFERENCE_TOOLS.specforge.tabs.map((tab) => ({ id: tab.arg, label: tab.label })),
    );
    expect(SPECFORGE_REFERENCE_CONTRACT.sourceSha256).toBeTruthy();
    expect(SPECFORGE_REFERENCE_CONTRACT.embeddedSourceSha256).not.toBe(
      SPECFORGE_REFERENCE_CONTRACT.sourceSha256,
    );
  });

  it('preserves the exact procurement sequence', () => {
    expect(SPECFORGE_PROCUREMENT_PIPELINE).toEqual([
      'RFQ Pending',
      'Quoted',
      'PO Raised',
      'Ordered',
      'In Transit',
      'Delivered',
      'Installed',
    ]);
  });
});
