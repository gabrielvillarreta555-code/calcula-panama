import { test, expect } from '@playwright/test';

test('Modo Pasillo calcula, edita y elimina en 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto('/compras/modo-pasillo/');
  await expect(page.locator('html')).toHaveJSProperty('scrollWidth', 320);
  await page.locator('#aisle-budget').fill('20.00');
  await page.locator('#aisle-budget').press('Tab');
  await page.locator('#aisle-name').fill('Leche');
  await page.locator('#aisle-price').fill('3.25');
  await page.locator('#aisle-quantity').fill('2');
  await page.getByRole('button', { name: 'Añadir producto' }).click();

  await expect(page.locator('[data-aisle-total]')).toHaveText(/6[,.]50/);
  await expect(page.locator('[data-aisle-balance]')).toContainText(/13[,.]50/);
  await expect(page.locator('[data-aisle-count]')).toContainText('1 producto');

  const row = page.locator('.aisle-item').first();
  await row.getByLabel('Cantidad').fill('3');
  await row.getByLabel('Cantidad').press('Tab');
  await expect(page.locator('[data-aisle-total]')).toHaveText(/9[,.]75/);
  await expect(page.locator('[data-aisle-balance]')).toContainText(/10[,.]25/);

  await row.getByRole('button', { name: /Eliminar/ }).click();
  await expect(page.locator('[data-aisle-total]')).toHaveText(/0[,.]00/);
  await expect(page.locator('#aisle-empty')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('valida entradas y muestra presupuesto excedido a 375 px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/compras/modo-pasillo/');
  await page.locator('#aisle-budget').fill('5');
  await page.locator('#aisle-budget').press('Tab');
  await page.locator('#aisle-price').fill('-1');
  await page.getByRole('button', { name: 'Añadir producto' }).click();
  await expect(page.locator('#aisle-error')).not.toBeEmpty();

  await page.locator('#aisle-price').fill('3.00');
  await page.locator('#aisle-quantity').fill('2');
  await page.getByRole('button', { name: 'Añadir producto' }).click();
  await expect(page.locator('#aisle-mode')).toHaveClass(/is-over-budget/);
  await expect(page.locator('[data-aisle-balance]')).toContainText(/Excedido.*1[,.]00/);
  await expect(page.locator('#aisle-meter')).toBeVisible();
  await page.locator('#aisle-name').focus();
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: 'test-results/screenshots/modo-pasillo-375.png', fullPage: true });
});

test('mantiene datos solo en memoria y Blue ofrece ayuda determinista', async ({ page }) => {
  await page.goto('/compras/modo-pasillo/');
  await page.locator('#aisle-name').fill('Arroz');
  await page.locator('#aisle-price').fill('2.50');
  await page.getByRole('button', { name: 'Añadir producto' }).click();
  await expect(page.locator('.aisle-item')).toHaveCount(1);
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => /aisle|pasillo|product|budget/i.test(key)))).toEqual([]);

  const guide = page.locator('#blue-help');
  await guide.locator(':scope > summary').click();
  await expect(guide.locator('.blue-help-content')).toContainText('No se aplican impuestos ni descuentos automáticamente');
  await page.reload();
  await expect(page.locator('.aisle-item')).toHaveCount(0);
});

test('acepta nombre opcional, coma decimal y cantidad fraccionaria', async ({ page }) => {
  await page.goto('/compras/modo-pasillo/');
  await page.locator('#aisle-price').fill('1,99');
  await page.locator('#aisle-quantity').fill('0,5');
  await page.getByRole('button', { name: 'Añadir producto' }).click();
  await expect(page.locator('.aisle-item')).toContainText('Producto sin nombre');
  await expect(page.locator('[data-aisle-total]')).toHaveText(/1[,.]00/);
});
