import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const entryMjs = resolve('dist/server/entry.mjs');
const cjsShim = resolve('dist/server.cjs');

if (!existsSync(entryMjs)) {
  console.warn('[postbuild] dist/server/entry.mjs not found; skipping dist/server.cjs generation.');
  process.exit(0);
}

const content = "import('./server/entry.mjs');\n";
writeFileSync(cjsShim, content, 'utf8');
console.log('[postbuild] Generated dist/server.cjs shim.');
