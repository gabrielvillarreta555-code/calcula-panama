import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { BUDGET_KEY, MIGRATED_FLAG_KEY } from '../../src/lib/finance/storage-keys';
import { OTHER_BUDGET, SAMPLE_BUDGET } from './sample-budget';

const policy = JSON.parse(readFileSync('src/data/ad-policy.json', 'utf8')) as { pages: Record<string, { tier: string }> };
const pagesByTier = (tier: string) => Object.keys(policy.pages).filter(p => policy.pages[p]!.tier === tier);

const MAIN = 'http://calculapanama.localhost:4331';
const APP = 'http://app.calculapanama.localhost:4332';
const FOREIGN = 'http://evil.localhost:4333';
const STRICT = "default-src 'self'; script-src 'self' 'unsafe-inline'";

/**
 * Sustituto de adsbygoogle.js: se comporta como el peor script publicitario posible y recoge todo
 * lo que podría leer en la página (almacenamiento, cookies, campos, iframes y bases IndexedDB).
 */
const SPY = `(async () => {
  const found = { storage: [], inputs: [], frames: [], cookie: document.cookie, idb: [] };
  for (const area of ['localStorage', 'sessionStorage']) {
    try { const s = window[area]; for (let i = 0; i < s.length; i++) { const k = s.key(i); found.storage.push(k + '=' + s.getItem(k)); } } catch (e) { found.storage.push(area + ':error'); }
  }
  document.querySelectorAll('input, textarea, select').forEach(el => found.inputs.push(el.value));
  document.querySelectorAll('iframe').forEach(f => { try { found.frames.push(f.contentDocument ? 'readable' : 'blocked'); } catch (e) { found.frames.push('blocked'); } });
  try { found.idb = (await indexedDB.databases()).map(d => d.name); } catch (e) {}
  window.__adSpy = found;
})();`;

async function spyOnAds(page: Page) {
  const hits: string[] = [];
  await page.route('https://pagead2.googlesyndication.com/**', route => { hits.push(route.request().url()); return route.fulfill({ contentType: 'text/javascript', body: SPY }); });
  return hits;
}
const FINANCIAL = /cp-mi-quincena-v1|84250|Internet|Préstamo personal|21075/;

async function seed(page: Page, origin: string, value: string) {
  // Una página sin publicidad del origen indicado, para escribir el dato de prueba.
  await page.goto(origin === MAIN ? `${MAIN}/privacidad/` : `${APP}/`);
  await page.evaluate(([k, v]) => localStorage.setItem(k!, v!), [BUDGET_KEY, value]);
}
const stored = (page: Page) => page.evaluate(k => localStorage.getItem(k), BUDGET_KEY);

test('primera etapa: AdSense se carga en las 13 páginas y no encuentra datos financieros, aunque el usuario use Mi Quincena en la app', async ({ page }) => {
  await seed(page, APP, SAMPLE_BUDGET);
  await page.goto(`${APP}/quincena/`);
  await expect(page.locator('#budget-opening')).toHaveValue('842.50');
  const hits = await spyOnAds(page);
  const stage1 = pagesByTier('stage1');
  expect(stage1).toHaveLength(13);
  for (const path of stage1) {
    await page.goto(`${MAIN}${path}`);
    await page.waitForFunction(() => (window as any).__adSpy, null, { timeout: 5000 });
    const spy = await page.evaluate(() => (window as any).__adSpy);
    expect(JSON.stringify(spy), path).not.toMatch(FINANCIAL);
    expect(spy.storage.filter((s: string) => s.startsWith(BUDGET_KEY)), path).toEqual([]);
    expect(spy.frames.every((f: string) => f === 'blocked'), path).toBe(true);
    expect(await page.locator('html').getAttribute('data-ads'), path).toBe('loaded');
  }
  expect(hits).toHaveLength(13);
});

test('segunda etapa, Mi Quincena, páginas legales y 404: nunca cargan AdSense y mantienen la CSP estricta', async ({ page }) => {
  const hits = await spyOnAds(page);
  for (const path of [...pagesByTier('stage2'), ...pagesByTier('never').filter(p => p !== '/404/'), '/no-existe/']) {
    const response = await page.goto(`${MAIN}${path}`);
    expect(response?.status(), path).toBe(path === '/no-existe/' ? 404 : 200);
    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    expect(csp, path).toContain(STRICT);
    expect(csp, path).toContain("connect-src 'none'");
  }
  expect(hits).toEqual([]);
});

test('guardia: con un presupuesto antiguo en el dominio principal, AdSense no se carga y se ofrece el traslado', async ({ page }) => {
  await seed(page, MAIN, SAMPLE_BUDGET);
  const hits = await spyOnAds(page);
  for (const path of ['/', '/guias/', '/compras/precio-por-unidad/']) {
    await page.goto(`${MAIN}${path}`);
    await expect(page.locator('html')).toHaveAttribute('data-ads', 'blocked');
    await expect(page.locator('[data-legacy-notice]')).toBeVisible();
  }
  expect(hits).toEqual([]);
  expect(await stored(page)).toBe(SAMPLE_BUDGET);
});

test('traslado completo: llega idéntico a la app, se borra del dominio principal y después la publicidad no ve nada', async ({ page }) => {
  await seed(page, MAIN, SAMPLE_BUDGET);
  const thirdParty: string[] = [];
  page.on('request', r => { const o = new URL(r.url()).origin; if (o !== MAIN && o !== APP) thirdParty.push(r.url()); });
  await page.goto(`${MAIN}/finanzas/mi-quincena/`);
  await expect(page.locator('[data-migration-panel]')).toBeVisible();
  await expect(page.locator('[data-migration-download]')).toHaveAttribute('download', 'mi-quincena-copia.json');
  await page.getByRole('button', { name: 'Trasladar mi presupuesto' }).click();
  await expect(page.locator('[data-migration-done]')).toBeVisible();
  expect(await stored(page)).toBeNull();
  expect(await page.evaluate(k => localStorage.getItem(k), MIGRATED_FLAG_KEY)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(thirdParty).toEqual([]);

  await page.goto(`${APP}/quincena/`);
  expect(await stored(page)).toBe(SAMPLE_BUDGET);
  await expect(page.locator('#budget-opening')).toHaveValue('842.50');
  await expect(page.locator('#movement-list li')).toHaveCount(2);

  const hits = await spyOnAds(page);
  await page.goto(`${MAIN}/`);
  await page.waitForFunction(() => (window as any).__adSpy);
  expect(JSON.stringify(await page.evaluate(() => (window as any).__adSpy))).not.toMatch(FINANCIAL);
  expect(hits).toHaveLength(1);
});

test('si la app no responde, los datos se conservan en el dominio principal', async ({ page }) => {
  test.setTimeout(45000);
  await seed(page, MAIN, SAMPLE_BUDGET);
  await page.route(`${APP}/importar/**`, route => route.abort());
  await page.goto(`${MAIN}/finanzas/mi-quincena/`);
  await page.getByRole('button', { name: 'Trasladar mi presupuesto' }).click();
  await expect(page.locator('[data-migration-status]')).toContainText('sigue guardado', { timeout: 20000 });
  expect(await stored(page)).toBe(SAMPLE_BUDGET);
  expect(await page.evaluate(k => localStorage.getItem(k), MIGRATED_FLAG_KEY)).toBeNull();
});

test('si la app ya tiene otro presupuesto, no se sobrescribe sin confirmación', async ({ page }) => {
  await seed(page, APP, OTHER_BUDGET);
  await seed(page, MAIN, SAMPLE_BUDGET);
  await page.goto(`${MAIN}/finanzas/mi-quincena/`);
  page.once('dialog', d => d.dismiss());
  await page.getByRole('button', { name: 'Trasladar mi presupuesto' }).click();
  await expect(page.locator('[data-migration-status]')).toContainText('los dos presupuestos se conservan');
  expect(await stored(page)).toBe(SAMPLE_BUDGET);
  await page.goto(`${APP}/`);
  expect(await stored(page)).toBe(OTHER_BUDGET);

  await page.goto(`${MAIN}/finanzas/mi-quincena/`);
  page.once('dialog', d => d.accept());
  await page.getByRole('button', { name: 'Trasladar mi presupuesto' }).click();
  await expect(page.locator('[data-migration-done]')).toBeVisible();
  expect(await stored(page)).toBeNull();
  await page.goto(`${APP}/`);
  expect(await stored(page)).toBe(SAMPLE_BUDGET);
});

test('un sitio ajeno no puede escribir en la app ni recibir respuestas del receptor', async ({ page }) => {
  await page.goto(`${FOREIGN}/`);
  await page.waitForFunction(() => (window as any).__sent === true);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => (window as any).__received)).toEqual([]);
  await page.goto(`${APP}/`);
  expect(await stored(page)).toBeNull();
});

test('la app no carga recursos de terceros, aplica la CSP estricta y es noindex', async ({ page }) => {
  const external: string[] = [];
  page.on('request', r => { if (new URL(r.url()).origin !== APP) external.push(r.url()); });
  for (const path of ['/', '/quincena/', '/importar/']) {
    await page.goto(`${APP}${path}`);
    expect(await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content'), path).toContain(STRICT);
    await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute('content', 'noindex');
  }
  await page.goto(`${APP}/quincena/`);
  await page.fill('#budget-opening', '1000');
  await page.locator('#budget-opening').blur();
  expect(await stored(page)).toContain('"openingCents":100000');
  expect(external).toEqual([]);
});

test('ensayo: el canal de datos ficticios traslada a su propia clave y no toca el presupuesto real', async ({ page }) => {
  await seed(page, MAIN, SAMPLE_BUDGET);
  await page.goto(`${MAIN}/ensayo/traslado-quincena/`);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await page.getByRole('button', { name: '1. Crear presupuesto ficticio' }).click();
  await page.getByRole('button', { name: '2. Trasladar el presupuesto ficticio' }).click();
  await expect(page.locator('[data-migration-done]')).toBeVisible();
  expect(await stored(page)).toBe(SAMPLE_BUDGET);
  await page.getByRole('button', { name: 'Comprobar desde esta página' }).click();
  await expect(page.locator('[data-check="cross-origin-blocked"]')).toHaveAttribute('data-ok', 'true');
  await expect(page.locator('[data-check="no-real-budget"]')).toHaveAttribute('data-ok', 'false');
  await page.goto(`${APP}/ensayo/`);
  await expect(page.locator('[data-rehearsal-state]')).toContainText('B/.1234.56');
  expect(await stored(page)).toBeNull();
});
