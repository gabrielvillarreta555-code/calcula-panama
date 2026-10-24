// Verifica el sitio compilado (dist/) antes de publicarlo: sitemap.xml, robots.txt y URL canónicas.
// Uso: SITE_URL=https://calculapanama.com/ node scripts/verify-seo.mjs
import { existsSync, readFileSync } from 'node:fs';

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
for (const loc of locs) {
  if (!loc.startsWith(site)) { errors.push(`URL fuera del dominio ${site}: ${loc}`); continue; }
  const file = `dist/${loc.slice(site.length)}index.html`;
  if (!existsSync(file)) { errors.push(`La URL del sitemap no tiene página: ${loc}`); continue; }
  const html = readFileSync(file, 'utf8');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical !== loc) errors.push(`Canonical distinto en ${loc}: ${canonical}`);
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) errors.push(`Página noindex en el sitemap: ${loc}`);
}

const robots = read('dist/robots.txt');
if (!robots.includes(`Sitemap: ${site}sitemap.xml`)) errors.push('robots.txt no enlaza sitemap.xml');
if (/^Disallow:\s*\/\s*$/m.test(robots)) errors.push('robots.txt bloquea todo el sitio');

if (errors.length) {
  console.error(`Verificación SEO fallida:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Verificación SEO correcta: ${locs.length} URL en sitemap.xml, robots.txt y canonical coherentes con ${site}`);
