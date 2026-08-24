import { expect, test } from '@playwright/test';
import { openMigratedTool, VIEWPORTS } from './helpers/v8-migration';

test('Project Explorer Browse opens the matching project workspace', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.desktop);
  await openMigratedTool(page, 'project_explorer');
  await page.getByLabel('Project Explorer sections').getByRole('button', { name: 'Entity Registry', exact: true }).click();
  await page.getByRole('button', { name: 'Browse →', exact: true }).first().click();
  await expect(page.locator('main h1', { hasText: 'Documents & Drawings' })).toBeVisible();
});
