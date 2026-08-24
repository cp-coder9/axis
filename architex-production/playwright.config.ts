import { defineConfig, devices } from '@playwright/test';

const productionBuild = process.env.E2E_PRODUCTION_BUILD === 'true';
const port = productionBuild ? 3100 : 3000;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 4,
  retries: 0,
  reporter: [['list']],
  timeout: 60_000,
  use: {
    baseURL: process.env.E2E_BASE_URL || `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Auto-start the Next.js dev server for e2e runs (reused when already up).
  // E2E_BASE_URL overrides both the server probe and the test base URL.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : productionBuild
    ? {
        command: 'npm start -- -p 3100',
        url: 'http://127.0.0.1:3100',
        reuseExistingServer: false,
        timeout: 120_000,
      }
    : {
        command: 'npm run dev',
        env: { ...process.env, NEXT_PUBLIC_GOD_MODE_ENABLED: 'true' },
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
