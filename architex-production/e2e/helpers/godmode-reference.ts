import { expect, type Page } from '@playwright/test';

import type { GodModeShellRegion } from '../../lib/reference/godmode-shell-contract';

export interface RegionRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function collectRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console:${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page:${error.message}`));
  page.on('requestfailed', (request) => errors.push(`request:${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`));
  page.on('response', (response) => {
    if (response.status() >= 500) errors.push(`response:${response.status()} ${response.url()}`);
  });
  return { errors };
}

export async function installSessionApi(page: Page) {
  let sessionActive = false;
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/login')) {
      sessionActive = true;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'reference-shell-access' }) });
      return;
    }
    if (path.endsWith('/auth/refresh')) {
      await route.fulfill({
        status: sessionActive ? 200 : 401,
        contentType: 'application/json',
        body: JSON.stringify(sessionActive ? { access_token: 'reference-shell-refresh' } : { error: 'Unauthenticated' }),
      });
      return;
    }
    if (path.endsWith('/me')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        user: { id: 'user-reference-shell', name: 'Reference Shell Owner', email: 'owner@example.com', status: 'active' },
        organization: { id: 'org-reference-shell', name: 'Reference Organisation', slug: 'reference-organisation' },
        roles: ['organisation_admin'],
        project_memberships: [],
        active_role: 'organisation_admin',
        permissions: ['projects.read'],
      }) });
      return;
    }
    if (path.endsWith('/users')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ users: [] }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
}

export async function authenticateThroughSessionUi(page: Page) {
  await page.goto('/');
  const landing = page.getByRole('heading', { name: 'The Operating System for the Built Environment' });
  const restoredShell = page.getByTestId('role-switcher');
  await expect(landing.or(restoredShell)).toBeVisible({ timeout: 30_000 });
  if (await restoredShell.isVisible()) return;
  const signIn = page.getByRole('button', { name: 'Sign in' }).first();
  if (await signIn.isVisible()) {
    await signIn.click();
  } else {
    const datumStage = page.locator('#datumStage');
    const rectangle = await datumStage.boundingBox();
    if (!rectangle) throw new Error('Public datum sign-in path is unavailable');
    await page.mouse.move(rectangle.x + rectangle.width * 0.93, rectangle.y + rectangle.height * 0.52);
    const datumAction = page.locator('#datumPointerCta');
    await expect(datumAction).toContainText('Sign In');
    await datumAction.click();
  }
  await page.getByLabel('Email address').fill('owner@example.com');
  await page.getByLabel('Password').fill('reference shell password');
  await page.getByRole('button', { name: 'Enter workspace' }).click();
  await expect(page.getByTestId('role-switcher')).toBeVisible({ timeout: 30_000 });
}

export async function measureRegion(page: Page, region: GodModeShellRegion): Promise<RegionRectangle | null> {
  return page.locator(`[data-v8-region="${region}"]`).boundingBox();
}

export async function computedStyleSnapshot(page: Page, region: GodModeShellRegion) {
  return page.locator(`[data-v8-region="${region}"]`).evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      borderRightColor: style.borderRightColor,
      borderLeftColor: style.borderLeftColor,
      borderBottomColor: style.borderBottomColor,
      boxShadow: style.boxShadow,
      fontFamily: style.fontFamily,
    };
  });
}

export async function expectReferenceRect(
  label: string,
  actual: RegionRectangle | null,
  expected: RegionRectangle,
  tolerance = 1,
) {
  expect(actual, `${label} rectangle`).not.toBeNull();
  for (const key of ['x', 'y', 'width', 'height'] as const) {
    expect(Math.abs(actual![key] - expected[key]), `${label}.${key}`).toBeLessThanOrEqual(tolerance);
  }
}

export async function expectNoBodyOverflow(page: Page) {
  expect(await page.evaluate(() => document.body.scrollWidth <= document.body.clientWidth), 'body horizontal overflow').toBe(true);
}

export async function visibleRegionOrder(page: Page): Promise<GodModeShellRegion[]> {
  return page.locator('[data-v8-region]').evaluateAll((nodes) => nodes
    .filter((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    })
    .map((node) => node.getAttribute('data-v8-region') as GodModeShellRegion));
}
