import type { APIRoute } from 'astro';
import { buildSitemapXml, sitemapPaths } from '../lib/sitemap';

/**
 * Sitemap estándar en /sitemap.xml con las URL canónicas de todas las páginas públicas.
 * Se genera a partir de los archivos de `src/pages`, así que una página nueva entra sola.
 * (@astrojs/sitemap sigue generando sitemap-index.xml para compatibilidad.)
 */
const pages = import.meta.glob('./**/*.astro');

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('Configura `site` en astro.config.mjs para generar el sitemap.');
  return new Response(buildSitemapXml(sitemapPaths(Object.keys(pages)), site), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
