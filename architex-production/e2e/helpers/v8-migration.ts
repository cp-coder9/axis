import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

export const VIEWPORTS = {
  desktop: { width: 1440, height: 1000 },
  tablet: { width: 1024, height: 1366 },
  mobile: { width: 390, height: 844 },
} as const;

export async function openMigratedTool(page: Page, id: string) {
  await page.goto('/?workspace=v8');
  await page.getByTestId('mode-standalone').click();
  const target = page.getByTestId(`tool-${id}`);
  await target.scrollIntoViewIfNeeded();
  await target.click();
}

export async function assertNoBodyOverflow(page: Page) {
  expect(await page.evaluate(() => document.body.scrollWidth <= document.body.clientWidth)).toBe(true);
}

export async function assertFontReadiness(page: Page) {
  expect(await page.evaluate(() => document.fonts.status)).toBe('loaded');
}

export async function runAxe(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  expect(blocking).toEqual([]);
}

export async function assertReducedMotion(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('body').evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe('auto');
}
