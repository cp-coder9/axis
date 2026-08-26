import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.ARCHITEX_CERT_URL ?? 'https://test.architex.co.za/';
const email = process.env.ARCHITEX_CERT_EMAIL;
const password = process.env.ARCHITEX_CERT_PASSWORD;
const outputDir = path.resolve(process.env.ARCHITEX_CERT_OUTPUT ?? 'release/evidence/v8-project-datum/live');

if (!email || !password) throw new Error('ARCHITEX_CERT_EMAIL and ARCHITEX_CERT_PASSWORD are required');
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const consoleErrors = [];
const failedRequests = [];
const apiResponses = [];
const serverErrors = [];

page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }));
page.on('response', response => {
  const url = response.url();
  if (url.startsWith('https://api.architex.co.za/api/v1/')) apiResponses.push({ url, status: response.status() });
  if (response.status() >= 500) serverErrors.push({ url, status: response.status() });
});

const result = {
  baseUrl,
  certifiedAt: new Date().toISOString(),
  landing: false,
  authenticated: false,
  projectDatum: false,
  themeToggle: false,
  themePersistsAfterReload: false,
  godMode: false,
  sessionRestoresAfterReload: false,
  projectsRequest: false,
  logout: false,
};

try {
  await page.goto(`${baseUrl}?live-cert=${Date.now()}`, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.getByRole('heading', { name: 'The Operating System for the Built Environment' }).waitFor();
  result.landing = true;
  await page.screenshot({ path: path.join(outputDir, 'landing.png'), fullPage: true });

  await page.getByRole('button', { name: 'Sign in' }).first().click();
  await page.getByRole('heading', { name: 'Welcome back' }).waitFor();
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Enter workspace' }).click();
  await page.getByTestId('role-switcher').waitFor({ timeout: 30_000 });
  result.authenticated = true;

  await page.getByTestId('datum-canvas').waitFor();
  result.projectDatum = true;
  await page.screenshot({ path: path.join(outputDir, 'project-datum.png'), fullPage: true });

  const theme = page.getByTestId('workspace-theme-toggle');
  const pressedBefore = await theme.getAttribute('aria-pressed');
  await theme.click();
  const pressedAfter = await theme.getAttribute('aria-pressed');
  result.themeToggle = pressedBefore !== pressedAfter;
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByTestId('role-switcher').waitFor({ timeout: 30_000 });
  result.sessionRestoresAfterReload = true;
  result.themePersistsAfterReload = (await page.getByTestId('workspace-theme-toggle').getAttribute('aria-pressed')) === pressedAfter;

  await page.getByRole('button', { name: /God Mode/ }).first().click();
  await page.getByText('God Mode · Ecosystem Explorer').waitFor();
  result.godMode = true;
  await page.screenshot({ path: path.join(outputDir, 'god-mode.png'), fullPage: true });

  result.projectsRequest = apiResponses.some(entry => entry.url.endsWith('/projects') && entry.status === 200);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.getByRole('heading', { name: 'The Operating System for the Built Environment' }).waitFor();
  result.logout = true;
} catch (error) {
  result.error = error instanceof Error ? error.message : String(error);
  await page.screenshot({ path: path.join(outputDir, 'failure.png'), fullPage: true }).catch(() => {});
} finally {
  result.apiResponses = apiResponses;
  result.consoleErrors = consoleErrors;
  result.failedRequests = failedRequests;
  result.serverErrors = serverErrors;
  await writeFile(path.join(outputDir, 'browser-certification.json'), `${JSON.stringify(result, null, 2)}\n`);
  await browser.close();
}

console.log(JSON.stringify(result));
const required = ['landing', 'authenticated', 'projectDatum', 'themeToggle', 'themePersistsAfterReload', 'godMode', 'sessionRestoresAfterReload', 'projectsRequest', 'logout'];
if (required.some(key => result[key] !== true) || serverErrors.length || failedRequests.length) process.exitCode = 1;
