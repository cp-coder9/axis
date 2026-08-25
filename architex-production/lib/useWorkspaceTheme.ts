'use client';

import { useCallback, useEffect, useState } from 'react';

export type WorkspaceTheme = 'light' | 'dark';

export const WORKSPACE_THEME_STORAGE_KEY = 'architex.workspace-theme';

export function parseWorkspaceTheme(value: string | null): WorkspaceTheme {
  return value === 'dark' ? 'dark' : 'light';
}

export function useWorkspaceTheme(): {
  theme: WorkspaceTheme;
  toggleTheme: () => void;
} {
  const [theme, setTheme] = useState<WorkspaceTheme>('light');

  useEffect(() => {
    setTheme(parseWorkspaceTheme(window.localStorage.getItem(WORKSPACE_THEME_STORAGE_KEY)));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme: WorkspaceTheme = currentTheme === 'light' ? 'dark' : 'light';
      window.localStorage.setItem(WORKSPACE_THEME_STORAGE_KEY, nextTheme);
      return nextTheme;
    });
  }, []);

  return { theme, toggleTheme };
}
