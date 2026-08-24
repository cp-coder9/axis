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

test('P6-NAV-01 mobile inspector drawer exposes its existing contextual content', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');

  const trigger = page.getByRole('button', { name: 'Open context inspector' });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const drawer = page.getByRole('dialog', { name: 'Context inspector' });
  await expect(drawer).toContainText('Project Context');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('P6-NAV-01 mobile global drawer preserves the selected destination transition', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');

  await page.getByRole('button', { name: 'Open global navigation' }).click();
  const drawer = page.getByRole('dialog', { name: 'Global navigation' });
  await expect(drawer).toContainText('Global OS Rail');
  await drawer.getByRole('button', { name: 'Project Space Datum' }).click();

  await expect(drawer).toBeHidden();
  await expect(page.getByTestId('datum-canvas')).toBeVisible();
  await assertNoBodyOverflow(page);
});

test('P6-NAV-01 tablet context drawer keeps the desktop workspace unobscured until opened', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.tablet);
  await page.goto('/?workspace=v8');

  const trigger = page.getByRole('button', { name: 'Open context navigation' });
  await expect(trigger).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Context navigation' })).toBeHidden();
  await expect(page.getByTestId('datum-canvas')).toBeVisible();

  await trigger.click();
  await expect(page.getByRole('dialog', { name: 'Context navigation' })).toBeVisible();
  await assertNoBodyOverflow(page);
});
