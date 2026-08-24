import { expect, test } from '@playwright/test';

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
