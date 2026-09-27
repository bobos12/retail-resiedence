#!/usr/bin/env node
// Renders the styled neighbourhood map (OpenFreeMap vector tiles, restyled to
// the site palette, no labels) to .cache/map/*.png and writes the projected
// marker positions to src/content/map-markers.json. Labels are overlaid in
// HTML so they can be translated. Run `npm run optimize:images` afterwards.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '.cache', 'map');
const MARKERS = path.join(ROOT, 'src', 'content', 'map-markers.json');

const PALETTE = {
  land: '#E8E5DC',
  water: '#CFD3CD',
  park: '#DEDFD3',
  building: '#DEDAD0',
  minor: '#F4F2EC',
  major: '#FBFAF7',
  casing: '#D3CEC2',
};

// [lng, lat]. Retal from the brief; others from OpenStreetMap.
const POINTS = {
  retal: [50.2195, 26.3771],
  bisak: [50.21673, 26.37395],
  expo: [50.2141, 26.3817],
  mall: [50.17, 26.306],
  corniche: [50.225, 26.2942],
  aramco: [50.14, 26.315],
  causeway: [50.3522, 26.1818],
  airport: [49.7989, 26.4674],
};
const AREAS = {
  khobar: [50.2, 26.283],
  dhahran: [50.145, 26.292],
  gulf: [50.262, 26.345],
};

const VARIANTS = [
  { name: 'neighborhood', width: 1600, height: 1000, center: [50.19, 26.337], zoom: 12.3 },
  { name: 'neighborhood-portrait', width: 800, height: 1000, center: [50.185, 26.337], zoom: 11.95 },
];

async function buildStyle() {
  const res = await fetch('https://tiles.openfreemap.org/styles/positron');
  const style = await res.json();
  const drop = (l) =>
    l.type === 'symbol' || l.id.startsWith('boundary') || l.id.startsWith('railway') || l.id.startsWith('landcover_');
  style.layers = style.layers.filter((l) => !drop(l));
  delete style.sources.ne2_shaded;
  for (const l of style.layers) {
    const p = (l.paint ??= {});
    if (l.id === 'background') p['background-color'] = PALETTE.land;
    else if (l.id === 'water') p['fill-color'] = PALETTE.water;
    else if (l.id === 'waterway') p['line-color'] = PALETTE.water;
    else if (l.id === 'park') p['fill-color'] = PALETTE.park;
    else if (l.id === 'landuse_residential') p['fill-opacity'] = 0;
    else if (l.id === 'building') {
      p['fill-color'] = PALETTE.building;
      p['fill-outline-color'] = PALETTE.building;
    } else if (l.id.includes('casing')) p['line-color'] = PALETTE.casing;
    else if (l.id.includes('subtle')) p['line-color'] = PALETTE.casing;
    else if (l.type === 'line' && /motorway|major/.test(l.id)) p['line-color'] = PALETTE.major;
    else if (l.type === 'line') p['line-color'] = PALETTE.minor;
    else if (l.type === 'fill' && l.id.startsWith('aeroway')) p['fill-color'] = PALETTE.minor;
    else if (l.id === 'road_area_pier') p['fill-color'] = PALETTE.land;
  }
  return style;
}

const page = (style, v) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css" rel="stylesheet">
<script src="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js"></script>
<style>html,body,#m{margin:0;width:${v.width}px;height:${v.height}px}.maplibregl-ctrl-attrib{display:none}</style>
</head><body><div id="m"></div><script>
window.map = new maplibregl.Map({ container: 'm', style: ${JSON.stringify(style)},
  center: ${JSON.stringify(v.center)}, zoom: ${v.zoom}, interactive: false,
  attributionControl: false, fadeDuration: 0, canvasContextAttributes: { preserveDrawingBuffer: true } });
window.map.once('idle', () => { window.ready = true; });
</script></body></html>`;

async function main() {
  const style = await buildStyle();
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const markers = {};
  for (const v of VARIANTS) {
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: 2 });
    const tab = await ctx.newPage();
    await tab.setContent(page(style, v), { waitUntil: 'load' });
    await tab.waitForFunction(() => window.ready === true, null, { timeout: 120_000 });
    await tab.waitForTimeout(500);
    await tab.screenshot({ path: path.join(OUT, `${v.name}.png`) });
    const project = (all) =>
      tab.evaluate((pts) => {
        const out = {};
        for (const [k, ll] of Object.entries(pts)) {
          const p = window.map.project(ll);
          out[k] = { x: +(p.x / window.innerWidth).toFixed(4), y: +(p.y / window.innerHeight).toFixed(4) };
        }
        return out;
      }, all);
    markers[v.name] = { points: await project(POINTS), areas: await project(AREAS) };
    await ctx.close();
    console.log(`  rendered ${v.name} ${v.width * 2}x${v.height * 2}`);
  }
  await browser.close();
  await mkdir(path.dirname(MARKERS), { recursive: true });
  await writeFile(MARKERS, `${JSON.stringify(markers, null, 2)}\n`);
  console.log(`Wrote ${path.relative(ROOT, MARKERS)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
