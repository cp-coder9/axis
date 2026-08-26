import { expect, test } from '@playwright/test';

test.describe('Architex V8 public access', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
  });

  test('clones the public landing and opens the upgraded V8 sign-in console', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'The Operating System for the Built Environment' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();

    await page.getByRole('button', { name: 'Sign in' }).first().click();
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByText('V8 secure access')).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('morphs registration from the sign-in panel', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).first().click();
    await page.getByRole('tab', { name: 'Create account' }).click();
    await expect(page.getByRole('heading', { name: 'Join Architex OS' })).toBeVisible();
    await expect(page.getByLabel('Full name')).toBeVisible();
    await expect(page.getByLabel('Organisation name')).toBeVisible();
    await expect(page.getByLabel('Role profile')).toBeVisible();

    await page.getByRole('tab', { name: 'Sign in' }).click();
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByLabel('Full name')).toBeHidden();

  });

  test('signs in, restores, and revokes through the real auth protocol', async ({ page }) => {
    let refreshSession = false;
    const requests: string[] = [];
    const profile = {
      user: { id: 'user-e2e', name: 'E2E Owner', email: 'owner@example.com', status: 'active' },
      organization: { id: 'org-e2e', name: 'E2E Organisation', slug: 'e2e-organisation' },
      roles: ['organisation_admin'],
      project_memberships: [],
      active_role: 'organisation_admin',
      permissions: ['projects.read'],
    };

    await page.route('**/api/v1/**', async (route) => {
      const path = new URL(route.request().url()).pathname;
      requests.push(path);
      if (path.endsWith('/auth/login')) {
        refreshSession = true;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'access-login' }) });
      } else if (path.endsWith('/auth/refresh')) {
        await route.fulfill({ status: refreshSession ? 200 : 401, contentType: 'application/json', body: JSON.stringify(refreshSession ? { access_token: 'access-refresh' } : { error: 'Unauthenticated' }) });
      } else if (path.endsWith('/auth/logout')) {
        refreshSession = false;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'signed_out' }) });
      } else if (path.endsWith('/me')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(profile) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      }
    });

    await page.getByRole('button', { name: 'Sign in' }).first().click();
    await page.getByLabel('Email address').fill('owner@example.com');
    await page.getByLabel('Password').fill('correct horse battery staple');
    await page.getByRole('button', { name: 'Enter workspace' }).click();
    await expect(page.getByTestId('role-switcher')).toBeVisible();

    await page.reload();
    await expect(page.getByTestId('role-switcher')).toBeVisible();
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', { name: 'The Operating System for the Built Environment' })).toBeVisible();

    expect(requests).toEqual(expect.arrayContaining([
      '/api/v1/auth/login',
      '/api/v1/me',
      '/api/v1/auth/refresh',
      '/api/v1/auth/logout',
    ]));
  });
});
