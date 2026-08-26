import { expect, Page, test } from '@playwright/test';
import { V8_SHELL_CONTRACT } from '../lib/v8-shell-contract';

const normalizeBackgroundImage = (value: string) => value
  .replaceAll(' 0px,', ' 0,')
  .replaceAll(' 0%,', ' 0,');

async function restoreAuthenticatedShell(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/refresh')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'shell-contract-access' }) });
    } else if (path.endsWith('/me')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        user: { id: 'user-shell', name: 'Shell Owner', email: 'shell@example.com', status: 'active' },
        organization: { id: 'org-shell', name: 'Shell Organisation', slug: 'shell-organisation' },
        roles: ['organisation_admin'], project_memberships: [], active_role: 'organisation_admin', permissions: ['projects.read'],
      }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
  });
}

test('matches the supplied reference desktop shell contract', async ({ page }) => {
  await restoreAuthenticatedShell(page);
  await page.setViewportSize(V8_SHELL_CONTRACT.viewports.desktop.viewport);
  await page.goto('/');
  await expect(page.getByTestId('role-switcher')).toBeVisible({ timeout: 30_000 });

  const expected = V8_SHELL_CONTRACT.viewports.desktop.regions;
  for (const [name, rectangle] of Object.entries(expected)) {
    expect(rectangle).not.toBeNull();
    const actual = await page.locator(`[data-v8-region="${name}"]`).boundingBox();
    expect(actual, `${name} rectangle`).not.toBeNull();
    for (const key of ['x', 'y', 'width', 'height'] as const) {
      expect(Math.abs(actual![key] - rectangle![key]), `${name}.${key}`).toBeLessThanOrEqual(1);
    }
  }

  const controls = await page.locator('[data-v8-region="topbar"] [data-v8-control]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-v8-control')));
  expect(controls).toEqual(V8_SHELL_CONTRACT.referenceControlOrder);
  for (const control of V8_SHELL_CONTRACT.referenceControlOrder) {
    const hitTested = await page.locator(`[data-v8-control="${control}"]`).evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return hit !== null && (node === hit || node.contains(hit));
    });
    expect(hitTested, `${control} is not clipped`).toBe(true);
  }

  for (const name of ['rail', 'navigator', 'topbar', 'canvas', 'inspector'] as const) {
    const expectedStyle = V8_SHELL_CONTRACT.regionStyles[name]!;
    const actualStyle = await page.locator(`[data-v8-region="${name}"]`).evaluate((node) => {
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
    expect({
      ...actualStyle,
      backgroundImage: normalizeBackgroundImage(actualStyle.backgroundImage),
    }, `${name} computed style`).toEqual({
      ...expectedStyle,
      backgroundImage: normalizeBackgroundImage(expectedStyle.backgroundImage),
    });
  }
});

test('matches the supplied reference tablet regions', async ({ page }) => {
  await restoreAuthenticatedShell(page);
  await page.setViewportSize(V8_SHELL_CONTRACT.viewports.tablet.viewport);
  await page.goto('/');
  await expect(page.getByTestId('role-switcher')).toBeVisible({ timeout: 30_000 });

  for (const name of ['rail', 'navigator', 'topbar', 'canvas'] as const) {
    const expected = V8_SHELL_CONTRACT.viewports.tablet.regions[name]!;
    const actual = await page.locator(`[data-v8-region="${name}"]`).boundingBox();
    expect(actual, `${name} rectangle`).not.toBeNull();
    for (const key of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(actual![key] - expected[key]), `${name}.${key}`).toBeLessThanOrEqual(1);
  }
  await expect(page.locator('[data-v8-region="inspector"]')).toHaveCount(0);
});

test('preserves the usable reference mobile rail and canvas', async ({ page }) => {
  await restoreAuthenticatedShell(page);
  await page.setViewportSize(V8_SHELL_CONTRACT.viewports.mobile.viewport);
  await page.goto('/');
  await expect(page.getByTestId('role-switcher')).toBeVisible({ timeout: 30_000 });

  await expect(page.locator('[data-v8-region="rail"]')).toHaveCSS('width', '74px');
  await expect(page.locator('[data-v8-region="navigator"]')).toHaveCount(0);
  await expect(page.locator('[data-v8-region="inspector"]')).toHaveCount(0);
  expect(await page.locator('[data-v8-region="canvas"]').boundingBox()).toMatchObject({ x: 74, y: 66, width: 316, height: 778 });
  expect(await page.locator('[data-v8-region="topbar"]').boundingBox()).toMatchObject({ x: 74, y: 0, width: 316, height: 66 });
});
