import { test, expect, type Page } from '@playwright/test';
const offer = (page: Page, name: string) => page.locator(`[data-offer="${name}"]`);
const field = (page: Page, offerName: string, name: string) => offer(page, offerName).locator(`[data-field="${name}"]`);

test('actualiza cuota, cargos, comisión y amortización en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const external: string[] = []; page.on('request', req => { if (new URL(req.url()).origin !== 'http://127.0.0.1:4329') external.push(new URL(req.url()).origin); });
  await page.goto('/finanzas/calculadora-prestamos/');
  await field(page,'a','principal').fill('1000'); await field(page,'a','rate').fill('12'); await field(page,'a','term').fill('12'); await field(page,'a','unit').selectOption('months');
  await field(page,'a','insurance').fill('2,00'); await field(page,'a','charges').fill('1'); await field(page,'a','fee').fill('5');
  await expect(page.locator('[data-output=financial]')).toHaveText('B/.88.85'); await expect(page.locator('[data-output=monthly]')).toHaveText('B/.91.85'); await expect(page.locator('[data-output=net]')).toHaveText('B/.995.00');
  await page.locator('#schedule summary').click(); await expect(page.locator('#schedule-list li')).toHaveCount(12); await expect(page.locator('#schedule-list li').first()).toContainText('Saldo B/.921.15'); await expect(page.locator('#schedule-list li').last()).toContainText('Saldo B/.0.00');
  await expect(field(page,'a','principal')).toHaveAttribute('inputmode','decimal'); await field(page,'a','principal').focus(); await expect(field(page,'a','principal')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); expect(external).toEqual([]); await expect(page.locator('script[src*="adsbygoogle"]')).toHaveCount(0);
});

test('compara ofertas sin afirmar que plazos distintos son equivalentes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 }); await page.goto('/finanzas/calculadora-prestamos/');
  await page.locator('#comparison summary').click(); await field(page,'b','rate').fill('5');
  await expect(page.locator('#comparison-result')).toContainText('oferta B tiene menor pago mensual'); await expect(page.locator('#comparison-result')).toContainText('oferta B tiene menor total');
  await field(page,'b','term').fill('10'); await expect(page.locator('#comparison-result')).toContainText('no identifican automáticamente una mejor oferta');
  await field(page,'b','rate-type').selectOption('effective'); await expect(page.locator('#comparison-result')).toContainText('Oferta B');
});

test('maneja tasa cero, comisión inválida y campos vacíos sin mostrar un resultado anterior', async ({ page }) => {
  await page.goto('/finanzas/calculadora-prestamos/'); await field(page,'a','rate').fill('0'); await field(page,'a','principal').fill('100'); await field(page,'a','term').fill('3'); await field(page,'a','unit').selectOption('months');
  await expect(page.locator('[data-output=interest]')).toHaveText('B/.0.00'); await expect(page.locator('[data-output=last]')).toHaveText('B/.33.34');
  await field(page,'a','fee').fill('101'); await expect(offer(page,'a').locator('[data-error]')).toContainText('comisión'); await expect(page.locator('[data-output=monthly]')).toHaveText('—');
  await field(page,'a','principal').fill(''); await expect(page.locator('[data-output=monthly]')).toHaveText('—');
});

for (const v of [{ width: 375, height: 812, name: 'movil' }, { width: 1440, height: 900, name: 'escritorio' }]) test(`captura de préstamos ${v.name}`, async ({ page }) => { await page.setViewportSize(v); await page.goto('/finanzas/calculadora-prestamos/'); await page.screenshot({ path: `test-results/prestamos/${v.name}.png`, fullPage: true, animations: 'disabled' }); });
