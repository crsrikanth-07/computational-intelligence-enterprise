// Renders the CuTTI demo poster (assets/img/cutti/demo-poster.webp, video ratio) and the share image
// (assets/og/og-cutti.jpg, 1200x630) from the page's own key visual and tokens.
// Usage: node website/_tools/make-cutti-art.js   (needs Playwright; Python Pillow converts PNG to WebP/JPEG)
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');
const root = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'products/cutti/index.html'), 'utf8');
const svg = page.match(/<svg class="lp-kv"[\s\S]*?<\/svg>/)[0];
const css = ['assets/css/tokens.css', 'assets/css/site.css', 'assets/css/pages/cutti.css', 'assets/css/theme.css']
  .map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
const fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">';
const card = (w, h, scale) => `<!doctype html><html><head><meta charset="utf-8">${fonts}<style>${css}
  html, body { margin: 0; width: ${w}px; height: ${h}px; overflow: hidden; background: #0B0E13; }
  .art { position: relative; width: ${w}px; height: ${h}px; box-sizing: border-box; padding: ${56 * scale}px ${64 * scale}px;
    display: grid; grid-template-columns: 0.9fr 1.1fr; gap: ${40 * scale}px; align-items: center;
    --bg: #0E1116; --surface: #141A22; --rule: rgba(255,255,255,.1); --text: #F5F6F8; --text-muted: #AEB6C2; --accent: #FF6A50; --accent-text: #FF7A62;
    background:
      radial-gradient(${620 * scale}px ${420 * scale}px at 88% 12%, color-mix(in srgb, var(--lp-chorus) 34%, transparent), transparent 70%),
      radial-gradient(${520 * scale}px ${380 * scale}px at 70% 100%, color-mix(in srgb, var(--lp-intro) 26%, transparent), transparent 70%),
      radial-gradient(${460 * scale}px ${340 * scale}px at 0% 80%, color-mix(in srgb, var(--lp-verse) 18%, transparent), transparent 70%),
      linear-gradient(180deg, #10141A, #0B0E13); color: var(--text); font-family: var(--font-body); }
  .art::after { content: ""; position: absolute; inset: 0; pointer-events: none;
    background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
    background-size: ${32 * scale}px ${32 * scale}px; }
  .copy { position: relative; z-index: 1; }
  .by { font: 500 ${13 * scale}px/1 var(--font-mono); letter-spacing: .32em; text-transform: uppercase; color: #C9CFD8; }
  .name { margin-top: ${18 * scale}px; font: 800 ${150 * scale}px/.9 var(--font-heading); letter-spacing: -0.05em;
    background: linear-gradient(100deg, #F5F6F8 0%, #F5F6F8 48%, var(--lp-chorus) 78%, var(--lp-intro) 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent; }
  .sub { margin-top: ${14 * scale}px; font: 600 ${34 * scale}px/1.1 var(--font-heading); letter-spacing: -0.015em; color: #FF7A62; }
  .line { margin-top: ${22 * scale}px; max-width: 29ch; font: 400 ${21 * scale}px/1.45 var(--font-body); color: #C3C9D2; }
  .date { margin-top: ${26 * scale}px; display: inline-flex; align-items: center; gap: ${10 * scale}px; padding: ${8 * scale}px ${16 * scale}px;
    border: 1px solid rgba(255,255,255,.16); border-radius: 999px; font: 500 ${14 * scale}px/1 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; }
  .date::before { content: ""; width: ${9 * scale}px; height: ${9 * scale}px; border-radius: 50%; background: #FF6A50; box-shadow: 0 0 0 ${4 * scale}px rgba(255,106,80,.22); }
  .win { position: relative; z-index: 1; border-radius: ${14 * scale}px; overflow: hidden; border: 1px solid rgba(255,255,255,.12); background: var(--lp-window);
    box-shadow: 0 ${50 * scale}px ${100 * scale}px -${30 * scale}px rgba(0,0,0,.85), 0 ${30 * scale}px ${80 * scale}px -${30 * scale}px color-mix(in srgb, var(--lp-chorus) 50%, transparent);
    transform: perspective(${1600 * scale}px) rotateY(-7deg) rotateX(2deg); }
  .win svg { display: block; width: 100%; height: auto; }
</style></head><body><div class="art">
  <div class="copy"><div class="by">SVLS Labs LLP</div><div class="name">CuTTI</div><div class="sub">MCP for Logic Pro</div>
  <div class="line">From simple prompts to editable song arrangements inside Logic Pro.</div><div class="date">Launching 12 November 2026</div></div>
  <div class="win">${svg}</div></div></body></html>`;
(async () => {
  const b = await chromium.launch();
  const jobs = [
    { w: 1376, h: 864, s: 1, png: 'demo-poster.png', out: 'assets/img/cutti/demo-poster.webp', fmt: 'WEBP' },
    { w: 1200, h: 630, s: 0.82, png: 'og-cutti.png', out: 'assets/og/og-cutti.jpg', fmt: 'JPEG' },
  ];
  for (const j of jobs) {
    const p = await b.newPage({ viewport: { width: j.w, height: j.h } });
    await p.setContent(card(j.w, j.h, j.s), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    const tmp = path.join(require('os').tmpdir(), j.png);
    await p.screenshot({ path: tmp });
    execFileSync('python3', ['-c', `from PIL import Image; Image.open(${JSON.stringify(tmp)}).convert('RGB').save(${JSON.stringify(path.join(root, j.out))}, '${j.fmt}', quality=84${j.fmt === 'JPEG' ? ', optimize=True, progressive=True' : ', method=6'})`]);
    console.log('wrote', j.out, fs.statSync(path.join(root, j.out)).size, 'bytes');
    await p.close();
  }
  await b.close();
})();
