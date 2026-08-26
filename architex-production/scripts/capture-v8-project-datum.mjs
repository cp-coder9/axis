import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = resolve('.');
const source = resolve(process.env.V8_REFERENCE_HTML || 'E:/Downloads/architex_datum_os_integrated_modules_v8_engineering_godmode.html');
const evidenceDir = resolve('release/evidence/v8-project-datum');
const implementationUrl = process.env.V8_IMPLEMENTATION_URL || 'http://127.0.0.1:3100/?workspace=v8';
const viewport = { width: 1600, height: 1000 };

async function isReachable(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer(url, processHandle) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    if (await isReachable(url)) return;
    if (processHandle?.exitCode !== null) throw new Error(`Implementation server exited with ${processHandle.exitCode}`);
    await new Promise((resolveWait) => setTimeout(resolveWait, 1_000));
  }
  throw new Error(`Implementation server did not become ready: ${url}`);
}

async function authenticateImplementation(page) {
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/refresh')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'evidence-access' }) });
      return;
    }
    if (path.endsWith('/me')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        user: { id: 'evidence-architect', name: 'Datum Architect', email: 'architect@architex.co.za', status: 'active' },
        organization: { id: 'evidence-org', name: 'Architex Studio', slug: 'architex-studio' },
        roles: ['architect'], project_memberships: [], active_role: 'architect', permissions: ['projects.read'],
      }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
}

async function measure(page, selectors) {
  return page.evaluate((selectorMap) => {
    const required = (selector) => {
      const node = document.querySelector(selector);
      if (!(node instanceof HTMLElement)) throw new Error(`Missing evidence selector: ${selector}`);
      return node;
    };
    const rectangle = (selector) => {
      const box = required(selector).getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    };
    const style = (selector) => {
      const value = getComputedStyle(required(selector));
      return {
        fontFamily: value.fontFamily,
        fontSize: value.fontSize,
        fontWeight: value.fontWeight,
        lineHeight: value.lineHeight,
        color: value.color,
        backgroundColor: value.backgroundColor,
        backgroundImage: value.backgroundImage,
        borderRadius: value.borderRadius,
        borderColor: value.borderColor,
        boxShadow: value.boxShadow,
      };
    };
    return {
      regions: Object.fromEntries(Object.entries(selectorMap.regions).map(([name, selector]) => [name, rectangle(selector)])),
      computedStyles: Object.fromEntries(Object.entries(selectorMap.styles).map(([name, selector]) => [name, style(selector)])),
    };
  }, selectors);
}

async function inventory(page, selectors) {
  return page.evaluate((selectorMap) => {
    const rectangle = (node) => {
      const box = node.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    };
    const one = (selector) => {
      const node = document.querySelector(selector);
      if (!(node instanceof HTMLElement)) throw new Error(`Missing inventory selector: ${selector}`);
      return { text: (node.textContent || '').trim().replace(/\s+/g, ' '), rectangle: rectangle(node) };
    };
    return {
      pageIcon: one(selectorMap.pageIcon),
      pageTitle: one(selectorMap.pageTitle),
      actions: [...document.querySelectorAll(selectorMap.actions)].map((node) => ({
        text: (node.textContent || '').trim().replace(/\s+/g, ' '),
        rectangle: rectangle(node),
      })),
      roleAvatar: one(selectorMap.roleAvatar),
      projectTitle: one(selectorMap.projectTitle),
      cards: [...document.querySelectorAll(selectorMap.cards)].map((node) => ({
        text: (node.textContent || '').trim().replace(/\s+/g, ' '),
        rectangle: rectangle(node),
      })),
    };
  }, selectors);
}

await mkdir(evidenceDir, { recursive: true });

let server = null;
if (!await isReachable(implementationUrl)) {
  const nextBin = resolve('node_modules/next/dist/bin/next');
  server = spawn(process.execPath, [nextBin, 'start', '-p', '3100'], {
    cwd: root,
    env: { ...process.env, PORT: '3100' },
    stdio: 'ignore',
    windowsHide: true,
  });
  await waitForServer(implementationUrl, server);
}

const browser = await chromium.launch({ headless: true });
try {
  const reference = await browser.newPage({ viewport });
  await reference.goto(pathToFileURL(source).href, { waitUntil: 'load', timeout: 120_000 });
  await reference.evaluate(() => document.fonts.ready);
  await reference.locator('.main .datum-viewport').waitFor({ state: 'visible' });
  await reference.screenshot({ path: resolve(evidenceDir, 'reference.png') });
  const referenceMeasurements = await measure(reference, {
    regions: {
      pageHead: '.main .page-head',
      roleBanner: '.main .role-banner',
      projectHero: '.main .project-hero',
      datumViewport: '.main .datum-viewport',
    },
    styles: {
      pageTitle: '.main .page-head h1',
      roleBanner: '.main .role-banner',
      projectHero: '.main .project-hero',
      stage: '.main .stage',
      activeStage: '.main .stage.active i',
      datumViewport: '.main .datum-viewport',
      datumLine: '.main .datum-line',
      datumCard: '.main .datum-card',
    },
  });
  const referenceInventory = await inventory(reference, {
    pageIcon: '.main .page-icon',
    pageTitle: '.main .page-head h1',
    actions: '.main .page-head .btn',
    roleAvatar: '.main .role-avatar',
    projectTitle: '.main .project-top h2',
    cards: '.main .datum-card',
  });

  const implementation = await browser.newPage({ viewport });
  await implementation.addInitScript(() => {
    window.localStorage.removeItem('architex:god-mode');
    window.localStorage.setItem('architex-theme', 'light');
  });
  await authenticateImplementation(implementation);
  await implementation.goto(implementationUrl, { waitUntil: 'load', timeout: 120_000 });
  await implementation.evaluate(() => document.fonts.ready);
  await implementation.getByTestId('datum-canvas').waitFor({ state: 'visible' });
  await implementation.screenshot({ path: resolve(evidenceDir, 'implementation.png') });
  const implementationMeasurements = await measure(implementation, {
    regions: {
      pageHead: '[data-v8-datum-region="page-head"]',
      roleBanner: '[data-v8-datum-region="role-banner"]',
      projectHero: '[data-v8-datum-region="project-hero"]',
      datumViewport: '[data-v8-datum-region="datum-viewport"]',
    },
    styles: {
      pageTitle: '.v8-datum-page-title h1',
      roleBanner: '.v8-role-banner',
      projectHero: '.v8-project-hero',
      stage: '.v8-stage',
      activeStage: '.v8-stage.is-active i',
      datumViewport: '.v8-datum-viewport',
      datumLine: '.v8-datum-line',
      datumCard: '.v8-datum-card',
    },
  });
  const implementationInventory = await inventory(implementation, {
    pageIcon: '.v8-datum-page-icon',
    pageTitle: '.v8-datum-page-title h1',
    actions: '.v8-datum-page-actions button',
    roleAvatar: '.v8-role-avatar',
    projectTitle: '.v8-project-top h2',
    cards: '.v8-datum-card',
  });

  await writeFile(resolve(evidenceDir, 'computed-styles.json'), `${JSON.stringify({
    capturedAt: new Date().toISOString(),
    viewport,
    reference: { source: source.replaceAll('\\', '/'), ...referenceMeasurements, inventory: referenceInventory },
    implementation: { url: implementationUrl, ...implementationMeasurements, inventory: implementationInventory },
  }, null, 2)}\n`, 'utf8');
} finally {
  await browser.close();
  if (server && server.exitCode === null) server.kill();
}
