// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = 'https://opensource-demo.orangehrmlive.com';
const AUTH_FILE = 'playwright/.auth/admin.json';
const isCI = !!process.env.CI;

module.exports = defineConfig({
  testDir: './tests',

  // The public demo is shared and slow: run one test at a time and allow generous timeouts
  fullyParallel: false,
  workers: 1,
  timeout: 150_000,
  expect: { timeout: 15_000 },

  forbidOnly: isCI,         // fail CI if a test.only is left in by mistake
  retries: isCI ? 2 : 1,    // the shared demo site occasionally hiccups

  reporter: isCI
    ? [['list'], ['github'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    viewport: { width: 1280, height: 720 },
    navigationTimeout: 60_000,
    actionTimeout: 15_000,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.js/,
    },
  ],

  outputDir: 'test-results/',
});
