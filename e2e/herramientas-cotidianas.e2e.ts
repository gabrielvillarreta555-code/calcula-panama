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

test('días hábiles: año 2027 completo, feriados y sin peticiones', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/vida-cotidiana/dias-habiles-y-feriados/', { waitUntil: 'networkidle' });
  const requests: string[] = []; page.on('request', r => requests.push(r.url()));
  await expect(page.locator('.tool-reading')).toContainText('martes 9 de febrero: martes de carnaval');
  await page.getByLabel('Fecha inicial').fill('2027-01-01'); await page.getByLabel('Fecha final').fill('2027-12-31'); await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('Días hábiles: 252');
  await page.locator('[data-details] summary').click();
  await expect(page.locator('[data-details] table')).toContainText('Viernes santo');
  await page.getByLabel('Días laborables').selectOption('mon-sat'); await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('Días hábiles: 301');
  await page.getByLabel('Fecha final').fill('2026-12-31'); await calculate(page);
  await expect(page.locator('[data-error]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(requests).toEqual([]);
});

test('tarjeta de crédito: pago fijo, pago mínimo y pago insuficiente', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/finanzas/tarjeta-de-credito/', { waitUntil: 'networkidle' });
  const requests: string[] = []; page.on('request', r => requests.push(r.url()));
  await expect(page.getByLabel('Pago mínimo: porcentaje del saldo (%)')).toBeHidden();
  await page.getByLabel('Saldo de la tarjeta (B/.)').fill('2000'); await page.getByLabel('Tasa de interés anual (%)').fill('36');
  await page.getByLabel('Pago fijo mensual (B/.)').fill('100'); await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('31 meses (2 años y 7 meses)');
  await expect(page.locator('[data-result]')).toContainText('Intereses: B/.1,099.92');
  await expect(page.locator('[data-details] table').first()).toContainText('B/.200.93');
  await page.getByLabel('Cómo vas a pagar').selectOption('minimum');
  await expect(page.getByLabel('Pago fijo mensual (B/.)')).toBeHidden();
  await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('95 meses');
  await expect(page.locator('[data-result]')).toContainText('B/.103.00');
  await page.getByLabel('Cómo vas a pagar').selectOption('fixed'); await page.getByLabel('Pago fijo mensual (B/.)').fill('50'); await calculate(page);
  await expect(page.locator('[data-error]')).toContainText('no cubre los intereses');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(requests).toEqual([]);
});

test('salario mínimo: actividad, región, trabajo doméstico y tabla del decreto', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/calculadoras/salario-minimo/', { waitUntil: 'networkidle' });
  const requests: string[] = []; page.on('request', r => requests.push(r.url()));
  await page.getByLabel('Actividad económica').selectOption('menor-gran'); await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('Salario mínimo por hora: B/.3.02');
  await expect(page.locator('[data-result]')).toContainText('B/.628.16 al mes');
  await page.getByLabel('Región', { exact: true }).selectOption('r2'); await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('B/.2.48');
  await page.getByLabel('Actividad económica').selectOption('domestico');
  await expect(page.getByLabel('Horas ordinarias por semana')).toBeHidden();
  await calculate(page);
  await expect(page.locator('[data-result]')).toContainText('Salario mínimo mensual: B/.320.00');
  await page.getByLabel('Actividad económica').selectOption('zona-libre'); await calculate(page);
  await expect(page.locator('[data-error]')).toContainText('Región 2');
  await expect(page.locator('.tool-reading table')).toContainText('Tripulantes de cabina de vuelos internacionales');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(requests).toEqual([]);
});

test('calendario de quincenas 2027 y feriados de diciembre de 2026', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/guias/calendario-de-quincenas-2027/');
  await expect(page.locator('h1')).toHaveText('Calendario de quincenas 2027 en Panamá');
  await expect(page.locator('main table tbody tr')).toHaveCount(24);
  await expect(page.locator('main table')).toContainText('viernes 15 de enero');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/vida-cotidiana/dias-habiles-y-feriados/');
  await expect(page.locator('.tool-reading')).toContainText('lunes 21 de diciembre: lunes de descanso por una fiesta en domingo');
  await page.goto('/calculadoras/decimo-tercer-mes/');
  await expect(page.locator('#tercera-partida-2026')).toBeVisible();
  await expect(page.locator('main')).toContainText('martes 15 de diciembre de 2026');
});

test('guía para administrar el décimo: cifras calculadas y enlaces a las calculadoras', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/guias/como-administrar-el-decimo/');
  await expect(page.locator('h1')).toHaveText('Cómo administrar el décimo tercer mes en Panamá');
  await expect(page.locator('main')).toContainText('B/. 301.47');
  for (const href of ['/calculadoras/decimo-tercer-mes/', '/finanzas/tarjeta-de-credito/', '/finanzas/meta-de-ahorro/', '/finanzas/mi-quincena/']) await expect(page.locator(`main a[href="${href}"]`).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
