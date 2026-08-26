import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';
const referencePath = resolve(process.env.V8_REFERENCE_HTML || 'E:/Downloads/architex_datum_os_integrated_modules_v8_engineering_godmode.html');
const outputDirectory = resolve('release/evidence/v8-entry-shell');
const viewport = { width: 1600, height: 1000 };
const regionNames = ['rail', 'navigator', 'topbar', 'canvas', 'inspector'];
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const diagnostics = { capturedAt: new Date().toISOString(), baseUrl, viewport, reference: {}, implementation: {}, consoleErrors: [] };
try {
  const reference = await browser.newPage({ viewport });
  await reference.goto(pathToFileURL(referencePath).href, { waitUntil: 'load', timeout: 120_000 });
  await reference.evaluate(() => document.fonts.ready);
  await reference.screenshot({ path: resolve(outputDirectory, 'reference-desktop-light.png') });
  diagnostics.reference = await reference.evaluate(() => ({ title: document.title, bodyClass: document.body.className }));

  const implementation = await browser.newPage({ viewport });
  implementation.on('console', (message) => { if (message.type() === 'error') diagnostics.consoleErrors.push(message.text()); });
  implementation.on('pageerror', (error) => diagnostics.consoleErrors.push(error.message));
  await implementation.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/refresh')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'capture-access' }) });
    } else if (path.endsWith('/me')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: 'capture-user', name: 'Capture Owner', email: 'capture@example.com', status: 'active' }, organization: { id: 'capture-org', name: 'Capture Organisation', slug: 'capture' }, roles: ['organisation_admin'], project_memberships: [], active_role: 'organisation_admin', permissions: ['projects.read'] }) });
    } else if (path.endsWith('/users')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ users: [] }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
  });
  await implementation.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await implementation.getByTestId('role-switcher').waitFor({ state: 'visible', timeout: 30_000 });
  await implementation.evaluate(() => document.fonts.ready);
  await implementation.screenshot({ path: resolve(outputDirectory, 'implementation-desktop-light.png') });
  diagnostics.implementation = await implementation.evaluate((names) => Object.fromEntries(names.map((name) => {
    const node = document.querySelector(`[data-v8-region="${name}"]`);
    if (!node) return [name, null];
    const rectangle = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return [name, {
      rectangle: { x: rectangle.x, y: rectangle.y, width: rectangle.width, height: rectangle.height },
      style: { backgroundColor: style.backgroundColor, backgroundImage: style.backgroundImage, borderRightColor: style.borderRightColor, borderLeftColor: style.borderLeftColor, borderBottomColor: style.borderBottomColor, boxShadow: style.boxShadow, fontFamily: style.fontFamily },
    }];
  })), regionNames);
} finally {
  await browser.close();
}

await writeFile(resolve(outputDirectory, 'local-browser-certification.json'), `${JSON.stringify(diagnostics, null, 2)}\n`, 'utf8');
if (diagnostics.consoleErrors.length > 0) throw new Error(`Browser console errors: ${diagnostics.consoleErrors.join(' | ')}`);
