#!/usr/bin/env node
// Encodes every video in _raw-assets/ into web-ready versions in public/video/:
//   <name>.mp4        1080p H.264, CRF 26, +faststart, no audio
//   <name>.webm       1080p VP9, no audio
//   <name>-720.mp4    720p H.264 for phones
//   <name>-poster.jpg first frame, mozjpeg via sharp
// Clips are trimmed to 20 s; the 1080p MP4 is re-encoded at a higher CRF until it is <= 6 MB.
//   node scripts/optimize-video.mjs [--force]
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(ROOT, '_raw-assets');
const OUT = path.join(ROOT, 'public', 'video');
const FORCE = process.argv.includes('--force');
const MAX_SECONDS = 20;
const MAX_BYTES = 6 * 1024 * 1024;
const VIDEO = /\.(mp4|mov|m4v|webm|mkv|avi)$/i;

const kebab = (s) =>
  s
    .replace(/\.[^.]+$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

async function findVideos(dir) {
  const found = [];
  for (const d of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) found.push(...(await findVideos(full)));
    else if (VIDEO.test(d.name)) found.push(full);
  }
  return found;
}

const ffmpeg = (args) => run(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { maxBuffer: 1 << 26 });
const scale = (h) => `scale=-2:'min(${h},ih)':flags=lanczos,format=yuv420p`;

async function encode(src, name) {
  const mp4 = path.join(OUT, `${name}.mp4`);
  if (!FORCE && existsSync(mp4)) return console.log(`  ${name} unchanged`);
  const trim = ['-t', String(MAX_SECONDS)];

  for (let crf = 26; crf <= 34; crf += 2) {
    await ffmpeg(['-i', src, ...trim, '-an', '-vf', scale(1080), '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-movflags', '+faststart', mp4]);
    const { size } = await stat(mp4);
    if (size <= MAX_BYTES || crf >= 34) {
      console.log(`  ${name}.mp4  crf ${crf}  ${(size / 1048576).toFixed(1)} MB`);
      break;
    }
  }
  await ffmpeg(['-i', src, ...trim, '-an', '-vf', scale(1080), '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-row-mt', '1', path.join(OUT, `${name}.webm`)]);
  await ffmpeg(['-i', src, ...trim, '-an', '-vf', scale(720), '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-movflags', '+faststart', path.join(OUT, `${name}-720.mp4`)]);
  const frame = path.join(OUT, `${name}-frame.png`);
  await ffmpeg(['-i', src, '-frames:v', '1', '-vf', scale(1080), frame]);
  await sharp(frame).jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(path.join(OUT, `${name}-poster.jpg`));
  await rm(frame);
  console.log(`  ${name}.webm, ${name}-720.mp4, ${name}-poster.jpg`);
}

async function main() {
  const videos = await findVideos(RAW);
  if (!videos.length) {
    console.log('No source videos in _raw-assets/. Nothing to encode.');
    return;
  }
  await mkdir(OUT, { recursive: true });
  for (const src of videos) await encode(src, kebab(path.basename(src)));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
