import { expect, Page, test } from '@playwright/test';
import { VIEWPORTS, assertFontReadiness, assertNoBodyOverflow, runAxe } from './helpers/v8-migration';

async function restoreAuthenticatedShell(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/refresh')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'shell-access' }) });
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

test('workspace theme top bar control toggles the dashboard to dark mode', async ({ page }) => {
  await restoreAuthenticatedShell(page);
  await page.goto('/?workspace=v8');
  const toggle = page.getByTestId('workspace-theme-toggle');
  await expect(toggle).toHaveAccessibleName('Switch colour theme');
  await expect(toggle).toContainText('Dark');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html[data-theme="dark"]')).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle).toContainText('Light');
  await page.reload();
  await expect(page.getByTestId('workspace-theme-toggle')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('workspace-theme-toggle')).toContainText('Light');
});

test('P6-NAV-01 shell baseline preserves role control and responsive overflow contract', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.desktop);
  await page.goto('/?workspace=v8');
  await expect(page.getByTestId('role-switcher')).toBeVisible();
  await assertFontReadiness(page);
  await assertNoBodyOverflow(page);
  await runAxe(page);
});

test('P6-NAV-01 mobile context drawer opens, traps focus, and restores its trigger', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');

  const trigger = page.getByRole('button', { name: 'Open context navigation' });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const drawer = page.getByRole('dialog', { name: 'Context navigation' });
  await expect(drawer).toBeVisible();
  await expect(drawer).toBeFocused();

  const lastDrawerControl = drawer.locator('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])').last();
  await page.keyboard.press('Shift+Tab');
  await expect(lastDrawerControl).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await assertNoBodyOverflow(page);
});

test('P6-NAV-01 mobile inspector drawer exposes its existing contextual content', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');

  const trigger = page.getByRole('button', { name: 'Open context inspector' });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const drawer = page.getByRole('dialog', { name: 'Context inspector' });
  await expect(drawer).toContainText('Project Context');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('P6-NAV-01 mobile global drawer preserves the selected destination transition', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');

  await page.getByRole('button', { name: 'Open global navigation' }).click();
  const drawer = page.getByRole('dialog', { name: 'Global navigation' });
  await expect(drawer).toContainText('Global OS Rail');
  await drawer.getByRole('button', { name: 'Project Space Datum' }).click();

  await expect(drawer).toBeHidden();
  await expect(page.getByTestId('datum-canvas')).toBeVisible();
  await assertNoBodyOverflow(page);
});

test('P6-NAV-01 tablet context drawer keeps the desktop workspace unobscured until opened', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.tablet);
  await page.goto('/?workspace=v8');

  const trigger = page.getByRole('button', { name: 'Open context navigation' });
  await expect(trigger).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Context navigation' })).toBeHidden();
  await expect(page.getByTestId('datum-canvas')).toBeVisible();

  await trigger.click();
  await expect(page.getByRole('dialog', { name: 'Context navigation' })).toBeVisible();
  await assertNoBodyOverflow(page);
});

test('P6-W0-SYS feedback shortcut opens a named dialog and restores its trigger', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');

  const trigger = page.getByRole('button', { name: 'Open feedback intelligence' });
  await trigger.focus();
  await page.keyboard.press('Control+Shift+F');

  const dialog = page.getByRole('dialog', { name: 'Send Feedback' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByPlaceholder('Describe the issue, idea, or compliance friction...')).toBeFocused();

  const recordsTab = dialog.getByRole('tab', { name: /My Feedback/ });
  await recordsTab.click();
  await expect(recordsTab).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('P6-W0-SYS feedback tabs retain their existing record state and keyboard navigation', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');
  await page.getByRole('button', { name: 'Open feedback intelligence' }).click();
  const dialog = page.getByRole('dialog', { name: 'Send Feedback' });
  const submitTab = dialog.getByRole('tab', { name: 'Submit Feedback' });
  const recordsTab = dialog.getByRole('tab', { name: /My Feedback/ });
  await submitTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(recordsTab).toBeFocused();
  await recordsTab.click();
  await expect(recordsTab).toHaveAttribute('aria-selected', 'true');
});

test('P6-W0-SYS not-found keeps a landmark and recovery action at mobile width', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/missing-datum-record');

  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { name: 'Resource Not Found' })).toBeVisible();
  await expect(main.getByRole('link', { name: 'Return to Project Datum' })).toHaveAttribute('href', '/');
  await assertNoBodyOverflow(page);
});

test('P6-W0-GLOBAL Datum renders the existing tool order as a mobile sequence', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');

  const sequence = page.getByTestId('datum-mobile-sequence');
  await expect(sequence).toBeVisible();
  await expect(sequence.getByTestId('datum-mobile-tool')).toHaveCount(8);
  await sequence.getByTestId('datum-mobile-tool').first().click();
  await expect(page.getByRole('heading', { name: 'Practice & Project Command Centre' })).toBeVisible();
  await assertNoBodyOverflow(page);
});

test('P6-W0-GLOBAL Tool Registry exposes its existing search control at mobile width', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');
  await page.getByRole('button', { name: 'Open global navigation' }).click();
  await page.getByRole('dialog', { name: 'Global navigation' }).getByRole('button', { name: 'Workspace Tools 47' }).click();
  await expect(page.getByRole('searchbox', { name: 'Search workspace tools' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Practice Management/ })).toBeVisible();
});

test('P6-W0-GLOBAL Tool Registry exposes the existing live filter state', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');
  await page.getByRole('button', { name: 'Open global navigation' }).click();
  await page.getByRole('dialog', { name: 'Global navigation' }).getByRole('button', { name: 'Workspace Tools 47' }).click();

  const allFilter = page.getByRole('button', { name: /All \(47\)/ });
  const liveFilter = page.getByRole('button', { name: /Live \(\d+\)/ });
  await expect(allFilter).toHaveAttribute('aria-pressed', 'true');
  await expect(liveFilter).toHaveAttribute('aria-pressed', 'false');

  await liveFilter.click();
  await expect(liveFilter).toHaveAttribute('aria-pressed', 'true');
  await expect(allFilter).toHaveAttribute('aria-pressed', 'false');
});

test('P6-W0-GLOBAL Settings exposes the existing selected configuration tab', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');
  await page.getByRole('button', { name: 'Open global navigation' }).click();
  await page.getByRole('dialog', { name: 'Global navigation' }).getByRole('button', { name: 'Settings' }).click();

  const tablist = page.getByRole('tablist', { name: 'Settings sections' });
  const usersTab = tablist.getByRole('tab', { name: 'User Management' });
  const organisationTab = tablist.getByRole('tab', { name: 'Organisation' });
  await expect(usersTab).toHaveAttribute('aria-selected', 'true');
  await expect(organisationTab).toHaveAttribute('aria-selected', 'false');

  await organisationTab.click();
  await expect(organisationTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Organisation' })).toContainText('Organisation Profile');

  await organisationTab.focus();
  await page.keyboard.press('ArrowRight');
  const securityTab = tablist.getByRole('tab', { name: 'Security & RBAC' });
  await expect(securityTab).toHaveAttribute('aria-selected', 'true');
  await expect(securityTab).toBeFocused();
});

test('P6-GOD-01 God Mode exposes the existing selected role lens', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');
  await page.getByRole('button', { name: 'Explore the entire Architex ecosystem' }).click();

  const lenses = page.getByRole('group', { name: 'Role lenses' });
  const architect = lenses.getByRole('button', { name: /Architect/ });
  const contractor = lenses.getByRole('button', { name: /Contractor/ });
  await expect(architect).toHaveAttribute('aria-pressed', 'true');
  await expect(contractor).toHaveAttribute('aria-pressed', 'false');

  await contractor.click();
  await expect(contractor).toHaveAttribute('aria-pressed', 'true');
  await expect(architect).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByText(/Demo lens: Contractor/)).toBeVisible();
});

test('P6-GOD-01 shell exposes the existing God Mode toggle state', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');

  const enterGodMode = page.getByRole('button', { name: 'Explore the entire Architex ecosystem' });
  await expect(enterGodMode).toHaveAttribute('aria-pressed', 'false');
  await enterGodMode.click();

  const exitGodMode = page.getByRole('button', { name: 'Exit God Mode' });
  await expect(exitGodMode).toHaveAttribute('aria-pressed', 'true');
  await exitGodMode.click();
  await expect(page.getByRole('button', { name: 'Explore the entire Architex ecosystem' })).toHaveAttribute('aria-pressed', 'false');
});

test('P6-GOD-01 God Mode preserves the existing lifecycle-stage action', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');
  await page.getByRole('button', { name: 'Explore the entire Architex ecosystem' }).click();
  await page.getByRole('button', { name: 'Brief' }).click();

  await expect(page.getByTestId('datum-canvas')).toBeVisible();
  await expect(page.getByText('Brief')).toBeVisible();
  await assertNoBodyOverflow(page);
});

test('P6-W0-GLOBAL Tool Registry preserves search and status filtering', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');
  await page.getByRole('button', { name: 'Open global navigation' }).click();
  await page.getByRole('dialog', { name: 'Global navigation' }).getByRole('button', { name: 'Workspace Tools 47' }).click();

  await page.getByRole('searchbox', { name: 'Search workspace tools' }).fill("Engineer's Calculation Hub");
  await expect(page.getByRole('button', { name: /Engineer's Calculation Hub/ })).toBeVisible();

  await page.getByRole('button', { name: /Scaffold \(\d+\)/ }).click();
  await expect(page.getByRole('button', { name: /Engineer's Calculation Hub/ })).toBeHidden();
  await assertNoBodyOverflow(page);
});

test('P6-W0-GLOBAL Command destination preserves its existing card action', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');
  await page.getByRole('button', { name: 'Open global navigation' }).click();
  await page.getByRole('dialog', { name: 'Global navigation' }).getByRole('button', { name: /Command Centre/ }).click();

  await page.getByRole('button', { name: /Practice & Command Centre/ }).click();
  await expect(page.getByRole('heading', { name: 'Practice & Project Command Centre' })).toBeVisible();
  await assertNoBodyOverflow(page);
});

test('P6-W0-GLOBAL User Management preserves the admin invite-panel toggle', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?workspace=v8');
  await page.getByRole('combobox', { name: 'Active role' }).selectOption('platform_admin');
  await page.getByRole('button', { name: 'Open global navigation' }).click();
  await page.getByRole('dialog', { name: 'Global navigation' }).getByRole('button', { name: 'Settings' }).click();

  const invite = page.getByRole('button', { name: 'Invite user' });
  await invite.click();
  await expect(page.getByPlaceholder('e.g. Naledi Mokoena')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByPlaceholder('e.g. Naledi Mokoena')).toBeHidden();
});

test('P6-W0-GLOBAL Datum desktop plane preserves its first card action', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.desktop);
  await page.goto('/?workspace=v8');
  await page.getByTestId('datum-card').first().click();

  await expect(page.getByRole('heading', { name: 'Practice & Project Command Centre' })).toBeVisible();
});
