import { test, expect, devices, type Page } from '@playwright/test';

async function prepareSalary(page: Page) { await page.goto('/calculadoras/salario-neto/'); await page.locator('#gross').fill('1500'); await page.locator('#salary-form button[type=submit]').click(); }
async function openPreview(page: Page, selector: string) { await page.locator(selector).click(); await expect(page.locator('.share-dialog')).toBeVisible(); }

test('salario: privacidad por defecto, vista previa, cancelación y WhatsApp explícito en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() => { Object.defineProperty(window, 'open', { value: (url: string) => { (window as unknown as { opened: string }).opened = url; } }); });
  const requests: string[] = []; page.on('request', req => { if (new URL(req.url()).origin !== 'http://127.0.0.1:4329') requests.push(new URL(req.url()).origin); });
  await prepareSalary(page); await openPreview(page, '#salary-share');
  const dialog = page.locator('.share-dialog'), preview = dialog.locator('.share-preview');
  await expect(preview).toContainText('Salario neto — Calcula Panamá'); await expect(preview).toContainText('https://calculapanama.com/calculadoras/salario-neto/');
  await expect(preview).not.toContainText('1,236.92'); await expect(dialog.getByLabel('Incluir el resultado principal')).not.toBeChecked();
  expect(await page.evaluate(() => (window as unknown as { opened?: string }).opened)).toBeUndefined();
  await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); expect(await page.evaluate(() => (window as unknown as { opened?: string }).opened)).toBeUndefined();
  await openPreview(page, '#salary-share'); await page.getByLabel('Incluir el resultado principal').check();
  await expect(preview).toContainText('1,236.92'); await expect(preview).not.toContainText('Seguro Social:');
  const expected = await preview.innerText(); await page.getByRole('button', { name: 'Compartir por WhatsApp' }).click();
  const url = await page.evaluate(() => (window as unknown as { opened: string }).opened);
  expect(new URL(url).origin).toBe('https://wa.me'); expect(new URL(url).searchParams.get('text')).toBe(expected); expect(requests).toEqual([]);
  await page.screenshot({ path: 'test-results/compartir/movil.png', fullPage: false, animations: 'disabled' });
});

test('compartir nativo y copia usan exactamente el texto autorizado', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: async (data: { text: string }) => { (window as unknown as { shared: string }).shared = data.text; }, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (text: string) => { (window as unknown as { copied: string }).copied = text; } }, configurable: true });
  });
  await prepareSalary(page); await openPreview(page, '#salary-share');
  await page.getByLabel('Incluir detalles adicionales (pueden contener importes)').check();
  const expected = await page.locator('.share-preview').innerText(); await expect(page.locator('.share-preview')).toContainText('Seguro Social:');
  await page.getByRole('button', { name: 'Compartir con otra aplicación' }).click(); expect(await page.evaluate(() => (window as unknown as { shared: string }).shared)).toBe(expected);
  await page.getByRole('button', { name: 'Copiar resumen' }).click(); expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toBe(expected);
  await page.screenshot({ path: 'test-results/compartir/escritorio.png', fullPage: false, animations: 'disabled' });
});

test('sin compartir nativo ni Clipboard usa alternativa y no sale del sitio al cancelar', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }); Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    document.execCommand = () => { (window as unknown as { copied: string }).copied = (document.activeElement as HTMLTextAreaElement).value; return true; };
  });
  await prepareSalary(page); await openPreview(page, '#salary-share');
  await expect(page.getByRole('button', { name: /no disponible/ })).toBeDisabled();
  await page.getByRole('button', { name: 'Copiar resumen' }).click(); await expect(page.locator('.share-status')).toHaveText('Resumen copiado.');
  expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).not.toContain('1,236.92');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click(); await expect(page.locator('#salary-share')).toBeFocused();
});

test('décimo, vacaciones y liquidación solo incluyen resultados con autorización', async ({ page }) => {
  await page.goto('/calculadoras/decimo-tercer-mes/'); await page.locator('#monthly').fill('900'); await page.locator('#year').fill('2026'); await page.locator('#thirteenth-form button[type=submit]').click();
  await openPreview(page, '#thirteenth-share'); await expect(page.locator('.share-preview')).not.toContainText('300.00'); await page.getByLabel('Incluir detalles adicionales (pueden contener importes)').check(); await expect(page.locator('.share-preview')).toContainText('Período:'); await page.keyboard.press('Escape');
  await page.goto('/calculadoras/vacaciones/'); await page.locator('#salary').fill('1000'); await page.locator('input[name=mode][value=days]').check(); await page.locator('#pending').fill('30'); await page.locator('#vacation-form button[type=submit]').click();
  await openPreview(page, '#vacation-share'); await page.getByLabel('Incluir el resultado principal').check(); await expect(page.locator('.share-preview')).toContainText('1,000.00'); await page.keyboard.press('Escape');
  await page.goto('/calculadoras/liquidacion-laboral/'); await page.locator('#salary').fill('1000'); await page.locator('#start').fill('2024-01-01'); await page.locator('#end').fill('2025-12-31'); await page.locator('#termination-form button[type=submit]').click();
  await openPreview(page, '#termination-share'); await expect(page.locator('.share-preview')).not.toContainText('B/.'); await page.getByLabel('Incluir detalles adicionales (pueden contener importes)').check(); await expect(page.locator('.share-preview')).toContainText('Prima de antigüedad:');
});

test('Mi Quincena, préstamo y productos seleccionados no filtran datos por defecto', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 }); await page.goto('/finanzas/mi-quincena/');
  const end = await page.evaluate(() => { const d = new Date(); d.setDate(d.getDate()+12); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; });
  await page.locator('#budget-payday').fill(end); await page.locator('#budget-opening').fill('500');
  await page.locator('#move-name').fill('Privado123'); await page.locator('#move-amount').fill('80'); await page.getByRole('button', { name: 'Añadir movimiento' }).click();
  await openPreview(page, '#budget-share'); await expect(page.locator('.share-preview')).not.toContainText('420'); await expect(page.locator('.share-preview')).toContainText('/finanzas/mi-quincena/');
  await page.getByLabel('Incluir el resultado principal').check(); await page.getByLabel('Incluir detalles adicionales (pueden contener importes)').check(); await expect(page.locator('.share-preview')).toContainText('420.00'); await expect(page.locator('.share-preview')).not.toContainText('Privado123'); await page.keyboard.press('Escape');
  await page.goto('/finanzas/calculadora-prestamos/'); await openPreview(page, '#loan-share'); await expect(page.locator('.share-preview')).not.toContainText('B/.'); await page.getByLabel('Incluir el resultado principal').check(); await expect(page.locator('.share-preview')).toContainText('B/.'); await page.keyboard.press('Escape');
  await page.goto('/compras/modo-pasillo/'); await page.locator('#aisle-name').fill('Café'); await page.locator('#aisle-price').fill('4.50'); await page.getByRole('button', { name: 'Añadir producto' }).click();
  await page.locator('#aisle-name').fill('Pan'); await page.locator('#aisle-price').fill('2'); await page.getByRole('button', { name: 'Añadir producto' }).click();
  await openPreview(page, '#aisle-share'); await expect(page.locator('.share-preview')).not.toContainText('Café'); await expect(page.locator('.share-preview')).not.toContainText('B/.');
  await page.getByLabel('Incluir producto: 1 × Café').check(); await expect(page.locator('.share-preview')).toContainText('Café'); await expect(page.locator('.share-preview')).not.toContainText('1 × Pan');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('perfil iPhone simulado en Chromium: se puede cancelar sin compartir', async ({ browser }) => {
  const { defaultBrowserType: _default, ...profile } = devices['iPhone 13'];
  const context = await browser.newContext({ ...profile, baseURL: 'http://127.0.0.1:4329' });
  const page = await context.newPage();
  try {
    await prepareSalary(page); await openPreview(page, '#salary-share');
    await expect(page.locator('.share-preview')).not.toContainText('1,236.92');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(page.locator('.share-dialog')).toHaveCount(0);
  } finally { await context.close(); }
});
