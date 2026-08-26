import { expect, test } from '@playwright/test';
import { assertNoBodyOverflow, runAxe } from './helpers/v8-migration';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/refresh')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'command-contract' }) });
    } else if (path.endsWith('/me')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        user: { id: 'user-command', name: 'Command Owner', email: 'command@example.com', status: 'active' },
        organization: { id: 'org-command', name: 'Command Organisation', slug: 'command-organisation' },
        roles: ['architect'], project_memberships: [], active_role: 'architect', permissions: ['projects.read'],
      }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
  });
});

test('matches the supplied V8 OS Command Centre structure and measured card geometry', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/?workspace=v8-command');
  await page.getByRole('navigation').getByRole('button', { name: 'Command Centre' }).click();

  const command = page.getByTestId('global-destination-command');
  await expect(command.getByRole('heading', { level: 1, name: 'Architex OS Command Centre' })).toBeVisible();
  await expect(command).toContainText('The global landing point for work across projects, tools, actions and feedback.');

  const cards = command.locator('[data-v8-command-card]');
  await expect(cards).toHaveCount(4);
  await expect(cards.first()).toContainText('Enter Faerie Glen Residential and work through the project’s single line of truth.');
  await expect(cards.nth(2)).toContainText('Browse 47 live and scaffolded capabilities.');

  const geometry = await cards.evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const icon = element.querySelector('.v8-command-card-icon')?.getBoundingClientRect();
    return {
      x: rect.x, y: rect.y, width: rect.width, height: rect.height,
      padding: style.padding, borderRadius: style.borderRadius,
      iconWidth: icon?.width, iconHeight: icon?.height,
    };
  }));
  expect(geometry[0].width).toBeGreaterThanOrEqual(390);
  expect(geometry[0].width).toBeLessThanOrEqual(420);
  expect(geometry[1].x - (geometry[0].x + geometry[0].width)).toBeCloseTo(14, 0);
  expect(geometry[2].y - (geometry[0].y + geometry[0].height)).toBeCloseTo(14, 0);
  expect(geometry.every(card => card.padding === '18px' && card.borderRadius === '15px')).toBe(true);
  expect(geometry.every(card => card.iconWidth === 38 && card.iconHeight === 38)).toBe(true);

  await assertNoBodyOverflow(page);
  await runAxe(page);
});
