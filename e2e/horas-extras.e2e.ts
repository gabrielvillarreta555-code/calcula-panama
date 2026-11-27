import { test, expect, type Page } from '@playwright/test';

// CP-TOOL-008: calculadora de horas extras. Se ejecuta en Chromium (npm run test:e2e) y en Firefox y WebKit
// (playwright.browsers.config.ts). Solo usa APIs estándar.
const PATH = '/calculadoras/horas-extras/';

function watch(page: Page) {
  const errors: string[] = [], external: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const origin = new URL(String(test.info().project.use.baseURL ?? 'http://127.0.0.1:4329')).origin;
  page.on('request', r => { const u = new URL(r.url()); if (['http:', 'https:'].includes(u.protocol) && u.origin !== origin) external.push(u.origin); });
  return { errors, external };
}
async function salary(page: Page, value = '1000') { await page.locator('#ot-salary').fill(value); }
async function logMode(page: Page) { await page.getByText('Registro de jornadas', { exact: true }).click(); await expect(page.locator('#ot-log')).toBeVisible(); }
async function addShift(page: Page, date: string, start: string, end: string, opts: { kind?: string; brk?: string } = {}) {
  await page.locator('#ot-date').fill(date);
  await page.locator('#ot-start').fill(start);
  await page.locator('#ot-end').fill(end);
  await page.locator('#ot-break').fill(opts.brk ?? '0');
  await page.locator('#ot-daykind').selectOption(opts.kind ?? 'normal');
  await page.locator('#ot-entry-submit').click();
}

test('modo rápido: hora ordinaria, hora extra, recargo y total', async ({ page }) => {
  const w = watch(page);
  await page.goto(PATH);
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('h1')).toHaveText(/horas extras/i);
  await salary(page);
  await page.locator('#ot-hours').fill('2');
  await expect(page.locator('[data-ot="total"]')).toHaveText(/B\/\.\s?12.02$/);
  await expect(page.locator('[data-ot="qHourly"]')).toHaveText(/B\/\.\s?4.81$/);
  await expect(page.locator('[data-ot="qHourValue"]')).toHaveText(/B\/\.\s?6.01$/);
  await expect(page.locator('[data-ot="qSurcharge"]')).toHaveText(/B\/\.\s?2.40$/);
  await page.getByRole('radio', { name: /75% · prolongación nocturna/ }).check();
  await expect(page.locator('[data-ot="total"]')).toHaveText(/B\/\.\s?16.83$/);
  await page.locator('#ot-day').selectOption('feriado');
  await expect(page.locator('#ot-alerts')).toContainText('feriado ya está pagado');
  await page.locator('#ot-hours').fill('4');
  await expect(page.locator('#ot-alerts')).toContainText('límite del art. 36');
  // Quincenal: misma hora con la mitad del salario.
  await page.locator('input[name=basis][value=fortnightly]').check({ force: true });
  await salary(page, '500');
  await page.locator('#ot-day').selectOption('normal'); await page.getByRole('radio', { name: /25% · de día/ }).check(); await page.locator('#ot-hours').fill('2');
  await expect(page.locator('[data-ot="total"]')).toHaveText(/B\/\.\s?12.02$/);
  // Errores claros.
  await page.locator('#ot-minutes').fill('75');
  await expect(page.locator('#ot-quick-error')).toContainText('0 a 59');
  expect(w.errors).toEqual([]); expect(w.external).toEqual([]);
});

test('registro: turnos rotativos, medianoche, domingo, edición, duplicado y eliminación', async ({ page }) => {
  const w = watch(page);
  await page.goto(PATH);
  await salary(page);
  await logMode(page);
  await addShift(page, '2026-11-02', '07:00', '17:00');
  await addShift(page, '2026-11-03', '15:00', '23:00');
  await expect(page.locator('#ot-holiday-hint')).toHaveText('');
  await addShift(page, '2026-11-04', '23:00', '07:00');
  await addShift(page, '2026-11-08', '07:00', '15:00', { kind: 'descanso' });
  await expect(page.locator('.fx-shift')).toHaveCount(4);
  await expect(page.locator('[data-ot="total"]')).toHaveText(/B\/\.\s?86.54$/);
  await expect(page.locator('[data-ot="logExtra"]')).toHaveText('4 h');
  await expect(page.locator('#ot-alerts')).toContainText('turnos rotativos');
  await expect(page.locator('#ot-alerts')).toContainText('3 de noviembre');
  await expect(page.locator('[data-ot="dockTotal"]')).toHaveText(/B\/\.\s?86.54$/);

  // Editar: el domingo pasa a día laborable.
  await page.getByRole('button', { name: /Editar la jornada del 2026-11-08/ }).click();
  await expect(page.locator('#ot-entry-submit')).toHaveText(/Guardar cambios/);
  await page.locator('#ot-daykind').selectOption('normal');
  await page.locator('#ot-entry-submit').click();
  await expect(page.locator('[data-ot="total"]')).toHaveText(/B\/\.\s?28.85$/);

  // Duplicar crea la jornada del día siguiente; un duplicado exacto no se cuenta dos veces.
  await page.getByRole('button', { name: /Duplicar la jornada del 2026-11-08/ }).click();
  await expect(page.locator('.fx-shift')).toHaveCount(5);
  await addShift(page, '2026-11-02', '07:00', '17:00');
  await expect(page.locator('#ot-alerts')).toContainText('duplicada');
  await expect(page.locator('.fx-shift.is-excluded')).toHaveCount(1);

  // Eliminar.
  await page.getByRole('button', { name: /Eliminar la jornada del 2026-11-03/ }).click();
  await expect(page.locator('.fx-shift')).toHaveCount(5);

  // Descanso mayor que la jornada: error y no se añade.
  await addShift(page, '2026-11-20', '07:00', '08:00', { brk: '90' });
  await expect(page.locator('#ot-entry-error')).toContainText('descanso');
  await expect(page.locator('.fx-shift')).toHaveCount(5);

  // Feriado sugerido y jornada que cruza la medianoche.
  await page.locator('#ot-date').fill('2026-12-25'); await page.locator('#ot-start').fill('22:00'); await page.locator('#ot-end').fill('06:00');
  await expect(page.locator('#ot-holiday-hint')).toContainText('25 de diciembre');
  await expect(page.locator('#ot-nextkind')).toBeVisible();
  expect(w.errors).toEqual([]); expect(w.external).toEqual([]);
});

test('exporta CSV, copia, comparte con vista previa y reinicia sin guardar nada', async ({ page, browserName }) => {
  const w = watch(page);
  await page.goto(PATH);
  await salary(page);
  await logMode(page);
  await addShift(page, '2026-11-02', '07:00', '17:00');
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#ot-csv').click()]);
  expect(download.suggestedFilename()).toMatch(/^horas-extras-\d{4}-\d{2}-\d{2}\.csv$/);
  const csv = await (await download.createReadStream()).toArray().then(chunks => Buffer.concat(chunks).toString('utf8'));
  expect(csv).toContain('2026-11-02;07:00;17:00;0;Día laborable;diurna;600;480;120;0;12.02;Incluida');
  expect(csv).not.toMatch(/nombre|cédula|empresa/i);

  if (browserName === 'chromium') await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.locator('#ot-copy').click();
  await expect(page.locator('#ot-status')).toContainText(/copiado|No se pudo copiar/);

  await page.locator('#ot-share').click();
  await expect(page.locator('.share-dialog')).toBeVisible();
  await expect(page.locator('.share-preview')).not.toContainText('12.02');
  await page.keyboard.press('Escape');

  expect(await page.evaluate(() => ({ local: Object.keys(localStorage).length, session: Object.keys(sessionStorage).length }))).toEqual({ local: 0, session: 0 });
  page.once('dialog', d => d.accept());
  await page.locator('#ot-reset').click();
  await expect(page.locator('.fx-shift')).toHaveCount(0);
  await expect(page.locator('#ot-salary')).toHaveValue('');
  expect(w.errors).toEqual([]); expect(w.external).toEqual([]);
});

for (const width of [360, 390, 412, 768, 1440]) {
  test(`diseño y accesibilidad a ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(PATH);
    await salary(page);
    await logMode(page);
    await addShift(page, '2026-11-02', '06:00', '18:00');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('h1')).toHaveCount(1);
    const unlabeled = await page.evaluate(() => [...document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('main input:not([type=hidden]), main select, .fx-wrap input, .fx-wrap select')]
      .filter(el => el.offsetParent !== null && !(el.labels?.length) && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !el.closest('label')).map(el => el.id || el.name));
    expect(unlabeled).toEqual([]);
    const small = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('#ot-app button, #ot-app .fx-choice, #ot-app .fx-segmented label')]
      .filter(el => el.offsetParent !== null).map(el => el.getBoundingClientRect()).filter(r => r.width < 44 || r.height < 44).length);
    expect(small).toBe(0);
    await expect(page.locator('#ot-alerts li.is-warn').first()).toHaveCSS('color', 'rgb(245, 165, 36)');
    if (width < 960) await expect(page.locator('#ot-dock')).toBeVisible(); else await expect(page.locator('#ot-dock')).toBeHidden();
  });
}

test('sin publicidad, con CSP estricta y fuera del sitemap mientras no se publique', async ({ page, request }) => {
  await page.goto(PATH);
  await expect(page.locator('script[src*="adsbygoogle"]')).toHaveCount(0);
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute('content', /connect-src 'none'/);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('horas-extras');
  const index = await (await request.get('/sitemap-0.xml')).text();
  expect(index).not.toContain('horas-extras');
});
