// Verifica la compilación del origen de la app (dist-app/): ninguna página puede cargar publicidad,
// analítica ni scripts de terceros; todas llevan la CSP estricta y noindex. Uso: npm run verify:app
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const dir = process.env.OUT_DIR || 'dist-app';
const appOrigin = new URL(process.env.APP_ORIGIN || 'https://app.calculapanama.com').origin;
const mainOrigin = new URL(process.env.MAIN_ORIGIN || 'https://calculapanama.com').origin;
const errors = [];
const strictCsp = readFileSync('src/data/ad-policy.ts', 'utf8').match(/STRICT_CSP = "([^"]+)"/)?.[1];
if (!strictCsp) errors.push('No se encontró STRICT_CSP');
const files = d => readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(join(d, e.name)) : e.name.endsWith('.html') ? [join(d, e.name)] : []);
if (!existsSync(dir)) errors.push(`Falta ${dir}`);
const pages = existsSync(dir) ? files(dir) : [];
for (const file of pages) {
  const path = '/' + relative(dir, file).replaceAll('\\', '/');
  const html = readFileSync(file, 'utf8');
  if ((html.match(/http-equiv="Content-Security-Policy"/g) ?? []).length !== 1 || !html.includes(`content="${strictCsp}"`)) errors.push(`CSP estricta ausente o duplicada: ${path}`);
  if (!/<meta name="robots" content="noindex"/.test(html)) errors.push(`Falta noindex: ${path}`);
  if (/adsbygoogle|googlesyndication|doubleclick|googletagmanager|google-analytics/i.test(html)) errors.push(`Código publicitario o de analítica: ${path}`);
  for (const m of html.matchAll(/<(?:script|link|img|iframe)\b[^>]*\b(?:src|href)=["']([^"']+)["']/gi)) {
    const url = new URL(m[1], appOrigin);
    if (url.origin !== appOrigin) errors.push(`Recurso de otro origen (${url.origin}) en ${path}`);
  }
}
for (const required of ['quincena/index.html', 'importar/index.html', '_headers', 'robots.txt']) if (!existsSync(join(dir, required))) errors.push(`Falta ${required}`);
const importer = existsSync(join(dir, 'importar/index.html')) ? readFileSync(join(dir, 'importar/index.html'), 'utf8') : '';
if (!importer.includes(`data-main-origin="${mainOrigin}"`)) errors.push(`El receptor no está ligado a ${mainOrigin}`);
const headers = existsSync(join(dir, '_headers')) ? readFileSync(join(dir, '_headers'), 'utf8') : '';
if (!headers.includes(`frame-ancestors ${mainOrigin}`) && !process.env.MAIN_ORIGIN) errors.push('_headers no limita quién puede incrustar /importar/');
if (/Disallow:\s*\/\s*$/m.test(readFileSync(join(dir, 'robots.txt'), 'utf8'))) errors.push('robots.txt no debe bloquear la app (AdSense no sirve anuncios junto a contenido que no puede evaluar)');
if (errors.length) { console.error(`Verificación de la app fallida:\n- ${errors.join('\n- ')}`); process.exit(1); }
console.log(`Verificación de la app correcta: ${pages.length} páginas en ${dir}, CSP estricta, noindex y sin recursos de terceros.`);
