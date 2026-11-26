import { defineConfig, devices } from '@playwright/test';

// Validación de producción (CP-ADS-004): sitio principal y app reales, con datos FICTICIOS del canal de ensayo.
// Se ejecuta desde GitHub Actions («Validación de producción»), que instala Chromium, Firefox y WebKit.
export default defineConfig({
  testDir: './e2e/production', testMatch: '**/*.e2e.ts', timeout: 60000, retries: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-produccion' }]],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'webkit-iphone', use: { ...devices['iPhone 13'] } }
  ]
});
