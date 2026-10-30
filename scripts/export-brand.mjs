// Genera los SVG de la marca en public/brand a partir de src/lib/brand.js.
// Uso: node scripts/export-brand.mjs
import { writeFile, mkdir } from 'node:fs/promises';
import { hiveMark, tierBadge } from '../src/lib/brand.js';

const out = new URL('../public/brand/', import.meta.url);
await mkdir(out, { recursive: true });
await writeFile(new URL('hive-mark.svg', out), hiveMark('file') + '\n');
for (const t of ['abeja', 'obrera', 'reina']) {
  await writeFile(new URL(`nivel-${t}.svg`, out), tierBadge(t, 'file') + '\n');
}
await writeFile(new URL('../public/favicon.svg', import.meta.url), hiveMark('fav') + '\n');
console.log('Marca exportada en public/brand/');
