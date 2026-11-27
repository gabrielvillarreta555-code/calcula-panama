import { test, expect, type Page } from '@playwright/test';
import { expansionTools } from '../src/data/expansion-tools';
async function fill(page: Page, values: Record<string,string>) { for (const [key,value] of Object.entries(values)) await page.locator(`[name="${key}"]`).fill(value); }
async function calculate(page: Page) { await page.getByRole('button', { name: 'Calcular', exact: true }).click(); }
for (const tool of expansionTools) {
  test(`${tool.id}: HTML, canonical, sitemap, directory, labels and mobile`, async ({ page, request }) => {
    const response = await request.get(tool.path); expect(response.status()).toBe(200);
    const html = await response.text(); expect(html).toContain(tool.example); expect(html).toContain('Cómo se calcula');
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/herramientas/'); await page.locator(`main a[href="${tool.path}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(tool.path));
    await expect(page.locator('h1')).toHaveText(tool.title);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://calculapanama.com${tool.path}`);
    await expect(page.locator('meta[name=description]')).toHaveAttribute('content', tool.description);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('input,select').evaluateAll(inputs => inputs.every(el => (el as HTMLInputElement).labels?.length))).toBe(true);
    expect(await page.locator('[id]').evaluateAll(elements => new Set(elements.map(el => el.id)).size === elements.length)).toBe(true);
    for (const map of ['/sitemap.xml','/sitemap-0.xml']) expect(await (await request.get(map)).text()).toContain(`https://calculapanama.com${tool.path}`);
    for (const link of tool.related) expect((await request.get(link.path)).status()).toBe(200);
    await expect(page.locator('script[src*="adsbygoogle"]')).toHaveCount(0);
    await calculate(page); await expect(page.locator('[data-error]')).toBeVisible(); await expect(page.locator('[data-error]')).toBeFocused();
  });
}
test('unit comparison: add/remove, incompatible units, comma decimal and stale result', async ({ page }) => {
  await page.goto('/compras/precio-por-unidad/');
  const rows = page.locator('.tool-row');
  await rows.nth(0).getByLabel('Precio del paquete').fill('2'); await rows.nth(0).getByLabel('Contenido').fill('500');
  await rows.nth(1).getByLabel('Precio del paquete').fill('2,70'); await rows.nth(1).getByLabel('Contenido').fill('750');
  await calculate(page); await expect(page.locator('[data-result]')).toContainText('producto 2');
  await rows.nth(1).getByLabel('Unidad', { exact: true }).selectOption('ml'); await expect(page.locator('[data-result]')).toBeEmpty();
  await calculate(page); await expect(page.locator('[data-error]')).toContainText('compatibles');
  await page.getByRole('button', { name: 'Añadir producto', exact: true }).click(); await expect(rows).toHaveCount(3);
  await rows.nth(2).getByRole('button').click(); await expect(rows).toHaveCount(2);
});
test('discount modes, fractional quantity and reset', async ({ page }) => {
  await page.goto('/compras/descuentos-y-promociones/'); await fill(page, { price: '6', quantity: '3' });
  await page.locator('[name=mode]').selectOption('3x2'); await expect(page.locator('[name=discount]')).toBeHidden(); await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('B/.12.00');
  await page.locator('[name=mode]').selectOption('successive'); await fill(page, { price: '100', quantity: '1', discount: '20', secondDiscount: '10' }); await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('B/.72.00');
  await fill(page, { quantity: '1.5' }); await calculate(page); await expect(page.locator('[data-error]')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar' }).click(); await expect(page.locator('[data-error]')).toBeHidden(); await expect(page.locator('[data-result]')).toBeEmpty();
});
test('savings dates, twelve exact contributions and no automatic storage', async ({ page }) => {
  await page.goto('/finanzas/meta-de-ahorro/'); await fill(page, { goal: '600', saved: '120', start: '2027-01-01', end: '2027-06-30' });
  await calculate(page); await expect(page.locator('[data-result]')).toContainText('B/.40.00'); await expect(page.locator('[data-result]')).toContainText('12 aportes');
  await page.getByText('Ver calendario de aportes').click(); await expect(page.locator('tbody tr')).toHaveCount(12);
  await page.reload(); await expect(page.locator('[name=goal]')).toHaveValue('');
});
test('weighted grades, partial target and impossible objective', async ({ page }) => {
  await page.goto('/educacion/promedio-de-notas/'); const rows = page.locator('.tool-row');
  await rows.nth(0).getByLabel('Nota obtenida').fill('80'); await rows.nth(0).getByLabel('Peso en').fill('40');
  await rows.nth(1).getByLabel('Nota obtenida').fill('90'); await rows.nth(1).getByLabel('Peso en').fill('60');
  await calculate(page); await expect(page.locator('[data-result]')).toContainText('Nota final: 86.00');
  await rows.nth(1).getByRole('button').click(); await fill(page, { target: '70' }); await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('63.33');
  await rows.nth(0).getByLabel('Nota obtenida').fill('0'); await rows.nth(0).getByLabel('Peso en').fill('90'); await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('no alcanzable');
});
test('electricity: no default tariff, hypothetical cost, invalid hours and no requests with inputs', async ({ page }) => {
  await page.goto('/vida-cotidiana/consumo-electrico/', { waitUntil: 'networkidle' }); const requests: string[] = []; page.on('request', r => requests.push(r.url()));
  await fill(page, { watts: '100', hours: '5' }); await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('15.000 kWh'); await expect(page.locator('[data-result]')).toContainText('Sin estimación de costo');
  await fill(page, { rate: '0,20' }); await calculate(page); await expect(page.locator('[data-result]')).toContainText('B/.3.00');
  await fill(page, { hours: '25' }); await calculate(page); await expect(page.locator('[data-error]')).toContainText('Horas diarias');
  expect(requests).toEqual([]);
});
for (const width of [320, 390, 900, 1024, 1440]) {
  test(`directory and tools layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/herramientas/', ...expansionTools.map(t => t.path)]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
      if (width === 390 || width === 1440) await page.screenshot({ path: `test-results/expansion-3/${path.split('/').filter(Boolean).at(-1)}-${width}.png`, fullPage: true, animations: 'disabled' });
    }
  });
}
test('readable content without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false }); const page = await context.newPage();
  for (const tool of expansionTools) { await page.goto(`http://127.0.0.1:4329${tool.path}`); await expect(page.locator('h1')).toHaveText(tool.title); await expect(page.getByText('Activa JavaScript para calcular.', { exact: false })).toBeVisible(); await expect(page.getByRole('button', { name: 'Calcular', exact: true })).toBeDisabled(); }
  await context.close();
});
