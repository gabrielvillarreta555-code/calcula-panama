import { test, expect } from '@playwright/test';

const MAIN = process.env.PROD_MAIN_ORIGIN || 'https://calculapanama.com';
const APP = process.env.PROD_APP_ORIGIN || 'https://app.calculapanama.com';
const CHECK_APP = process.env.PROD_CHECK_APP !== '0';
const REHEARSAL_KEY = 'cp-ensayo-quincena-v1';
const REAL_KEY = 'cp-mi-quincena-v1';
const STRICT = "default-src 'self'; script-src 'self' 'unsafe-inline'";

// Comprobaciones HTTP: una sola vez (en Chromium), no dependen del navegador.
test.describe('infraestructura', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Solo una vez, en Chromium');

  test('HTTPS: http y www redirigen a https://calculapanama.com', async ({ request }) => {
    for (const url of ['http://calculapanama.com/', 'http://www.calculapanama.com/']) {
      const r = await request.get(url, { maxRedirects: 0 });
      expect([301, 308], url).toContain(r.status());
      expect(r.headers()['location'], url).toMatch(/^https:\/\//);
    }
    const final = await request.get('https://www.calculapanama.com/');
    expect(final.url()).toBe(`${MAIN}/`);
  });

  test('ads.txt, robots.txt y sitemap; cada URL pública responde 200 con canonical, CSP estricta y sin AdSense', async ({ request }) => {
    expect((await (await request.get(`${MAIN}/ads.txt`)).text()).trim()).toBe('google.com, pub-2150093744862116, DIRECT, f08c47fec0942fa0');
    expect(await (await request.get(`${MAIN}/robots.txt`)).text()).toContain(`Sitemap: ${MAIN}/sitemap.xml`);
    const locs = [...(await (await request.get(`${MAIN}/sitemap.xml`)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]!);
    expect(locs.length).toBeGreaterThanOrEqual(26);
    for (const loc of locs) {
      const r = await request.get(loc);
      const html = await r.text();
      expect(r.status(), loc).toBe(200);
      expect(html, loc).toContain(`<link rel="canonical" href="${loc}"`);
      expect(html, loc).toContain(STRICT);
      expect(html, loc).not.toMatch(/adsbygoogle|googlesyndication/);
    }
    expect((await request.get(`${MAIN}/no-existe-cp-ads-004/`)).status()).toBe(404);
  });

  test('app: HTTPS, cabeceras de aislamiento, CSP estricta y noindex', async ({ request }) => {
    test.skip(!CHECK_APP, 'App todavía no publicada');
    const importer = await request.get(`${APP}/importar/`);
    expect(importer.status()).toBe(200);
    expect(importer.headers()['content-security-policy']).toBe(`frame-ancestors ${MAIN}`);
    const quincena = await request.get(`${APP}/quincena/`);
    expect(quincena.headers()['content-security-policy']).toBe("frame-ancestors 'none'");
    for (const r of [importer, quincena]) {
      expect(r.headers()['x-robots-tag']).toContain('noindex');
      expect(r.headers()['x-content-type-options']).toBe('nosniff');
      const html = await r.text();
      expect(html).toContain(STRICT); expect(html).toContain('<meta name="robots" content="noindex"');
      expect(html).not.toMatch(/adsbygoogle|googlesyndication|googletagmanager/);
    }
    expect((await request.get(`http://app.calculapanama.com/quincena/`, { maxRedirects: 0 })).status()).toBeGreaterThanOrEqual(300);
  });
});

// Ensayo del traslado con un presupuesto FICTICIO, en cada navegador.
test.describe('ensayo del traslado (datos ficticios)', () => {
  test.skip(!CHECK_APP, 'App todavía no publicada');

  test('traslada, verifica y aísla sin tocar la clave real', async ({ page }) => {
    const thirdParty: string[] = [];
    page.on('request', r => { const o = new URL(r.url()).origin; if (o !== MAIN && o !== APP) thirdParty.push(r.url()); });
    await page.goto(`${MAIN}/ensayo/traslado-quincena/`);
    await page.evaluate(k => localStorage.setItem(k, 'centinela-no-tocar'), REAL_KEY);
    await page.getByRole('button', { name: '1. Crear presupuesto ficticio' }).click();
    const sent = await page.evaluate(k => localStorage.getItem(k), REHEARSAL_KEY);
    expect(sent).toContain('123456');
    await page.getByRole('button', { name: '2. Trasladar el presupuesto ficticio' }).click();
    await expect(page.locator('[data-migration-done]')).toBeVisible({ timeout: 30000 });
    expect(await page.evaluate(k => localStorage.getItem(k), REHEARSAL_KEY)).toBeNull();
    expect(await page.evaluate(k => localStorage.getItem(k), REAL_KEY)).toBe('centinela-no-tocar');
    await page.evaluate(k => localStorage.removeItem(k), REAL_KEY);

    await page.getByRole('button', { name: 'Comprobar desde esta página' }).click();
    await expect(page.locator('[data-check="cross-origin-blocked"]')).toHaveAttribute('data-ok', 'true', { timeout: 15000 });
    await expect(page.locator('[data-check="no-real-budget"]')).toHaveAttribute('data-ok', 'true');
    await expect(page.locator('[data-check="no-rehearsal-budget"]')).toHaveAttribute('data-ok', 'true');

    await page.goto(`${APP}/ensayo/`);
    await expect(page.locator('[data-rehearsal-state]')).toContainText('B/.1234.56');
    const expected = await page.evaluate(async text => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text!)))].map(b => b.toString(16).padStart(2, '0')).join(''), sent);
    await expect(page.locator('[data-rehearsal-sha]')).toHaveText(expected);
    await page.getByRole('button', { name: 'Borrar el ensayo' }).click();
    await expect(page.locator('[data-rehearsal-state]')).toHaveText('no hay');
    expect(thirdParty).toEqual([]);
  });

  test('si la app no responde, el presupuesto ficticio se conserva', async ({ page }) => {
    await page.route(`${APP}/importar/**`, route => route.abort());
    await page.goto(`${MAIN}/ensayo/traslado-quincena/`);
    await page.getByRole('button', { name: '1. Crear presupuesto ficticio' }).click();
    const before = await page.evaluate(k => localStorage.getItem(k), REHEARSAL_KEY);
    await page.getByRole('button', { name: '2. Trasladar el presupuesto ficticio' }).click();
    await expect(page.locator('[data-migration-status]')).toContainText('sigue guardado', { timeout: 30000 });
    expect(await page.evaluate(k => localStorage.getItem(k), REHEARSAL_KEY)).toBe(before);
    await page.evaluate(k => localStorage.removeItem(k), REHEARSAL_KEY);
  });
});
