import { expect, test } from '@playwright/test';
import { ALL_TOOLS } from '../lib/data';
import { assertNoBodyOverflow, assertReducedMotion, openMigratedTool, runAxe, VIEWPORTS } from './helpers/v8-migration';

const WAVE_FOUR = ['fee_proposal', 'insurance_register', 'rfq_marketplace', 'supplier_catalog', 'market_insights', 'contract_admin', 'payments_escrow', 'dispute_resolution'] as const;

function startsWithAccessibleName(label: string) {
  return new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`);
}

test.describe('P6 Wave 4 commercial and procurement contracts', () => {
  for (const [index, id] of WAVE_FOUR.entries()) {
    const tool = ALL_TOOLS[id];
    const initialTab = tool.tabs[0];
    test(`P6-W4-${String(index + 1).padStart(2, '0')} ${id} preserves open/default tab/a11y contract`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await openMigratedTool(page, id);
      await expect(page.locator('main')).toContainText(tool.name);
      await expect(page.locator('aside').getByRole('button', { name: startsWithAccessibleName(initialTab.label) })).toHaveAttribute('aria-pressed', 'true');
      await assertNoBodyOverflow(page);
      await runAxe(page);
      await assertReducedMotion(page);
    });
  }

  test('P6-W4-01 fee proposal builder renders commercial terms through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'fee_proposal');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Fee Proposal Builder');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('stage-based professional fees');
  });
});
