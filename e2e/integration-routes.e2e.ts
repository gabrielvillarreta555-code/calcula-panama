import { test, expect } from '@playwright/test';

test('rutas de compras y resultados de las cuatro calculadoras', async ({ page }) => {
  for (const path of ['/compras/', '/compras/modo-pasillo/']) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  }

  await page.goto('/calculadoras/salario-neto/');
  await page.locator('#gross').fill('1500');
  await page.locator('#salary-form button[type=submit]').click();
  await expect(page.locator('#salary-result')).toBeVisible();
  await expect(page.locator('#salary-result')).toContainText('1,236.92');

  await page.goto('/calculadoras/decimo-tercer-mes/');
  await page.locator('#monthly').fill('900');
  await page.locator('#year').fill('2026');
  await page.locator('#thirteenth-form button[type=submit]').click();
  await expect(page.locator('#thirteenth-result')).toBeVisible();
  await expect(page.locator('#thirteenth-result')).toContainText('300.00');

  await page.goto('/calculadoras/vacaciones/');
  await page.locator('#salary').fill('1000');
  await page.locator('input[name=mode][value=days]').check();
  await page.locator('#pending').fill('30');
  await page.locator('#vacation-form button[type=submit]').click();
  await expect(page.locator('#vacation-result')).toBeVisible();
  await expect(page.locator('#vacation-result')).toContainText('1,000.00');

  await page.goto('/calculadoras/liquidacion-laboral/');
  await page.locator('#salary').fill('1000');
  await page.locator('#start').fill('2024-01-01');
  await page.locator('#end').fill('2025-12-31');
  await page.locator('#termination-form button[type=submit]').click();
  await expect(page.locator('#termination-result')).toBeVisible();
  await expect(page.locator('#termination-result')).not.toBeEmpty();
});
