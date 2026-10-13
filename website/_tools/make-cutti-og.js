// Renders the CuTTI share image (assets/og/og-cutti.jpg, 1200x630) from the demo cover frame.
// Usage: node website/_tools/make-cutti-og.js   (needs Playwright and ffmpeg via python imageio-ffmpeg)
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');
const root = path.join(__dirname, '..');
const poster = 'data:image/webp;base64,' + fs.readFileSync(path.join(root, 'assets/img/cutti/demo-poster.webp')).toString('base64');
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;800&family=Inter:wght@400;500&family=JetBrains+Mono:wght@500&display=swap">
<style>html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0B0E13}
.a{position:relative;width:1200px;height:630px;box-sizing:border-box;padding:64px 72px;display:grid;grid-template-columns:1fr 300px;gap:56px;align-items:center;color:#F5F6F8;font-family:Inter,sans-serif;
background:radial-gradient(520px 380px at 85% 20%,rgba(52,199,123,.22),transparent 70%),radial-gradient(480px 360px at 0% 100%,rgba(228,67,43,.16),transparent 70%),linear-gradient(180deg,#10141A,#0B0E13)}
.by{font:500 14px/1 'JetBrains Mono',monospace;letter-spacing:.3em;text-transform:uppercase;color:#C9CFD8}
.n{margin-top:18px;font:800 132px/.9 'Inter Tight',sans-serif;letter-spacing:-.05em}
.s{margin-top:18px;font:600 34px/1.15 'Inter Tight',sans-serif;letter-spacing:-.015em;color:#FF7A62;max-width:16ch}
.d{margin-top:28px;display:inline-flex;align-items:center;gap:10px;padding:9px 16px;border:1px solid rgba(255,255,255,.18);border-radius:999px;font:500 14px/1 'JetBrains Mono',monospace;letter-spacing:.1em;text-transform:uppercase}
.d:before{content:"";width:9px;height:9px;border-radius:50%;background:#FF6A50;box-shadow:0 0 0 4px rgba(255,106,80,.22)}
.p{width:300px;aspect-ratio:9/16;border-radius:26px;overflow:hidden;border:1px solid rgba(255,255,255,.16);box-shadow:0 40px 80px -30px rgba(0,0,0,.9),0 30px 70px -30px rgba(52,199,123,.45);transform:translateY(118px)}
.p img{width:100%;height:100%;object-fit:cover;display:block}</style></head><body><div class="a">
<div><div class="by">SVLS LABS LLP</div><div class="n">CuTTI</div><div class="s">One request. A full producer session in Logic Pro.</div><div class="d">Available from 1 January 2027</div></div>
<div class="p"><img src="${poster}" alt=""></div></div></body></html>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  const tmp = path.join(os.tmpdir(), 'og-cutti.png'); await p.screenshot({ path: tmp }); await b.close();
  const ff = execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
  execFileSync(ff, ['-hide_banner', '-loglevel', 'error', '-y', '-i', tmp, '-q:v', '3', path.join(root, 'assets/og/og-cutti.jpg')]);
  console.log('wrote assets/og/og-cutti.jpg', fs.statSync(path.join(root, 'assets/og/og-cutti.jpg')).size);
})();
