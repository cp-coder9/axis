const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const dump = async (label) => {
    const h1 = await page.locator('main h1').first().innerText().catch(() => '(no h1)');
    const mainText = (await page.locator('main').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 120);
    console.log(`[${label}] h1=${JSON.stringify(h1)} main=${JSON.stringify(mainText)}`);
  };

  await dump('initial');

  // --- Test OS rail items (aside 0) ---
  const rail0 = page.locator('aside').nth(0);
  const rail0Btns = await rail0.locator('button').all();
  console.log('OS RAIL buttons:', rail0Btns.length);
  for (const b of rail0Btns) {
    const label = (await b.textContent() || '').replace(/\s+/g, ' ').trim();
    if (!label) continue;
    try {
      await b.click();
      await page.waitForTimeout(350);
      const activeGlobal = await rail0.locator('button.bg-white').first().getAttribute('title').catch(() => null);
      console.log(`  OS click "${label.slice(0,25)}" -> active=${activeGlobal}`);
    } catch (e) {
      console.log(`  OS click "${label.slice(0,25)}" FAILED: ${e.message.slice(0,120)}`);
    }
  }

  // --- Test ContextNavigator tool list buttons (aside 1) ---
  const rail1 = page.locator('aside').nth(1);
  const rail1Btns = await rail1.locator('button').all();
  console.log('\nNAV buttons:', rail1Btns.length);
  for (const b of rail1Btns) {
    const label = (await b.textContent() || '').replace(/\s+/g, ' ').trim();
    if (!label || ['Project', 'Standalone', '×', 'Add project', 'Create project', 'Cancel'].includes(label)) continue;
    try {
      await b.click();
      await page.waitForTimeout(400);
      const bodyHasTool = await page.locator('main h1').innerText().catch(() => '');
      console.log(`  NAV click "${label.slice(0,30)}" -> h1=${JSON.stringify((bodyHasTool||'').slice(0,40))}`);
    } catch (e) {
      console.log(`  NAV click "${label.slice(0,30)}" FAILED: ${e.message.slice(0,150)}`);
    }
  }

  await browser.close();
})();
