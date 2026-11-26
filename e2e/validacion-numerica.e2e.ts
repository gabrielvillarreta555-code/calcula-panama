import { expect, test } from '@playwright/test';

for (const item of [
  { path: '/calculadoras/salario-neto/', field: '#gross', form: '#salary-form', error: '#salary-error', result: '#salary-result' },
  { path: '/calculadoras/decimo-tercer-mes/', field: '#monthly', form: '#thirteenth-form', error: '#thirteenth-error', result: '#thirteenth-result' },
  { path: '/calculadoras/vacaciones/', field: '#salary', form: '#vacation-form', error: '#vacation-error', result: '#vacation-result' },
  { path: '/calculadoras/liquidacion-laboral/', field: '#salary', form: '#termination-form', error: '#termination-error', result: '#termination-result' }
]) {
  test(`${item.path}: rechaza entrada extrema sin mostrar NaN`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.goto(item.path);
    await page.locator(item.field).fill('1e308');
    await page.locator(`${item.form} button[type=submit]`).click();
    await expect(page.locator(item.error)).toContainText('límite técnico');
    await expect(page.locator(item.result)).toBeHidden();
    await expect(page.locator('body')).not.toContainText('NaN');
  });
}

test('un resultado previo desaparece al introducir un importe extremo', async ({ page }) => {
  await page.goto('/calculadoras/salario-neto/');
  await page.locator('#gross').fill('1500');
  await page.locator('#salary-form button[type=submit]').click();
  await expect(page.locator('#salary-result')).toBeVisible();
  await page.locator('#gross').fill('1e308');
  await expect(page.locator('#salary-result')).toBeHidden();
  await expect(page.locator('#salary-error')).toContainText('límite técnico');
});
