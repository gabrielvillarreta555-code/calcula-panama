import { test, expect } from '@playwright/test';

test('Blue cambia de estado según eventos sin leer valores', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  // CP-DESIGN-007: salario neto ya no tiene a Blue; se prueba en vacaciones, que lo conserva.
  await page.goto('/calculadoras/vacaciones/');
  const guide = page.locator('#blue-help');
  await page.locator('#salary').focus();
  await expect(guide).toHaveAttribute('data-blue-mood', 'focused');
  await page.locator('#salary').fill('1500');
  await page.locator('input[name=mode][value=days]').check();
  await page.locator('#pending').fill('15');
  await page.locator('#vacation-form button[type=submit]').click();
  await expect(guide).toHaveAttribute('data-blue-mood', 'happy');
  await expect(guide).not.toContainText('1500');
  await guide.locator(':scope > summary').focus();
  await page.keyboard.press('Enter');
  await expect(guide.locator('.blue-help-content')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(guide).not.toHaveAttribute('open', '');
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: 'test-results/blue-interactivo/mobile.png', fullPage: true });
});

test('reducir movimiento elimina la mirada animada', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/calculadoras/vacaciones/');
  await page.locator('#salary').focus();
  await expect(page.locator('#blue-help')).toHaveAttribute('data-blue-mood', 'focused');
  await expect(page.locator('#blue-help')).not.toHaveAttribute('data-blue-gaze');
  expect(await page.locator('.blue-rig-head').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
});
