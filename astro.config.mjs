import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const excludedSitemapPatterns = [
  /^\/routes$/,
  /^\/schiphol-airport-to-/,
  /^\/amsterdam-airport-to-/,
  /-taxi$/,
];

function shouldIncludeInSitemap(pageUrl) {
  const pathname = new URL(pageUrl).pathname.replace(/\/$/, '') || '/';

  if (excludedSitemapPatterns.some((pattern) => pattern.test(pathname))) {
    return false;
  }

  return true;
}

export default defineConfig({
  site: 'https://pickupr.com',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    react(),
    sitemap({
      filter: shouldIncludeInSitemap,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      sourcemap: true,
    },
    define: {
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || ''),
      'import.meta.env.PUBLIC_SUPABASE_URL': JSON.stringify(
        process.env.PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
      ),
      'import.meta.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(
        process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
      ),
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  },
  srcDir: 'src',
  publicDir: 'public',
});
