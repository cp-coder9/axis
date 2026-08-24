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

test('P6-NAV-01 mobile context drawer opens, traps focus, and restores its trigger', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');

  const trigger = page.getByRole('button', { name: 'Open context navigation' });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const drawer = page.getByRole('dialog', { name: 'Context navigation' });
  await expect(drawer).toBeVisible();
  await expect(drawer).toBeFocused();

  const lastDrawerControl = drawer.locator('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])').last();
  await page.keyboard.press('Shift+Tab');
  await expect(lastDrawerControl).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await assertNoBodyOverflow(page);
});
