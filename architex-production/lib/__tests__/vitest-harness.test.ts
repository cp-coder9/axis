import { describe, expect, it } from 'vitest';

describe('Vitest harness', () => {
  it('resolves the project alias', async () => {
    expect(await import('@/lib/navigation')).toBeDefined();
  });
});
