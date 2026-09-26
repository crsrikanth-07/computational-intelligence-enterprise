// Renders LinkedIn company page images (logo 400x400, banner 1128x191 at 2x) from the brand lockup.
const path = require('path'); const fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const OUT = path.resolve(__dirname, '../assets/social');
const FONT = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700;800&family=Inter:wght@400;500&family=JetBrains+Mono:wght@500&display=swap';
const mark = (size, ink, accent) => `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true"><path d="M4 24V4h20v4H8v16z" fill="${ink}"/><circle cx="32" cy="32" r="13.5" fill="none" stroke="${ink}" stroke-width="5"/><path d="M60 40v20H40v-4h16V40z" fill="${accent}"/></svg>`;
const grid = (c) => `background-image:linear-gradient(${c} 1px,transparent 1px),linear-gradient(90deg,${c} 1px,transparent 1px);background-size:64px 64px;`;
const pages = {
  'linkedin-logo-dark.png': { w: 400, h: 400, html: `<div style="width:400px;height:400px;background:#0E1116;${grid('rgba(243,244,246,.05)')}display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px"><div>${mark(176,'#F3F4F6','#FF6A50')}</div><div style="font:800 46px/1 'Inter Tight',Inter,sans-serif;letter-spacing:-.01em;color:#F3F4F6">SVLS LABS</div></div>` },
  'linkedin-logo-light.png': { w: 400, h: 400, html: `<div style="width:400px;height:400px;background:#FFFFFF;${grid('rgba(16,20,24,.06)')}display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px"><div>${mark(176,'#101418','#E4432B')}</div><div style="font:800 46px/1 'Inter Tight',Inter,sans-serif;letter-spacing:-.01em;color:#101418">SVLS LABS</div></div>` },
  'linkedin-banner.png': { w: 1128, h: 191, html: `<div style="position:relative;width:1128px;height:191px;background:#0E1116;${grid('rgba(243,244,246,.05)')}overflow:hidden;display:flex;align-items:center;padding:0 56px;box-sizing:border-box;color:#F3F4F6">
    <div style="position:absolute;right:-40px;top:-110px;opacity:.10">${mark(420,'#F3F4F6','#FF6A50')}</div>
    <div style="position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,#E4432B,#FF6A50 40%,transparent)"></div>
    <div style="display:flex;align-items:center;gap:24px;position:relative">${mark(84,'#F3F4F6','#FF6A50')}<div style="font:800 54px/1 'Inter Tight',Inter,sans-serif;letter-spacing:-.01em">SVLS LABS</div></div>
    <div style="position:relative;margin-left:auto;text-align:right;max-width:560px">
      <div style="font:700 26px/1.2 'Inter Tight',Inter,sans-serif;letter-spacing:-.01em">SAP, Cloud and Governed AI. Engineered to Spec.</div>
      <div style="font:500 13px/1 'JetBrains Mono',monospace;letter-spacing:.14em;color:#A9B1BD;margin-top:12px">S/4HANA · BTP · INTEGRATION SUITE · GOVERNED AGENTS · VALUE LENS · SVLSLABS.COM</div>
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
