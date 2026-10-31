import { test, expect } from '@playwright/test';

for (const mode of ['light', 'dark'] as const) {
  test(`la portada usa una paleta azul en modo ${mode}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const colors = await page.locator('.labor-card .calculator-art').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).color));
    expect(colors).toHaveLength(4);
    expect(new Set(colors).size).toBe(1);
    await expect(page.locator('.shopping-feature')).toBeVisible();
    await expect(page.locator('.shopping-feature-button')).toHaveAttribute('href', '/compras/modo-pasillo/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.theme-button').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', mode === 'dark' ? 'light' : 'dark');
  });
}

test('la ilustración de Compras conserva el acceso a Modo Pasillo', async ({ page }) => {
  await page.goto('/compras/');
  await expect(page.locator('.shopping-scene-blue')).toBeVisible();
  await expect(page.getByRole('link', { name: /Ir a Modo Pasillo/ })).toHaveAttribute('href', '/compras/modo-pasillo/');
});
