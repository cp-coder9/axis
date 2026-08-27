import { describe, expect, it } from 'vitest';

import { canUseSpecForge, specForgeCapabilitySnapshot } from '@/lib/specforge/capabilities';

describe('SpecForge presentation capabilities', () => {
  it.each(['engineer', 'energy_professional', 'fire_engineer'] as const)(
    'allows assigned technical author %s to use Smart Add',
    role => expect(canUseSpecForge(role, 'author')).toBe(true),
  );

  it('exposes a stable role-sorted snapshot for the server parity contract', () => {
    expect(specForgeCapabilitySnapshot().author).toEqual([
      'architect', 'bep', 'contractor', 'energy_professional', 'engineer', 'fire_engineer', 'platform_admin', 'subcontractor', 'supplier',
    ]);
  });
});
