import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e', testMatch: '**/*.e2e.ts',
  use: { baseURL: 'http://127.0.0.1:4329', browserName: 'chromium', launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {} },
  // Astro 7 inicia preview como proceso de fondo en CI; seguir su log mantiene
  // vivo el proceso que Playwright supervisa mientras prueba la compilación real.
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4329 && npm run preview -- logs --follow', url: 'http://127.0.0.1:4329', reuseExistingServer: !process.env.CI, timeout: 30000 },
});
