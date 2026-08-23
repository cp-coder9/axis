const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // List all data-testid tool buttons visible in the nav (aside 1)
  const nav = page.locator('aside').nth(1);
  const toolBtns = nav.locator('button[data-testid^="tool-"]');
  const count = await toolBtns.count();
  console.log('TOOL BUTTONS in nav:', count);

  for (let i = 0; i < count; i++) {
    const btn = toolBtns.nth(i);
    const tid = await btn.getAttribute('data-testid');
    const label = (await btn.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    // Navigate back to project space to reset
    if (i > 0) {
      await page.locator('aside').nth(0).getByRole('button', { name: /Project Space/ }).click();
      await page.waitForTimeout(250);
    }
    const freshBtn = nav.locator(`button[data-testid="${tid}"]`).first();
    try {
      await freshBtn.click();
      await page.waitForTimeout(450);
      const h1 = await page.locator('main h1').first().innerText().catch(() => '(no h1)');
      const navNow = (await nav.innerText().catch(() => '')).replace(/\s+/g, ' ');
      const inside = navNow.includes('Inside');
      const activeTabVisible = navNow.includes('General') || /Inside/.test(navNow);
      console.log(`  ${tid} "${label.slice(0, 28)}" -> h1=${JSON.stringify((h1||'').slice(0,30))} navInside=${inside}`);
    } catch (e) {
      console.log(`  ${tid} "${label.slice(0, 28)}" FAILED: ${e.message.slice(0, 120)}`);
    }
  }

  await browser.close();
})();
