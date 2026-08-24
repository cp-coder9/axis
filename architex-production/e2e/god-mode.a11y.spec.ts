import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('P7-A11Y God Mode home has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/?workspace=v8');
  await page.getByTestId('god-mode-toggle').click();

  const results = await new AxeBuilder({ page }).analyze();
  const blockingViolations = results.violations.filter((violation) =>
    violation.impact === 'serious' || violation.impact === 'critical',
  );

  expect(blockingViolations).toEqual([]);
});

test('P7-A11Y God Mode fits the required mobile viewport without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?workspace=v8');
  await page.getByTestId('god-mode-toggle').click();

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('P7-A11Y God Mode fits the required tablet viewport without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/?workspace=v8');
  await page.getByTestId('god-mode-toggle').click();

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
});
