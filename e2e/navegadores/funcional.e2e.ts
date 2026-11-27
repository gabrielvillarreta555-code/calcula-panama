import { test, expect, type Page } from '@playwright/test';

// CP-DESIGN-007: comprobaciones de Midnight Functional que se ejecutan también en Firefox y WebKit (Safari)
// con playwright.browsers.config.ts. Solo usan APIs estándar para funcionar igual en los tres motores.
const ORIGIN = 'http://127.0.0.1:4329';
function watch(page: Page) {
  const errors: string[] = [], external: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', r => { const o = new URL(r.url()).origin; if (o !== ORIGIN && !o.startsWith('data:')) external.push(o); });
  return { errors, external };
}
const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const day = (offset: number) => { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

for (const width of [390, 1280]) {
  test(`salario neto calcula, desglosa y reinicia (${width} px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const w = watch(page);
    await page.goto('/calculadoras/salario-neto/');
    await expect(page.locator('body')).toHaveClass(/\bfx\b/);
    await expect(page.locator('h1')).toHaveCount(1);
    await page.locator('#gross').fill('1500');
    await page.locator('#salary-form button[type=submit]').click();
    await expect(page.locator('#salary-hero [data-out=net]')).toHaveText(/1,236\.92/);
    await expect(page.locator('[data-out=socialSecurity]').first()).toHaveText(/146\.25/);
    await expect(page.locator('#salary-donut')).toBeVisible();
    expect(await noOverflow(page)).toBe(true);
    await page.locator('#salary-reset').click();
    await expect(page.locator('#gross')).toHaveValue('');
    expect(w.errors).toEqual([]); expect(w.external).toEqual([]);
  });

  test(`Mi Quincena registra gastos y avisa en ámbar con saldo negativo (${width} px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const w = watch(page);
    await page.goto('/finanzas/mi-quincena/');
    await expect(page.getByText('Dinero inicial', { exact: true })).toBeVisible();
    await page.locator('#budget-start').fill(day(0));
    await page.locator('#budget-payday').fill(day(10));
    await page.locator('#budget-opening').fill('500');
    await page.locator('#move-name').fill('Servicios'); await page.locator('#move-amount').fill('180');
    await page.getByRole('button', { name: 'Añadir movimiento' }).click();
    await expect(page.locator('[data-result=free]')).toHaveText('B/.320.00');
    await expect(page.locator('#budget-alert')).not.toHaveClass(/is-warn/);
    await page.reload();
    await expect(page.locator('.budget-item')).toHaveCount(1);
    await page.locator('#move-name').fill('Alquiler'); await page.locator('#move-amount').fill('400');
    await page.getByRole('button', { name: 'Añadir movimiento' }).click();
    await expect(page.locator('[data-result=free]')).toHaveText('B/.-80.00');
    await expect(page.locator('#budget-alert')).toHaveClass(/is-warn/);
    await expect(page.locator('#budget-alert')).toHaveCSS('color', 'rgb(245, 165, 36)');
    await expect(page.locator('#budget-progress')).toHaveClass(/is-over/);
    expect(await noOverflow(page)).toBe(true);
    expect(w.errors).toEqual([]); expect(w.external).toEqual([]);
  });

  test(`Modo Pasillo suma, cambia cantidades y avisa en ámbar (${width} px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const w = watch(page);
    await page.goto('/compras/modo-pasillo/');
    await page.locator('#aisle-budget').fill('20');
    await page.locator('#aisle-name').fill('Arroz'); await page.locator('#aisle-price').fill('4.25');
    await page.locator('#aisle-form button[type=submit]').click();
    await expect(page.locator('[data-aisle-total]')).toHaveText(/4\.25/);
    await page.getByRole('button', { name: 'Añadir una unidad de Arroz' }).click();
    await expect(page.locator('[data-aisle-total]')).toHaveText(/8\.50/);
    await expect(page.locator('.fx-overbudget')).toBeHidden();
    await page.locator('#aisle-name').fill('Aceite'); await page.locator('#aisle-price').fill('15');
    await page.locator('#aisle-form button[type=submit]').click();
    await expect(page.locator('[data-aisle-total]')).toHaveText(/23\.50/);
    await expect(page.locator('.fx-overbudget')).toBeVisible();
    await expect(page.locator('.fx-overbudget')).toHaveCSS('color', 'rgb(245, 165, 36)');
    await page.getByRole('button', { name: 'Eliminar Aceite' }).click();
    await expect(page.locator('.fx-overbudget')).toBeHidden();
    expect(await noOverflow(page)).toBe(true);
    expect(w.errors).toEqual([]); expect(w.external).toEqual([]);
  });
}

test('la portada no usa la variante funcional y no hay publicidad', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).not.toHaveClass(/\bfx\b/);
  await expect(page.locator('script[src*="adsbygoogle"]')).toHaveCount(0);
});

test('Salario neto: tabla, fórmulas y aviso de fuentes legibles (contraste AA)', async ({ page }) => {
  await page.goto('/calculadoras/salario-neto/');
  const ratios = await page.evaluate(() => {
    const parse = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number);
    const lum = (c: number[]) => c.slice(0, 3).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i]!, 0);
    const bg = (el: Element | null): number[] => { for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if ((c[3] ?? 1) > .5) return c; } return [8, 9, 12]; };
    return ['.fx-prose tbody td', '.fx-prose thead th', '.fx-prose .formula', '.sources .callout'].map(sel => {
      const el = document.querySelector(sel)!; const a = lum(parse(getComputedStyle(el).color)), b = lum(bg(el));
      return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    });
  });
  for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
});
