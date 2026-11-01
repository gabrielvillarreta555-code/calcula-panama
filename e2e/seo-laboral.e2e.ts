import { test, expect } from '@playwright/test';

const pages = [
  { path: '/calculadoras/salario-neto/', heading: 'Antes de calcular tu salario neto', form: '#salary-form', field: '#gross' },
  { path: '/calculadoras/vacaciones/', heading: 'Qué necesitas para estimar tus vacaciones', form: '#vacation-form', field: 'input' },
  { path: '/calculadoras/liquidacion-laboral/', heading: 'Qué revisar antes de calcular una liquidación', form: '#termination-form', field: 'input' }
];

for (const width of [320, 375]) {
  for (const item of pages) {
    test(`${item.path}: contenido y formulario en ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 812 });
      const response = await page.goto(item.path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { name: item.heading })).toBeVisible();
      await expect(page.locator(item.form)).toBeVisible();
      await expect(page.locator(item.form).locator(item.field).first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      const links = page.locator('article a');
      await expect(links.filter({ hasText: /calculadora de (vacaciones|liquidación|salario neto)/i }).first()).toBeVisible();
    });
  }
}
