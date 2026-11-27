import { test, expect } from '@playwright/test';

// CP-DESIGN-006: portada editorial integrada. Comprueba diseño, navegación, búsqueda, SEO y privacidad.
const ROUTES = ['/vehiculos/financiamiento-de-auto/', '/vehiculos/combustible-por-viaje/', '/vehiculos/costo-mensual-de-un-auto/', '/finanzas/calculadora-prestamos/', '/finanzas/meta-de-ahorro/', '/finanzas/mi-quincena/', '/calculadoras/salario-neto/', '/calculadoras/decimo-tercer-mes/', '/calculadoras/vacaciones/', '/calculadoras/liquidacion-laboral/', '/vida-cotidiana/consumo-electrico/', '/compras/modo-pasillo/', '/compras/descuentos-y-promociones/', '/compras/precio-por-unidad/', '/educacion/promedio-de-notas/'];

for (const width of [360, 390, 768, 1440]) {
  test(`portada editorial a ${width} px: sin Blue, sin degradados, sin desbordamiento`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('body')).toHaveClass(/\bed\b/);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCSS('font-family', /Instrument Serif/);
    await expect(page.locator('img[src*="blue"], .blue-showcase, .site-header, .tabbar, .labor-card')).toHaveCount(0);
    const gradients = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => getComputedStyle(el).backgroundImage.includes('gradient')).length);
    expect(gradients).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('enlaza todas las herramientas y guías con rutas reales que responden', async ({ page, request }) => {
  await page.goto('/');
  const links = await page.locator('main a[href^="/"], .colophon a[href^="/"]').evaluateAll(as => [...new Set(as.map(a => (a as HTMLAnchorElement).getAttribute('href')!))]);
  for (const route of ROUTES) expect(links).toContain(route);
  expect(links.filter(h => h === '#' || h.endsWith('.html'))).toEqual([]);
  for (const href of links) expect((await request.get(href)).status(), href).toBe(200);
});

test('índice y búsqueda locales: abre, filtra, navega y cierra con Escape', async ({ page }) => {
  const external: string[] = [];
  page.on('request', r => { const u = new URL(r.url()); if (u.origin !== 'http://127.0.0.1:4329') external.push(u.origin); });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const opener = page.getByRole('button', { name: 'Índice' });
  await opener.click();
  await expect(page.locator('#overlay')).toHaveClass(/open/);
  await expect(opener).toHaveAttribute('aria-expanded', 'true');
  await page.locator('[data-search="overlay"]').fill('decimo');
  await expect(page.locator('[data-results="overlay"] a').first()).toHaveAttribute('href', '/calculadoras/decimo-tercer-mes/');
  await page.keyboard.press('Escape');
  await expect(page.locator('#overlay')).not.toHaveClass(/open/);
  await expect(opener).toBeFocused();
  await page.locator('[data-search="hero"]').fill('pasillo');
  await page.locator('[data-search="hero"]').press('Enter');
  await expect(page).toHaveURL(/\/compras\/modo-pasillo\/$/);
  expect(external).toEqual([]);
});

test('SEO y política se conservan: título, canónica, datos estructurados, CSP y sin AdSense', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Calcula Panamá: calculadoras de salario, finanzas, compras y autos');
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://calculapanama.com/');
  const types = await page.locator('script[type="application/ld+json"]').evaluateAll(s => s.map(n => JSON.parse(n.textContent!)['@type']));
  expect(types).toEqual(['WebSite', 'ItemList']);
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute('content', /connect-src 'none'/);
  await expect(page.locator('script[src*="adsbygoogle"]')).toHaveCount(0);
  await expect(page.locator('.datum .figure')).toContainText('1,236.92');
});

test('la portada es solo oscura, aunque el sistema o la preferencia guardada sean claros', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => { try { localStorage.setItem('cp-theme', 'light'); } catch { /* sin almacenamiento */ } });
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(8, 9, 12)');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe('rgb(8, 9, 12)');
  await expect(page.locator('h1')).toHaveCSS('color', 'rgb(231, 233, 237)');
  await expect(page.locator('.theme-button')).toHaveCount(0);
});

test('imágenes identificadas: IA, ilustrativa y sin afiliación con Toyota', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#hogar figcaption').first()).toContainText('Imagen generada con IA');
  await expect(page.locator('#movilidad figcaption')).toContainText('Imagen ilustrativa generada con IA');
  await expect(page.locator('#movilidad figcaption')).toContainText('no tiene afiliación con Toyota');
  await expect(page.locator('#movilidad img')).not.toHaveAttribute('alt', /Toyota|Hilux/);
});
