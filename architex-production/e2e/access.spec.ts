import { expect, test } from '@playwright/test';

test.describe('Architex V8 public access', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
  });

  test('clones the public landing and opens the upgraded V8 sign-in console', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'The Operating System for the Built Environment' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Quick navigation' })).toBeVisible();

    await page.getByRole('button', { name: 'Enter OS' }).first().click();
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByText('V8 secure access')).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('requires a role before registration and mounts the V8 OS after sign-in', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.getByRole('heading', { name: 'Join Architex' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up with Email' })).toBeDisabled();

    await page.getByRole('button', { name: /BEP \/ Design Team/ }).click();
    await page.getByRole('button', { name: 'Sign Up with Email' }).click();
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Enter OS' }).first().click();
    await page.getByLabel('Email address').fill('demo@architex.co.za');
    await page.getByLabel('Password').fill('architex-v8');
    await page.getByRole('button', { name: 'Enter workspace' }).click();
    await expect(page.getByTestId('role-switcher')).toBeVisible();
  });
});
