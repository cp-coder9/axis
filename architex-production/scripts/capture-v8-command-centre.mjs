import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const source = resolve(process.env.V8_REFERENCE_HTML || 'E:/Downloads/architex_datum_os_integrated_modules_v8_engineering_godmode.html');
const evidenceDir = resolve('release/evidence/v8-command-centre');
const implementationUrl = process.env.V8_IMPLEMENTATION_URL || 'http://127.0.0.1:3100/?workspace=v8-command';
const viewport = { width: 1600, height: 1000 };

async function reachable(url) {
  try { return (await fetch(url, { signal: AbortSignal.timeout(2_000) })).ok; } catch { return false; }
}

async function waitForServer(url, processHandle) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    if (await reachable(url)) return;
    if (processHandle.exitCode !== null) throw new Error(`Implementation server exited with ${processHandle.exitCode}`);
    await new Promise(resolveWait => setTimeout(resolveWait, 1_000));
  }
  throw new Error(`Implementation server did not become ready: ${url}`);
}

async function authenticate(page) {
  await page.route('**/api/v1/**', async route => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.endsWith('/auth/refresh')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'command-evidence' }) });
    } else if (pathname.endsWith('/me')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        user: { id: 'command-evidence', name: 'Command Architect', email: 'architect@architex.co.za', status: 'active' },
        organization: { id: 'command-org', name: 'Architex Studio', slug: 'architex-studio' },
        roles: ['architect'], project_memberships: [], active_role: 'architect', permissions: ['projects.read'],
      }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
  });
}

async function inspect(page, selectors) {
  return page.evaluate(selectorMap => {
    const inspectOne = selector => {
      const node = document.querySelector(selector);
      if (!(node instanceof HTMLElement)) throw new Error(`Missing selector: ${selector}`);
      const box = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return {
        text: (node.textContent || '').trim().replace(/\s+/g, ' '),
        rectangle: { x: box.x, y: box.y, width: box.width, height: box.height },
        style: {
          fontSize: style.fontSize, fontWeight: style.fontWeight, lineHeight: style.lineHeight,
          color: style.color, backgroundColor: style.backgroundColor,
          borderRadius: style.borderRadius, borderColor: style.borderColor,
          padding: style.padding, boxShadow: style.boxShadow,
        },
      };
    };
    return {
      pageHead: inspectOne(selectorMap.pageHead),
      pageIcon: inspectOne(selectorMap.pageIcon),
      pageTitle: inspectOne(selectorMap.pageTitle),
      grid: inspectOne(selectorMap.grid),
      cards: [...document.querySelectorAll(selectorMap.cards)].map(node => inspectOne(`#${node.id}`)),
      icons: [...document.querySelectorAll(selectorMap.icons)].map(node => {
        const box = node.getBoundingClientRect();
        return { width: box.width, height: box.height };
      }),
    };
  }, selectors);
}

await mkdir(evidenceDir, { recursive: true });
let server = null;
if (!await reachable(implementationUrl)) {
  server = spawn(process.execPath, [resolve('node_modules/next/dist/bin/next'), 'start', '-p', '3100'], {
    cwd: resolve('.'), env: { ...process.env, PORT: '3100' }, stdio: 'ignore', windowsHide: true,
  });
  await waitForServer(implementationUrl, server);
}

const browser = await chromium.launch({ headless: true });
try {
  const reference = await browser.newPage({ viewport });
  await reference.goto(pathToFileURL(source).href, { waitUntil: 'load', timeout: 120_000 });
  await reference.evaluate(() => window.openGlobal('command'));
  await reference.locator('.main .scaffold-grid').waitFor();
  await reference.locator('.main .scaffold-card').evaluateAll(cards => cards.forEach((card, index) => { card.id = `reference-command-card-${index}`; }));
  await reference.screenshot({ path: resolve(evidenceDir, 'reference.png') });
  const referenceEvidence = await inspect(reference, {
    pageHead: '.main .page-head', pageIcon: '.main .page-icon', pageTitle: '.main .page-head h1',
    grid: '.main .scaffold-grid', cards: '.main .scaffold-card', icons: '.main .scaffold-card .lib-icon',
  });

  const implementation = await browser.newPage({ viewport });
  await implementation.addInitScript(() => localStorage.setItem('architex-theme', 'light'));
  await authenticate(implementation);
  await implementation.goto(implementationUrl, { waitUntil: 'load', timeout: 120_000 });
  await implementation.getByRole('navigation').getByRole('button', { name: 'Command Centre' }).click();
  await implementation.getByTestId('global-destination-command').waitFor();
  await implementation.locator('[data-v8-command-card]').evaluateAll(cards => cards.forEach((card, index) => { card.id = `implementation-command-card-${index}`; }));
  await implementation.screenshot({ path: resolve(evidenceDir, 'implementation.png') });
  const implementationEvidence = await inspect(implementation, {
    pageHead: '.v8-command-head', pageIcon: '.v8-command-page-icon', pageTitle: '.v8-command-copy h1',
    grid: '.v8-command-grid', cards: '[data-v8-command-card]', icons: '.v8-command-card-icon',
  });

  await writeFile(resolve(evidenceDir, 'computed-styles.json'), `${JSON.stringify({
    capturedAt: new Date().toISOString(), viewport,
    reference: { source: source.replaceAll('\\', '/'), ...referenceEvidence },
    implementation: { url: implementationUrl, ...implementationEvidence },
  }, null, 2)}\n`);
} finally {
  await browser.close();
  if (server && server.exitCode === null) server.kill();
}
