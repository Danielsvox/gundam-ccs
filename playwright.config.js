const { defineConfig, devices } = require('@playwright/test');

const PORT = 3100;

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Each test starts with a clean browser context; the API is mocked per test (e2e/mockApi.js).
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm start',
    port: PORT,
    reuseExistingServer: true,
    timeout: 180_000,
    env: {
      PORT: String(PORT),
      BROWSER: 'none',
      REACT_APP_API_BASE_URL: 'http://localhost:8000/api/v1',
    },
  },
});
