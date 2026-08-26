import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const source = resolve(process.env.V8_REFERENCE_HTML || 'E:/Downloads/architex_datum_os_integrated_modules_v8_engineering_godmode.html');
const output = resolve('fixtures/v8-project-datum-contract.json');
const viewport = { width: 1600, height: 1000 };

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport });
  await page.goto(pathToFileURL(source).href, { waitUntil: 'load', timeout: 120_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.main .datum-viewport').waitFor({ state: 'visible', timeout: 30_000 });

  const contract = await page.evaluate(() => {
    const required = (selector) => {
      const node = document.querySelector(selector);
      if (!(node instanceof HTMLElement)) throw new Error(`Missing reference selector: ${selector}`);
      return node;
    };
    const rectangle = (selector) => {
      const box = required(selector).getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    };
    const computedStyle = (selector) => {
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
    const actionKey = (label) => label.trim().toLowerCase().replace(/\s+/g, '-');

    return {
      source: 'E:/Downloads/architex_datum_os_integrated_modules_v8_engineering_godmode.html',
      viewport: { width: 1600, height: 1000 },
      regions: {
        pageHead: rectangle('.main .page-head'),
        roleBanner: rectangle('.main .role-banner'),
        projectHero: rectangle('.main .project-hero'),
        datumViewport: rectangle('.main .datum-viewport'),
      },
      controlOrder: [...document.querySelectorAll('.main .page-head .btn')].map((node) => actionKey(node.textContent || '')),
      labels: {
        stages: [...document.querySelectorAll('.main .stage span')].map((node) => (node.textContent || '').trim()),
      },
      details: {
        pageIcon: rectangle('.main .page-icon'),
        actions: [...document.querySelectorAll('.main .page-head .btn')].map((node) => ({
          id: actionKey(node.textContent || ''),
          rectangle: rectangle(`.main .page-head .btn:nth-of-type(${[...node.parentElement.children].indexOf(node) + 1})`),
        })),
        roleAvatar: {
          text: required('.main .role-avatar').textContent.trim(),
          rectangle: rectangle('.main .role-avatar'),
        },
        projectTitleFontWeight: getComputedStyle(required('.main .project-top h2')).fontWeight,
        datumCards: [...document.querySelectorAll('.main .datum-card')].map((node) => {
          const box = node.getBoundingClientRect();
          return { x: box.x, y: box.y, width: box.width };
        }),
      },
      computedStyles: {
        pageTitle: computedStyle('.main .page-head h1'),
        roleBanner: computedStyle('.main .role-banner'),
        projectHero: computedStyle('.main .project-hero'),
        stage: computedStyle('.main .stage'),
        activeStage: computedStyle('.main .stage.active i'),
        datumViewport: computedStyle('.main .datum-viewport'),
        datumLine: computedStyle('.main .datum-line'),
        datumCard: computedStyle('.main .datum-card'),
      },
    };
  });

  await writeFile(output, `${JSON.stringify(contract, null, 2)}\n`, 'utf8');
} finally {
  await browser.close();
}
