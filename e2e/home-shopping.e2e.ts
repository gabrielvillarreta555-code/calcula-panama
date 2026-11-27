import { test, expect } from '@playwright/test';

for (const width of [320, 375, 1280]) {
  test(`portada y Compras son visibles y navegables a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    // Portada editorial (CP-DESIGN-006): Modo Pasillo sigue accesible desde la sección Compras.
    await page.goto('/');
    await expect(page.locator('#hogar').getByRole('link', { name: /Modo Pasillo/ })).toHaveAttribute('href', '/compras/modo-pasillo/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.goto('/compras/');
    await expect(page.getByRole('heading', { name: /compra más tranquila/ })).toBeVisible();
    await expect(page.locator('.shopping-scene-blue')).toBeVisible();
    await expect(page.getByRole('link', { name: /Ir a Modo Pasillo/ })).toHaveAttribute('href', '/compras/modo-pasillo/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('las guías siguen disponibles fuera de la portada', async ({ page }) => {
  await page.goto('/guias/');
  await expect(page.getByRole('link', { name: /Descuentos del salario en Panamá/ }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Décimo tercer mes: fechas/ }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Prima de antigüedad e indemnización/ }).first()).toBeVisible();
});
