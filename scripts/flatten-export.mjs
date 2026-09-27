#!/usr/bin/env node
// After `next build` (static export): the client prefetches route segments as flat files,
// e.g. en/residences/__next.$d$locale.residences.__PAGE__.txt, but the export writes them
// nested (__next.$d$locale/residences/__PAGE__.txt). Plain hosts have no rewrite for that,
// so write the flat copies next to the nested ones.
import { copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve(process.argv[2] ?? process.env.NEXT_DIST_DIR ?? 'out');
let count = 0;

async function walk(dir) {
  for (const d of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, d.name);
    if (!d.isDirectory()) continue;
    if (d.name.startsWith('__next.')) await flatten(dir, full, [d.name]);
    else if (d.name !== '_next' && d.name !== 'images') await walk(full);
  }
}

async function flatten(base, dir, parts) {
  for (const d of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) await flatten(base, full, [...parts, d.name]);
    else if (d.name.endsWith('.txt')) {
      await copyFile(full, path.join(base, [...parts, d.name].join('.')));
      count++;
    }
  }
}

await walk(OUT);
console.log(`Flattened ${count} segment files in ${path.relative(process.cwd(), OUT)}`);
