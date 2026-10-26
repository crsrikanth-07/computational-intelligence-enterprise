// Renders LinkedIn company page images (logo 400x400, banner 1128x191 at 2x) from the brand lockup.
const path = require('path'); const fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const OUT = path.resolve(__dirname, '../assets/social');
const FONT = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700;800&family=Inter:wght@400;500&family=JetBrains+Mono:wght@500&display=swap';
const mark = (size, ink, accent) => `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true"><path d="M4 24V4h20v4H8v16z" fill="${ink}"/><circle cx="32" cy="32" r="13.5" fill="none" stroke="${ink}" stroke-width="5"/><path d="M60 40v20H40v-4h16V40z" fill="${accent}"/></svg>`;
const grid = (c) => `background-image:linear-gradient(${c} 1px,transparent 1px),linear-gradient(90deg,${c} 1px,transparent 1px);background-size:64px 64px;`;
// Architectural topology: a node grid joined by orthogonal links, one governed path in the accent colour.
// Kept between x 290 and 580, clear of the page logo (bottom left) and the text block (right).
const topo = () => { const X = x => 290 + (x - 380) * 0.8; let out = ''; const cols = [380, 470, 560, 650, 740]; const rows = [40, 95, 150];
  for (const y of rows) out += `<line x1="250" x2="600" y1="${y}" y2="${y}" stroke="rgba(243,244,246,.07)"/>`;
  for (const x of cols) out += `<line x1="${X(x)}" x2="${X(x)}" y1="0" y2="191" stroke="rgba(243,244,246,.05)"/>`;
  const nodes = [[380, 40], [470, 95], [560, 40], [560, 150], [650, 95], [740, 40], [740, 150]];
  out += `<path d="M${X(380)} 40H${X(470)}V95H${X(650)}V40H${X(740)}" fill="none" stroke="rgba(243,244,246,.22)" stroke-width="1.2"/><path d="M${X(560)} 150V95M${X(650)} 95V150H${X(740)}" fill="none" stroke="rgba(243,244,246,.22)" stroke-width="1.2"/>`;
  out += `<path d="M${X(470)} 95H${X(650)}" fill="none" stroke="#E4432B" stroke-width="1.6"/>`;
  for (const [x, y] of nodes) out += `<rect x="${X(x) - 13}" y="${y - 8}" width="26" height="16" fill="#0B0E13" stroke="${(x === 470 || x === 650) && y === 95 ? '#E4432B' : 'rgba(243,244,246,.35)'}"/>`;
  return out; };
const pages = {
  'linkedin-logo-dark.png': { w: 400, h: 400, html: `<div style="width:400px;height:400px;background:#0E1116;${grid('rgba(243,244,246,.05)')}display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px"><div>${mark(176,'#F3F4F6','#FF6A50')}</div><div style="font:800 46px/1 'Inter Tight',Inter,sans-serif;letter-spacing:-.01em;color:#F3F4F6">SVLS LABS</div></div>` },
  'linkedin-logo-light.png': { w: 400, h: 400, html: `<div style="width:400px;height:400px;background:#FFFFFF;${grid('rgba(16,20,24,.06)')}display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px"><div>${mark(176,'#101418','#E4432B')}</div><div style="font:800 46px/1 'Inter Tight',Inter,sans-serif;letter-spacing:-.01em;color:#101418">SVLS LABS</div></div>` },
  'linkedin-banner.png': { w: 1128, h: 191, html: `<div style="position:relative;width:1128px;height:191px;background:#0B0E13;overflow:hidden;color:#F3F4F6;font-family:Inter,sans-serif">
    <div style="position:absolute;inset:0;${grid('rgba(243,244,246,.035)')}background-size:16px 16px"></div>
    <svg width="1128" height="191" viewBox="0 0 1128 191" style="position:absolute;inset:0" aria-hidden="true">${topo()}</svg>
    <div style="position:absolute;left:0;right:0;bottom:0;height:2px;background:#E4432B"></div>
    <div style="position:absolute;right:56px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:flex-end;text-align:right;width:420px">
      <div style="font:500 10px/1 'JetBrains Mono',monospace;letter-spacing:.24em;color:#A9B1BD;margin-bottom:12px">SVLS LABS · ENTERPRISE ARCHITECTURE · SINCE 2020</div>
      <div style="font:700 30px/1.1 'Inter Tight',Inter,sans-serif;letter-spacing:-.02em">Architecture for Complex<br>Enterprise Systems<span style="color:#FF6A50">.</span></div>
      <div style="font:500 10.5px/1 'JetBrains Mono',monospace;letter-spacing:.14em;color:#A9B1BD;margin-top:14px;white-space:nowrap">ERP MODERNISATION · INTEGRATION · AI GOVERNANCE · SVLSLABS.COM</div>
    </div></div>` },
};
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const [name, p] of Object.entries(pages)) {
    const page = await browser.newPage({ viewport: { width: p.w, height: p.h }, deviceScaleFactor: 2 });
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONT}"><style>html,body{margin:0}</style></head><body>${p.html}</body></html>`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, name), type: 'png' }); await page.close(); console.log('wrote', name);
  }
  await browser.close();
})();
