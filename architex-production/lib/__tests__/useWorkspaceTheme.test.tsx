import { describe, expect, it } from 'vitest';

import { parseWorkspaceTheme } from '@/lib/useWorkspaceTheme';

describe('useWorkspaceTheme', () => {
  it('accepts only the supported persisted theme values', () => {
    expect(parseWorkspaceTheme('dark')).toBe('dark');
    expect(parseWorkspaceTheme('light')).toBe('light');
    expect(parseWorkspaceTheme('invalid')).toBe('light');
    expect(parseWorkspaceTheme(null)).toBe('light');
  });
});
