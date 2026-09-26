#!/usr/bin/env node
/* Renders /favicon.svg (ink square, reversed mark at 75%) to the PNG favicons
   listed in BRAND_SPEC 8.7 with headless Chromium.
   Usage: node _tools/render-icons.js
   Writes: /favicon-32.png, /favicon-16.png, /apple-touch-icon.png (180)
   Not deployed: _tools/ is excluded from the site. */
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const SVG = fs.readFileSync(path.join(ROOT, 'favicon.svg'), 'utf8');
const TARGETS = [
  { file: 'favicon-32.png', size: 32 },
  { file: 'favicon-16.png', size: 16 },
  { file: 'apple-touch-icon.png', size: 180 },
];

(async () => {
  const browser = await chromium.launch();
  for (const t of TARGETS) {
    const page = await browser.newPage({ viewport: { width: t.size, height: t.size }, deviceScaleFactor: 1 });
    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent}img{display:block;width:${t.size}px;height:${t.size}px}</style></head>` +
      `<body><img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(SVG)}" alt=""></body></html>`
    );
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(ROOT, t.file), omitBackground: true, clip: { x: 0, y: 0, width: t.size, height: t.size } });
    await page.close();
    console.log('wrote', t.file);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
