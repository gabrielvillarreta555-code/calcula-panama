import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITEMAP_EXCLUDED } from './src/lib/sitemap.ts';

// Dos sitios desde el mismo código (CP-ADS-003):
// - principal (por defecto): https://calculapanama.com, con contenido y, en su momento, publicidad.
// - app (SITE_TARGET=app): https://app.calculapanama.com, sin publicidad; aloja Mi Quincena y el receptor del traslado.
const app = process.env.SITE_TARGET === 'app';

export default defineConfig(app ? {
  site: process.env.APP_ORIGIN || 'https://app.calculapanama.com/',
  srcDir: './app',
  publicDir: './app/public',
  outDir: process.env.OUT_DIR || './dist-app',
  output: 'static',
  vite: { build: { cssMinify: true } }
} : {
  site: process.env.SITE_URL || 'https://calculapanama.com/',
  base: process.env.BASE_PATH || '/',
  outDir: process.env.OUT_DIR || './dist',
  output: 'static',
  // Mismas exclusiones que sitemap.xml: páginas de ensayo y herramientas aún no publicadas (CP-TOOL-008).
  integrations: [sitemap({ filter: page => !SITEMAP_EXCLUDED.has(new URL(page).pathname) })],
  vite: { build: { cssMinify: true } }
});
