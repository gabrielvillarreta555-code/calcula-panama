import { test, expect } from '@playwright/test';

for (const width of [320, 375, 1280]) {
  test(`resumen y formulario se ordenan en una columna a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/compras/modo-pasillo/');
    const summary = await page.locator('.aisle-summary').boundingBox();
    const form = await page.locator('.aisle-entry').boundingBox();
    const list = await page.locator('.aisle-cart').boundingBox();
    expect(summary && form && list).toBeTruthy();
    expect(summary!.y + summary!.height).toBeLessThanOrEqual(form!.y + 1);
    expect(form!.y + form!.height).toBeLessThanOrEqual(list!.y + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('#aisle-price')).toHaveAttribute('inputmode', 'decimal');
  });
}

test('cantidad táctil y resumen se actualizan sin alterar el cálculo', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/compras/modo-pasillo/');
  await page.locator('#aisle-budget').fill('10');
  await page.locator('#aisle-budget').press('Tab');
  await page.locator('#aisle-price').fill('4.50');
  await page.getByRole('button', { name: 'Aumentar cantidad' }).click();
  await expect(page.locator('#aisle-quantity')).toHaveValue('2');
  await page.getByRole('button', { name: 'Añadir producto' }).click();
  await expect(page.locator('[data-aisle-total]')).toContainText('9.00');
  await expect(page.locator('[data-aisle-balance]')).toContainText('1.00');
  await expect(page.locator('[data-aisle-hint]')).toContainText('cerca del límite');
  await expect(page.locator('#aisle-price')).toBeFocused();
  await expect(page.locator('#aisle-price')).toHaveValue('');
  await expect(page.locator('#aisle-quantity')).toHaveValue('1');
  await page.getByRole('button', { name: 'Disminuir cantidad' }).click();
  await expect(page.locator('#aisle-quantity')).toHaveValue('1');
});

test('el resumen no queda fijo al enfocar un campo', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 1000 });
  await page.goto('/compras/modo-pasillo/');
  await page.locator('#aisle-price').focus();
  await expect(page.locator('.aisle-summary')).not.toHaveCSS('position', 'sticky');
});

test('sin JavaScript no se envían los datos mediante el formulario', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto('/compras/modo-pasillo/');
  await expect(page.getByRole('button', { name: 'Añadir producto' })).toBeDisabled();
  await page.locator('#aisle-price').fill('123.45');
  await page.locator('#aisle-price').press('Enter');
  await page.waitForTimeout(200);
  expect(new URL(page.url()).search).toBe('');
  await expect(page.getByText(/Activa JavaScript para añadir productos/)).toBeVisible();
  await context.close();
});
