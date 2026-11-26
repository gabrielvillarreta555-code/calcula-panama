import { test, expect } from '@playwright/test';

// Midnight Edition (CP-DESIGN-005): paleta, tema, buscador, fotografías y presencia discreta de Blue.
const PALETTE = ['rgb(8, 9, 12)', 'rgb(16, 24, 36)', 'rgb(37, 54, 75)', 'rgb(140, 171, 201)', 'rgb(231, 233, 237)'];

test('Midnight es el tema por defecto y el botón alterna con Marfil', async ({ page }) => {
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(PALETTE[0]);
  expect(await page.evaluate(() => getComputedStyle(document.body).color)).toBe(PALETTE[4]);
  await page.locator('.theme-button').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(PALETTE[4]);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('.theme-button').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('sin rojos, vinos ni dorados en los elementos de la interfaz', async ({ page }) => {
  for (const path of ['/', '/calculadoras/salario-neto/', '/herramientas/', '/finanzas/calculadora-prestamos/']) {
    await page.goto(path);
    const warm = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll('body *:not(img):not(picture):not(source)')) {
        const cs = getComputedStyle(el);
        for (const value of [cs.color, cs.backgroundColor, cs.borderTopColor]) {
          const m = value.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
          if (!m || (m[4] !== undefined && Number(m[4]) < .2)) continue;
          const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
          if (r > g + 40 && r > b + 40) out.push(`${el.tagName}.${el.className} ${value}`);
        }
      }
      return out.slice(0, 5);
    });
    expect(warm, path).toEqual([]);
  }
});

test('buscador de herramientas: filtra, navega con teclado y no hace peticiones', async ({ page }) => {
  await page.goto('/');
  const requests: string[] = [];
  // Lo que escribes no sale del navegador: ninguna petición fetch/XHR ni ninguna URL con el texto buscado.
  page.on('request', r => { if (['xhr', 'fetch'].includes(r.resourceType()) || /liquidacion|xyzxyz|combustible/i.test(r.url())) requests.push(r.url()); });
  const search = page.locator('#home-search');
  await search.fill('liquidacion');
  const result = page.locator('[data-tool-search]').filter({ has: search }).getByRole('link', { name: /Liquidación laboral/ });
  await expect(result).toHaveAttribute('href', '/calculadoras/liquidacion-laboral/');
  await search.fill('xyzxyz');
  await expect(page.getByText('Sin resultados.', { exact: false }).first()).toBeVisible();
  expect(requests).toEqual([]);
  page.removeAllListeners('request');
  await page.locator('.search-button').click();
  await expect(page.locator('#header-search')).toBeFocused();
  await page.keyboard.type('combustible');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/vehiculos\/combustible-por-viaje\/$/);
});

test('fotografías: alt, dimensiones, formatos modernos y crédito con licencia', async ({ page }) => {
  await page.goto('/');
  const figures = page.locator('figure.mn-photo');
  expect(await figures.count()).toBeGreaterThanOrEqual(6);
  for (const figure of await figures.all()) {
    const img = figure.locator('img');
    expect((await img.getAttribute('alt'))!.length).toBeGreaterThan(20);
    expect(Number(await img.getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(await img.getAttribute('height'))).toBeGreaterThan(0);
    await expect(figure.locator('source[type="image/avif"]')).toHaveCount(1);
    await expect(figure.locator('figcaption a[rel~="license"]')).toHaveText(/^(CC0|Public domain|CC BY(-SA)? [\d.]+)$/);
  }
  await expect(page.locator('main img[src*="blue"]')).toHaveCount(0);
  await expect(page.locator('footer img[src*="blue"]')).toHaveCount(1);
});
