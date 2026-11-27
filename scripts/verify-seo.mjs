// Verifica el sitio compilado (dist/) antes de publicarlo: sitemap.xml, robots.txt y URL canónicas.
// Uso: SITE_URL=https://calculapanama.com/ node scripts/verify-seo.mjs
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const site = process.env.SITE_URL || 'https://calculapanama.com/';
const errors = [];
const read = path => (existsSync(path) ? readFileSync(path, 'utf8') : (errors.push(`Falta ${path}`), ''));

const sitemap = read('dist/sitemap.xml');
if (!sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) errors.push('sitemap.xml no empieza con la declaración XML');
if (!sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">') || !sitemap.trimEnd().endsWith('</urlset>')) {
  errors.push('sitemap.xml no tiene un <urlset> válido');
}
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
if (locs.length === 0) errors.push('sitemap.xml no contiene URL');
if (new Set(locs).size !== locs.length) errors.push('sitemap.xml contiene URL duplicadas');
const priorityPaths = ['calculadoras/salario-neto/', 'calculadoras/vacaciones/', 'calculadoras/liquidacion-laboral/'];
const priorityTitles = new Set();
const priorityDescriptions = new Set();
for (const loc of locs) {
  if (!loc.startsWith(site)) { errors.push(`URL fuera del dominio ${site}: ${loc}`); continue; }
  const file = `dist/${loc.slice(site.length)}index.html`;
  if (!existsSync(file)) { errors.push(`La URL del sitemap no tiene página: ${loc}`); continue; }
  const html = readFileSync(file, 'utf8');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical !== loc) errors.push(`Canonical distinto en ${loc}: ${canonical}`);
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) errors.push(`Página noindex en el sitemap: ${loc}`);
  const priorityPath = priorityPaths.find(path => loc === new URL(path, site).toString());
  if (priorityPath) {
    const titles = [...html.matchAll(/<title>([^<]+)<\/title>/g)];
    const descriptions = [...html.matchAll(/<meta name="description" content="([^"]+)"/g)];
    const headings = [...html.matchAll(/<h1(?:\s[^>]*)?>/g)];
    if (titles.length !== 1 || priorityTitles.has(titles[0]?.[1])) errors.push(`Título ausente, duplicado o no único: ${loc}`);
    if (descriptions.length !== 1 || priorityDescriptions.has(descriptions[0]?.[1])) errors.push(`Descripción ausente, duplicada o no única: ${loc}`);
    if (headings.length !== 1) errors.push(`Debe haber un solo H1: ${loc}`);
    priorityTitles.add(titles[0]?.[1]);
    priorityDescriptions.add(descriptions[0]?.[1]);
    const structured = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    const schemas = [];
    for (const match of structured) {
      try { schemas.push(JSON.parse(match[1])); } catch { errors.push(`JSON-LD inválido: ${loc}`); }
    }
    if (!schemas.some(schema => schema['@type'] === 'WebApplication' && schema.url === loc)) errors.push(`WebApplication o URL incorrecta: ${loc}`);
    if (!schemas.some(schema => schema['@type'] === 'BreadcrumbList' && Array.isArray(schema.itemListElement))) errors.push(`BreadcrumbList ausente: ${loc}`);
    for (const target of priorityPaths.filter(path => path !== priorityPath)) {
      if (!html.includes(`href="/${target}"`)) errors.push(`Falta enlace interno desde ${loc} a /${target}`);
    }
  }
}
for (const path of priorityPaths) if (!locs.includes(new URL(path, site).toString())) errors.push(`Página prioritaria ausente del sitemap: ${path}`);

// Primera expansión: cada herramienta debe ser rastreable y accesible desde el directorio.
const expansionPaths = ['compras/precio-por-unidad/', 'compras/descuentos-y-promociones/', 'compras/dividir-la-cuenta/', 'impuestos/itbms/', 'vida-cotidiana/dias-habiles-y-feriados/', 'finanzas/tarjeta-de-credito/', 'finanzas/meta-de-ahorro/', 'educacion/promedio-de-notas/', 'vida-cotidiana/consumo-electrico/', 'vehiculos/financiamiento-de-auto/', 'vehiculos/combustible-por-viaje/', 'vehiculos/costo-mensual-de-un-auto/'];
const directory = read('dist/herramientas/index.html');
const toolTitles = new Set();
const toolDescriptions = new Set();
for (const path of expansionPaths) {
  const url = new URL(path, site).toString();
  if (!locs.includes(url)) errors.push(`Herramienta ausente del sitemap: ${url}`);
  const html = read(`dist/${path}index.html`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  if (!title || toolTitles.has(title)) errors.push(`Título de herramienta ausente o repetido: ${url}`);
  if (!description || toolDescriptions.has(description)) errors.push(`Descripción de herramienta ausente o repetida: ${url}`);
  toolTitles.add(title); toolDescriptions.add(description);
  if ([...html.matchAll(/<h1(?:\s[^>]*)?>/g)].length !== 1) errors.push(`La herramienta requiere un único H1: ${url}`);
  for (const text of ['Cómo se calcula', 'Ejemplo verificable', 'Alcance y limitaciones', 'Fuentes y metodología']) {
    if (!html.includes(text)) errors.push(`Contenido HTML ausente: ${text} en ${url}`);
  }
  if (!directory.includes(`href="/${path}"`)) errors.push(`Falta enlace desde el directorio: ${url}`);
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); } catch { errors.push(`Datos estructurados inválidos: ${url}`); }
  }
}

const robots = read('dist/robots.txt');
if (!robots.includes(`Sitemap: ${site}sitemap.xml`)) errors.push('robots.txt no enlaza sitemap.xml');
if (/^Disallow:\s*\/\s*$/m.test(robots)) errors.push('robots.txt bloquea todo el sitio');

// Publicidad (CP-ADS-002): la decide src/data/ad-policy.json para TODAS las páginas HTML, incluida la 404.
// Sin publicidad: CSP estricta, ningún script de terceros. Con publicidad (solo 'stage1' y política activa):
// el script oficial una sola vez en el <head>. ads.txt debe coincidir con el ID en cualquier caso.
const siteConfig = readFileSync('src/data/site.ts', 'utf8');
const client = siteConfig.match(/client: '(ca-pub-\d{16})'/)?.[1];
const policy = JSON.parse(readFileSync('src/data/ad-policy.json', 'utf8'));
const isolation = JSON.parse(readFileSync('src/data/isolation.json', 'utf8'));
// CP-ADS-003: la publicidad no puede activarse mientras Mi Quincena guarde datos en este origen.
if (policy.active && !isolation.quincenaMoved) errors.push('ad-policy.json activa la publicidad, pero Mi Quincena no se ha trasladado a su propio origen (isolation.json)');
const strictCsp = readFileSync('src/data/ad-policy.ts', 'utf8').match(/STRICT_CSP = "([^"]+)"/)?.[1];
if (!strictCsp) errors.push('No se encontró STRICT_CSP en src/data/ad-policy.ts');
const htmlFiles = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const file = join(dir, entry.name);
  return entry.isDirectory() ? htmlFiles(file) : file.endsWith('.html') ? [file] : [];
});
let adPages = 0;
for (const file of htmlFiles('dist')) {
  const path = '/' + relative('dist', file).replaceAll('\\', '/').replace(/index\.html$/, '').replace(/\.html$/, '/');
  const html = readFileSync(file, 'utf8');
  const head = html.split('</head>')[0];
  const tier = policy.pages[path]?.tier ?? 'never';
  const shouldHaveAds = Boolean(policy.active && isolation.quincenaMoved && client && tier === 'stage1');
  const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/g) ?? [];
  if (csp.length !== 1) errors.push(`Debe haber exactamente una CSP en ${path}`);
  if (shouldHaveAds) {
    adPages++;
    // AdSense se carga solo a través de la guardia de datos antiguos, nunca con una etiqueta estática.
    if ((head.match(/data-ads-guard/g) ?? []).length !== 1 || html.split('adsbygoogle.js').length !== 2 || !head.includes(client)) errors.push(`Guardia de AdSense ausente o duplicada en ${path}`);
    if (/<script[^>]+src="https:\/\/pagead2\.googlesyndication\.com/.test(html)) errors.push(`AdSense cargado sin la guardia en ${path}`);
  } else {
    const content = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1] ?? '';
    const allowedFrame = ['/finanzas/mi-quincena/', '/ensayo/traslado-quincena/'].includes(path) && /^; frame-src https?:\/\/[a-z0-9.-]+(:\d+)?$/.test(content.slice(strictCsp.length));
    if (!(content === strictCsp || (content.startsWith(strictCsp) && allowedFrame))) errors.push(`Falta la CSP estricta en la página sin publicidad ${path}`);
    if (/adsbygoogle|googlesyndication|doubleclick/i.test(html)) errors.push(`Código publicitario en una página sin publicidad: ${path}`);
    for (const tag of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)) {
      if (new URL(tag[1], site).origin !== new URL(site).origin) errors.push(`Script externo en una página sin publicidad: ${path}`);
    }
  }
}
if (client) {
  const adsTxt = read('dist/ads.txt');
  if (!adsTxt.includes(`google.com, ${client.replace('ca-', '')}, DIRECT, f08c47fec0942fa0`)) errors.push('ads.txt no coincide con el ID de AdSense');
}

if (errors.length) {
  console.error(`Verificación SEO fallida:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Verificación SEO correcta: ${locs.length} URL en sitemap.xml, robots.txt y canonical coherentes con ${site}; publicidad ${policy.active ? `activa en ${adPages} páginas` : 'pausada en todo el sitio'}, CSP estricta en las demás${client ? ' y ads.txt correcto' : ''}`);
