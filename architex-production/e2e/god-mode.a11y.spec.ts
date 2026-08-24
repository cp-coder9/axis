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
