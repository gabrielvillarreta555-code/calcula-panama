import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
  integrations: [sitemap()],
  vite: { build: { cssMinify: true } }
});
