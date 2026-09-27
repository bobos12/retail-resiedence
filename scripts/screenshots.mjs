#!/usr/bin/env node
// Full-page screenshots of every page at phone and desktop widths, in both locales.
//   node scripts/screenshots.mjs [--base=http://localhost:3000] [--pages=/,/contact] [--widths=390,1440] [--locales=en,ar]
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;

const BASE = arg('base', 'http://localhost:3000');
const PAGES = arg(
  'pages',
  '/,/residences,/residences/one-bedroom-apartment,/residences/three-bedroom-town-villa,/residences/four-bedroom-executive-villa,/clubhouse,/living,/neighborhood,/contact,/missing-page',
).split(',');
const WIDTHS = arg('widths', '390,1440').split(',').map(Number);
const LOCALES = arg('locales', 'en,ar').split(',');
const OUT = path.join(ROOT, 'screenshots');

const slug = (p) => (p === '/' ? 'home' : p.replace(/^\//, '').replace(/\//g, '__'));

async function capture(browser, locale, pagePath, width) {
  const height = width < 768 ? 844 : 900;
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const url = `${BASE}/${locale}${pagePath === '/' ? '' : pagePath}`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });

  // Walk down the page so reveals and lazy images run, then return to the top.
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += Math.round(height * 0.6)) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(160);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(600);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const file = path.join(OUT, `${locale}-${width}-${slug(pagePath)}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await ctx.close();
  const notes = [overflow > 0 ? `horizontal overflow ${overflow}px` : '', ...errors].filter(Boolean);
  console.log(`${path.relative(ROOT, file)}${notes.length ? `  !! ${notes.join(' | ')}` : ''}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const locale of LOCALES) {
    for (const p of PAGES) {
      for (const w of WIDTHS) await capture(browser, locale, p, w);
    }
  }
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
