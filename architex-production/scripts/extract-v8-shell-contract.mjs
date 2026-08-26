import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const referencePath = resolve(process.env.V8_REFERENCE_HTML || 'E:/Downloads/architex_datum_os_integrated_modules_v8_engineering_godmode.html');
const outputPath = resolve('fixtures/v8-shell-contract.json');
const source = await readFile(referencePath, 'utf8');

for (const token of ['--rail:74px', '--nav:306px', '--inspector:344px', '--top:66px']) {
  if (!source.includes(token)) throw new Error(`Reference shell token missing: ${token}`);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const viewports = {
  desktop: { width: 1600, height: 1000 },
  tablet: { width: 1024, height: 768 },
  mobile: { width: 390, height: 844 },
};

const selectors = {
  rail: '.os-rail',
  navigator: '.navigator',
  topbar: '.topbar',
  canvas: '.main',
  inspector: '.inspector',
};

const captures = {};
try {
  for (const [name, viewport] of Object.entries(viewports)) {
    await page.setViewportSize(viewport);
    await page.goto(pathToFileURL(referencePath).href, { waitUntil: 'load', timeout: 120_000 });
    await page.waitForTimeout(250);
    captures[name] = await page.evaluate(({ selectors, viewport }) => {
      const roundedRect = (selector) => {
        const element = document.querySelector(selector);
        if (!element || getComputedStyle(element).display === 'none') return null;
        const rect = element.getBoundingClientRect();
        return Object.fromEntries(['x', 'y', 'width', 'height'].map((key) => [key, Math.round(rect[key] * 100) / 100]));
      };
      return {
        viewport,
        regions: Object.fromEntries(Object.entries(selectors).map(([region, selector]) => [region, roundedRect(selector)])),
      };
    }, { selectors, viewport });
  }

  const presentation = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    const labels = Array.from(document.querySelectorAll('.os-label')).map((node) => node.textContent?.trim()).filter(Boolean);
    const workspace = Array.from(document.querySelectorAll('.os-item')).find((node) => node.querySelector('.os-label')?.textContent?.trim() === 'Workspace Tools');
    return {
      labels,
      referenceToolCount: Number(workspace?.querySelector('.os-meta')?.textContent || 0),
      fontFamily: getComputedStyle(document.body).fontFamily,
      colours: {
        teal: style.getPropertyValue('--teal').trim(),
        ink: style.getPropertyValue('--ink').trim(),
        canvas: getComputedStyle(document.body).backgroundColor,
        border: style.getPropertyValue('--border').trim(),
      },
    };
  });

  if (presentation.referenceToolCount !== 45) throw new Error(`Expected 45 reference tools, found ${presentation.referenceToolCount}`);

  const contract = {
    source: referencePath.replaceAll('\\', '/'),
    regions: { rail: { width: 74 }, navigator: { width: 306 }, topbar: { height: 66 }, inspector: { width: 344 } },
    controls: ['theme', 'god-mode', 'role'],
    referenceControlOrder: ['navigation', 'breadcrumb', 'scope', 'project', 'theme', 'god-mode', 'role', 'wingman', 'inspector'],
    ...presentation,
    viewports: captures,
  };
  await mkdir(resolve('fixtures'), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(contract, null, 2)}\n`, 'utf8');
} finally {
  await browser.close();
}
