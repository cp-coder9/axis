import { expect, test } from '@playwright/test';
import { ALL_TOOLS } from '../lib/data';
import { assertNoBodyOverflow, assertReducedMotion, openMigratedTool, runAxe, VIEWPORTS } from './helpers/v8-migration';

const WAVE_TWO = [
  'project_passport', 'project_explorer', 'professional_directory', 'team_workspace', 'inbox_action',
  'issues_rfis', 'approvals_queue', 'documents_drawings', 'survey_geomatics', 'bim_ifc',
] as const;

function startsWithAccessibleName(label: string) {
  return new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`);
}

test.describe('P6 Wave 2 project record contracts', () => {
  for (const [index, id] of WAVE_TWO.entries()) {
    const tool = ALL_TOOLS[id];
    const initialTab = tool.tabs[0];

    test(`P6-W2-${String(index + 1).padStart(2, '0')} ${id} preserves open/default tab/a11y contract`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await openMigratedTool(page, id);

      await expect(page.locator('main')).toContainText(tool.name);
      await expect(page.locator('aside').getByRole('button', { name: startsWithAccessibleName(initialTab.label) })).toHaveAttribute('aria-pressed', 'true');
      await assertNoBodyOverflow(page);
      await runAxe(page);
      await assertReducedMotion(page);
    });
  }

  test('P6-W2-01 project passport renders its shared record through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'project_passport');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Project Passport');
  });

  test('P6-W2-02 project explorer renders its record relationships through the design-system header', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openMigratedTool(page, 'project_explorer');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('Project Explorer');
    await expect(page.locator('main [data-ui="page-header"]')).toContainText('search across drawings, contracts, RFIs, meetings, approvals');
  });
});
