import { expect, test } from '@playwright/test';

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
