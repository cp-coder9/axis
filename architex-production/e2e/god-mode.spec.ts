import { expect, test } from '@playwright/test';
import { ROLE_PROFILES, STAGES, STAGE_TOOL_MAP } from '@/lib/data';

test('P7-T08 release flag disabled removes the God Mode entry point', async ({ page }) => {
  test.skip(process.env.NEXT_PUBLIC_GOD_MODE_ENABLED !== 'false', 'requires the disabled production artifact');
  await page.goto('/?workspace=v8');
  await expect(page.getByTestId('god-mode-toggle')).toHaveCount(0);
});

test('P7-T05 God Mode toggle exposes stable selected semantics', async ({ page }) => {
  await page.goto('/?workspace=v8');
  const toggle = page.getByTestId('god-mode-toggle');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
});

test('P7-T03 God Mode lens does not change the authenticated role', async ({ page }) => {
  await page.goto('/?workspace=v8');
  const roleSwitcher = page.getByTestId('role-switcher');
  await expect(roleSwitcher).toHaveValue('architect');
  await page.getByTestId('god-mode-toggle').click();
  await page.getByRole('button', { name: /Quantity Surveyor/ }).click();

  await expect(roleSwitcher).toHaveValue('architect');
  await expect(page.getByRole('button', { name: /Quantity Surveyor/ })).toHaveAttribute('aria-pressed', 'true');
});

test('P7-T03 every God Mode lens remains a session-only presentation choice', async ({ page }) => {
  await page.goto('/?workspace=v8');
  const roleSwitcher = page.getByTestId('role-switcher');
  await expect(roleSwitcher).toHaveValue('architect');
  await page.getByTestId('god-mode-toggle').click();

  const lenses = page.getByRole('group', { name: 'Role lenses' });
  for (const [role, profile] of Object.entries(ROLE_PROFILES)) {
    const code = profile.code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const lens = lenses.getByRole('button', { name: new RegExp(`^${code}\\s`) });
    await lens.click();
    await expect(lens).toHaveAttribute('aria-pressed', 'true');
    await expect(roleSwitcher, `${role} must not alter the authenticated role`).toHaveValue('architect');
  }
});

test('P7-T04 handoff explorer opens governed stage details and restores focus', async ({ page }) => {
  await page.goto('/?workspace=v8');
  await page.getByRole('button', { name: 'God Mode Explore' }).click();
  const explorer = page.getByRole('button', { name: 'Explore handoffs' });
  await explorer.click();
  const dialog = page.getByRole('dialog', { name: 'Governed handoffs' });
  await expect(dialog).toContainText('Project brief');
  await dialog.getByRole('button', { name: /Brief.*Project brief/ }).click();
  await expect(dialog).toContainText('Client brief confirmation');
  await page.keyboard.press('Escape');
  await expect(explorer).toBeFocused();
});

test('P7-T02 God stage exploration renders the complete selected stage map without changing the project stage', async ({ page }) => {
  await page.goto('/?workspace=v8');
  await page.getByRole('button', { name: 'God Mode Explore' }).click();
  await page.getByRole('button', { name: 'Brief' }).click();

  const datum = page.getByTestId('datum-canvas');
  await expect(page.getByTestId('god-mode-datum')).toHaveText('Brief exploration');
  expect(await datum.locator('[data-tool-id]').evaluateAll(
    (cards) => cards.map((card) => card.getAttribute('data-tool-id')),
  )).toEqual(STAGE_TOOL_MAP.Brief);
  await page.getByTitle('Exit God Mode').click();
  await expect(page.getByTestId('god-mode-datum')).toHaveCount(0);
  await expect(page.getByText('Design Stage:', { exact: true })).toBeVisible();
});

test('P7-T02 every God Mode stage renders its canonical map without durable stage mutation', async ({ page }) => {
  for (const stage of STAGES) {
    await page.goto('/?workspace=v8');
    await page.getByRole('button', { name: 'God Mode Explore' }).click();
    const datum = page.getByTestId('datum-canvas');
    await page.getByRole('button', { name: new RegExp(`^\\d+\\s${stage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).click();
    await expect(page.getByTestId('god-mode-datum')).toHaveText(`${stage} exploration`);
    expect(await datum.locator('[data-tool-id]').evaluateAll(
      (cards) => cards.map((card) => card.getAttribute('data-tool-id')),
    )).toEqual(STAGE_TOOL_MAP[stage]);
    await page.getByTitle('Exit God Mode').click();
    await expect(page.getByTestId('god-mode-datum')).toHaveCount(0);
    await expect(page.getByText('Design Stage:', { exact: true })).toBeVisible();
  }
});
