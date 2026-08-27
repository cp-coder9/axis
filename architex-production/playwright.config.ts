import { defineConfig, devices } from '@playwright/test';

const productionBuild = process.env.E2E_PRODUCTION_BUILD === 'true';
const specForgeIsolated = process.env.E2E_SPECFORGE_ISOLATED === 'true';
const port = specForgeIsolated ? Number(process.env.E2E_UI_PORT ?? 3200) : productionBuild ? 3100 : 3000;
const apiPort = Number(process.env.E2E_API_PORT ?? 3300);
const webServerEnv = Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined));

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
  webServer: specForgeIsolated
    ? [
        {
          command: `php -S 127.0.0.1:${apiPort} backend/public/index.php`,
          url: `http://127.0.0.1:${apiPort}/api/v1/health`,
          reuseExistingServer: false,
          timeout: 120_000,
          env: webServerEnv,
        },
        {
          command: `npm run dev -- -p ${port}`,
          url: `http://127.0.0.1:${port}`,
          reuseExistingServer: false,
          timeout: 120_000,
          env: webServerEnv,
        },
      ]
    : process.env.E2E_BASE_URL
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
