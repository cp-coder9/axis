import { expect, type Page, test } from '@playwright/test';
import { V8_PROJECT_DATUM_CONTRACT } from '../lib/v8-project-datum-contract';
import { assertNoBodyOverflow, runAxe } from './helpers/v8-migration';

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

  const pageIcon = await page.locator('.v8-datum-page-icon').boundingBox();
  expect(pageIcon).not.toBeNull();
  for (const key of ['x', 'y', 'width', 'height'] as const) {
    expect(Math.abs(pageIcon![key] - V8_PROJECT_DATUM_CONTRACT.details.pageIcon[key]), `pageIcon.${key}`).toBeLessThanOrEqual(1);
  }

  for (const [index, expected] of V8_PROJECT_DATUM_CONTRACT.details.actions.entries()) {
    const actual = await page.locator('[data-v8-datum-action]').nth(index).boundingBox();
    expect(actual).not.toBeNull();
    expect(await page.locator('[data-v8-datum-action]').nth(index).getAttribute('data-v8-datum-action')).toBe(expected.id);
    for (const key of ['x', 'y', 'width', 'height'] as const) {
      expect(Math.abs(actual![key] - expected.rectangle[key]), `action.${expected.id}.${key}`).toBeLessThanOrEqual(1);
    }
  }

  const roleAvatar = page.locator('.v8-role-avatar');
  await expect(roleAvatar).toHaveText(V8_PROJECT_DATUM_CONTRACT.details.roleAvatar.text);
  const roleAvatarBox = await roleAvatar.boundingBox();
  expect(roleAvatarBox).not.toBeNull();
  for (const key of ['x', 'y', 'width', 'height'] as const) {
    expect(Math.abs(roleAvatarBox![key] - V8_PROJECT_DATUM_CONTRACT.details.roleAvatar.rectangle[key]), `roleAvatar.${key}`).toBeLessThanOrEqual(1);
  }

  await expect(page.locator('.v8-project-top h2')).toHaveCSS('font-weight', V8_PROJECT_DATUM_CONTRACT.details.projectTitleFontWeight);
  const datumCards = page.getByTestId('v8-datum-card');
  await expect(datumCards).toHaveCount(V8_PROJECT_DATUM_CONTRACT.details.datumCards.length);
  for (const [index, expected] of V8_PROJECT_DATUM_CONTRACT.details.datumCards.entries()) {
    const actual = await datumCards.nth(index).boundingBox();
    expect(actual).not.toBeNull();
    for (const key of ['x', 'y', 'width'] as const) {
      expect(Math.abs(actual![key] - expected[key]), `datumCard.${index}.${key}`).toBeLessThanOrEqual(1);
    }
  }

  await expect(page.locator('.v8-datum-page-title h1')).toHaveCSS('font-size', V8_PROJECT_DATUM_CONTRACT.computedStyles.pageTitle.fontSize);
  await expect(page.locator('.v8-role-banner')).toHaveCSS('border-radius', V8_PROJECT_DATUM_CONTRACT.computedStyles.roleBanner.borderRadius);
  await expect(page.locator('.v8-project-hero')).toHaveCSS('border-radius', V8_PROJECT_DATUM_CONTRACT.computedStyles.projectHero.borderRadius);
  await expect(page.locator('.v8-stage').first()).toHaveCSS('font-size', V8_PROJECT_DATUM_CONTRACT.computedStyles.stage.fontSize);
  await expect(page.locator('.v8-stage.is-active i')).toHaveCSS('background-color', V8_PROJECT_DATUM_CONTRACT.computedStyles.activeStage.backgroundColor);
  await expect(page.locator('.v8-datum-line')).toHaveCSS('height', '2px');
  await expect(page.locator('.v8-datum-card').first()).toHaveCSS('border-radius', V8_PROJECT_DATUM_CONTRACT.computedStyles.datumCard.borderRadius);
});

test('preserves stage, tool, zoom, theme, mobile order, and accessibility behavior', async ({ page }) => {
  await restoreAuthenticatedShell(page);
  await page.setViewportSize(V8_PROJECT_DATUM_CONTRACT.viewport);
  await page.goto('/?workspace=v8');
  await expect(page.getByTestId('datum-canvas')).toBeVisible();

  await page.getByRole('button', { name: 'Comply' }).click();
  await expect(page.getByRole('button', { name: 'Comply' })).toHaveAttribute('aria-current', 'step');

  const firstCard = page.getByTestId('v8-datum-card').first();
  const firstToolId = await firstCard.getAttribute('data-tool-id');
  await firstCard.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('datum-canvas')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Back to Datum Project Space' })).toBeVisible();
  expect(firstToolId).not.toBeNull();

  await page.getByRole('button', { name: 'Back to Datum Project Space' }).click();
  await expect(page.getByTestId('datum-canvas')).toBeVisible();

  await page.getByRole('slider', { name: 'Datum canvas zoom' }).fill('1.15');
  await expect(page.getByText('115%', { exact: true })).toBeVisible();

  await page.getByTestId('workspace-theme-toggle').click();
  await expect(page.locator('html[data-theme="dark"]')).toBeVisible();
  await expect(page.locator('.v8-project-hero')).toHaveCSS('background-color', 'rgb(20, 38, 48)');

  const desktopOrder = await page.getByTestId('v8-datum-card').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-tool-id')),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.v8-datum-viewport')).toBeHidden();
  await expect(page.getByTestId('v8-datum-sequence-item')).toHaveCount(desktopOrder.length);
  const mobileOrder = await page.getByTestId('v8-datum-sequence-item').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-tool-id')),
  );
  expect(mobileOrder).toEqual(desktopOrder);

  await runAxe(page);
  await assertNoBodyOverflow(page);
});
