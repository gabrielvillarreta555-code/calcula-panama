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

// AdSense: el script oficial debe estar una vez en el <head> de cada página y ads.txt debe coincidir.
const siteConfig = readFileSync('src/data/site.ts', 'utf8');
const client = siteConfig.match(/client: '(ca-pub-\d{16})'/)?.[1];
if (client) {
  const tag = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}" crossorigin="anonymous"></script>`;
  for (const loc of locs) {
    const file = `dist/${loc.slice(site.length)}index.html`;
    if (!existsSync(file)) continue;
    const html = readFileSync(file, 'utf8');
    const head = html.split('</head>')[0];
    if (['finanzas/mi-quincena/', 'finanzas/calculadora-prestamos/'].some(path => loc === new URL(path, site).toString())) {
      if (html.includes('adsbygoogle.js')) errors.push(`AdSense no debe cargarse en la herramienta privada ${loc}`);
    } else if (head.split(tag).length !== 2 || html.split('adsbygoogle.js').length !== 2) errors.push(`Script de AdSense ausente o duplicado en ${loc}`);
  }
  const adsTxt = read('dist/ads.txt');
  if (!adsTxt.includes(`google.com, ${client.replace('ca-', '')}, DIRECT, f08c47fec0942fa0`)) errors.push('ads.txt no coincide con el ID de AdSense');
}

if (errors.length) {
  console.error(`Verificación SEO fallida:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Verificación SEO correcta: ${locs.length} URL en sitemap.xml, robots.txt y canonical coherentes con ${site}${client ? '; AdSense excluido de las herramientas privadas y ads.txt correcto' : ''}`);
