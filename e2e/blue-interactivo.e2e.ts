import { test, expect } from '@playwright/test';

// CP-DESIGN-008: Blue se retiró de la interfaz. Su ayuda contextual se conserva como «Guía rápida» en texto,
// accesible con teclado y sin animaciones, en las calculadoras laborales.
for (const [path, guide] of [['/calculadoras/decimo-tercer-mes/', 'thirteenth'], ['/calculadoras/vacaciones/', 'vacation'], ['/calculadoras/liquidacion-laboral/', 'termination']] as const) {
  test(`${path}: guía rápida en texto, sin Blue`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('[class*="blue"], img[src*="blue"]')).toHaveCount(0);
    const details = page.locator(`[data-guide="${guide}"]`);
    await expect(details).not.toHaveAttribute('open', '');
    await details.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('open', '');
    await expect(details.locator('li')).toHaveCount(4);
  });
}
