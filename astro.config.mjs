// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL permite cambiar el dominio sin tocar código (p. ej. en GitHub Pages sin dominio propio).
const site = process.env.SITE_URL || 'https://hive.yafel.dev';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: { format: 'directory' },
});
