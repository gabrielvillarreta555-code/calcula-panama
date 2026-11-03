import {test,expect} from '@playwright/test';

test('buscar y navegar desde una respuesta a su herramienta',async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await page.goto('/responde/');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Calcula Panamá Responde');
 await page.getByLabel('Busca una pregunta').fill('decimo');
 await expect(page.locator('.resultado:visible')).toHaveCount(1);
 await page.locator('.resultado:visible').getByRole('link',{name:'¿Cuánto me corresponde de décimo si trabajé seis meses en Panamá?'}).click();
 await expect(page.locator('h1')).toHaveCount(1);
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',/\/responde\/cuanto-decimo-por-seis-meses\/$/);
 await expect(page.getByText('B/.450 brutos',{exact:false}).first()).toBeVisible();
 await page.getByRole('link',{name:'Calcula tu décimo con tus datos'}).click();
 await expect(page).toHaveURL(/\/calculadoras\/decimo-tercer-mes\/$/);
});

test('categorías, ausencia de resultados y sitemap',async({page,request})=>{
 await page.goto('/responde/');
 await page.getByLabel('Categoría').selectOption({label:'Compras e impuestos'});
 await expect(page.locator('.resultado:visible')).toHaveCount(1);
 await page.getByLabel('Busca una pregunta').fill('xyzsincoincidencia');
 await expect(page.getByText('No encontramos preguntas con esos filtros.')).toBeVisible();
 const response=await request.get('/sitemap.xml');
 expect(await response.text()).toContain('/responde/como-calcular-itbms-panama/');
});
