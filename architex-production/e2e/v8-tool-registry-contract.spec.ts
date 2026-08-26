import { expect, test } from '@playwright/test';
import { ALL_TOOLS } from '../lib/data';
import { assertNoBodyOverflow, runAxe } from './helpers/v8-migration';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/**', async route => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.endsWith('/auth/refresh')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'registry-contract' }) });
    } else if (pathname.endsWith('/me')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        user: { id: 'registry-user', name: 'Registry Architect', email: 'registry@example.com', status: 'active' },
        organization: { id: 'registry-org', name: 'Registry Practice', slug: 'registry-practice' },
        roles: ['architect'], project_memberships: [], active_role: 'architect', permissions: ['projects.read'],
      }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
  });
});

async function openRegistry(page: import('@playwright/test').Page) {
  await page.goto('/?workspace=v8-registry', { waitUntil: 'domcontentloaded' });
  await page.getByRole('navigation').getByRole('button', { name: 'Workspace Tools' }).click();
  await page.getByTestId('v8-tool-registry').waitFor();
}

test('matches the V8 grouped compact registry contract and preserves navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await openRegistry(page);

  const registry = page.getByTestId('v8-tool-registry');
  await expect(registry.getByRole('heading', { level: 1, name: 'Workspace Tool Registry' })).toBeVisible();
  await expect(registry.getByRole('heading', { level: 2, name: 'Complete workspace tool registry' })).toBeVisible();
  await expect(registry.locator('[data-v8-registry-tool]')).toHaveCount(47);

  const firstGrid = registry.locator('.v8-registry-grid').first();
  const firstTool = registry.locator('[data-v8-registry-tool]').first();
  const styles = await firstTool.evaluate(element => {
    const style = getComputedStyle(element);
    const gridStyle = getComputedStyle(element.parentElement!);
    return {
      padding: style.padding,
      radius: style.borderRadius,
      display: style.display,
      gap: style.gap,
      gridGap: gridStyle.gap,
      gridColumns: gridStyle.gridTemplateColumns,
    };
  });
  expect(styles).toMatchObject({ padding: '12px', radius: '13px', display: 'flex', gap: '11px', gridGap: '10px' });
  expect(styles.gridColumns.split(' ').length).toBeGreaterThanOrEqual(3);
  await expect(firstGrid).toBeVisible();

  await firstTool.focus();
  await expect(firstTool).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: Object.values(ALL_TOOLS)[0].name })).toBeVisible();

  await page.getByRole('button', { name: /Back to (workspace tools|standalone (library|registry))/i }).click();
  await page.getByRole('button', { name: 'Open project orientation' }).click();
  await expect(page.getByTestId('datum-canvas')).toBeVisible();
  await assertNoBodyOverflow(page);
  await runAxe(page);
});

test('collapses the compact registry without page overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?workspace=v8-registry-mobile', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Open global navigation' }).click();
  await page.getByRole('dialog', { name: 'Global navigation' }).getByRole('button', { name: /Workspace Tools/ }).click();
  await page.getByTestId('v8-tool-registry').waitFor();
  await expect(page.getByTestId('v8-tool-registry').locator('[data-v8-registry-tool]')).toHaveCount(47);
  await assertNoBodyOverflow(page);
});
