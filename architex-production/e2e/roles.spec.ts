import { test, expect, Page } from '@playwright/test';

/**
 * Role dashboard integrity suite.
 * For every one of the 20 professional roles, walks the OS rail and verifies:
 *   - no page errors / uncaught exceptions
 *   - no console errors
 *   - the datum dashboard and each rail destination render
 */

const ALL_ROLE_KEYS = [
  'architect', 'client', 'bep', 'engineer', 'quantity_surveyor', 'town_planner',
  'land_surveyor', 'energy_professional', 'fire_engineer', 'cpm', 'contractor',
  'subcontractor', 'supplier', 'site_manager', 'health_safety', 'developer',
  'freelancer', 'firm_admin', 'admin', 'platform_admin',
];

const RAIL_ITEMS = [
  { id: 'command', label: 'Command Centre' },
  { id: 'projects', label: 'Project Space' },
  { id: 'tools', label: 'Workspace Tools' },
  { id: 'inbox', label: 'Inbox & Collaboration' },
  { id: 'documents', label: 'Documents' },
  { id: 'finance', label: 'Finance & Payments' },
  { id: 'knowledge', label: 'Knowledge & CPD' },
  { id: 'feedback', label: 'Feedback Intelligence' },
  { id: 'settings', label: 'Settings' },
];

interface CollectedErrors {
  pageErrors: string[];
  consoleErrors: string[];
}

function attachErrorCollectors(page: Page): CollectedErrors {
  const collected: CollectedErrors = { pageErrors: [], consoleErrors: [] };
  page.on('pageerror', (err) => collected.pageErrors.push(String(err.message || err)));
  page.on('console', (msg) => {
    // Filter out Next.js 15 dev-server cross-origin 403s — these are a
    // development environment artifact, not real app errors.
    const text = msg.text();
    if (msg.type() === 'error' && !text.includes('403 (Forbidden)')) {
      collected.consoleErrors.push(text);
    }
  });
  return collected;
}

test.describe('OS rail integrity across all 20 role dashboards', () => {
  for (const roleKey of ALL_ROLE_KEYS) {
    test(`role "${roleKey}": OS rail destinations render without errors`, async ({ page }) => {
      await page.goto('/');
      const errors = attachErrorCollectors(page);

      // Switch to the role under test
      await page.getByTestId('role-switcher').selectOption(roleKey);

      // 1) Project datum dashboard renders
      await expect(page.getByTestId('datum-canvas')).toBeVisible();
      await expect(page.getByTestId('role-switcher')).toHaveValue(roleKey);

      // 2) Every rail item opens a destination without errors
      for (const item of RAIL_ITEMS) {
        await page.getByRole('button', { name: new RegExp(item.label, 'i') }).first().click();
        await page.waitForTimeout(150);
        // The generic placeholder must never appear — every rail item is a real destination
        const body = await page.locator('body').innerText();
        expect(body.toLowerCase()).not.toContain('module active and synchronized');
        // Return to the datum for the next item
        await page.getByRole('button', { name: /Project Space/i }).first().click();
        await page.waitForTimeout(100);
      }

      // 3) Back on the datum, all assertions clean
      expect(errors.pageErrors, `page errors for ${roleKey}: ${errors.pageErrors.join(' | ')}`).toEqual([]);
      expect(errors.consoleErrors, `console errors for ${roleKey}: ${errors.consoleErrors.join(' | ')}`).toEqual([]);
    });
  }
});

test.describe('Role dashboard — datum tool cards resolve for every role', () => {
  for (const roleKey of ALL_ROLE_KEYS) {
    test(`role "${roleKey}": datum cards open tools without errors`, async ({ page }) => {
      await page.goto('/');
      const errors = attachErrorCollectors(page);
      await page.getByTestId('role-switcher').selectOption(roleKey);

      const cards = page.locator('[data-testid="datum-card"]');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < Math.min(count, 4); i++) {
        await cards.nth(i).click();
        await page.waitForTimeout(200);
        // A tool module shell renders
        await expect(page.locator('h1, header').first()).toBeVisible();
        // Return to the datum via the rail
        await page.getByRole('button', { name: /Project Space/i }).first().click();
        await page.waitForTimeout(250);
        await expect(page.getByTestId('datum-canvas')).toBeVisible();
      }

      expect(errors.pageErrors, `page errors for ${roleKey}: ${errors.pageErrors.join(' | ')}`).toEqual([]);
      expect(errors.consoleErrors, `console errors for ${roleKey}: ${errors.consoleErrors.join(' | ')}`).toEqual([]);
    });
  }
});
