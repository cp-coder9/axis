import { expect, test } from '@playwright/test';
import { VIEWPORTS, assertNoBodyOverflow } from './helpers/v8-migration';

async function openStandaloneTool(page: import('@playwright/test').Page, toolId: string) {
  await page.goto('/?workspace=v8');
  await page.getByTestId('mode-standalone').click();
  await page.getByTestId(`tool-${toolId}`).click();
}

test.describe('P6-BEH-01 frozen V8 workflow contracts', () => {
  test('preserves rail destinations, mode changes, role changes, and project creation entry', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/?workspace=v8');

    await page.getByTestId('role-switcher').selectOption('platform_admin');
    await expect(page.getByTestId('role-switcher')).toHaveValue('platform_admin');

    await page.getByRole('button', { name: /Workspace Tools/ }).first().click();
    await expect(page.getByRole('heading', { name: 'Workspace Tool Registry' })).toBeVisible();

    await page.getByTestId('mode-project').click();
    await expect(page.getByRole('combobox', { name: 'Active project' })).toBeVisible();
    await page.getByTestId('add-project').click();
    await expect(page.getByPlaceholder('Project name')).toBeVisible();
    await expect(page.getByTestId('add-project-submit')).toHaveText('Create project');

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByPlaceholder('Project name')).toBeHidden();
    await assertNoBodyOverflow(page);
  });

  test('preserves Tool Registry search, filters, open, and return path', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/?workspace=v8');
    await page.getByRole('button', { name: /Workspace Tools/ }).first().click();

    const search = page.getByRole('searchbox', { name: 'Search workspace tools' });
    await search.fill("Engineer's Calculation Hub");
    await page.locator('main').getByRole('button', { name: /Engineer's Calculation Hub/ }).click();
    await expect(page.getByTestId('engineering-calculation')).toBeVisible();

    await page.getByRole('button', { name: /Back to Standalone Registry/ }).click();
    await expect(search).toBeVisible();
    await page.getByRole('button', { name: /All \(47\)/ }).click();
    await expect(page.getByRole('button', { name: /Live \(47\)/ })).toBeVisible();
  });

  test('preserves God Mode toggle, role lens, and Datum stage return', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/?workspace=v8');
    await page.getByRole('button', { name: 'Explore the entire Architex ecosystem' }).click();

    const lenses = page.getByRole('group', { name: 'Role lenses' });
    await lenses.getByRole('button', { name: /Contractor/ }).click();
    await expect(page.getByText('Demo lens: Contractor')).toBeVisible();

    await page.getByRole('button', { name: 'Brief' }).click();
    await expect(page.getByTestId('datum-canvas')).toBeVisible();
    await assertNoBodyOverflow(page);
  });

  test('preserves feedback category, validation, and locally captured submit fallback', async ({ page }) => {
    await page.route('**/api/v1/feedback', (route) => route.abort('failed'));
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/?workspace=v8');
    await page.getByRole('button', { name: 'Open feedback intelligence' }).click();

    const dialog = page.getByRole('dialog', { name: 'Send Feedback' });
    await dialog.getByRole('button', { name: 'Usability Friction' }).click();
    await dialog.getByRole('button', { name: 'Submit with Workspace Context' }).click();
    await expect(page.getByText('Please enter at least 10 characters.')).toBeVisible();

    const description = 'The migration behavior suite keeps feedback visible when the API is unavailable.';
    await dialog.getByPlaceholder('Describe the issue, idea, or compliance friction...').fill(description);
    await dialog.getByRole('button', { name: 'Submit with Workspace Context' }).click();
    await expect(dialog).toBeHidden();

    await page.getByRole('button', { name: 'Open feedback intelligence' }).click();
    await dialog.getByRole('tab', { name: /My Feedback/ }).click();
    await expect(dialog.getByText(description.slice(0, 75), { exact: false })).toBeVisible();
  });

  test('preserves Engineering calculation input invalidation and calculator state isolation', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openStandaloneTool(page, 'engineering_calc');

    const calculator = page.getByTestId('engineering-calculation');
    const firstInput = calculator.getByRole('spinbutton').first();
    await firstInput.fill('1');
    await calculator.getByRole('button', { name: 'Calculate' }).click();
    await expect(calculator.getByRole('button', { name: /Show derivation|Hide derivation/ })).toBeVisible();

    await page.locator('aside').getByRole('button', { name: 'Stormwater & Drainage' }).click();
    await expect(calculator).toHaveAttribute('data-calculator-id', 'stormwater-rational');
    await expect(calculator.getByText('Enter inputs and click Calculate to see results.')).toBeVisible();
  });

  test('preserves Meetings schedule entry and role-based Approvals decision guards', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openStandaloneTool(page, 'meetings');
    await page.getByTestId('meetings-schedule').click();
    await expect(page.getByRole('heading', { name: 'Step 1: Project Context & Scope' })).toBeVisible();
    await page.getByRole('button', { name: '5. Policy' }).click();
    await expect(page.getByRole('heading', { name: 'Step 5: Consent, Retention & AI Governance' })).toBeVisible();

    await page.route('**/api/v1/approvals**', (route) => route.abort('failed'));
    await openStandaloneTool(page, 'approvals_queue');
    await page.getByTestId('role-switcher').selectOption('client');
    await expect(page.getByText(/may view but cannot decide this gate/).first()).toBeVisible();
    await expect(page.getByTestId(/approval-reject-/).first()).toBeDisabled();
  });
});
