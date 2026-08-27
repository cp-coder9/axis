import { expect, type Page, test } from '@playwright/test';

import { assertNoBodyOverflow, runAxe } from './helpers/v8-migration';

test.describe.configure({ mode: 'serial' });
test.setTimeout(120_000);

const credentials = {
  architect: { email: 'justin@architex-os.local', password: 'demo-user-demo-architect' },
  client: { email: 'client@architex-os.local', password: 'demo-user-demo-client' },
  supplier: { email: 'supplier@architex-os.local', password: 'demo-user-demo-supplier' },
} as const;

async function login(page: Page, identity: keyof typeof credentials) {
  const runtime = { consoleErrors: [] as string[], failedRequests: [] as string[], serverErrors: [] as string[] };
  await page.goto('/', { waitUntil: 'networkidle' });
  if (!await page.getByLabel('Email address').isVisible()) {
    await page.getByRole('button', { name: /^sign in$/i }).click();
  }
  await page.getByLabel('Email address').fill(credentials[identity].email);
  await page.getByLabel('Password').fill(credentials[identity].password);
  await page.getByRole('button', { name: 'Enter workspace' }).click();
  await expect(page.getByTestId('workspace-theme-toggle')).toBeVisible({ timeout: 15_000 });
  page.on('console', message => { if (message.type() === 'error') runtime.consoleErrors.push(message.text()); });
  page.on('requestfailed', request => runtime.failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`));
  page.on('response', response => { if (response.status() >= 500) runtime.serverErrors.push(`${response.status()} ${response.url()}`); });
  return runtime;
}

async function openSpecForge(page: Page) {
  await page.getByRole('navigation').getByRole('button', { name: /Workspace Tools/ }).click();
  await expect(page.getByTestId('v8-tool-registry')).toBeVisible();
  await page.getByRole('button', { name: 'Open project orientation' }).click();
  const specForgeDatum = page.locator('[data-testid="v8-datum-card"][data-tool-id="specforge"], [data-testid="v8-datum-sequence-item"][data-tool-id="specforge"]').first();
  if (await specForgeDatum.count() === 0) {
    await page.getByTestId('god-mode-toggle').click();
    await page.getByRole('button', { name: 'Project datum', exact: true }).click();
    await expect(specForgeDatum).toBeVisible();
  }
  await specForgeDatum.click();
  await expect(page.getByRole('heading', { level: 1, name: 'SpecForge V2' })).toBeVisible();
}

async function expectCleanRuntime(runtime: Awaited<ReturnType<typeof login>>) {
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.serverErrors).toEqual([]);
}

function waitForApprovalStatus(page: Page, expectedStatus: string) {
  return page.waitForResponse(async response => {
    if (!/\/projects\/[^/]+\/specforge$/.test(new URL(response.url()).pathname) || response.request().method() !== 'GET' || response.status() !== 200) return false;
    const payload = await response.json().catch(() => null);
    return payload?.workspace?.approvals?.some((approval: { status?: string }) => approval.status === expectedStatus) === true;
  });
}

function waitForItemStatus(page: Page, itemTitle: string, expectedStatus: string) {
  return page.waitForResponse(async response => {
    if (!/\/projects\/[^/]+\/specforge$/.test(new URL(response.url()).pathname) || response.request().method() !== 'GET' || response.status() !== 200) return false;
    const payload = await response.json().catch(() => null);
    return payload?.workspace?.items?.some((item: { title?: string; status?: string }) => item.title === itemTitle && item.status === expectedStatus) === true;
  });
}

function waitForItemQuantity(page: Page, itemTitle: string, expectedQuantity: number) {
  return page.waitForResponse(async response => {
    if (!/\/projects\/[^/]+\/specforge$/.test(new URL(response.url()).pathname) || response.request().method() !== 'GET' || response.status() !== 200) return false;
    const payload = await response.json().catch(() => null);
    return payload?.workspace?.items?.some((item: { title?: string; quantity?: number }) => item.title === itemTitle && Number(item.quantity) === expectedQuantity) === true;
  });
}

test('loads authenticated persisted records, all V8 workflows, and survives reload/theme/mobile gates', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  const runtime = await login(page, 'architect');
  await openSpecForge(page);
  const specforge = page.getByLabel('SpecForge specification workspace');

  await expect(specforge.getByText('v1.1', { exact: true }).first()).toBeVisible();
  for (const label of ['Overview','Pictorial Board','Sections','Products','Document Preview','Approvals','Budget & Risk','BoM / BoQ','Planning','Procurement','Issue & Distribute','Drawing Intelligence','Closeout','Integration']) {
    await expect(specforge.getByRole('button', { name: label })).toBeVisible();
  }
  await expect(specforge.getByText('Large format porcelain wall tile')).toBeVisible();

  const persistedTitle = `Browser-certified acoustic panel ${Date.now()}`;
  await specforge.getByRole('button', { name: 'Add specification' }).click();
  await specforge.getByLabel('Describe a product or specification').fill(persistedTitle);
  await specforge.getByRole('button', { name: 'Review draft' }).click();
  await expect(specforge.getByText('Manual draft')).toBeVisible();
  const createRequest = page.waitForResponse(response => /\/specforge\/items$/.test(new URL(response.url()).pathname) && response.request().method() === 'POST');
  await specforge.getByRole('button', { name: 'Confirm & save' }).click();
  expect((await createRequest).status()).toBe(201);
  await expect(specforge.getByRole('region', { name: 'Add specification' })).toHaveCount(0);
  await specforge.getByRole('button', { name: 'Products', exact: true }).click();
  await expect(specforge.getByText(persistedTitle)).toBeVisible();
  await page.reload({ waitUntil: 'networkidle' });
  await openSpecForge(page);
  await specforge.getByRole('button', { name: 'Products', exact: true }).click();
  await expect(specforge.getByText(persistedTitle)).toBeVisible();

  await specforge.getByRole('button', { name: 'BoM / BoQ', exact: true }).click();
  await expect(specforge.getByText('Drawing A-420 P03 · Quote Q-2026-1042')).toBeVisible();
  await expect(specforge.getByText(/R 128[, \s]500/).first()).toBeVisible();
  await specforge.getByRole('button', { name: 'Edit BoQ sources for Large format porcelain wall tile' }).click();
  const boqDialog = specforge.getByRole('dialog', { name: /BoQ sources/ });
  await boqDialog.getByRole('spinbutton', { name: 'Quantity', exact: true }).fill('190');
  const boqRequest = page.waitForResponse(response => response.url().includes('/boq-line') && response.request().method() === 'PATCH');
  const boqReload = waitForItemQuantity(page, 'Large format porcelain wall tile', 190);
  await boqDialog.getByRole('button', { name: 'Save BoQ line' }).click();
  expect((await boqRequest).status()).toBe(200);
  expect((await boqReload).status()).toBe(200);
  await expect(specforge.getByText('190', { exact: true })).toBeVisible();
  await page.reload({ waitUntil: 'networkidle' });
  await openSpecForge(page);
  await specforge.getByRole('button', { name: 'BoM / BoQ', exact: true }).click();
  await expect(specforge.getByText('190', { exact: true })).toBeVisible();
  await expect(specforge.getByText('Drawing A-420 P03 · Quote Q-2026-1042')).toBeVisible();

  await specforge.getByRole('button', { name: 'Procurement', exact: true }).click();
  const transitionRequest = page.waitForResponse(response => response.url().includes('/procurement-transition') && response.request().method() === 'POST');
  const transitionReload = waitForItemStatus(page, 'Issued porcelain floor tile', 'quoted');
  await specforge.getByRole('button', { name: 'Send RFQ for Issued porcelain floor tile' }).click();
  const transitionResponse = await transitionRequest;
  expect(transitionResponse.status()).toBe(201);
  expect((await transitionResponse.json()).transition.connector_status).toBe('integration_required');
  expect((await transitionReload).status()).toBe(200);
  await expect(specforge.getByRole('button', { name: 'Accept quote for Issued porcelain floor tile' })).toBeVisible();
  await page.reload({ waitUntil: 'networkidle' });
  await openSpecForge(page);
  await specforge.getByRole('button', { name: 'Procurement', exact: true }).click();
  await expect(specforge.getByRole('button', { name: 'Accept quote for Issued porcelain floor tile' })).toBeVisible();

  await specforge.getByRole('button', { name: 'Issue & Distribute' }).focus();
  await expect(specforge.getByRole('button', { name: 'Issue & Distribute' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Controls require attention' })).toBeVisible();
  await expect(page.getByText('approvals pending')).toBeVisible();

  await page.getByTestId('workspace-theme-toggle').click();
  await expect(page.getByTestId('workspace-theme-toggle')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('architex-theme'))).toBe('dark');
  await page.reload({ waitUntil: 'networkidle' });
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('architex-theme'))).toBe('dark');
  await expect(page.getByTestId('workspace-theme-toggle')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('workspace-theme-toggle')).toContainText('Light');
  await page.getByTestId('workspace-theme-toggle').click();
  await openSpecForge(page);

  await page.setViewportSize({ width: 700, height: 900 });
  await expect.poll(() => specforge.locator('.specforge-metrics').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(1);
  await assertNoBodyOverflow(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await assertNoBodyOverflow(page);
  await runAxe(page);
  await expectCleanRuntime(runtime);
});

test('uses real client authentication and exposes only client-decision records', async ({ page }) => {
  const runtime = await login(page, 'client');
  await openSpecForge(page);
  const specforge = page.getByLabel('SpecForge specification workspace');
  await specforge.getByRole('button', { name: 'Products', exact: true }).click();
  await expect(specforge.getByText('Large format porcelain wall tile')).toBeVisible();
  await expect(specforge.getByText('Acoustic oak wall panel')).toHaveCount(0);
  await expect(specforge.getByRole('button', { name: 'Add specification' })).toHaveCount(0);
  await specforge.getByRole('button', { name: 'Approvals', exact: true }).click();
  const approve = specforge.getByRole('button', { name: 'Approve' });
  await expect.poll(async () => await approve.count() + await specforge.getByText('approved', { exact: true }).count()).toBeGreaterThan(0);
  if (await approve.count()) {
    const approvalRequest = page.waitForResponse(response => response.url().includes('/specforge/approvals/') && response.request().method() === 'POST');
    const approvalReload = waitForApprovalStatus(page, 'approved');
    await approve.click();
    const decisionResponse = await approvalRequest;
    expect([200, 201]).toContain(decisionResponse.status());
    expect((await decisionResponse.json()).approval.status).toBe('approved');
    const reloadResponse = await approvalReload;
    expect(reloadResponse.status()).toBe(200);
    expect((await reloadResponse.json()).workspace.approvals[0].status).toBe('approved');
  }
  await expect(specforge.getByText('approved', { exact: true })).toBeVisible({ timeout: 15_000 });
  await expectCleanRuntime(runtime);
});

test('retains supplier package RBAC while God Mode changes only the viewing lens', async ({ page }) => {
  const runtime = await login(page, 'supplier');
  await openSpecForge(page);
  const specforge = page.getByLabel('SpecForge specification workspace');
  await specforge.getByRole('button', { name: 'Products', exact: true }).click();
  await expect(specforge.getByText('Issued porcelain floor tile')).toBeVisible();
  await expect(specforge.getByText('Commercial door hardware set')).toHaveCount(0);
  await expect(specforge.getByRole('button', { name: 'Add specification' })).toBeVisible();
  await expect(specforge.getByRole('button', { name: 'Prepare issue' })).toHaveCount(0);

  await page.getByTestId('god-mode-toggle').click();
  await page.getByTestId('role-switcher').selectOption('architect');
  await page.getByRole('navigation').getByRole('button', { name: /Workspace Tools/ }).click();
  await page.getByRole('button', { name: 'Open project orientation' }).click();
  await page.locator('[data-testid="v8-datum-card"][data-tool-id="specforge"], [data-testid="v8-datum-sequence-item"][data-tool-id="specforge"]').first().click();
  await specforge.getByRole('button', { name: 'Products', exact: true }).click();
  await expect(specforge.getByText('Issued porcelain floor tile')).toBeVisible();
  await expect(specforge.getByText('Commercial door hardware set')).toHaveCount(0);
  await expect(specforge.getByRole('button', { name: 'Add specification' })).toBeVisible();
  await expect(specforge.getByRole('button', { name: 'Prepare issue' })).toHaveCount(0);
  await expectCleanRuntime(runtime);
});

test('validates, issues, reloads and reports persisted downstream states', async ({ page }) => {
  await login(page, 'client');
  await openSpecForge(page);
  let specforge = page.getByLabel('SpecForge specification workspace');
  await specforge.getByRole('button', { name: 'Approvals', exact: true }).click();
  const approve = specforge.getByRole('button', { name: 'Approve' });
  await expect.poll(async () => await approve.count() + await specforge.getByText('approved', { exact: true }).count()).toBeGreaterThan(0);
  if (await approve.count()) {
    const approvalRequest = page.waitForResponse(response => response.url().includes('/specforge/approvals/') && response.request().method() === 'POST');
    const approvalReload = waitForApprovalStatus(page, 'approved');
    await approve.click();
    const decisionResponse = await approvalRequest;
    expect([200, 201]).toContain(decisionResponse.status());
    expect((await decisionResponse.json()).approval.status).toBe('approved');
    const reloadResponse = await approvalReload;
    expect(reloadResponse.status()).toBe(200);
    expect((await reloadResponse.json()).workspace.approvals[0].status).toBe('approved');
  }
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByLabel('Email address')).toBeVisible();

  const runtime = await login(page, 'architect');
  const architectWorkspaceRequest = waitForApprovalStatus(page, 'approved');
  await openSpecForge(page);
  const architectWorkspaceResponse = await architectWorkspaceRequest;
  expect(architectWorkspaceResponse.status()).toBe(200);
  expect((await architectWorkspaceResponse.json()).workspace.approvals[0].status).toBe('approved');
  specforge = page.getByLabel('SpecForge specification workspace');
  await specforge.getByRole('button', { name: 'Approvals', exact: true }).click();
  const confirmResponsibility = specforge.getByRole('button', { name: 'Confirm and sign professional responsibility' });
  if (await confirmResponsibility.count()) {
    const confirmationRequest = page.waitForResponse(response => response.url().includes('/responsibility-confirmations') && response.request().method() === 'POST');
    await confirmResponsibility.click();
    expect((await confirmationRequest).status()).toBe(201);
    await expect(specforge.getByRole('heading', { name: /Confirmed for P\d+/ })).toBeVisible();
  }
  await specforge.getByRole('button', { name: 'Issue & Distribute' }).click();
  await expect(specforge.getByRole('heading', { name: 'Issue register' })).toBeVisible();
  const validationRequest = page.waitForResponse(response => response.url().includes('/specforge/issues/validate') && response.request().method() === 'POST');
  const issueRequest = page.waitForResponse(response => /\/specforge\/issues$/.test(new URL(response.url()).pathname) && response.request().method() === 'POST');
  await specforge.getByRole('button', { name: /Validate and issue/ }).click();
  const validationResponse = await validationRequest;
  expect(validationResponse.status()).toBe(200);
  expect(await validationResponse.json()).toEqual({ ready: true, codes: [] });
  expect((await issueRequest).status()).toBe(201);
  await expect(specforge.getByRole('status')).toContainText(/Issue P\d+ created/);
  await expect(specforge.getByRole('region', { name: 'Downstream job status' })).toBeVisible();
  await expect(specforge.getByRole('region', { name: 'Downstream job status' }).getByText('Queued').first()).toBeVisible();
  const jobsRequest = page.waitForResponse(response => response.url().includes('/jobs') && response.request().method() === 'GET');
  await specforge.getByRole('button', { name: 'Refresh statuses' }).click();
  expect((await jobsRequest).status()).toBe(200);
  await expect(specforge.getByRole('region', { name: 'Downstream job status' }).getByText('Queued').first()).toBeVisible();
  await page.reload({ waitUntil: 'networkidle' });
  await openSpecForge(page);
  await specforge.getByRole('button', { name: 'Issue & Distribute' }).click();
  await expect(specforge.getByRole('heading', { name: 'Issue register' })).toBeVisible();
  await expect(specforge.locator('.specforge-issue-row')).toHaveCount(1);
  await expectCleanRuntime(runtime);
});
