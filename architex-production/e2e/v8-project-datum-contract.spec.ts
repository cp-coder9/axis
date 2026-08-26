import { expect, type Page, test } from '@playwright/test';
import { V8_PROJECT_DATUM_CONTRACT } from '../lib/v8-project-datum-contract';

async function restoreAuthenticatedShell(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/refresh')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'datum-access' }) });
      return;
    }
    if (path.endsWith('/me')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        user: { id: 'user-datum', name: 'Datum Architect', email: 'architect@architex.co.za', status: 'active' },
        organization: { id: 'org-datum', name: 'Architex Studio', slug: 'architex-studio' },
        roles: ['architect'], project_memberships: [], active_role: 'architect', permissions: ['projects.read'],
      }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
}

const regionAttribute = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

test('matches the extracted V8 Project Datum geometry and computed styles', async ({ page }) => {
  await restoreAuthenticatedShell(page);
  await page.setViewportSize(V8_PROJECT_DATUM_CONTRACT.viewport);
  await page.goto('/?workspace=v8');
  await expect(page.getByTestId('datum-canvas')).toBeVisible();

  for (const [name, expected] of Object.entries(V8_PROJECT_DATUM_CONTRACT.regions)) {
    const actual = await page.locator(`[data-v8-datum-region="${regionAttribute(name)}"]`).boundingBox();
    expect(actual, `${name} must exist`).not.toBeNull();
    for (const key of ['x', 'y', 'width', 'height'] as const) {
      expect.soft(Math.abs(actual![key] - expected[key]), `${name}.${key}`).toBeLessThanOrEqual(1);
    }
  }

  const actionOrder = await page.locator('[data-v8-datum-action]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-v8-datum-action')),
  );
  expect(actionOrder).toEqual(V8_PROJECT_DATUM_CONTRACT.controlOrder);

  await expect(page.locator('.v8-datum-page-title h1')).toHaveCSS('font-size', V8_PROJECT_DATUM_CONTRACT.computedStyles.pageTitle.fontSize);
  await expect(page.locator('.v8-role-banner')).toHaveCSS('border-radius', V8_PROJECT_DATUM_CONTRACT.computedStyles.roleBanner.borderRadius);
  await expect(page.locator('.v8-project-hero')).toHaveCSS('border-radius', V8_PROJECT_DATUM_CONTRACT.computedStyles.projectHero.borderRadius);
  await expect(page.locator('.v8-stage').first()).toHaveCSS('font-size', V8_PROJECT_DATUM_CONTRACT.computedStyles.stage.fontSize);
  await expect(page.locator('.v8-stage.is-active i')).toHaveCSS('background-color', V8_PROJECT_DATUM_CONTRACT.computedStyles.activeStage.backgroundColor);
  await expect(page.locator('.v8-datum-line')).toHaveCSS('height', '2px');
  await expect(page.locator('.v8-datum-card').first()).toHaveCSS('border-radius', V8_PROJECT_DATUM_CONTRACT.computedStyles.datumCard.borderRadius);
});
