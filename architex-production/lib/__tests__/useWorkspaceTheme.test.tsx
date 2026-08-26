import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseWorkspaceTheme, WORKSPACE_THEME_STORAGE_KEY } from '@/lib/useWorkspaceTheme';

describe('useWorkspaceTheme', () => {
  it('accepts only the supported persisted theme values', () => {
    expect(parseWorkspaceTheme('dark')).toBe('dark');
    expect(parseWorkspaceTheme('light')).toBe('light');
    expect(parseWorkspaceTheme('invalid')).toBe('light');
    expect(parseWorkspaceTheme(null)).toBe('light');
  });

  it('uses the canonical persisted V8 theme key', () => {
    expect(WORKSPACE_THEME_STORAGE_KEY).toBe('architex-theme');
  });

  it('renders the reference text-plus-icon theme action', () => {
    const source = readFileSync(resolve('components/layout/TopBar.tsx'), 'utf8');
    expect(source).toContain('aria-label="Switch colour theme"');
    expect(source).toContain("theme === 'dark' ? 'Light' : 'Dark'");
    expect(source).toContain('data-v8-control="theme"');
  });
});
