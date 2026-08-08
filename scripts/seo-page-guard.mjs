import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const MIN_WORDS = Number(process.env.SEO_MIN_WORDS || 250);
const TITLE_MIN = Number(process.env.SEO_TITLE_MIN || 30);
const TITLE_MAX = Number(process.env.SEO_TITLE_MAX || 60);

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

function stripNonContent(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--([\s\S]*?)-->/g, ' ');
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function textFromHtml(html) {
  const withoutTags = html.replace(/<[^>]+>/g, ' ');
  const decoded = decodeEntities(withoutTags);
  return decoded.replace(/\s+/g, ' ').trim();
}

function getWordCount(html) {
  const cleaned = stripNonContent(html);
  const text = textFromHtml(cleaned);
  if (!text) {
    return 0;
  }
  return text.split(/\s+/).filter(Boolean).length;
}

function hasValidH1(html) {
  const matches = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi);
  if (!matches || matches.length === 0) {
    return false;
  }

  return matches.some((rawH1) => {
    const text = textFromHtml(rawH1);
    return text.length > 2;
  });
}

function extractTitle(html) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) {
    return '';
  }
  return textFromHtml(match[1]).trim();
}

function extractMetaDescription(html) {
  const match = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (!match) {
    return '';
  }
  return decodeEntities(match[1]).replace(/\s+/g, ' ').trim();
}

function extractMetaRobots(html) {
  const match = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (!match) {
    return '';
  }
  return decodeEntities(match[1]).replace(/\s+/g, ' ').trim().toLowerCase();
}

function extractCanonical(html) {
  const match = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  if (!match) {
    return '';
  }
  return decodeEntities(match[1]).trim();
}

function toCanonicalRoute(canonical, fallbackRoute) {
  if (!canonical) {
    return fallbackRoute;
  }

  const withoutOrigin = canonical.replace(/^https?:\/\/[^/]+/i, '');
  if (!withoutOrigin.startsWith('/')) {
    return fallbackRoute;
  }

  return withoutOrigin.replace(/\/$/, '') || '/';
}

function isNoindex(robots) {
  if (!robots) {
    return false;
  }
  return robots.includes('noindex');
}

function toRoute(filePath) {
  const rel = path.relative(DIST_DIR, filePath).replace(/\\/g, '/').replace(/^client\//, '');
  if (rel === 'index.html') {
    return '/';
  }
  return `/${rel.replace(/\/index\.html$/i, '').replace(/\.html$/i, '')}`;
}

if (!fs.existsSync(DIST_DIR)) {
  console.error('SEO guard: dist folder not found. Run the build first.');
  process.exit(1);
}

const htmlFiles = walkHtmlFiles(DIST_DIR);
const violations = [];
const pageData = [];
const byCanonicalRoute = new Map();

for (const filePath of htmlFiles) {
  const html = fs.readFileSync(filePath, 'utf8');
  const route = toRoute(filePath);
  const robots = extractMetaRobots(html);

  if (isNoindex(robots)) {
    continue;
  }

  const canonical = extractCanonical(html);
  const canonicalRoute = toCanonicalRoute(canonical, route);

  if (byCanonicalRoute.has(canonicalRoute)) {
    continue;
  }

  byCanonicalRoute.set(canonicalRoute, filePath);

  const hasH1 = hasValidH1(html);
  const words = getWordCount(html);
  const title = extractTitle(html);
  const description = extractMetaDescription(html);

  pageData.push({ route: canonicalRoute, title, description });

  const titleTooShort = title.length > 0 && title.length < TITLE_MIN;
  const titleTooLong = title.length > TITLE_MAX;
  const missingTitle = title.length === 0;
  const missingDescription = description.length === 0;

  if (!hasH1 || words < MIN_WORDS || titleTooShort || titleTooLong || missingTitle || missingDescription) {
    violations.push({ route: canonicalRoute, hasH1, words, title, description, titleTooShort, titleTooLong, missingTitle, missingDescription });
  }
}

const titleMap = new Map();
const descriptionMap = new Map();

for (const item of pageData) {
  if (item.title) {
    const list = titleMap.get(item.title) || [];
    list.push(item.route);
    titleMap.set(item.title, list);
  }
  if (item.description) {
    const list = descriptionMap.get(item.description) || [];
    list.push(item.route);
    descriptionMap.set(item.description, list);
  }
}

const duplicateTitles = [...titleMap.entries()].filter(([, routes]) => routes.length > 1);
const duplicateDescriptions = [...descriptionMap.entries()].filter(([, routes]) => routes.length > 1);

if (violations.length > 0 || duplicateTitles.length > 0 || duplicateDescriptions.length > 0) {
  console.error(`SEO guard failed.`);
  console.error(`Rules: non-empty title, unique title, unique description, title length ${TITLE_MIN}-${TITLE_MAX}, at least 1 non-empty H1, at least ${MIN_WORDS} words.`);
  for (const item of violations) {
    const reasons = [];
    if (item.missingTitle) {
      reasons.push('missing title');
    }
    if (item.missingDescription) {
      reasons.push('missing meta description');
    }
    if (item.titleTooShort) {
      reasons.push(`title too short (${item.title.length})`);
    }
    if (item.titleTooLong) {
      reasons.push(`title too long (${item.title.length})`);
    }
    if (!item.hasH1) {
      reasons.push('missing H1');
    }
    if (item.words < MIN_WORDS) {
      reasons.push(`low word count (${item.words})`);
    }
    console.error(`- ${item.route}: ${reasons.join(', ')}`);
  }

  if (duplicateTitles.length > 0) {
    console.error(`Duplicate title values found: ${duplicateTitles.length}`);
    for (const [title, routes] of duplicateTitles.slice(0, 20)) {
      console.error(`- Title "${title}" used by: ${routes.join(', ')}`);
    }
    if (duplicateTitles.length > 20) {
      console.error(`... and ${duplicateTitles.length - 20} more duplicate title values.`);
    }
  }

  if (duplicateDescriptions.length > 0) {
    console.error(`Duplicate description values found: ${duplicateDescriptions.length}`);
    for (const [description, routes] of duplicateDescriptions.slice(0, 20)) {
      console.error(`- Description "${description}" used by: ${routes.join(', ')}`);
    }
    if (duplicateDescriptions.length > 20) {
      console.error(`... and ${duplicateDescriptions.length - 20} more duplicate description values.`);
    }
  }

  process.exit(1);
}

console.log(`SEO guard passed for ${pageData.length} canonical indexable page(s).`);
console.log(`Rules: title+description present, title length ${TITLE_MIN}-${TITLE_MAX}, no duplicate title/description, H1 present, and at least ${MIN_WORDS} words.`);
