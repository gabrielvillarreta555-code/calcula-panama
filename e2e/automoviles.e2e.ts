import { test, expect, type Page } from '@playwright/test';
import { vehicleTools } from '../src/data/expansion-tools';

async function fill(page: Page, values: Record<string, string>) { for (const [key, value] of Object.entries(values)) await page.locator(`[name="${key}"]`).fill(value); }
async function calculate(page: Page) { await page.getByRole('button', { name: 'Calcular', exact: true }).click(); }
const result = (page: Page) => page.locator('[data-result]');

for (const tool of vehicleTools) {
  test(`${tool.id}: HTML, canonical, sitemap, directorio, FAQ, etiquetas y móvil`, async ({ page, request }) => {
    const response = await request.get(tool.path); expect(response.status()).toBe(200);
    const html = await response.text();
    for (const text of [tool.example, 'Cómo se calcula', 'Preguntas frecuentes', 'Herramientas relacionadas']) expect(html).toContain(text);
    expect(html).toContain('"@type":"FAQPage"');
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/herramientas/'); await page.locator(`#vehiculos a[href="${tool.path}"]`).click();
    await expect(page).toHaveURL(new RegExp(tool.path));
    await expect(page.locator('h1')).toHaveText(tool.title);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://calculapanama.com${tool.path}`);
    await expect(page.locator('meta[name=description]')).toHaveAttribute('content', tool.description);
    await expect(page).toHaveTitle(`${tool.title} | Calcula Panamá`);
    await expect(page.locator('.faq details')).toHaveCount(tool.faq!.length);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('input,select').evaluateAll(inputs => inputs.every(el => (el as HTMLInputElement).labels?.length))).toBe(true);
    expect(await page.locator('[id]').evaluateAll(elements => new Set(elements.map(el => el.id)).size === elements.length)).toBe(true);
    for (const map of ['/sitemap.xml', '/sitemap-0.xml']) expect(await (await request.get(map)).text()).toContain(`https://calculapanama.com${tool.path}`);
    for (const link of tool.related) expect((await request.get(link.path)).status()).toBe(200);
    await expect(page.locator('script[src*="adsbygoogle"]')).toHaveCount(0);
  });
}

test('financiamiento: letra, tasa efectiva con comisión, tabla de amortización y errores', async ({ page }) => {
  await page.goto('/vehiculos/financiamiento-de-auto/', { waitUntil: 'networkidle' });
  const requests: string[] = []; page.on('request', r => requests.push(r.url()));
  await calculate(page); await expect(page.locator('[data-error]')).toBeVisible(); await expect(page.locator('[data-error]')).toBeFocused();
  await fill(page, { price: '25000', downPayment: '5000', rate: '8', months: '72' }); await calculate(page);
  await expect(result(page)).toContainText('Letra mensual: B/.350.66');
  await expect(result(page)).toContainText('Intereses totales: B/.5,247.98');
  await expect(result(page)).toContainText('8.30%');
  await expect(result(page)).not.toContainText('Seguros en todo el plazo');
  await fill(page, { insurance: '60', bankFees: '300', otherCosts: '150' }); await expect(result(page)).toBeEmpty(); await calculate(page);
  await expect(result(page)).toContainText('B/.410.66 con seguros');
  await expect(result(page)).toContainText('B/.35,017.98');
  await expect(result(page)).toContainText('Seguros en todo el plazo: B/.4,320.00');
  await expect(result(page)).toContainText('8.89%');
  await page.getByText('Ver tabla de amortización').click();
  const rows = page.locator('[data-details] tbody tr'); await expect(rows).toHaveCount(72);
  await expect(rows.first()).toContainText('B/.133.33'); await expect(rows.last()).toContainText('B/.0.00');
  await fill(page, { rate: '8,5' }); await calculate(page); await expect(result(page)).toContainText('Letra mensual');
  await fill(page, { downPayment: '25000' }); await calculate(page); await expect(page.locator('[data-error]')).toContainText('abono');
  await fill(page, { downPayment: '5000', months: '12.5' }); await calculate(page); await expect(page.locator('[data-error]')).toBeVisible();
  expect(requests).toEqual([]);
});

test('combustible: ida y vuelta por litro, mpg por galón y reparto entre personas', async ({ page }) => {
  await page.goto('/vehiculos/combustible-por-viaje/');
  await fill(page, { distance: '100', efficiency: '12', price: '1,25', people: '2' });
  await page.locator('[name=trip]').selectOption('round'); await calculate(page);
  await expect(result(page)).toContainText('Costo del combustible: B/.20.83');
  await expect(result(page)).toContainText('16.67 litros (4.40 galones) para 200.00 km');
  await expect(result(page)).toContainText('Por persona: B/.10.42');
  await page.locator('[name=trip]').selectOption('one-way'); await page.locator('[name=unit]').selectOption('mpg'); await page.locator('[name=priceUnit]').selectOption('gallon');
  await fill(page, { distance: '50', efficiency: '30', price: '4.80', people: '1' }); await calculate(page);
  await expect(result(page)).toContainText('B/.4.97'); await expect(result(page)).not.toContainText('Por persona');
  await fill(page, { efficiency: '0' }); await calculate(page); await expect(page.locator('[data-error]')).toContainText('Rendimiento');
});

test('costo mensual: total, anual, sin depreciación, costo por km y desglose', async ({ page }) => {
  await page.goto('/vehiculos/costo-mensual-de-un-auto/');
  await calculate(page); await expect(page.locator('[data-error]')).toContainText('al menos un gasto');
  await fill(page, { loanPayment: '420', fuel: '140', parking: '60', tolls: '25', other: '15', insuranceYear: '720', maintenanceYear: '600', registrationYear: '80', depreciationYear: '1800', kmPerMonth: '1200' });
  await calculate(page);
  await expect(result(page)).toContainText('Costo mensual del auto: B/.926.67');
  await expect(result(page)).toContainText('B/.11,120.00');
  await expect(result(page)).toContainText('Sin la pérdida de valor: B/.776.67');
  await expect(result(page)).toContainText('B/.0.772');
  await expect(page.locator('[data-details] tbody tr')).toHaveCount(9);
  await expect(page.locator('[data-details] tbody tr').first()).toContainText('Cuota del financiamiento');
  await page.getByRole('button', { name: 'Limpiar' }).click(); await expect(result(page)).toBeEmpty();
});

for (const width of [320, 390, 1440]) {
  test(`vehículos: sin desbordes a ${width}px, con la tabla de amortización abierta`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const tool of vehicleTools) {
      await page.goto(tool.path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), tool.path).toBe(true);
    }
    await page.goto('/vehiculos/financiamiento-de-auto/');
    await fill(page, { price: '25000', downPayment: '5000', rate: '8', months: '72' }); await calculate(page);
    await page.getByText('Ver tabla de amortización').click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390) await page.screenshot({ path: 'test-results/automoviles/financiamiento-390.png', fullPage: false, animations: 'disabled' });
    await page.goto('/herramientas/#vehiculos');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('vehículos: contenido legible sin JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false }); const page = await context.newPage();
  for (const tool of vehicleTools) {
    await page.goto(`http://127.0.0.1:4329${tool.path}`);
    await expect(page.locator('h1')).toHaveText(tool.title);
    await expect(page.getByText('Activa JavaScript para calcular.', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Calcular', exact: true })).toBeDisabled();
  }
  await context.close();
});
