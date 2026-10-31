import { test, expect, type Page } from '@playwright/test';

async function setup(page: Page) {
  await page.goto('/finanzas/mi-quincena/');
  const dates = await page.evaluate(() => { const d = new Date(); const fmt = (v: Date) => `${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,'0')}-${String(v.getDate()).padStart(2,'0')}`; const start = fmt(d); d.setDate(d.getDate() + 12); return { start, end: fmt(d) }; });
  await page.locator('#budget-start').fill(dates.start);
  await page.locator('#budget-payday').fill(dates.end);
  await page.locator('#budget-opening').fill('500');
  await page.locator('#budget-savings').fill('100');
}
async function add(page: Page, name: string, amount: string) { await page.locator('#move-name').fill(name); await page.locator('#move-amount').fill(amount); await page.getByRole('button', { name: 'Añadir movimiento' }).click(); }

test('presupuesto, edición, pago, eliminación y recuperación en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const external: string[] = []; page.on('request', request => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4329') external.push(new URL(request.url()).origin); });
  await setup(page); await add(page, 'Servicios', '180');
  await expect(page.locator('[data-result=free]')).toHaveText('B/.220.00');
  await expect(page.locator('[data-result=daily]')).toHaveText('B/.18.33');
  await expect(page.locator('[data-result=days]')).toHaveText('12');
  await page.reload(); await expect(page.locator('.budget-item')).toHaveCount(1);
  const row = page.locator('.budget-item'); await row.getByRole('button', { name: 'Marcar pagado' }).click();
  await expect(page.locator('[data-result=current]')).toHaveText('B/.320.00'); await expect(page.locator('[data-result=pending]')).toHaveText('B/.0.00'); await expect(page.locator('[data-result=free]')).toHaveText('B/.220.00');
  await row.getByRole('button', { name: 'Editar' }).click(); await row.getByLabel('Importe en B/.').fill('200,01'); await row.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.locator('[data-result=free]')).toHaveText('B/.199.99');
  await row.getByRole('button', { name: 'Eliminar' }).click(); await expect(page.locator('[data-result=free]')).toHaveText('B/.400.00');
  await expect(page.locator('#move-amount')).toHaveAttribute('inputmode', 'decimal'); await page.locator('#move-amount').focus(); await expect(page.locator('#move-amount')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(external).toEqual([]); await expect(page.locator('script[src*="adsbygoogle"]')).toHaveCount(0);
});

test('validación, recurrentes y eliminación de datos', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 }); await setup(page);
  await page.locator('#budget-opening').fill('-1'); await expect(page.locator('#period-error')).not.toBeEmpty(); await expect(page.locator('[data-result=free]')).toHaveText('—');
  await page.locator('#budget-opening').fill('500'); await page.locator('#move-recurring').check(); await add(page, 'Internet', '20'); await add(page, 'Taxi', '5');
  await page.locator('#keep-recurring').check(); page.once('dialog', dialog => dialog.accept()); await page.locator('#new-period').click();
  await expect(page.locator('.budget-item')).toHaveCount(1); await expect(page.locator('.budget-item')).toContainText('Internet'); await page.reload(); await expect(page.locator('.budget-item')).toHaveCount(1);
  page.once('dialog', dialog => dialog.accept()); await page.locator('#delete-data').click(); await expect(page.locator('.budget-item')).toHaveCount(0); expect(await page.evaluate(() => localStorage.getItem('cp-mi-quincena-v1'))).toBeNull();
});

test('saldo cero y fecha vencida no producen división por cero', async ({ page }) => {
  await setup(page); await page.locator('#budget-opening').fill('100');
  await expect(page.locator('[data-result=free]')).toHaveText('B/.0.00'); await expect(page.locator('#budget-alert')).toContainText('No queda dinero libre');
  const dates = await page.evaluate(() => { const d = new Date(); d.setDate(d.getDate() - 2); const format = (v: Date) => `${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,'0')}-${String(v.getDate()).padStart(2,'0')}`; const start = format(d); d.setDate(d.getDate()+1); return { start, end: format(d) }; });
  await page.locator('#budget-start').fill(dates.start); await page.locator('#budget-payday').fill(dates.end);
  await expect(page.locator('[data-result=days]')).toHaveText('0'); await expect(page.locator('[data-result=daily]')).toHaveText('—'); await expect(page.locator('#budget-alert')).toContainText('ya pasó');
});

test('si el almacenamiento está bloqueado, informa que solo usa memoria', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('bloqueado'); } }); });
  await page.goto('/finanzas/mi-quincena/'); await expect(page.locator('#storage-status')).toContainText('solo estará en memoria');
});

for (const viewport of [{ width: 375, height: 812, name: 'movil' }, { width: 1440, height: 900, name: 'escritorio' }]) {
  test(`captura ${viewport.name} con datos de ejemplo`, async ({ page }) => {
    await page.setViewportSize(viewport); await setup(page); await add(page, 'Servicios', '180');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `test-results/mi-quincena/${viewport.name}.png`, fullPage: true, animations: 'disabled' });
  });
}
