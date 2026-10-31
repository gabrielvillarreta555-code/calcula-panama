import { test, expect } from '@playwright/test';

test('Blue cambia de estado según eventos sin leer valores', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/calculadoras/salario-neto/');
  const guide = page.locator('#blue-help');
  await page.locator('#gross').focus();
  await expect(guide).toHaveAttribute('data-blue-mood', 'focused');
  await page.locator('#gross').fill('1500');
  await page.locator('#salary-form button[type=submit]').click();
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
  await page.goto('/calculadoras/salario-neto/');
  await page.locator('#gross').focus();
  await expect(page.locator('#blue-help')).toHaveAttribute('data-blue-mood', 'focused');
  await expect(page.locator('#blue-help')).not.toHaveAttribute('data-blue-gaze');
  expect(await page.locator('.blue-rig-head').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
});
