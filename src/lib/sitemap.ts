/** Páginas que no deben aparecer en el sitemap (no son contenido indexable). */
export const SITEMAP_EXCLUDED = new Set(['/404/']);

/**
 * Convierte rutas de archivos de `src/pages` (p. ej. `./guias/index.astro`) en rutas públicas
 * con barra final (`/guias/`), descarta rutas dinámicas y excluidas, y deja la portada primero.
 */
export function sitemapPaths(files: string[]): string[] {
  return files
    .map(file => file.replace(/^\.\//, '/').replace(/\.astro$/, '').replace(/\/index$/, '/').replace(/([^/])$/, '$1/'))
    .filter(path => !path.includes('[') && !SITEMAP_EXCLUDED.has(path))
    .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));
}

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** Documento XML del sitemap (protocolo sitemaps.org 0.9) con URL absolutas sobre `site`. */
export function buildSitemapXml(paths: string[], site: URL | string): string {
  const urls = paths.map(path => `  <url><loc>${escapeXml(new URL(path.replace(/^\//, ''), site).toString())}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}
