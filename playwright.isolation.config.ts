import { defineConfig } from '@playwright/test';

// Pruebas de aislamiento de Mi Quincena y de la guardia de publicidad (CP-ADS-003).
// Tres orígenes reales: el sitio principal, la app y un sitio ajeno, todos en *.localhost.
export default defineConfig({
  testDir: './e2e/isolation', testMatch: '**/*.e2e.ts', timeout: 60000,
  use: { browserName: 'chromium', launchOptions: { args: ['--no-proxy-server'], ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) } },
  webServer: {
    command: 'node scripts/build-isolation-test.mjs && node scripts/static-server.mjs dist-test-main:4331 dist-test-app:4332 e2e/isolation/fixtures:4333',
    url: 'http://127.0.0.1:4333/', reuseExistingServer: false, timeout: 180000
  }
});
