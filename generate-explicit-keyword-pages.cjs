const fs = require('fs');
const path = require('path');

const keywordFile = path.join('src', 'lib', 'keywordLandingRoutes.ts');
const cityFile = path.join('src', 'lib', 'cityLandingRoutes.ts');
const keywordSrc = fs.readFileSync(keywordFile, 'utf8');
const citySrc = fs.readFileSync(cityFile, 'utf8');

function extractArray(src, name) {
  const m = src.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\] as const;`));
  if (!m) throw new Error(`Array not found: ${name}`);
  return [...m[1].matchAll(/'([^']+)'/g)].map((v) => v[1]);
}

function slugify(input) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\[|\]/g, '')
    .replace(/&/g, ' and ')
    .replace(/'/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

const dutch = extractArray(citySrc, 'DUTCH_CITIES');
const belgian = extractArray(citySrc, 'BELGIAN_CITIES');
const german = extractArray(citySrc, 'GERMAN_CITIES');
const french = extractArray(citySrc, 'FRENCH_CITIES');
const staticKeywords = extractArray(keywordSrc, 'STATIC_KEYWORDS');

const airportCityKeywords = [
  ...belgian.map((c) => `Amsterdam Airport to ${c} Taxi`),
  ...german.map((c) => `Amsterdam Airport to ${c} Taxi`),
  ...french.map((c) => `Amsterdam Airport to ${c} Taxi`),
  ...dutch.map((c) => `Schiphol Airport to ${c} Taxi`),
  ...belgian.map((c) => `Schiphol Airport to ${c} Taxi`),
  ...german.map((c) => `Schiphol Airport to ${c} Taxi`),
  ...french.map((c) => `Schiphol Airport to ${c} Taxi`),
];

function cityPath(prefix, city) {
  return `/${prefix}-${slugify(city)}-taxi`;
}

const cityPaths = new Set([
  ...dutch.map((c) => cityPath('schiphol-to', c)),
  ...belgian.map((c) => cityPath('amsterdam-to', c)),
  ...german.map((c) => cityPath('amsterdam-to', c)),
  ...french.map((c) => cityPath('amsterdam-to', c)),
]);

const pagesDir = path.join('src', 'pages');
const allKeywords = [...staticKeywords, ...airportCityKeywords];
const seen = new Set();
let created = 0;

for (const keyword of allKeywords) {
  const slug = slugify(keyword);
  const pathname = `/${slug}`;

  if (cityPaths.has(pathname)) continue;
  if (seen.has(pathname)) continue;

  seen.add(pathname);

  const title = `${keyword} | Pickupr`;
  const description = `Book ${keyword} with private transfer, direct confirmation, and clear fixed-fare details from Pickupr.`;

  const content = `---\nimport AppPageShell from '../components/AppPageShell.astro';\n---\n\n<AppPageShell\n  title=${JSON.stringify(title)}\n  description=${JSON.stringify(description)}\n  canonical=${JSON.stringify(pathname)}\n  structuredData={{\n    '@context': 'https://schema.org',\n    '@graph': [\n      {\n        '@type': 'Service',\n        name: ${JSON.stringify(keyword)},\n        provider: { '@type': 'Organization', name: 'Pickupr', url: '/' },\n        serviceType: 'Private airport and long-distance transfer',\n        areaServed: ['Netherlands', 'Belgium', 'Germany', 'France'],\n      },\n      {\n        '@type': 'FAQPage',\n        mainEntity: [\n          {\n            '@type': 'Question',\n            name: ${JSON.stringify(`Can I pre-book ${keyword} online?`)},\n            acceptedAnswer: {\n              '@type': 'Answer',\n              text: ${JSON.stringify(`Yes. You can pre-book ${keyword} online and receive direct confirmation for your transfer details.`)},\n            },\n          },\n        ],\n      },\n    ],\n  }}\n/>\n`;

  fs.writeFileSync(path.join(pagesDir, `${slug}.astro`), content);
  created += 1;
}

console.log(`Generated explicit keyword pages: ${created}`);
