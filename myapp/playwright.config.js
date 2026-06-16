// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright config for the Expo **web** build of the Svakarma app.
 * The app is React Native; Playwright drives its react-native-web render.
 *
 * Prereq: run the web build in another terminal first →  npm run web
 * (serves at http://localhost:8081). Then:  npm run test:e2e
 */
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:8081',
    // Mobile-sized viewport so the RN layout renders like a phone.
    viewport: { width: 414, height: 896 },
    actionTimeout: 15_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 414, height: 896 } } },
  ],

  // Reuses an already-running `npm run web`. If none is running, Playwright
  // starts it (first run is slow — Metro must bundle for web).
  webServer: {
    command: 'npm run web',
    url: 'http://localhost:8081',
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
