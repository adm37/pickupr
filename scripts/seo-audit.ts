import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const clientDir = path.join(projectRoot, 'dist', 'client');
const reportPath = path.join(projectRoot, 'seo-audit-report.json');
const csvPath = path.join(projectRoot, 'seo-audit-report.csv');

if (!fs.existsSync(clientDir)) {
  throw new Error('dist/client not found. Run npm run build before seo-audit.');
}

type PageAudit = {
  path: string;
  title: string | null;
  description: string | null;
  canonical: string | null;
  robots: string | null;
  h1Count: number;
  internalLinks: string[];
};

function walkHtmlFiles(dir: string): string[] {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...walkHtmlFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

function toRoutePath(filePath: string): string {
  const rel = path.relative(clientDir, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') {
    return '/';
  }
  if (rel.endsWith('/index.html')) {
    return `/${rel.slice(0, -'/index.html'.length)}`;
  }
  return `/${rel.replace(/\.html$/, '')}`;
}

function extractTagContent(html: string, regex: RegExp): string | null {
  const match = html.match(regex);
  return match?.[1]?.trim() || null;
}

function extractLinks(html: string): string[] {
  const links: string[] = [];
  const re = /<a\s[^>]*href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    links.push(match[1]);
  }
  return links;
}

const htmlFiles = walkHtmlFiles(clientDir);
const pages: PageAudit[] = htmlFiles.map((htmlFile) => {
  const html = fs.readFileSync(htmlFile, 'utf8');
  return {
    path: toRoutePath(htmlFile),
    title: extractTagContent(html, /<title>([^<]*)<\/title>/i),
    description: extractTagContent(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i),
    canonical: extractTagContent(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i),
    robots: extractTagContent(html, /<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i),
    h1Count: (html.match(/<h1\b/gi) || []).length,
    internalLinks: extractLinks(html).filter((href) => href.startsWith('/')),
  };
});

const duplicateTitles = new Map<string, string[]>();
const duplicateDescriptions = new Map<string, string[]>();
const duplicateCanonicals = new Map<string, string[]>();

for (const page of pages) {
  if (page.title) {
    const list = duplicateTitles.get(page.title) || [];
    list.push(page.path);
    duplicateTitles.set(page.title, list);
  }
  if (page.description) {
    const list = duplicateDescriptions.get(page.description) || [];
    list.push(page.path);
    duplicateDescriptions.set(page.description, list);
  }
  if (page.canonical) {
    const list = duplicateCanonicals.get(page.canonical) || [];
    list.push(page.path);
    duplicateCanonicals.set(page.canonical, list);
  }
}

const redirectedLinkPatterns = [
  /^\/schiphol-airport-to-/,
  /^\/amsterdam-airport-to-/,
  /-taxi$/,
];

const internalLinkIssues: Array<{ page: string; link: string }> = [];
for (const page of pages) {
  for (const link of page.internalLinks) {
    if (redirectedLinkPatterns.some((re) => re.test(link))) {
      internalLinkIssues.push({ page: page.path, link });
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  pageCount: pages.length,
  pages,
  issues: {
    missingTitle: pages.filter((page) => !page.title).map((page) => page.path),
    missingDescription: pages.filter((page) => !page.description).map((page) => page.path),
    missingCanonical: pages.filter((page) => !page.canonical).map((page) => page.path),
    invalidH1Count: pages.filter((page) => page.h1Count !== 1).map((page) => ({ path: page.path, h1Count: page.h1Count })),
    duplicateTitles: Array.from(duplicateTitles.entries())
      .filter(([, paths]) => paths.length > 1)
      .map(([title, paths]) => ({ title, paths })),
    duplicateDescriptions: Array.from(duplicateDescriptions.entries())
      .filter(([, paths]) => paths.length > 1)
      .map(([description, paths]) => ({ description, paths })),
    duplicateCanonicals: Array.from(duplicateCanonicals.entries())
      .filter(([, paths]) => paths.length > 1)
      .map(([canonical, paths]) => ({ canonical, paths })),
    redirectedInternalLinks: internalLinkIssues,
  },
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

const csvRows = [
  ['path', 'title', 'description', 'canonical', 'robots', 'h1Count'].join(','),
  ...pages.map((page) => [
    page.path,
    page.title || '',
    page.description || '',
    page.canonical || '',
    page.robots || '',
    String(page.h1Count),
  ].map((value) => `"${value.replace(/"/g, '""')}"`).join(',')),
];
fs.writeFileSync(csvPath, csvRows.join('\n'));

console.log(`[seo-audit] report written: ${path.basename(reportPath)} and ${path.basename(csvPath)}`);
