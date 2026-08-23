const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const nav = page.locator('aside').nth(1);
  const main = page.locator('main');

  const mainSnapshot = async (label) => {
    const t = (await main.innerText()).replace(/\s+/g, ' ');
    const hasTakeoff = t.includes('Drawing Takeoff') || t.includes('Drawing Schedule Takeoff');
    const hasBoMItems = t.includes('Trade Quantities') || t.includes('Measured BoM');
    const hasTender = t.includes('Tender Packages') || t.includes('JBCC Principal');
    console.log(`[${label}] takeoff=${hasTakeoff} boMItems=${hasBoMItems} tender=${hasTender}`);
  };

  // --- BoM test: open bom tool from standalone registry ---
  await page.getByTestId('mode-standalone').click();
  await page.waitForTimeout(300);
  await page.getByTestId('tool-bom').click();
  await page.waitForTimeout(600);
  console.log('Opened BoM. Navigator tabs:');
  const navText = (await nav.innerText()).replace(/\s+/g, ' ');
  console.log(navText.slice(0, 300));
  await mainSnapshot('initial (expect boMItems=true)');

  // Click navigator sub-rail tab "Drawing Takeoff"
  const navTakeoff = nav.getByRole('button', { name: 'Drawing Takeoff', exact: true });
  if (await navTakeoff.count()) {
    await navTakeoff.click();
    await page.waitForTimeout(500);
    console.log('Clicked navigator sub-rail "Drawing Takeoff"');
    await mainSnapshot('after nav sub-rail click (expect takeoff=true)');
  } else {
    console.log('Nav tab "Drawing Takeoff" NOT FOUND');
  }

  // Click the module's own top menu tab "Drawing Takeoff"
  const modTakeoff = main.getByRole('button', { name: 'Drawing Takeoff', exact: true });
  if (await modTakeoff.count()) {
    await modTakeoff.click();
    await page.waitForTimeout(500);
    console.log('Clicked module top-menu "Drawing Takeoff"');
    await mainSnapshot('after module top-menu click (expect takeoff=true)');
  }

  // --- Practice test: highlight sync check ---
  await page.locator('aside').nth(0).getByRole('button', { name: /Project Space/ }).click();
  await page.waitForTimeout(300);
  await page.getByTestId('tool-practice').click();
  await page.waitForTimeout(600);

  const navAfterOpen = nav.locator('button');
  const activeNavLabel = await nav.evaluate(() => {
    const b = document.querySelector('aside:nth-of-type(2) button.border-\\[\\#19B7B0\\]');
    return b ? b.textContent.trim().replace(/\s+/g, ' ') : '(none)';
  });
  console.log('\nActive nav tab after opening practice:', activeNavLabel);

  // Click module top menu "Action Centre (Kanban)" -> does nav highlight move?
  await main.getByRole('button', { name: /Action Centre \(Kanban\)/ }).click();
  await page.waitForTimeout(500);
  const activeNavAfter = await nav.evaluate(() => {
    const b = document.querySelector('aside:nth-of-type(2) button.border-\\[\\#19B7B0\\]');
    return b ? b.textContent.trim().replace(/\s+/g, ' ') : '(none)';
  });
  console.log('Active nav tab after module top-menu click:', activeNavAfter);

  await browser.close();
})();
