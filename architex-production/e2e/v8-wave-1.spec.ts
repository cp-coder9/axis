import { expect, test } from '@playwright/test';
import { ALL_TOOLS } from '../lib/data';
import { assertNoBodyOverflow, assertReducedMotion, openMigratedTool, runAxe, VIEWPORTS } from './helpers/v8-migration';

const WAVE_ONE = [
  'meetings', 'practice', 'wingman', 'engineering_calc', 'planning', 'municipal', 'xa',
  'forms', 'specforge', 'bom', 'itp', 'safety', 'feedback',
] as const;

function startsWithAccessibleName(label: string) {
  return new RegExp(`^${label.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}(?:\\s|$)`);
}

test.describe('P6 Wave 1 flagship module contracts', () => {
  for (const [index, id] of WAVE_ONE.entries()) {
    const tool = ALL_TOOLS[id];
    const initialTab = tool.tabs[0];

    test(`P6-W1-${String(index + 1).padStart(2, '0')} ${id} preserves open/default tab/a11y contract`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await openMigratedTool(page, id);

      await expect(page.locator('main')).toContainText(tool.name);
      await expect(page.locator('aside').getByRole('button', { name: startsWithAccessibleName(initialTab.label) })).toHaveAttribute('aria-pressed', 'true');
      await assertNoBodyOverflow(page);
      await runAxe(page);
      await assertReducedMotion(page);
    });
  }
});
