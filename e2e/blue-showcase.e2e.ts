import { test, expect } from '@playwright/test';

// La portada ya no usa Blue (CP-DESIGN-006): su prueba está en portada-editorial.e2e.ts. Compras conserva su ilustración.
test('la ilustración de Compras conserva el acceso a Modo Pasillo', async ({ page }) => {
  await page.goto('/compras/');
  await expect(page.locator('.shopping-scene-blue')).toBeVisible();
  await expect(page.getByRole('link', { name: /Ir a Modo Pasillo/ })).toHaveAttribute('href', '/compras/modo-pasillo/');
});
