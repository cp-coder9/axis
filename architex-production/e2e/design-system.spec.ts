import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('P5-TYP-01 loads the local typography specimen without external font requests', async ({ page }) => {
  const externalFontRequests: string[] = [];
  page.on('request', (request) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(request.url())) externalFontRequests.push(request.url());
  });

  await page.goto('/design-system');

  await expect(page.getByRole('heading', { name: 'Architex typography roles' })).toBeVisible();
  const fonts = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    const display = styles.getPropertyValue('--font-ax-display').trim();
    const body = styles.getPropertyValue('--font-ax-body').trim();
    const mono = styles.getPropertyValue('--font-ax-mono').trim();
    return {
      display, body, mono,
      displayLoaded: document.fonts.check(`600 24px ${display}`),
      bodyLoaded: document.fonts.check(`400 16px ${body}`),
      monoLoaded: document.fonts.check(`400 14px ${mono}`),
    };
  });
  expect(fonts.display).not.toBe('');
  expect(fonts.body).not.toBe('');
  expect(fonts.mono).not.toBe('');
  expect(fonts.displayLoaded).toBe(true);
  expect(fonts.bodyLoaded).toBe(true);
  expect(fonts.monoLoaded).toBe(true);
  expect(externalFontRequests).toEqual([]);
});

test('P5-ID-01 P5-DEN-01 P5-RSP-01 renders the deterministic design-system catalog without body overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/design-system');

  for (const id of ['identity', 'colour-semantics', 'typography', 'density', 'breakpoints', 'statuses', 'data-visualisation']) {
    await expect(page.locator(`#ax-catalog-${id}`)).toHaveCount(1);
  }
  await expect(page.locator('[data-density="comfortable"]')).toHaveCount(1);
  await expect(page.locator('[data-density="compact"]')).toHaveCount(1);
  expect(await page.evaluate(() => document.body.scrollWidth <= document.body.clientWidth)).toBe(true);
});

test('P5-API-01 actions expose native keyboard behavior and semantic status labels', async ({ page }) => {
  await page.goto('/design-system');

  const iconButton = page.getByRole('button', { name: 'Open project context' });
  await expect(iconButton).toBeVisible();
  await iconButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('action-count')).toHaveText('1');
  await page.keyboard.press('Space');
  await expect(page.getByTestId('action-count')).toHaveText('2');
  await expect(page.getByRole('button', { name: 'Saving project record' })).toBeDisabled();
  await expect(page.getByText('Engineering review required')).toBeVisible();
  await expect(page.locator('[data-ui="page-header"]')).toHaveCount(1);
  await expect(page.locator('[data-ui="surface"]')).toHaveCount(4);
});

test('P5-API-01 tabs fields table preserve controlled semantics and table relationships', async ({ page }) => {
  await page.goto('/design-system');

  const overview = page.getByRole('tab', { name: 'Overview' });
  await overview.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Inputs' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('tab', { name: 'Inputs' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByLabel('Design flow rate')).toHaveAttribute('aria-describedby', /-description/);
  await expect(page.getByText('Required', { exact: true })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Engineering review data' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Revision' })).toBeVisible();
});

test('P5-API-01 dialog empty workflow supports Escape and ordered workflow semantics', async ({ page }) => {
  await page.goto('/design-system');
  await page.getByRole('button', { name: 'Open review dialog' }).click();
  await expect(page.getByRole('dialog', { name: 'Review calculation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Review calculation' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'No calculation record yet' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Engineering workflow' })).toHaveCount(1);
  await expect(page.getByRole('listitem')).toHaveCount(4);
});

test('P5-A11Y-01 P5-MOT-01 has no serious catalog violations and suppresses nonessential motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/design-system');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  const transition = await page.locator('.ax-button').first().evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(transition).toBe('0.001s');
});
