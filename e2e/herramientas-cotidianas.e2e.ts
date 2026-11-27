import { test, expect } from '@playwright/test';
const calculate = (page: import('@playwright/test').Page) => page.getByRole('button', { name: 'Calcular', exact: true }).click();

test('ITBMS: agrega, separa, usa tarifas especiales y no hace peticiones', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/impuestos/itbms/', { waitUntil: 'networkidle' });
  const requests: string[] = []; page.on('request', r => requests.push(r.url()));
  await page.getByLabel('Importe (B/.)').fill('100'); await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('Total con ITBMS: B/.107.00');
  await page.getByLabel('¿El importe incluye ITBMS?').selectOption('remove');
  await expect(page.locator('[data-result]')).toBeEmpty();
  await page.getByLabel('Importe (B/.)').fill('53,50'); await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('Precio sin ITBMS: B/.50.00');
  await expect(page.locator('[data-result]')).toContainText('ITBMS (7%): B/.3.50');
  await page.getByLabel('¿El importe incluye ITBMS?').selectOption('add');
  await page.getByLabel('Tarifa').selectOption('10'); await page.getByLabel('Importe (B/.)').fill('120'); await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('B/.132.00');
  await expect(page.locator('[data-details] table')).toContainText('ITBMS 10%');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByLabel('Importe (B/.)').fill('1.005'); await calculate(page);
  await expect(page.locator('[data-error]')).toBeVisible();
  expect(requests).toEqual([]);
});

test('dividir la cuenta: propina sin ITBMS, reparto exacto y redondeo', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/compras/dividir-la-cuenta/', { waitUntil: 'networkidle' });
  const requests: string[] = []; page.on('request', r => requests.push(r.url()));
  await page.getByLabel('Total de la factura, con ITBMS (B/.)').fill('85.60');
  await page.getByLabel('ITBMS de la factura (B/.), opcional').fill('5.60');
  await page.getByLabel('Número de personas').fill('4'); await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('Cada persona paga: B/.23.40');
  await expect(page.locator('[data-result]')).toContainText('Propina: B/.8.00 sobre B/.80.00');
  await page.getByLabel('Redondear lo que paga cada persona').selectOption('0.25'); await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('Cada persona paga: B/.23.50');
  await expect(page.locator('[data-result]')).toContainText('sobran B/.0.40');
  await page.getByLabel('Redondear lo que paga cada persona').selectOption('none');
  await page.getByLabel('ITBMS de la factura (B/.), opcional').fill('');
  await page.getByLabel('Total de la factura, con ITBMS (B/.)').fill('10'); await page.getByLabel('Propina (%)').fill('0');
  await page.getByLabel('Número de personas').fill('3'); await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('1 persona paga B/.3.34 y 2 pagan B/.3.33');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(requests).toEqual([]);
});
