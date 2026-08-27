import { expect, test } from '@playwright/test';

import { GODMODE_SHELL_CONTRACT } from '../lib/reference/godmode-shell-contract';
import {
  authenticateThroughSessionUi,
  collectRuntimeErrors,
  expectNoBodyOverflow,
  expectReferenceRect,
  installSessionApi,
  measureRegion,
  visibleRegionOrder,
} from './helpers/godmode-reference';

const VIEWPORTS = [
  { width: 1600, height: 1000 },
  { width: 1024, height: 768 },
  { width: 700, height: 900 },
  { width: 390, height: 844 },
] as const;

test.describe.serial('sole-reference V8 shell parity', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}x${viewport.height} preserves reference regions and overflow`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await installSessionApi(page);
      await authenticateThroughSessionUi(page);
      const runtime = collectRuntimeErrors(page);

      const expectedOrder = GODMODE_SHELL_CONTRACT.regionOrder.filter((region) =>
        !((region === 'navigator' && viewport.width <= 760) || (region === 'inspector' && viewport.width <= 1400)),
      );
      expect(await visibleRegionOrder(page)).toEqual(expectedOrder);
      await expectReferenceRect('rail', await measureRegion(page, 'rail'), {
        x: 0, y: 0, width: GODMODE_SHELL_CONTRACT.geometry.rail, height: viewport.height,
      });
      await expectReferenceRect('topbar', await measureRegion(page, 'topbar'), {
        x: viewport.width <= 760 ? 74 : 380,
        y: 0,
        width: viewport.width <= 760 ? viewport.width - 74 : viewport.width - 380,
        height: GODMODE_SHELL_CONTRACT.geometry.topbar,
      });
      await expectNoBodyOverflow(page);
      expect(runtime.errors).toEqual([]);
    });
  }

  test('desktop certifies theme, registry, tool, role lens, and God Mode workflows', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS[0]);
    await installSessionApi(page);
    await authenticateThroughSessionUi(page);
    const runtime = collectRuntimeErrors(page);

    const theme = page.getByTestId('workspace-theme-toggle');
    await theme.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-theme="dark"]').first()).toBeVisible();
    await page.reload();
    await expect(theme).toHaveAttribute('aria-pressed', 'true');

    await page.getByTitle('Workspace Tools', { exact: true }).click();
    const registry = page.getByTestId('v8-tool-registry');
    await expect(registry.locator('[data-v8-registry-tool]')).toHaveCount(47);
    await registry.locator('[data-tool-id="specforge"]').click();
    await expect(page.getByRole('heading', { name: 'SpecForge V2', exact: true })).toBeVisible();

    await page.getByTestId('god-mode-toggle').click();
    await expect(page.getByRole('heading', { name: /God Mode.*Ecosystem Explorer/ })).toBeVisible();
    await page.getByTestId('role-switcher').selectOption('architect');
    await page.getByRole('button', { name: /^1\s+Brief$/ }).click();
    await expect(page.getByTestId('god-mode-datum')).toHaveText('Brief exploration');
    await page.getByTitle('Exit God Mode').click();
    await expect(page.getByTestId('role-switcher')).toHaveValue('organisation_admin');
    await expectNoBodyOverflow(page);
    expect(runtime.errors).toEqual([]);
  });

  test('reduced motion keeps keyboard navigation usable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize(VIEWPORTS[2]);
    await installSessionApi(page);
    await authenticateThroughSessionUi(page);
    const trigger = page.getByRole('button', { name: 'Open context navigation' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Context navigation' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await expectNoBodyOverflow(page);
  });
});
