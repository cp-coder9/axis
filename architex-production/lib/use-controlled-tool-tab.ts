'use client';

import { useCallback, useState } from 'react';

/**
 * Controlled tool-tab state that stays in sync with the ContextNavigator
 * sub-rail (V8 plan Phase 1D/1E).
 *
 * The navigator owns `activeTabKey`; modules must react when it changes
 * instead of treating it as a one-shot default. When the module's own top
 * menu changes the tab, `onTabChange` reports the key back so the navigator
 * highlight follows (two-way sync).
 *
 * Usage (replaces the common useState(() => TABS.some(...), ...) pattern):
 *   const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
 */
export function useControlledToolTab(
  activeTabKey: string | undefined,
  tabs: { key?: string }[],
  fallback: string,
  onTabChange?: (key: string) => void,
): [string, (tab: string) => void] {
  const controlledTab = tabs.some((t) => t.key === activeTabKey) ? (activeTabKey ?? fallback) : fallback;
  const [localTab, setLocalTab] = useState(controlledTab);
  const tab = activeTabKey === undefined ? localTab : controlledTab;

  const handleSetTab = useCallback(
    (next: string) => {
      const resolved = tabs.some((t) => t.key === next) ? next : fallback;
      setLocalTab(resolved);
      if (onTabChange && resolved !== activeTabKey) {
        onTabChange(resolved);
      }
    },
    [activeTabKey, fallback, onTabChange, tabs],
  );

  return [tab, handleSetTab];
}
