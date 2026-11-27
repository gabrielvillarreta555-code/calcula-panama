import { test, expect, type Page } from '@playwright/test';

// CP-DESIGN-008: desde la portada se llega, haciendo clic, a todas las rutas públicas del sitemap, y cada una usa
// Midnight Edition (Editorial o Functional), sin Blue, sin la cabecera antigua, sin desbordamiento ni errores.
async function routes(page: Page) {
  const xml = await (await page.request.get('/sitemap.xml')).text();
  return [...xml.matchAll(/<loc>https:\/\/calculapanama\.com(\/[^<]*)<\/loc>/g)].map(m => m[1]!).filter(p => p !== '/');
}

for (const [width, label] of [[390, 'móvil'], [1440, 'escritorio']] as const) {
  test(`navegación completa desde la portada (${label})`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(`${page.url()}: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`${page.url()}: ${m.text()}`); });
    const targets = await routes(page);
    expect(targets.length).toBeGreaterThanOrEqual(25);
    for (const target of targets) {
      await page.goto('/');
      let link = page.locator(`a[href="${target}"]:visible`).first();
      if (!(await link.count())) {
        // Segundo nivel: a través del directorio de herramientas o del índice de guías, enlazados desde la portada.
        const hub = target.startsWith('/guias/') ? '/guias/' : '/herramientas/';
        await page.locator(`a[href="${hub}"]:visible`).first().click();
        link = page.locator(`a[href="${target}"]:visible`).first();
      }
      await link.scrollIntoViewIfNeeded();
      await link.click();
      await expect(page, target).toHaveURL(new RegExp(`${target.replace(/[/]/g, '\\/')}$`));
      const state = await page.evaluate(() => ({
        identity: document.body.classList.contains('ed') ? 'ed' : document.body.classList.contains('fx') ? 'fx' : 'antigua',
        old: document.querySelectorAll('.site-header, .tabbar, .site-footer, .theme-button, [class*="blue"], img[src*="blue"]').length,
        overflow: document.documentElement.scrollWidth > innerWidth,
        h1: document.querySelectorAll('h1').length
      }));
      expect(state, target).toEqual({ identity: expect.stringMatching(/^(ed|fx)$/), old: 0, overflow: false, h1: 1 });
    }
    expect(errors).toEqual([]);
  });
}
