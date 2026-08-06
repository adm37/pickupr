import fs from 'node:fs';
import path from 'node:path';

const pagesRoot = path.resolve('src/pages');

function walkAstroFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAstroFiles(fullPath, files);
      continue;
    }
    if (entry.isFile() && fullPath.endsWith('.astro')) {
      files.push(fullPath);
    }
  }
  return files;
}

const titleRegex = /\btitle="([^"]*)"/;
const descriptionRegex = /\bdescription="([^"]*)"/;

const rows = walkAstroFiles(pagesRoot)
  .map((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const titleMatch = content.match(titleRegex);
    const descriptionMatch = content.match(descriptionRegex);

    if (!titleMatch && !descriptionMatch) {
      return null;
    }

    return {
      file: path.relative(pagesRoot, filePath).replace(/\\/g, '/'),
      title: titleMatch ? titleMatch[1] : '',
      description: descriptionMatch ? descriptionMatch[1] : '',
    };
  })
  .filter(Boolean);

function duplicateInfo(values) {
  const map = new Map();
  for (const value of values) {
    if (!value) {
      continue;
    }
    map.set(value, (map.get(value) || 0) + 1);
  }
  const duplicates = [...map.entries()].filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]);
  const pagesAffected = duplicates.reduce((total, [, count]) => total + count, 0);
  return { duplicates, pagesAffected };
}

const titleDup = duplicateInfo(rows.map((row) => row.title));
const descriptionDup = duplicateInfo(rows.map((row) => row.description));

const titleShort = rows.filter((row) => row.title && row.title.length < 30);
const titleLong = rows.filter((row) => row.title && row.title.length > 60);
const descriptionShort = rows.filter((row) => row.description && row.description.length < 70);
const descriptionLong = rows.filter((row) => row.description && row.description.length > 160);

const report = {
  pagesWithMeta: rows.length,
  duplicateTitleValues: titleDup.duplicates.length,
  duplicateTitlePages: titleDup.pagesAffected,
  duplicateDescriptionValues: descriptionDup.duplicates.length,
  duplicateDescriptionPages: descriptionDup.pagesAffected,
  shortTitles: titleShort.length,
  longTitles: titleLong.length,
  shortDescriptions: descriptionShort.length,
  longDescriptions: descriptionLong.length,
  topDuplicateTitle: titleDup.duplicates[0] || null,
  topDuplicateDescription: descriptionDup.duplicates[0] || null,
};

console.log(JSON.stringify(report, null, 2));

const hasErrors =
  report.duplicateTitleValues > 0 ||
  report.duplicateDescriptionValues > 0 ||
  report.shortTitles > 0 ||
  report.longTitles > 0;

if (hasErrors) {
  console.error('SEO metadata audit failed.');

  if (report.duplicateTitleValues > 0) {
    console.error(`- Duplicate title values: ${report.duplicateTitleValues}`);
    for (const [title, count] of titleDup.duplicates.slice(0, 20)) {
      console.error(`  - (${count}x) ${title}`);
    }
  }

  if (report.duplicateDescriptionValues > 0) {
    console.error(`- Duplicate description values: ${report.duplicateDescriptionValues}`);
    for (const [description, count] of descriptionDup.duplicates.slice(0, 20)) {
      console.error(`  - (${count}x) ${description}`);
    }
  }

  if (report.shortTitles > 0) {
    console.error(`- Short titles (<30): ${report.shortTitles}`);
    for (const row of titleShort.slice(0, 20)) {
      console.error(`  - ${row.file}: (${row.title.length}) ${row.title}`);
    }
  }

  if (report.longTitles > 0) {
    console.error(`- Long titles (>60): ${report.longTitles}`);
    for (const row of titleLong.slice(0, 20)) {
      console.error(`  - ${row.file}: (${row.title.length}) ${row.title}`);
    }
  }

  process.exit(1);
}
