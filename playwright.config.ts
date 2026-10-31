import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e', testMatch: '**/*.e2e.ts',
  use: { baseURL: 'http://127.0.0.1:4329', browserName: 'chromium', launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {} },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4329', url: 'http://127.0.0.1:4329', reuseExistingServer: !process.env.CI, timeout: 30000 },
});
