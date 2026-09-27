#!/usr/bin/env node
// Compresses the images listed in images.config.mjs from _raw-assets/ into
// public/images/ and writes src/content/image-manifest.json.
//   node scripts/optimize-images.mjs          process new or changed images
//   node scripts/optimize-images.mjs --force  reprocess everything
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { images } from './images.config.mjs';
import { renderView } from './pano-view.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(ROOT, '_raw-assets');
const OUT = path.join(ROOT, 'public', 'images');
const MANIFEST = path.join(ROOT, 'src', 'content', 'image-manifest.json');
const FORCE = process.argv.includes('--force');

// These are masters: next/image re-encodes them to AVIF/WebP at the width each visitor needs,
// so they are kept clean (q86, floor q80). Squeezing them further only bakes in artifacts
// that the second encode then preserves.
const HERO = { edge: 2560, maxBytes: 1100 * 1024 };
const STANDARD = { edge: 1920, maxBytes: 550 * 1024 };
const OG = { width: 1200, height: 630, maxBytes: 200 * 1024 };
// 360° scenes: equirectangular textures for the viewer (never upscaled), plus a flat poster
// rendered from the scene's starting view. The sources are 4096 wide, so the mobile texture
// steps down to 3072 to be meaningfully lighter.
const PANO = [
  { key: 'desktop', edge: 6144, maxBytes: 1536 * 1024 },
  { key: 'mobile', edge: 3072, maxBytes: 700 * 1024 },
];
const PANO_QUALITY = 78;
const PANO_MIN_QUALITY = 62;
const POSTER = { width: 1440, height: 900, fov: 90 };
// The site is a static export (no image server), so every width next/image asks for is
// written ahead of time as WebP: <id>-<width>.webp (see src/lib/image-loader.ts). Keep in
// step with images.deviceSizes and images.imageSizes in next.config.ts.
const WIDTHS = [384, 640, 828, 1080, 1440, 1920, 2560];
const VARIANT_QUALITY = 78;
const START_QUALITY = 86;
const PLAN_QUALITY = 92;
const MIN_QUALITY = 80;
/** Never shrink below this share of the target edge to hit a size cap. */
const MIN_SCALE = 0.8;

sharp.cache(false);
sharp.concurrency(2);

const kb = (n) => `${Math.round(n / 1024)} KB`;

async function resolveSource(entry) {
  if (entry.root) return path.join(ROOT, entry.dir, entry.file);
  const dirs = await readdir(RAW, { withFileTypes: true });
  const match = dirs.find((d) => d.isDirectory() && d.name.startsWith(entry.dir));
  if (!match) throw new Error(`No folder in _raw-assets starting with "${entry.dir}"`);
  const base = path.join(RAW, match.name);
  // Drive exports nest a same-named folder inside the timestamped one.
  const nested = path.join(base, entry.dir, entry.file);
  return existsSync(nested) ? nested : path.join(base, entry.file);
}

function pipelineFor(input, entry, meta) {
  let img = sharp(input, { limitInputPixels: false, failOn: 'none' }).rotate();
  if (entry.crop) {
    // `meta` dimensions are pre-rotation; swap when EXIF orientation turns the frame.
    const turned = (meta.orientation ?? 1) >= 5;
    const w = turned ? meta.height : meta.width;
    const h = turned ? meta.width : meta.height;
    img = img.extract({
      left: Math.round(entry.crop.left * w),
      top: Math.round(entry.crop.top * h),
      width: Math.round(entry.crop.width * w),
      height: Math.round(entry.crop.height * h),
    });
  }
  img = img.toColourspace('srgb');
  return img;
}

async function encode(img, maxBytes, startQuality, minQuality = MIN_QUALITY) {
  let quality = startQuality;
  for (;;) {
    const buf = await img.clone().jpeg({ quality, mozjpeg: true, progressive: true }).toBuffer();
    if (buf.length <= maxBytes || quality <= minQuality) return { buf, quality };
    quality -= 2;
  }
}

/** Floor plans are line drawings: keep them lossless and turn the paper white transparent. */
async function encodeDrawing(src, entry, meta) {
  const { data, info } = await pipelineFor(src, entry, meta)
    .ensureAlpha()
    .resize({ width: STANDARD.edge, height: STANDARD.edge, fit: 'inside', withoutEnlargement: true, kernel: 'lanczos3' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const white = Math.min(data[i], data[i + 1], data[i + 2]);
    // Fully transparent above 248, fading in to opaque by 228 so anti-aliased edges stay soft.
    const keep = Math.max(0, Math.min(1, (248 - white) / 20));
    data[i + 3] = Math.round(data[i + 3] * keep);
  }
  const buf = await sharp(data, { raw: info }).webp({ lossless: true, effort: 6 }).toBuffer();
  return { buf, info };
}

async function processPano(entry, src, hash) {
  const files = [];
  const pano = { yaw: entry.pano.yaw, pitch: entry.pano.pitch };
  for (const spec of PANO) {
    const rel = `${entry.id}-${spec.key}.jpg`;
    const frame = sharp(src, { limitInputPixels: false })
      .toColourspace('srgb')
      .resize({ width: spec.edge, height: spec.edge / 2, fit: 'inside', withoutEnlargement: true, kernel: 'lanczos3' });
    const { buf, quality } = await encode(frame, spec.maxBytes, PANO_QUALITY, PANO_MIN_QUALITY);
    await mkdir(path.dirname(path.join(OUT, rel)), { recursive: true });
    await writeFile(path.join(OUT, rel), buf);
    const { width } = await sharp(buf).metadata();
    pano[spec.key] = `/images/${rel}`;
    files.push(rel);
    console.log(`  ${rel}  ${width}px  q${quality}  ${kb(buf.length)}`);
  }
  const poster = await renderView(src, { ...entry.pano, ...POSTER });
  const { buf, quality } = await encode(poster, STANDARD.maxBytes, START_QUALITY);
  await writeFile(path.join(OUT, `${entry.id}.jpg`), buf);
  files.push(`${entry.id}.jpg`);
  console.log(`  ${entry.id}  poster  q${quality}  ${kb(buf.length)}`);
  return {
    src: `/images/${entry.id}.jpg`,
    width: POSTER.width,
    height: POSTER.height,
    blurDataURL: await blurDataURL(buf),
    pano,
    files,
    hash,
  };
}

async function blurDataURL(input) {
  const buf = await sharp(input).resize(16, 16, { fit: 'inside' }).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

async function fingerprint(src, entry) {
  const s = await stat(src);
  return createHash('sha1')
    .update(JSON.stringify({ size: s.size, mtime: s.mtimeMs, entry, HERO, STANDARD, OG }))
    .digest('hex')
    .slice(0, 12);
}

async function processEntry(entry, previous) {
  const src = await resolveSource(entry);
  if (!existsSync(src)) throw new Error(`Missing source for ${entry.id}: ${src}`);
  const hash = await fingerprint(src, entry);
  const ext = entry.drawing ? 'webp' : 'jpg';
  const outFile = path.join(OUT, `${entry.id}.${ext}`);
  const ogFile = entry.og ? path.join(OUT, 'og', `${entry.og}.jpg`) : null;
  const filesExist = previous?.files ? previous.files.every((f) => existsSync(path.join(OUT, f))) : existsSync(outFile);
  if (!FORCE && previous?.hash === hash && filesExist && (!ogFile || existsSync(ogFile))) {
    return { entry: previous, skipped: true };
  }

  if (entry.pano) return { entry: await processPano(entry, src, hash), skipped: false };

  const meta = await sharp(src, { limitInputPixels: false }).metadata();
  if (entry.drawing) {
    const { buf, info } = await encodeDrawing(src, entry, meta);
    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, buf);
    console.log(`  ${entry.id}  ${info.width}x${info.height}  lossless  ${kb(buf.length)}`);
    return {
      entry: { src: `/images/${entry.id}.webp`, width: info.width, height: info.height, blurDataURL: await blurDataURL(buf), hash },
      skipped: false,
    };
  }
  const spec = entry.hero ? HERO : STANDARD;
  let base = pipelineFor(src, entry, meta)
    .flatten({ background: '#ffffff' })
    .resize({ width: spec.edge, height: spec.edge, fit: 'inside', withoutEnlargement: true, kernel: 'lanczos3' });
  // Frames from the walkthrough videos get a light unsharp mask to offset video softness.
  if (entry.video) base = base.sharpen({ sigma: 0.8, m1: 0.6, m2: 1.4 });

  // Materialise the resized frame once; encoding and retries work from it.
  let { data, info } = await base.raw().toBuffer({ resolveWithObject: true });
  let frame = sharp(data, { raw: info });
  let { buf, quality } = await encode(frame, spec.maxBytes, entry.plan ? PLAN_QUALITY : START_QUALITY);
  // Dense foliage can stay over target at the quality floor: step the size down a little,
  // but never far enough to soften the image on large screens.
  const fullWidth = info.width;
  while (buf.length > spec.maxBytes && info.width * 0.92 >= fullWidth * MIN_SCALE) {
    ({ data, info } = await frame
      .resize(Math.round(info.width * 0.92), null, { kernel: 'lanczos3' })
      .raw()
      .toBuffer({ resolveWithObject: true }));
    frame = sharp(data, { raw: info });
    ({ buf, quality } = await encode(frame, spec.maxBytes, MIN_QUALITY + 2));
  }

  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, buf);

  if (ogFile) {
    const og = frame.clone().resize(OG.width, OG.height, { fit: 'cover', position: 'attention' });
    const { buf: ogBuf } = await encode(og, OG.maxBytes, START_QUALITY);
    await mkdir(path.dirname(ogFile), { recursive: true });
    await writeFile(ogFile, ogBuf);
  }

  const result = {
    src: `/images/${entry.id}.jpg`,
    width: info.width,
    height: info.height,
    blurDataURL: await blurDataURL(buf),
    ...(entry.og ? { og: `/images/og/${entry.og}.jpg` } : {}),
    hash,
  };
  console.log(`  ${entry.id}  ${info.width}x${info.height}  q${quality}  ${kb(buf.length)}`);
  return { entry: result, skipped: false };
}

/** Writes the responsive WebP widths for one master image, skipping any already up to date. */
async function writeVariants(entry, result) {
  const master = path.join(ROOT, 'public', result.src);
  const base = result.src.replace(/^\/images\//, '').replace(/\.(jpg|webp)$/, '');
  const masterTime = (await stat(master)).mtimeMs;
  const files = [];
  for (const w of WIDTHS) {
    const rel = `${base}-${w}.webp`;
    const out = path.join(OUT, rel);
    files.push(rel);
    if (!FORCE && existsSync(out) && (await stat(out)).mtimeMs >= masterTime) continue;
    // Never upscale: widths beyond the master reuse its full size.
    await sharp(master)
      .resize({ width: Math.min(w, result.width), withoutEnlargement: true, kernel: 'lanczos3' })
      .webp(entry.drawing ? { quality: 92, alphaQuality: 100 } : { quality: VARIANT_QUALITY, effort: 5 })
      .toFile(out);
  }
  return files;
}

async function removeStale(keep) {
  const walk = async (dir) => {
    if (!existsSync(dir)) return;
    for (const d of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, d.name);
      if (d.isDirectory()) await walk(full);
      else if (!keep.has(path.relative(OUT, full).split(path.sep).join('/'))) {
        await rm(full);
        console.log(`  removed stale ${path.relative(ROOT, full)}`);
      }
    }
  };
  await walk(OUT);
}

async function main() {
  const previous = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, 'utf8')) : {};
  const ids = new Set();
  for (const e of images) {
    if (ids.has(e.id)) throw new Error(`Duplicate image id ${e.id}`);
    if (!/^[a-z0-9-]+(\/[a-z0-9-]+)+$/.test(e.id)) throw new Error(`Id must be kebab-case: ${e.id}`);
    ids.add(e.id);
  }

  console.log(`Optimising ${images.length} images${FORCE ? ' (forced)' : ''}`);
  const manifest = {};
  let skipped = 0;
  for (const entry of images) {
    const r = await processEntry(entry, previous[entry.id]);
    manifest[entry.id] = r.entry;
    if (r.skipped) skipped++;
  }

  console.log('Writing responsive WebP widths');
  const variants = [];
  for (const entry of images) variants.push(...(await writeVariants(entry, manifest[entry.id])));

  const keep = new Set(
    images.flatMap((e) => [
      ...(manifest[e.id].files ?? [`${e.id}.${e.drawing ? 'webp' : 'jpg'}`]),
      ...(e.og ? [`og/${e.og}.jpg`] : []),
    ]),
  );
  for (const v of variants) keep.add(v);
  await removeStale(keep);

  await mkdir(path.dirname(MANIFEST), { recursive: true });
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  // Flag config entries nothing in src/ refers to, so only used images ship.
  const srcText = await collectSource(path.join(ROOT, 'src'));
  const unused = images.filter((e) => !srcText.includes(`'${e.id}'`) && !srcText.includes(`"${e.id}"`));
  console.log(`Done. ${images.length - skipped} processed, ${skipped} unchanged.`);
  if (unused.length) console.warn(`Not referenced in src/: ${unused.map((e) => e.id).join(', ')}`);
}

async function collectSource(dir) {
  let text = '';
  for (const d of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) text += await collectSource(full);
    else if (/\.(tsx?|json)$/.test(d.name) && d.name !== 'image-manifest.json') text += await readFile(full, 'utf8');
  }
  return text;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
