import { test, expect } from '@playwright/test';

// CP-DESIGN-008: Compras es una página editorial sin Blue; conserva el acceso a Modo Pasillo.
test('Compras: editorial, sin Blue y con acceso a Modo Pasillo', async ({ page }) => {
  await page.goto('/compras/');
  await expect(page.locator('body')).toHaveClass(/\bed\b/);
  await expect(page.locator('[class*="blue"], img[src*="blue"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Ir a Modo Pasillo/ })).toHaveAttribute('href', '/compras/modo-pasillo/');
});
