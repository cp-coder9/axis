import { expect, test } from '@playwright/test';
import { ALL_TOOLS } from '../lib/data';
import { assertNoBodyOverflow, assertReducedMotion, openMigratedTool, runAxe, VIEWPORTS } from './helpers/v8-migration';

const WAVE_FIVE = ['contractor_compliance', 'site_instructions', 'ncr_manager', 'snag_manager', 'fm_bridge', 'remote_desktop', 'cpd_learning', 'admin_review', 'iconography_registry'] as const;

function startsWithAccessibleName(label: string) { return new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`); }

test.describe('P6 Wave 5 site, close-out and platform contracts', () => {
  for (const [index, id] of WAVE_FIVE.entries()) {
    const tool = ALL_TOOLS[id]; const initialTab = tool.tabs[0];
    test(`P6-W5-${String(index + 1).padStart(2, '0')} ${id} preserves open/default tab/a11y contract`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop); await openMigratedTool(page, id);
      await expect(page.locator('main')).toContainText(tool.name);
      await expect(page.locator('aside').getByRole('button', { name: startsWithAccessibleName(initialTab.label) })).toHaveAttribute('aria-pressed', 'true');
      await assertNoBodyOverflow(page); await runAxe(page); await assertReducedMotion(page);
    });
  }
  test('P6-W5-01 contractor compliance renders its pre-qualification through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop); await openMigratedTool(page, 'contractor_compliance');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Contractor Compliance');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('COIDA, tax, CIDB, BBBEE');
  });

  test('P6-W5-02 site instructions renders its directive workflow through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop); await openMigratedTool(page, 'site_instructions');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Site Instructions');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('contractor acknowledgement + cost implications');
  });

  test('P6-W5-03 NCR manager renders its quality workflow through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop); await openMigratedTool(page, 'ncr_manager');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('NCR Manager');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('deviations, rectification and hold-point linkage');
  });
});
