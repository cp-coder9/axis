import { test, expect, Page } from '@playwright/test';

// Canonical 47-module registry — must match tools.json / lib/data.ts
const ALL_TOOL_IDS = [
  'meetings', 'practice', 'wingman', 'engineering_calc', 'planning', 'municipal', 'xa', 'forms',
  'specforge', 'bom', 'itp', 'safety', 'feedback', 'project_passport',
  'project_explorer', 'professional_directory', 'team_workspace', 'inbox_action',
  'issues_rfis', 'approvals_queue', 'compliance_hub', 'environmental_heritage',
  'eia_workspace', 'refuse_calculator', 'nhbrc_enrolment', 'documents_drawings',
  'survey_geomatics', 'bim_ifc', 'fee_proposal', 'insurance_register',
  'rfq_marketplace', 'supplier_catalog', 'market_insights', 'contract_admin',
  'payments_escrow', 'dispute_resolution', 'contractor_compliance',
  'site_instructions', 'ncr_manager', 'snag_manager', 'fm_bridge',
  'council_navigator', 'municipal_tracker', 'remote_desktop', 'cpd_learning',
  'admin_review', 'iconography_registry',
];

async function openTool(page: Page, toolId: string) {
  // Standalone mode shows all 47 tools unfiltered (project mode is role-filtered)
  await page.getByTestId('mode-standalone').click();
  const btn = page.getByTestId(`tool-${toolId}`);
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
}

test.describe('Architex OS — app shell', () => {
  test('loads with role switcher and project context', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('role-switcher')).toBeVisible();
    // Default role is architect
    await expect(page.getByTestId('role-switcher')).toHaveValue('architect');
  });

  test('role switcher changes active role', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('role-switcher').selectOption('client');
    await expect(page.getByTestId('role-switcher')).toHaveValue('client');
  });
});

test.describe('Architex OS — all 47 modules open', () => {
  for (const toolId of ALL_TOOL_IDS) {
    test(`module opens: ${toolId}`, async ({ page }) => {
      await page.goto('/');
      await page.getByTestId('mode-standalone').click();
      const btn = page.getByTestId(`tool-${toolId}`);
      await btn.scrollIntoViewIfNeeded();
      const toolName = (await btn.innerText()).trim().split('\n')[0];
      await btn.click();
      // Navigator switches to the "Inside <tool>" tab view when a module opens
      await expect(page.getByText(`Inside ${toolName}`)).toBeVisible({ timeout: 15000 });
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.toLowerCase()).not.toContain('application error');
      expect(bodyText.toLowerCase()).not.toContain('unhandled runtime error');
    });
  }
});

test.describe('Architex OS — Meetings governed workflow', () => {
  test('Meet Now opens pre-join screen', async ({ page }) => {
    await page.goto('/');
    await openTool(page, 'meetings');
    await page.getByTestId('meetings-meet-now').click();
    // Pre-join screen should show consent/recording governance language
    const body = await page.locator('body').innerText();
    expect(body.toLowerCase()).toMatch(/consent|record|transcript|join/);
  });

  test('Schedule opens 5-step wizard', async ({ page }) => {
    await page.goto('/');
    await openTool(page, 'meetings');
    await page.getByTestId('meetings-schedule').click();
    const body = await page.locator('body').innerText();
    expect(body).toContain('1. Context');
    expect(body).toContain('5. Policy');
  });
});

test.describe('Architex OS — Approvals RBAC', () => {
  test('non-matching role cannot decide a gate', async ({ page }) => {
    await page.goto('/');
    await openTool(page, 'approvals_queue');
    // Switch to a role unlikely to own the first pending gate
    await page.getByTestId('role-switcher').selectOption('client');
    const body = await page.locator('body').innerText();
    // Either no decide buttons enabled, or the view-only notice appears
    const approveButtons = page.locator('button[data-testid^="approval-approve-"]');
    const count = await approveButtons.count();
    if (count > 0) {
      // All visible approve buttons should be disabled for a non-owning role
      for (let i = 0; i < count; i++) {
        const disabled = await approveButtons.nth(i).isDisabled();
        expect(disabled).toBeTruthy();
      }
    } else {
      expect(body.toLowerCase()).toMatch(/cannot decide|view/);
    }
  });
});
