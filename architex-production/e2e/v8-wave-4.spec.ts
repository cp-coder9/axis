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

  test('P6-W4-02 insurance register renders its statutory cover through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'insurance_register');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Insurance Register');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('statutory and contractual cover');
  });

  test('P6-W4-03 RFQ marketplace renders controlled procurement through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'rfq_marketplace');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('RFQ Marketplace');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('controlled requests, transparent comparisons');
  });

  test('P6-W4-04 supplier catalog renders its verified supply chain through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'supplier_catalog');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Supplier Catalogue');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('compliance-checked suppliers with product data');
  });

  test('P6-W4-05 market insights renders its sector intelligence through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'market_insights');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Market Insights');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('building cost, tender and material trends');
  });

  test('P6-W4-06 contract administration renders its contract controls through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'contract_admin');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Contract Administration');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('certificates, variations, claims and EoT');
  });

  test('P6-W4-07 payments and escrow renders its release tracking through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'payments_escrow');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Payments & Escrow');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('invoice, milestone and release-status tracking');
  });

  test('P6-W4-08 dispute resolution renders its JBCC process through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'dispute_resolution');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Dispute Resolution');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('notices, adjudication, mediation');
  });
});
