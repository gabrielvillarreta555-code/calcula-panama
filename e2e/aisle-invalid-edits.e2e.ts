import { test, expect } from '@playwright/test';

test('ediciones inválidas no producen errores ni muestran un saldo anterior', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('/compras/modo-pasillo/');
  await page.locator('#aisle-budget').fill('10');
  await page.locator('#aisle-budget').press('Tab');
  await page.locator('#aisle-price').fill('2');
  await page.getByRole('button', { name: 'Añadir producto' }).click();
  await expect(page.locator('[data-aisle-balance]')).toContainText('8.00');

  const quantity = page.locator('.aisle-item').first().getByLabel('Cantidad');
  await quantity.fill('-2');
  await quantity.press('Tab');
  await expect(page.locator('#aisle-error')).not.toBeEmpty();
  await expect(page.locator('.aisle-item').first().getByLabel('Cantidad')).toHaveValue('1');
  await expect(page.locator('[data-aisle-total]')).toContainText('2.00');

  await page.locator('#aisle-budget').fill('-1');
  await page.locator('#aisle-budget').press('Tab');
  await expect(page.locator('#aisle-error')).not.toBeEmpty();
  await expect(page.locator('[data-aisle-balance]')).toContainText('Añade un presupuesto');
  expect(pageErrors).toEqual([]);
});
