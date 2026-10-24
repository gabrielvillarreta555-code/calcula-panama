import { describe, expect, it } from 'vitest';
import { buildSitemapXml, sitemapPaths } from './sitemap';

describe('sitemap', () => {
  it('convierte archivos de páginas en rutas públicas con barra final', () => {
    expect(sitemapPaths(['./index.astro', './guias/index.astro', './calculadoras/salario-neto.astro', './contacto.astro'])).toEqual([
      '/', '/calculadoras/salario-neto/', '/contacto/', '/guias/'
    ]);
  });

  it('excluye la página 404 y las rutas dinámicas', () => {
    expect(sitemapPaths(['./404.astro', './blog/[slug].astro', './index.astro'])).toEqual(['/']);
  });

  it('genera XML válido con URL absolutas del dominio propio', () => {
    const xml = buildSitemapXml(['/', '/guias/'], 'https://calculapanama.com/');
    expect(xml).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      '  <url><loc>https://calculapanama.com/</loc></url>\n' +
      '  <url><loc>https://calculapanama.com/guias/</loc></url>\n' +
      '</urlset>\n'
    );
    expect(xml).not.toContain('github.io');
  });

  it('escapa caracteres especiales de XML', () => {
    expect(buildSitemapXml(['/a&b/'], 'https://calculapanama.com/')).toContain('<loc>https://calculapanama.com/a&amp;b/</loc>');
  });
});
