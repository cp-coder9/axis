import { expect, test } from '@playwright/test';
import { ALL_TOOLS } from '../lib/data';
import { assertNoBodyOverflow, assertReducedMotion, openMigratedTool, runAxe, VIEWPORTS } from './helpers/v8-migration';

const WAVE_THREE = [
  'compliance_hub', 'environmental_heritage', 'eia_workspace', 'refuse_calculator',
  'nhbrc_enrolment', 'council_navigator', 'municipal_tracker',
] as const;

function startsWithAccessibleName(label: string) {
  return new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`);
}

test.describe('P6 Wave 3 planning and compliance contracts', () => {
  for (const [index, id] of WAVE_THREE.entries()) {
    const tool = ALL_TOOLS[id];
    const initialTab = tool.tabs[0];

    test(`P6-W3-${String(index + 1).padStart(2, '0')} ${id} preserves open/default tab/a11y contract`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await openMigratedTool(page, id);

      await expect(page.locator('main')).toContainText(tool.name);
      await expect(page.locator('aside').getByRole('button', { name: startsWithAccessibleName(initialTab.label) })).toHaveAttribute('aria-pressed', 'true');
      await assertNoBodyOverflow(page);
      await runAxe(page);
      await assertReducedMotion(page);
    });
  }

  test('P6-W3-01 compliance hub renders its statutory aggregation through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'compliance_hub');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Compliance Hub');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('SANS 10400, NBR, OHS and municipal by-laws');
  });

  test('P6-W3-02 environmental and heritage renders its EIA screening through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'environmental_heritage');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Environmental & Heritage');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('EIA screening, heritage impact, public participation');
  });

  test('P6-W3-03 EIA workspace renders its Basic Assessment workflow through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'eia_workspace');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('EIA Workspace');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Basic Assessment workflow');
  });
});
