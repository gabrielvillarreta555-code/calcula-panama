import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL || 'https://calculapanama.com/',
  base: process.env.BASE_PATH || '/',
  output: 'static',
  integrations: [sitemap()],
  vite: { build: { cssMinify: true } }
});
