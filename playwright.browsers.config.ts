import { defineConfig, devices } from '@playwright/test';

// CP-DESIGN-007: pruebas de las herramientas con Midnight Functional en Firefox y WebKit (motor de Safari,
// escritorio y iPhone) sobre la compilación local. Se ejecuta en CI («Navegadores») porque aquí solo hay Chromium.
export default defineConfig({
  testDir: './e2e',
  testMatch: ['navegadores/**/*.e2e.ts', 'mi-quincena.e2e.ts', 'aisle.e2e.ts', 'aisle-invalid-edits.e2e.ts', 'aisle-mobile-redesign.e2e.ts', 'horas-extras.e2e.ts'],
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://127.0.0.1:4329' },
  projects: [
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'webkit-iphone', use: { ...devices['iPhone 13'] } }
  ],
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4329 && npm run preview -- logs --follow', url: 'http://127.0.0.1:4329', reuseExistingServer: !process.env.CI, timeout: 30000 },
});
