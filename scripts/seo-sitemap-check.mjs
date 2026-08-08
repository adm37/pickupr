import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const CANDIDATE_SITEMAPS = [
  path.join(DIST_DIR, 'sitemap-index.xml'),
  path.join(DIST_DIR, 'client', 'sitemap-index.xml'),
  path.join(DIST_DIR, 'sitemap.xml'),
  path.join(DIST_DIR, 'client', 'sitemap.xml'),
];
const ROBOTS_PATH = path.resolve('public', 'robots.txt');

if (!fs.existsSync(DIST_DIR)) {
  console.error('Sitemap check failed: dist folder not found. Run the build first.');
  process.exit(1);
}

const sitemapPath = CANDIDATE_SITEMAPS.find((candidate) => fs.existsSync(candidate));

if (!sitemapPath) {
  console.error('Sitemap check failed: no sitemap file found in dist or dist/client.');
  process.exit(1);
}

const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
const urlCount = (sitemapXml.match(/<loc>/g) || []).length;

if (urlCount === 0) {
  console.error('Sitemap check failed: no URLs found in sitemap-index.xml.');
  process.exit(1);
}

if (!fs.existsSync(ROBOTS_PATH)) {
  console.error('Sitemap check failed: public/robots.txt is missing.');
  process.exit(1);
}

const robots = fs.readFileSync(ROBOTS_PATH, 'utf8');
const hasSitemapLine = /\bSitemap:\s*https?:\/\/[^\s]+/i.test(robots);

if (!hasSitemapLine) {
  console.error('Sitemap check failed: robots.txt has no absolute Sitemap line.');
  process.exit(1);
}

console.log(`Sitemap check passed using ${path.relative(process.cwd(), sitemapPath)}. Indexed URLs: ${urlCount}.`);
