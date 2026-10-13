// Renders LinkedIn company page images (logo 400x400, banner 1128x191 at 2x) from the brand lockup.
const path = require('path'); const fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const OUT = path.resolve(__dirname, '../assets/social');
const FONT = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700;800&family=Inter:wght@400;500&family=JetBrains+Mono:wght@500&display=swap';
const mark = (size, ink, accent) => `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true"><path d="M4 24V4h20v4H8v16z" fill="${ink}"/><circle cx="32" cy="32" r="13.5" fill="none" stroke="${ink}" stroke-width="5"/><path d="M60 40v20H40v-4h16V40z" fill="${accent}"/></svg>`;
const grid = (c) => `background-image:linear-gradient(${c} 1px,transparent 1px),linear-gradient(90deg,${c} 1px,transparent 1px);background-size:64px 64px;`;
// Flowing ribbons: a sound wave that settles into an ordered line, the two portfolios in one stroke.
const ribbons = () => { let out = ''; for (let k = 0; k < 14; k++) { const pts = []; for (let x = 0; x <= 1128; x += 8) { const t = x / 1128; const amp = (34 - k * 1.6) * Math.sin(Math.PI * Math.min(1, t * 1.25)) * (1 - 0.55 * t); const y = 104 + (k - 7) * 3.2 + amp * Math.sin(t * 9.5 + k * 0.32) * Math.cos(t * 3.1 - k * 0.12); pts.push(`${x},${y.toFixed(1)}`); } out += `<polyline points="${pts.join(' ')}" stroke-width="${k % 4 ? 0.6 : 1.1}" opacity="${(0.18 + 0.05 * (k % 5)).toFixed(2)}"/>`; } return out; };
const dots = () => { let out = ''; for (let i = 0; i < 70; i++) { const x = (i * 97.3) % 1128, y = (i * 53.7) % 191; out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.5 + (i % 3) * 0.35).toFixed(2)}" opacity="${(0.08 + (i % 5) * 0.05).toFixed(2)}"/>`; } return out; };
const pages = {
  'linkedin-logo-dark.png': { w: 400, h: 400, html: `<div style="width:400px;height:400px;background:#0E1116;${grid('rgba(243,244,246,.05)')}display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px"><div>${mark(176,'#F3F4F6','#FF6A50')}</div><div style="font:800 46px/1 'Inter Tight',Inter,sans-serif;letter-spacing:-.01em;color:#F3F4F6">SVLS LABS</div></div>` },
  'linkedin-logo-light.png': { w: 400, h: 400, html: `<div style="width:400px;height:400px;background:#FFFFFF;${grid('rgba(16,20,24,.06)')}display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px"><div>${mark(176,'#101418','#E4432B')}</div><div style="font:800 46px/1 'Inter Tight',Inter,sans-serif;letter-spacing:-.01em;color:#101418">SVLS LABS</div></div>` },
  'linkedin-banner.png': { w: 1128, h: 191, html: `<div style="position:relative;width:1128px;height:191px;background:radial-gradient(120% 140% at 70% 0%,#121826 0%,#07090D 60%);overflow:hidden;color:#F3F4F6;font-family:Inter,sans-serif">
    <div style="position:absolute;inset:-40%;background:radial-gradient(22% 40% at 62% 46%,rgba(212,168,67,.22),transparent 70%),radial-gradient(26% 55% at 88% 30%,rgba(52,199,123,.20),transparent 70%),radial-gradient(24% 50% at 40% 90%,rgba(228,67,43,.20),transparent 70%),radial-gradient(18% 40% at 20% 20%,rgba(120,110,255,.14),transparent 70%);filter:blur(10px)"></div>
    <svg width="1128" height="191" viewBox="0 0 1128 191" style="position:absolute;inset:0" aria-hidden="true"><defs>
      <linearGradient id="rb" x1="0" x2="1"><stop offset="0" stop-color="#E4432B" stop-opacity="0"/><stop offset=".35" stop-color="#E4432B"/><stop offset=".65" stop-color="#D4A843"/><stop offset="1" stop-color="#34C77B" stop-opacity=".2"/></linearGradient>
      <linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".25" stop-color="#fff"/><stop offset="1" stop-color="#fff"/></linearGradient>
      <mask id="m"><rect width="1128" height="191" fill="url(#fade)"/></mask></defs>
      <g mask="url(#m)" fill="none" stroke="url(#rb)">${ribbons()}</g>
      <g fill="#F3F4F6">${dots()}</g></svg>
    <div style="position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,#E4432B 25%,#D4A843 55%,#34C77B 85%,transparent)"></div>
    <div style="position:absolute;right:56px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:flex-end;text-align:right">
      <div style="font:500 10.5px/1 'JetBrains Mono',monospace;letter-spacing:.28em;color:#D4A843;margin-bottom:12px">SVLS LABS · INNOVATIVE SOFTWARE · SINCE 2020</div>
      <div style="font:800 34px/1.08 'Inter Tight',Inter,sans-serif;letter-spacing:-.02em;white-space:nowrap">Software for <span style="background:linear-gradient(90deg,#7FE0AE,#34C77B);-webkit-background-clip:text;background-clip:text;color:transparent">Enterprise</span><br>and <span style="background:linear-gradient(90deg,#FF7A5C,#D4A843);-webkit-background-clip:text;background-clip:text;color:transparent">Entertainment</span>.</div>
      <div style="font:500 11px/1 'JetBrains Mono',monospace;letter-spacing:.16em;color:#AEB6C2;margin-top:14px;white-space:nowrap">CuTTI&nbsp;&nbsp;◆&nbsp;&nbsp;VALUE LENS&nbsp;&nbsp;◆&nbsp;&nbsp;SVLSLABS.COM</div>
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
