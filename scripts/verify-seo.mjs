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
// La publicidad permanece pausada en TODO el origen que almacena Mi Quincena.
function verifyOriginPrivacy(html, loc) {
  const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1];
  if (!csp || !/script-src 'self' 'unsafe-inline'(?:;|$)/.test(csp) || !/connect-src 'none'(?:;|$)/.test(csp)) errors.push(`Falta la política de privacidad del origen: ${loc}`);
  if (/adsbygoogle|googlesyndication|doubleclick/i.test(html)) errors.push(`Código publicitario en el origen privado: ${loc}`);
  for (const tag of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    try { if (new URL(tag[1], loc).origin !== new URL(site).origin) errors.push(`Script externo no permitido: ${loc}`); }
    catch { errors.push(`URL de script no válida: ${loc}`); }
  }
}
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

const robots = read('dist/robots.txt');
if (!robots.includes(`Sitemap: ${site}sitemap.xml`)) errors.push('robots.txt no enlaza sitemap.xml');
if (/^Disallow:\s*\/\s*$/m.test(robots)) errors.push('robots.txt bloquea todo el sitio');

// Revisar también 404 y cualquier HTML futuro que no figure en el sitemap.
function verifyAllHtml(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) verifyAllHtml(file);
    else if (entry.isFile() && file.endsWith('.html')) verifyOriginPrivacy(read(file), new URL(relative('dist', file).replaceAll('\\', '/'), site).toString());
  }
}
verifyAllHtml('dist');
// Se conserva ads.txt para la cuenta existente; no habilita scripts ni anuncios.
const siteConfig = readFileSync('src/data/site.ts', 'utf8');
const client = siteConfig.match(/client: '(ca-pub-\d{16})'/)?.[1];
if (client) {
  const adsTxt = read('dist/ads.txt');
  if (!adsTxt.includes(`google.com, ${client.replace('ca-', '')}, DIRECT, f08c47fec0942fa0`)) errors.push('ads.txt no coincide con el ID de AdSense');
}

if (errors.length) {
  console.error(`Verificación SEO fallida:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Verificación SEO y privacidad correcta: ${locs.length} URL en sitemap.xml, robots.txt, canonical y política del origen; publicidad pausada${client ? ' y ads.txt conservado' : ''}`);
