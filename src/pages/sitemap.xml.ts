import type { APIRoute } from 'astro';

const pageModules = import.meta.glob('./**/*.astro', { eager: true, as: 'raw' });
const blockedRoutes = new Set(['/404', '/admin', '/booking', '/customer', '/login', '/register', '/rate']);

function toRoute(globPath: string): string {
  const clean = globPath.replace(/^\.\//, '').replace(/\.astro$/, '');

  if (clean === 'index') {
    return '/';
  }

  if (clean.endsWith('/index')) {
    return `/${clean.replace(/\/index$/, '')}`;
  }

  return `/${clean}`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = ({ url }) => {
  const configuredBase = (import.meta.env.SITE || import.meta.env.PUBLIC_SITE_URL || '').toString().replace(/\/$/, '');
  const requestBase = `${url.protocol}//${url.host}`.replace(/\/$/, '');
  const siteBase = configuredBase || requestBase;

  const routes = Object.entries(pageModules)
    .filter(([filePath]) => !filePath.includes('[') && !filePath.includes(']'))
    .filter(([_, source]) => !/robots\s*=\s*["']noindex/i.test(source))
    .map(([filePath]) => toRoute(filePath))
    .filter((route) => !blockedRoutes.has(route))
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((route) => {
    const loc = escapeXml(`${siteBase}${route}`);
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
