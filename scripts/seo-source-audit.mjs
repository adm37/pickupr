import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');

function walkHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(fullPath, files);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

function pick(pattern, html) {
  const match = html.match(pattern);
  return match ? (match[1] || '').trim() : '';
}

function has(pattern, html) {
  return pattern.test(html);
}

function toRoute(filePath) {
  const rel = path.relative(DIST_DIR, filePath).replace(/\\/g, '/').replace(/^client\//, '');
  if (rel === 'index.html') {
    return '/';
  }
  return `/${rel.replace(/\/index\.html$/i, '').replace(/\.html$/i, '')}`;
}

function normalizeCanonical(value, fallbackRoute) {
  if (!value) {
    return fallbackRoute;
  }

  const noOrigin = value.replace(/^https?:\/\/[^/]+/i, '');
  if (!noOrigin.startsWith('/')) {
    return fallbackRoute;
  }

  return noOrigin.replace(/\/$/, '') || '/';
}

function isNoindex(robotsValue) {
  return /\bnoindex\b/i.test(robotsValue);
}

if (!fs.existsSync(DIST_DIR)) {
  console.error('SEO source audit failed: dist folder not found. Run the build first.');
  process.exit(1);
}

const files = walkHtmlFiles(DIST_DIR);
const seenCanonicals = new Set();
const failures = [];
let checked = 0;

for (const filePath of files) {
  const html = fs.readFileSync(filePath, 'utf8');
  const route = toRoute(filePath);

  const robots = pick(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i, html);
  if (isNoindex(robots)) {
    continue;
  }

  const canonicalRaw = pick(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i, html);
  const canonicalRoute = normalizeCanonical(canonicalRaw, route);

  if (seenCanonicals.has(canonicalRoute)) {
    continue;
  }
  seenCanonicals.add(canonicalRoute);

  const title = pick(/<title\b[^>]*>([\s\S]*?)<\/title>/i, html);
  const description = pick(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i, html);
  const ogTitle = pick(/<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i, html);
  const ogDescription = pick(/<meta\s+[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i, html);
  const ogUrl = pick(/<meta\s+[^>]*property=["']og:url["'][^>]*content=["']([^"']*)["'][^>]*>/i, html);
  const twitterTitle = pick(/<meta\s+[^>]*name=["']twitter:title["'][^>]*content=["']([^"']*)["'][^>]*>/i, html);
  const twitterDescription = pick(/<meta\s+[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)["'][^>]*>/i, html);

  const checks = {
    title: title.length > 0,
    description: description.length > 0,
    canonical: canonicalRaw.length > 0,
    robots: robots.length > 0,
    h1: has(/<h1\b[^>]*>[\s\S]*?<\/h1>/i, html),
    ogTitle: ogTitle.length > 0,
    ogDescription: ogDescription.length > 0,
    ogUrl: ogUrl.length > 0,
    twitterTitle: twitterTitle.length > 0,
    twitterDescription: twitterDescription.length > 0,
    jsonLd: has(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i, html),
  };

  const failed = Object.entries(checks)
    .filter(([, ok]) => !ok)
    .map(([name]) => name);

  if (failed.length > 0) {
    failures.push({ route: canonicalRoute, missing: failed });
  }

  checked += 1;
}

if (failures.length > 0) {
  console.error('SEO source audit failed. Missing source-level SEO elements on canonical indexable pages:');
  for (const item of failures.slice(0, 100)) {
    console.error(`- ${item.route}: missing ${item.missing.join(', ')}`);
  }
  if (failures.length > 100) {
    console.error(`... and ${failures.length - 100} more page(s).`);
  }
  process.exit(1);
}

console.log(`SEO source audit passed for ${checked} canonical indexable page(s).`);
