import { test, expect } from '@playwright/test';

const routes = ['salario-neto', 'decimo-tercer-mes', 'vacaciones', 'liquidacion-laboral'];
for (const width of [320, 375, 768, 1280]) {
  test(`guía accesible y sin tapar controles a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const route of routes) {
      await page.goto(`/calculadoras/${route}/`);
      const guide = page.locator('#blue-help');
      await expect(page.locator('.blue-visibility')).toBeVisible();
      const overlaps = await guide.evaluate(el => {
        if (!el.classList.contains('blue-help-floating')) return false;
        const a = el.getBoundingClientRect();
        return [...document.querySelectorAll('form, .results, .site-header, .tabbar')].some(other => {
          const b = other.getBoundingClientRect();
          return b.width > 0 && b.height > 0 && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        });
      });
      expect(overlaps).toBe(false);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await guide.locator(':scope > summary').click();
      await expect(guide.locator('.blue-help-content')).toBeVisible();
      await guide.locator('.blue-help-close').click();
      await expect(guide).not.toHaveAttribute('open', '');
    }
    await page.goto('/calculadoras/salario-neto/');
    await page.locator('#gross').fill('1500');
    await page.locator('#salary-form button[type=submit]').click();
    await expect(page.locator('#salary-result')).toContainText('1,236.92');
    expect(errors).toEqual([]);
  });
}

test('recuerda si se oculta y respeta movimiento reducido', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/calculadoras/vacaciones/');
  await page.getByRole('button', { name: 'Ocultar a Blue' }).click();
  await expect(page.locator('.blue-help-avatar')).toBeHidden();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Mostrar a Blue' })).toBeVisible();
  await page.getByRole('button', { name: 'Mostrar a Blue' }).click();
  await expect(page.locator('.blue-help-avatar')).toBeVisible();
  expect(await page.locator('.blue-help-avatar').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
});

test('la guía funciona con imagen rota', async ({ page }) => {
  await page.route('**/blue-flotante.webp', route => route.abort());
  await page.goto('/calculadoras/vacaciones/');
  await page.locator('#blue-help > summary').click();
  await expect(page.locator('.blue-help-content')).toBeVisible();
});

test('la guía funciona sin JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 850 } });
  const page = await context.newPage();
  await page.goto('/calculadoras/vacaciones/');
  await page.locator('#blue-help > summary').click();
  await expect(page.locator('.blue-help-content')).toBeVisible();
  await context.close();
});

test('retira a Blue del vuelo al reducir el viewport o enfocar el formulario', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1100 });
  await page.goto('/calculadoras/vacaciones/');
  await expect(page.locator('#blue-help')).toHaveClass(/blue-help-floating/);
  await page.setViewportSize({ width: 375, height: 700 });
  await page.locator('#salary').focus();
  await expect(page.locator('#blue-help')).not.toHaveClass(/blue-help-floating/);
});

test('vuela entre zonas seguras y se suspende al ocultar la página', async ({ page }) => {
  test.setTimeout(25000);
  await page.setViewportSize({ width: 1920, height: 1100 });
  await page.goto('/calculadoras/vacaciones/');
  const guide = page.locator('#blue-help');
  await expect(guide).toHaveClass(/blue-help-floating/);
  const start = await guide.evaluate(el => (el as HTMLElement).style.transform);
  await page.evaluate(() => {
    (window as unknown as { blueCollisions: number }).blueCollisions = 0;
    const interval = window.setInterval(() => {
      const g = document.querySelector('#blue-help');
      if (!g || !g.classList.contains('blue-help-floating')) return;
      const a = g.getBoundingClientRect();
      for (const el of document.querySelectorAll('form, .results, .site-header, .tabbar')) {
        const b = el.getBoundingClientRect();
        if (b.width && b.height && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) (window as unknown as { blueCollisions: number }).blueCollisions++;
      }
    }, 40);
    window.setTimeout(() => clearInterval(interval), 12500);
  });
  await expect.poll(() => guide.evaluate(el => (el as HTMLElement).style.transform), { timeout: 14000 }).not.toBe(start);
  await page.waitForTimeout(2000); // Completar el vuelo para observar también el aterrizaje.
  expect(await page.evaluate(() => (window as unknown as { blueCollisions: number }).blueCollisions)).toBe(0);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(guide).not.toHaveClass(/blue-help-floating/);
});
