import { test, expect, Page } from '@playwright/test';

/**
 * OS Rail navigation repair tests (V8 plan §7B).
 * Verifies every rail item lands on a real destination, tool opens sync the
 * rail highlight, the first tab activates, tabs render grouped, and back /
 * rail round-trips never strand the user.
 */

async function clickRailItem(page: Page, label: string) {
  await page.getByRole('button', { name: new RegExp(label, 'i') }).first().click();
}

function startsWithAccessibleName(label: string) {
  return new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`);
}

const flagshipToolTabs = [
  {
    id: 'meetings',
    tabs: [
      ['my-day', 'My day'],
      ['upcoming', 'Upcoming'],
      ['invitations', 'Invitations'],
      ['recordings', 'Recordings & Minutes'],
      ['reviews', 'Draft reviews'],
      ['templates', 'Templates'],
      ['settings', 'Meeting settings'],
    ],
  },
  {
    id: 'practice',
    tabs: [
      ['dashboard', 'Dashboard'],
      ['actions', 'Action Centre'],
      ['notifications', 'Notifications'],
      ['programme', 'Programme (Gantt)'],
      ['tasks', 'Tasks Board (Kanban)'],
      ['milestones', 'Milestones'],
      ['calendar', 'Calendar'],
      ['team', 'Team & Resources'],
      ['site_diary', 'Site Diary'],
      ['rfis', 'RFIs & Instructions'],
      ['risks', 'Issues & Risks'],
      ['quality', 'Quality & Snags'],
      ['fees', 'Fee Planning'],
      ['timesheets', 'Timesheets & Expenses'],
      ['profitability', 'Project Profitability'],
      ['forecast', 'Forecasting'],
      ['budget', 'Budget & Cost'],
    ],
  },
  {
    id: 'wingman',
    tabs: [
      ['conversations', 'Conversations'],
      ['byoai', 'Import BYOAI'],
      ['provenance', 'Provenance Audit'],
      ['draft_rfi', 'Draft RFI Tool'],
      ['status_summary', 'Status Summary'],
      ['compliance_scan', 'Flag Compliance'],
    ],
  },
  {
    id: 'planning',
    tabs: [
      ['dashboard', 'Dashboard'],
      ['applications', 'Applications'],
      ['deadlines', 'Deadlines & Timelines'],
      ['participation', 'Public Participation'],
      ['conditions', 'Conditions Register'],
      ['hearings', 'Hearings & Appeals'],
      ['municipalities', 'Municipality Profiles'],
      ['payments', 'Payments & Fees'],
    ],
  },
  {
    id: 'municipal',
    tabs: [
      ['overview', 'Readiness Overview'],
      ['landuse', 'Land Use & Zoning'],
      ['circulation', 'Department Circulation'],
      ['pack', 'Submission Pack (10 Docs)'],
      ['certificate', 'Municipal Certificate'],
      ['outcomes', 'Submission Outcomes'],
    ],
  },
  {
    id: 'xa',
    tabs: [
      ['overview', 'Overview'],
      ['basics', 'Basics & Zones'],
      ['shading', 'Shading (Table 3)'],
      ['fenestration', 'Fenestration (5.3)'],
      ['walls', 'External Walls (5.5)'],
      ['roof', 'Roof Assembly (5.6)'],
      ['floors', 'Floor Insulation (5.4)'],
      ['hotwater', 'Hot Water (6.1)'],
      ['lighting', 'Lighting & LPD (6.2)'],
      ['results', 'Compliance Report'],
    ],
  },
  {
    id: 'specforge',
    tabs: [
      ['overview', 'Overview'],
      ['pictorial', 'Pictorial Board'],
      ['sections', 'Trade Sections'],
      ['products', 'Product Register'],
      ['docpreview', 'Document Preview'],
      ['approvals', 'Approval Register'],
      ['budget', 'Budget & Cost Risk'],
      ['bomboq', 'BoM / BoQ Link'],
      ['drawings', 'AI Drawing Scan'],
      ['issue', 'Issue & Distribute'],
    ],
  },
  {
    id: 'bom',
    tabs: [
      ['takeoff', 'Drawing Takeoff'],
      ['bomlines', 'BoM Lines (47)'],
      ['flagged', 'Flagged Anomalies'],
      ['procurement', 'Procurement Pipeline'],
      ['qs_review', 'QS Review Queue'],
      ['tender', 'Tender Generation'],
      ['export', 'Document Export'],
      ['audit', 'Audit Trail'],
    ],
  },
  {
    id: 'safety',
    tabs: [
      ['overview', 'Overview'],
      ['safety_file', 'Safety File (Reg 7)'],
      ['permits', 'Permits to Work (PTW)'],
      ['hira', 'HIRA Risk Matrix'],
      ['incidents', 'Incident Register'],
      ['inductions', 'Inductions & Talks'],
      ['plans', 'H&S Plans'],
      ['fall_protection', 'Fall Protection (Reg 10)'],
    ],
  },
] as const;

test.describe('Architex OS — OS rail navigation repair', () => {
  for (const tool of flagshipToolTabs) {
    test(`${tool.id} exposes a distinct synchronized panel for every configured tab`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.goto('/');
      await page.getByTestId('mode-standalone').click();
      await page.getByTestId(`tool-${tool.id}`).click();

      for (const [key, label] of tool.tabs) {
        const accessibleName = startsWithAccessibleName(label);
        const navigatorTab = page.locator('aside').getByRole('button', { name: accessibleName });
        await navigatorTab.click();
        await expect(navigatorTab).toHaveAttribute('aria-pressed', 'true');
        await expect(page.locator(`[data-tool-tab="${key}"]`)).toBeVisible();
        await expect(page.locator('main').getByRole('button', { name: accessibleName })).toHaveAttribute('aria-pressed', 'true');
      }

      for (const [key, label] of tool.tabs) {
        const accessibleName = startsWithAccessibleName(label);
        await page.locator('main button[aria-pressed]').filter({ hasText: label }).click();
        await expect(page.locator(`[data-tool-tab="${key}"]`)).toBeVisible();
        await expect(page.locator('aside').getByRole('button', { name: accessibleName })).toHaveClass(/border-\[#19B7B0\]/);
      }

      const [firstKey, firstLabel] = tool.tabs[0];
      const secondLabel = tool.tabs[1][1];
      await page.locator('main').getByRole('button', { name: startsWithAccessibleName(firstLabel) }).click();
      await page.locator('aside').getByRole('button', { name: startsWithAccessibleName(secondLabel) }).click();
      await page.locator('aside').getByRole('button', { name: startsWithAccessibleName(firstLabel) }).click();
      await expect(page.locator(`[data-tool-tab="${firstKey}"]`)).toBeVisible();
    });
  }

  test('meetings tab navigation does not restore an abandoned internal workflow', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('mode-standalone').click();
    await page.getByTestId('tool-meetings').click();
    await page.getByTestId('meetings-schedule').click();

    await page.locator('aside').getByRole('button', { name: 'Upcoming', exact: true }).click();
    await expect(page.locator('[data-tool-tab="upcoming"]')).toBeVisible();
    await page.locator('aside').getByRole('button', { name: 'My day', exact: true }).click();
    await expect(page.locator('[data-tool-tab="my-day"]')).toBeVisible();
  });

  test('specialist workflow tabs expose actionable domain records', async ({ page }) => {
    test.setTimeout(120_000);
    const scenarios = [
      { tool: 'planning', tab: 'Hearings & Appeals', content: 'Hearing pack readiness' },
      { tool: 'municipal', tab: 'Municipal Certificate', content: 'Certificate & occupancy gate' },
      { tool: 'bom', tab: 'Drawing Takeoff', content: 'Revision takeoff register' },
      { tool: 'bom', tab: 'Tender Generation', content: 'Tender package register' },
    ];

    for (const scenario of scenarios) {
      await page.goto('/');
      await page.getByTestId('mode-standalone').click();
      await page.getByTestId(`tool-${scenario.tool}`).click();
      await page.locator('aside').getByRole('button', { name: startsWithAccessibleName(scenario.tab) }).click();
      await expect(page.getByText(scenario.content, { exact: true })).toBeVisible();
    }
  });

  test('rail items land on a real destination (no generic placeholder)', async ({ page }) => {
    await page.goto('/');
    const destinations: { label: string; heading: string }[] = [
      { label: 'Command Centre', heading: 'Architex OS Command Centre' },
      { label: 'Project Space', heading: 'Faerie Glen Residential' },
      { label: 'Workspace Tools', heading: 'Workspace Tools' },
      { label: 'Inbox & Collaboration', heading: 'Inbox & Collaboration' },
      { label: 'Documents', heading: 'Documents & Drawings' },
      { label: 'Finance & Payments', heading: 'Finance & Payments' },
      { label: 'Knowledge & CPD', heading: 'Knowledge & CPD' },
      { label: 'Feedback Intelligence', heading: 'Feedback Intelligence' },
      { label: 'Settings', heading: 'Settings' },
    ];
    for (const { label, heading } of destinations) {
      await clickRailItem(page, label);
      const body = await page.locator('body').innerText();
      // The generic placeholder text must never appear for a real destination.
      expect(body.toLowerCase()).not.toContain('module active and synchronized');
      expect(body).toContain(heading);
    }
  });

  test('opening a tool highlights the rail context correctly', async ({ page }) => {
    await page.goto('/');
    // Open practice from the project navigator: the tool view shows the
    // navigator header "Inside Practice Management — Command Centre".
    await page.getByTestId('mode-project').click();
    await page.getByTestId('tool-practice').click();
    await expect(page.getByText('Inside Practice Management — Command Centre')).toBeVisible();

    // With the repaired navigator (1C), switching mode while a tool is open
    // keeps the user inside the tool — so return to Project Space via the
    // back guard, then open specforge from the standalone registry.
    await page.getByRole('button', { name: /Back to Datum Project Space/ }).click();
    await page.getByTestId('mode-standalone').click();
    await page.getByTestId('tool-specforge').click();
    await expect(page.getByText(/Inside SpecForge V2/)).toBeVisible();
  });

  test('first tab is active on tool open', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('mode-standalone').click();
    await page.getByTestId('tool-practice').click();
    // First practice tab is "Dashboard"; it should be the active (highlighted) tab.
    const dashboard = page.locator('aside').getByRole('button', { name: 'Dashboard', exact: true });
    await expect(dashboard).toHaveClass(/border-\[#19B7B0\]/);
  });

  test('engineering_calc tabs render grouped by discipline', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('mode-standalone').click();
    await page.getByTestId('tool-engineering_calc').click();
    await expect(page.getByText(/Inside Engineer's Calculation Hub/)).toBeVisible();
    for (const group of ['Structural', 'Civil', 'Fire Engineering', 'Electrical', 'Wet Services']) {
      await expect(page.getByText(group, { exact: true })).toBeVisible();
    }
  });

  test('V8-C01 V8-C02 contained calculator cannot create controlled evidence', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('mode-standalone').click();
    await page.getByTestId('tool-engineering_calc').click();
    await page.getByRole('button', { name: 'Calculate', exact: true }).click();

    await expect(page.getByTestId('calculator-containment')).toContainText(
      'Unvalidated advisory calculation',
    );
    await expect(page.getByRole('button', { name: /Save calculation/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Send to review/i })).toHaveCount(0);
    await expect(page.getByText(/MariaDB-backed/i)).toHaveCount(0);
    await expect(page.getByText(/controlled working record/i)).toHaveCount(0);
    await page.screenshot({
      path: 'docs/v8-remediation/screenshots/phase-0-containment.png',
      fullPage: false,
    });
  });

  test('rail -> tool -> back round-trip does not strand the user', async ({ page }) => {
    await page.goto('/');
    // Documents global view -> open Documents & Drawings tool -> back.
    await clickRailItem(page, 'Documents');
    await expect(page.getByRole('heading', { name: 'Documents & Drawings' })).toBeVisible();
    await page.getByRole('button', { name: /Open Documents & Drawings/ }).click();
    await expect(page.getByText(/Inside Documents & Drawings/)).toBeVisible();
    await page.getByRole('button', { name: /Back to Datum Project Space/ }).click();
    // Back to the project datum (h1 header; hero card has a matching h2).
    await expect(page.getByRole('heading', { name: 'Faerie Glen Residential' }).first()).toBeVisible();

    // Now the rail still works after the round-trip.
    await clickRailItem(page, 'Project Space');
    await expect(page.getByRole('heading', { name: 'Faerie Glen Residential' }).first()).toBeVisible();
  });

  test('stale-state guard: opening tool B after tool A + rail navigation opens B on its first tab', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('mode-standalone').click();
    await page.getByTestId('tool-forms').click();
    await expect(page.getByText(/Inside Integrated Form System/)).toBeVisible();
    // Navigate to a global destination, then open another tool.
    await clickRailItem(page, 'Knowledge & CPD');
    await page.getByTestId('mode-standalone').click();
    await page.getByTestId('tool-bom').click();
    // BoM opens on its first tab ("Drawing Takeoff") without leftover Forms state.
    await expect(page.getByText(/Inside BoM \/ BoQ & Tender Builder/)).toBeVisible();
    // The navigator renders the tool tabs; the module body may repeat the
    // label, so scope the active-tab assertion to the navigator aside.
    const takeoff = page.locator('aside').getByRole('button', { name: 'Drawing Takeoff' });
    await expect(takeoff).toHaveClass(/border-\[#19B7B0\]/);
  });
});

test.describe('Architex OS — God Mode (v8)', () => {
  test('toggle enables god mode and shows the ecosystem explorer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /God Mode/i }).first().click();
    await expect(page.getByText('God Mode · Ecosystem Explorer')).toBeVisible();
    // All tools remain visible via the role grid / tool groups.
    await expect(page.getByText('Understand the ecosystem of roles')).toBeVisible();
    await expect(page.getByText('Workspace registry by group')).toBeVisible();
  });

  test('god mode toggle appears in the rail as a global item', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /God Mode/i }).first().click();
    const rail = page.locator('aside').first();
    await expect(rail.getByRole('button', { name: /God Mode Explorer/i })).toBeVisible();
  });
});
