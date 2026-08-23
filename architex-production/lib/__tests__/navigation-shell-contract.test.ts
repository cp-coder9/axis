import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');
const source = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('Phase 1 shell navigation ownership', () => {
  it('V8-H07 app owns exactly one writable NavigationState', () => {
    const page = source('app/page.tsx');
    expect(page).toContain('useState<NavigationState>(INITIAL_NAVIGATION_STATE)');
    expect(page).toContain('transitionNavigation(state, event, ALL_TOOLS)');
    expect(page).not.toMatch(/\bsetMode\b|\bsetActiveGlobal\b|\bsetActiveToolId\b|\bsetActiveToolTabKey\b|\bsetGodMode\b/);
  });

  it('V8-H07 shell children consume typed NavigationEvent dispatch', () => {
    for (const path of [
      'components/layout/OsRail.tsx',
      'components/layout/ContextNavigator.tsx',
      'components/layout/TopBar.tsx',
      'components/views/GlobalDestinations.tsx',
      'components/views/GodModeView.tsx',
    ]) {
      const component = source(path);
      expect(component, path).toContain('onNavigate: (event: NavigationEvent) => void');
      expect(component, path).not.toMatch(/onSetMode|onSelectGlobal|onBackToProjectSpace|onBackToStandaloneLibrary|onBackToCollabHub|onToggleGodMode/);
    }
  });

  it('V8-M05 rail consumes canonical visible destination metadata', () => {
    const rail = source('components/layout/OsRail.tsx');
    expect(rail).toContain('visibleGlobalDestinations(navigation, totalToolsCount)');
    expect(rail).toContain('aria-current={isActive ? \'page\' : undefined}');
    expect(rail).not.toContain('const globalItems = [');
  });
});
