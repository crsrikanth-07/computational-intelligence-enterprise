#!/usr/bin/env node
/* OG image generator (BRAND_SPEC 13): 1200 x 630 PNG, white page, hairline
   64px grid at 6% ink, stacked lockup left-centred at 240px, page title right
   in Inter Tight 700 40px. --dark renders the reversed variant on #0B0E13.

   Usage:  node _tools/make-og.js <key> "<title>" [--dark]
   Writes: /assets/og/og-<key>.png
   Fonts load from Google Fonts (network needed); if they fail, the script says
   so and still writes the PNG with the fallback family.

   Examples:
     node _tools/make-og.js home "SAP, cloud and governed AI. Engineered to spec."
     node _tools/make-og.js value-lens "Value Lens: Margin Leak Finder for SAP O2C" --dark */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const args = process.argv.slice(2);
const dark = args.includes('--dark');
const [key, title] = args.filter((a) => a !== '--dark');
if (!key || !title) {
  console.error('Usage: node _tools/make-og.js <key> "<title>" [--dark]');
  process.exit(2);
}

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'og', `og-${key}.png`);
const FONTS = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap';

// Colours copied from tokens.css (the OG image is a static export, not a page).
const C = dark
  ? { bg: '#0B0E13', text: '#F3F4F6', muted: '#A9B1BD', accent: '#FF6A50', grid: 'rgba(243,244,246,0.05)', rule: '#1F2632' }
  : { bg: '#FFFFFF', text: '#101418', muted: '#4B5563', accent: '#E4432B', grid: 'rgba(16,20,24,0.06)', rule: '#D9DDE3' };

function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

// Two lines: split the tagline at the first sentence end if it has two sentences.
function lines(t) {
  const m = t.match(/^(.+?\.)\s+(.+)$/);
  return m ? [m[1], m[2]] : [t];
}
const size = title.length > 70 ? 34 : 40;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>
  html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:${C.bg};color:${C.text}}
  .og{position:relative;width:1200px;height:630px;
    background-image:linear-gradient(${C.grid} 1px,transparent 1px),linear-gradient(90deg,${C.grid} 1px,transparent 1px);
    background-size:64px 64px;background-position:88px 0}
  .lockup{position:absolute;left:88px;top:195px;width:240px;height:240px}
  .rule{position:absolute;left:392px;top:195px;width:1px;height:240px;background:${C.rule}}
  .copy{position:absolute;left:456px;top:0;width:656px;height:630px;display:flex;flex-direction:column;justify-content:center}
  .eyebrow{font:500 14px/20px 'JetBrains Mono',Menlo,Consolas,monospace;letter-spacing:.08em;text-transform:uppercase;color:${C.muted};margin-bottom:24px}
  h1{margin:0;font:700 ${size}px/1.2 'Inter Tight',Inter,'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:-0.02em;text-wrap:balance}
  .site{font:400 14px/20px 'JetBrains Mono',Menlo,Consolas,monospace;letter-spacing:.08em;text-transform:uppercase;color:${C.muted};margin-top:32px}
  .site i{display:inline-block;width:8px;height:8px;border-radius:50%;background:${C.accent};margin-right:10px;vertical-align:1px}
</style></head><body><div class="og">
<svg class="lockup" viewBox="0 0 320 320" aria-hidden="true">
  <g transform="translate(80 48) scale(2.5)">
    <path d="M4 24V4h20v4H8v16z" fill="${C.text}"/>
    <circle cx="32" cy="32" r="13.5" fill="none" stroke="${C.text}" stroke-width="5"/>
    <path d="M60 40v20H40v-4h16V40z" fill="${C.accent}"/>
  </g>
  <text x="47" y="272" fill="${C.text}" font-family="'Inter Tight', Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="49.5" font-weight="700" letter-spacing="-0.495">SVLS</text>
  <text x="177" y="272" fill="${C.text}" font-family="'Inter Tight', Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="34.65" font-weight="500" letter-spacing="4.158">LABS</text>
</svg>
<div class="rule"></div>
<div class="copy">
  <div class="eyebrow">SVLS LABS</div>
  <h1>${lines(title).map(esc).join('<br>')}</h1>
  <div class="site"><i></i>svlslabs.com</div>
</div>
</div></body></html>`;

(async () => {
  const server = http.createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(html); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() => document.fonts.check('700 40px "Inter Tight"') && [...document.fonts].some((f) => f.family.replace(/"/g, '') === 'Inter Tight' && f.status === 'loaded'));
  if (!loaded) console.warn('warning: Inter Tight did not load; the PNG uses the fallback font');
  await page.waitForTimeout(200);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await browser.close();
  server.close();
  console.log('wrote', path.relative(ROOT, OUT));
})().catch((e) => { console.error(e); process.exit(1); });
