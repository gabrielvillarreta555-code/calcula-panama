import { test, expect } from '@playwright/test';

const pages = ['/', '/calculadoras/salario-neto/', '/calculadoras/decimo-tercer-mes/', '/calculadoras/vacaciones/', '/calculadoras/liquidacion-laboral/', '/compras/', '/compras/modo-pasillo/', '/contacto/', '/finanzas/calculadora-prestamos/', '/finanzas/mi-quincena/', '/guias/', '/guias/descuentos-del-salario-en-panama/', '/guias/fechas-de-pago-del-decimo-tercer-mes/', '/guias/prima-de-antiguedad-e-indemnizacion/', '/privacidad/', '/sobre-nosotros/', '/terminos/', '/pagina-inexistente-auditoria/'];

test('un presupuesto previo sobrevive y ninguna página carga publicidad externa', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  const external: string[] = [];
  page.on('request', req => { if (new URL(req.url()).origin !== 'http://127.0.0.1:4329') external.push(new URL(req.url()).origin); });
  await page.goto('/finanzas/mi-quincena/');
  // Formato v1 existente: la actualización no migra ni borra esta clave.
  const previous = await page.evaluate(() => {
    const today = new Date();
    const format = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const start = format(today); today.setDate(today.getDate() + 12);
    const state = { version: 1, start, payday: format(today), openingCents: 50000, savingsCents: 10000, movements: [{ id: 'ejemplo', name: 'Servicios', cents: 18000, category: 'servicios', date: '', kind: 'gasto', status: 'pendiente', recurring: false }] };
    localStorage.setItem('cp-mi-quincena-v1', JSON.stringify(state));
    return state;
  });
  for (const path of pages) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(path.includes('pagina-inexistente') ? 404 : 200);
    await expect(page.locator('script[src*="adsbygoogle"]')).toHaveCount(0);
    await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cp-mi-quincena-v1') || 'null'))).toEqual(previous);
  }
  await page.goto('/finanzas/mi-quincena/');
  await expect(page.locator('[data-result=free]')).toHaveText('B/.220.00');
  await expect(page.locator('.budget-item')).toContainText('Servicios');
  expect(external).toEqual([]);
});

test('la política bloquea un script publicitario externo simulado en portada', async ({ page }) => {
  let requested = false;
  await page.route('https://publicidad.invalid/**', route => { requested = true; return route.fulfill({ contentType: 'application/javascript', body: 'window.adExecuted = true;' }); });
  await page.goto('/');
  const violated = await page.evaluate(() => new Promise<boolean>(resolve => {
    const timeout = setTimeout(() => resolve(false), 3000);
    addEventListener('securitypolicyviolation', event => {
      if (event.blockedURI.startsWith('https://publicidad.invalid/')) { clearTimeout(timeout); resolve(true); }
    }, { once: true });
    const script = document.createElement('script'); script.src = 'https://publicidad.invalid/anuncio.js'; document.head.append(script);
  }));
  expect(violated).toBe(true);
  expect(requested).toBe(false);
  expect(await page.evaluate(() => (window as unknown as { adExecuted?: boolean }).adExecuted)).toBeUndefined();
});
