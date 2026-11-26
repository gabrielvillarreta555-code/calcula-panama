import { test, expect } from '@playwright/test';

for (const width of [320, 390, 768, 1440]) {
  test(`portada Midnight y Compras son visibles y navegables a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Decisiones inteligentes.');
    await expect(page.getByRole('link', { name: /Explorar herramientas/ })).toHaveAttribute('href', '/herramientas/');
    for (const [name, href] of [['Modo Pasillo', '/compras/modo-pasillo/'], ['Salario neto', '/calculadoras/salario-neto/'], ['Financiamiento de autos', '/vehiculos/financiamiento-de-auto/'], ['Calculadora de promedio de notas y nota necesaria', '/educacion/promedio-de-notas/']] as const) {
      await expect(page.locator('main').getByRole('link', { name, exact: true }).first()).toHaveAttribute('href', href);
    }
    for (const id of ['movilidad-title', 'finanzas-title', 'trabajo-title', 'cotidiano-title', 'educacion-title', 'revista-title']) await expect(page.locator(`#${id}`)).toBeVisible();
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
