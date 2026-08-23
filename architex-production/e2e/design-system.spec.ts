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
