import { expect, test } from '@playwright/test';
import { VIEWPORTS, assertFontReadiness, assertNoBodyOverflow, runAxe } from './helpers/v8-migration';

test('P6-NAV-01 shell baseline preserves role control and responsive overflow contract', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.desktop);
  await page.goto('/?workspace=v8');
  await expect(page.getByTestId('role-switcher')).toBeVisible();
  await assertFontReadiness(page);
  await assertNoBodyOverflow(page);
  await runAxe(page);
});
