const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const nav = page.locator('aside').nth(1);
  const main = page.locator('main');

  // Open a tool from the project navigator
  await page.getByTestId('tool-practice').click();
  await page.waitForTimeout(600);

  const navText0 = (await nav.innerText()).replace(/\s+/g, ' ');
  console.log('NAV after opening practice (first 400):', navText0.slice(0, 400));
  console.log('---');
  const mainText0 = (await main.innerText()).replace(/\s+/g, ' ').slice(0, 200);
  console.log('MAIN after opening practice:', mainText0);

  // Click a tab in the navigator (the sub-rail): "Programme & Gantt"
  const programmeTab = nav.getByRole('button', { name: /Programme & Gantt/ });
  console.log('\nNavigator tab count:', await nav.locator('button').count());
  const progVisible = await programmeTab.count();
  console.log('Programme & Gantt tab in nav:', progVisible);

  if (progVisible) {
    await programmeTab.click();
    await page.waitForTimeout(500);
    const mainAfterNavTab = (await main.innerText()).replace(/\s+/g, ' ').slice(0, 300);
    console.log('MAIN after clicking nav tab (Programme & Gantt):', mainAfterNavTab);
  }

  // Now use the module's own top menu: click "Action Centre (Kanban)"
  const moduleTab = page.locator('main').getByRole('button', { name: /Action Centre \(Kanban\)/ });
  if (await moduleTab.count()) {
    await moduleTab.click();
    await page.waitForTimeout(500);
    const mainAfterModuleTab = (await main.innerText()).replace(/\s+/g, ' ').slice(0, 300);
    console.log('MAIN after clicking module top tab (Action Centre):', mainAfterModuleTab);
  }

  console.log('ERRORS:', JSON.stringify(errors));
  await browser.close();
})();
