import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests run against the running stack (docker compose up) at :4200.
 * Override the target with E2E_BASE_URL.
 * Tests use unique emails so they don't collide; workers = 1 keeps the
 * shared backend state predictable.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4200',
    headless: true,
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
