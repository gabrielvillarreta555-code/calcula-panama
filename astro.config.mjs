import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL || 'https://example.github.io/calcula-panama/',
  base: process.env.BASE_PATH || '/',
  output: 'static',
  integrations: [sitemap()],
  vite: { build: { cssMinify: true } }
});
