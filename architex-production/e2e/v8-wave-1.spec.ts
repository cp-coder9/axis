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

  test('P6-W1-02 practice renders its default dashboard through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'practice');

    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Practice & Project Command Centre');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Live Operations & KPI Dashboard');
  });

  test('P6-W1-03 wingman renders its AI workspace through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'wingman');

    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Architex Wingman AI Workspace');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Statutory & Document Intelligence');
  });

  test('P6-W1-04 engineering calculation renders calculator context through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'engineering_calc');

    await expect(page.locator('main [data-ui="page-header"]')).toContainText("Engineer's Calculation Hub");
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Steel Beam Bending & Deflection');
  });

  test('P6-W1-05 planning renders its statutory workspace through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'planning');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Town Planning & SPLUMA Manager');
  });

  test('P6-W1-06 municipal renders its submission workspace through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'municipal');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Municipal Submission Manager');
  });
});
