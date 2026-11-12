// End-to-end checks for the VS Pop Spotify landing page against a local WordPress.
// Usage: node landing.test.js <baseUrl> <wpRoot> <setoptPhp> [screenshotDir]
// Meta and Spotify are never contacted: both hosts are intercepted and answered locally.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const { execFileSync } = require('child_process');
const [base, wpRoot, setopt, shots] = process.argv.slice(2);
const ARTIST = 'https://open.spotify.com/artist/7omxXdWFGzNjA4FyjVn6oH';
const results = [];
const ok = (name, pass, detail = '') => { results.push({ name, pass }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  [' + detail + ']' : ''}`); };
const set = (...kv) => JSON.parse(execFileSync('php', [setopt, wpRoot, ...kv]).toString().trim().split('\n').pop());
const total = (rows, f, tag) => rows.filter(r => tag === undefined || r.tag === tag).reduce((a, r) => a + r[f], 0);
// A stand-in for fbevents.js: replays the queued fbq() calls into window.__fb so the test can read them.
const FB_STUB = `(function(){var q=window.fbq;window.__fb=window.__fb||[];function run(a){window.__fb.push(Array.prototype.slice.call(a));}if(q){q.callMethod=function(){run(arguments)};(q.queue||[]).forEach(run);q.queue=[];}})();`;

async function visit(browser, { path = '/spotify/', tz = 'America/New_York', gpc = false, viewport = { width: 390, height: 844 }, webdriver = false } = {}) {
  const ctx = await browser.newContext({ viewport, timezoneId: tz, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0.0' });
  if (!webdriver) await ctx.addInitScript(() => Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }));
  if (gpc) await ctx.addInitScript(() => Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true }));
  const log = { fb: [], spotify: [], hits: [], errors: [] };
  await ctx.route(/facebook\.(net|com)/, r => { log.fb.push(r.request().url()); return r.fulfill({ status: 200, contentType: 'text/javascript', body: /fbevents\.js/.test(r.request().url()) ? FB_STUB : '' }); });
  await ctx.route(/open\.spotify\.com/, r => { log.spotify.push(r.request().url()); return r.fulfill({ status: 200, contentType: 'text/html', body: '<title>Spotify stub</title>' }); });
  const page = await ctx.newPage();
  page.on('request', q => { if (/admin-ajax\.php/.test(q.url())) log.hits.push(q.postData() || ''); });
  page.on('pageerror', e => log.errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') log.errors.push(m.text()); });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  const fb = () => page.evaluate(() => (window.__fb || []).map(a => a.slice(0, 2).join(':')));
  return { ctx, page, log, fb };
}
const tap = async v => { await Promise.all([v.page.waitForURL(/open\.spotify\.com/), v.page.locator('#vspop-listen').click()]); await new Promise(r => setTimeout(r, 400)); };

(async () => {
  const browser = await chromium.launch();

  // 1. No Pixel ID: page works, nothing goes to Meta, first-party counts work.
  set('pixel_id=', 'consent_mode=ask_everyone', 'destination=artist', 'track_url=', '--reset-stats');
  let v = await visit(browser, { path: '/spotify/?utm_source=meta&utm_content=Ad1-Hook' });
  ok('page: one h1, one button, label "Listen on Spotify"', await v.page.locator('h1').count() === 1 && (await v.page.locator('#vspop-listen').innerText()).trim().toUpperCase() === 'LISTEN ON SPOTIFY');
  ok('page: button href is the approved artist profile', await v.page.locator('#vspop-listen').getAttribute('href') === ARTIST);
  ok('page: big title is the track, line below credits CR Srikanth', (await v.page.locator('h1').innerText()).trim().toUpperCase() === 'BENEATH THE LAST AUTUMN MOON' && (await v.page.locator('.track').innerText()).includes('by CR Srikanth'));
  ok('page: hint names the Spotify profile the button opens', (await v.page.locator('.hint').innerText()).includes('Ravi Chandra Srikanth Cherukupalli'));
  ok('page: VS POP RECORDS LLP branding present', (await v.page.content()).includes('VS POP RECORDS LLP') && !/SVLS/i.test(await v.page.content()));
  ok('no pixel id: no consent banner, no request to Meta', await v.page.locator('#vspop-consent').count() === 0 && v.log.fb.length === 0);
  ok('page: no horizontal overflow at 390px', await v.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  const box = await v.page.locator('#vspop-listen').boundingBox();
  ok('page: button fully visible without scrolling, at least 48px tall', box && box.y + box.height <= 844 && box.height >= 48, box ? `y=${Math.round(box.y)} h=${Math.round(box.height)}` : '');
  if (shots) await v.page.screenshot({ path: shots + '/landing-390.png' });
  await tap(v);
  ok('click: browser lands on the Spotify artist URL', v.page.url() === ARTIST, v.page.url());
  let rows = set().rows;
  ok('first-party: 1 view and 1 click counted under the ad tag', total(rows, 'views', 'ad1-hook') === 1 && total(rows, 'clicks', 'ad1-hook') === 1, JSON.stringify(rows));
  ok('page: no JavaScript errors', v.log.errors.length === 0, v.log.errors.join(' | '));
  await v.ctx.close();

  // 1b. Free traffic: utm_source labels the counts when there is no utm_content.
  set('--reset-stats');
  v = await visit(browser, { path: '/spotify/?utm_source=YouTube' });
  rows = set().rows;
  ok('free traffic: utm_source labels the count', total(rows, 'views', 'youtube') === 1, JSON.stringify(rows));
  await v.ctx.close();

  // 2. Pixel + ask everyone: nothing to Meta before consent; Allow -> PageView; button -> ViewContent once.
  set('pixel_id=123456789012345', 'consent_mode=ask_everyone', '--reset-stats');
  v = await visit(browser);
  ok('ask everyone: banner shown, zero Meta requests before a choice', await v.page.locator('#vspop-consent').isVisible() && v.log.fb.length === 0);
  const b2 = await v.page.locator('#vspop-listen').boundingBox(), c2 = await v.page.locator('#vspop-consent').boundingBox();
  ok('ask everyone: banner does not cover the button', b2.y + b2.height <= c2.y, `button bottom ${Math.round(b2.y + b2.height)} / banner top ${Math.round(c2.y)}`);
  if (shots) await v.page.screenshot({ path: shots + '/landing-390-consent.png' });
  await v.page.locator('#vspop-yes').click(); await v.page.waitForFunction(() => (window.__fb || []).length >= 2);
  let calls = await v.fb();
  ok('allow: pixel initialised with the saved ID, PageView fired', calls.includes('init:123456789012345') && calls.includes('track:PageView'), calls.join(', '));
  ok('allow: no ViewContent before the button is pressed', !calls.includes('track:ViewContent'));
  await v.page.evaluate(() => document.getElementById('vspop-listen').addEventListener('click', e => e.preventDefault(), { once: false }));
  await v.page.evaluate(() => document.getElementById('vspop-listen').click());
  ok('scripted (untrusted) click: no ViewContent', !(await v.fb()).includes('track:ViewContent'));
  await v.page.locator('#vspop-listen').click(); await v.page.locator('#vspop-listen').click();
  calls = await v.fb();
  ok('real press: ViewContent fired exactly once, even when pressed twice', calls.filter(c => c === 'track:ViewContent').length === 1, calls.join(', '));
  await v.ctx.close();

  // 3. Decline: no Meta at all, the button still works and is still counted first-party.
  v = await visit(browser);
  await v.page.locator('#vspop-no').click();
  await tap(v);
  rows = set().rows;
  ok('no thanks: zero Meta requests, button still opens Spotify', v.log.fb.length === 0 && v.page.url() === ARTIST);
  ok('no thanks: the click is still counted first-party', total(rows, 'clicks') >= 1, JSON.stringify(rows));
  await v.page.goBack({ waitUntil: 'networkidle' }).catch(() => {});
  await v.page.goto(base + '/spotify/', { waitUntil: 'networkidle' });
  ok('no thanks is remembered: no banner, no Meta on the next visit', !(await v.page.locator('#vspop-consent').isVisible()) && v.log.fb.length === 0);
  await v.page.locator('#vspop-choices').click();
  ok('"Privacy choices" reopens the banner', await v.page.locator('#vspop-consent').isVisible());
  await v.ctx.close();

  // 4. Ask where required: US loads without asking; Germany is asked first; GPC always means no.
  set('consent_mode=ask_where_required');
  v = await visit(browser, { tz: 'America/Chicago' });
  ok('ask where required, US time zone: pixel loads, no banner', (await v.fb()).includes('track:PageView') && !(await v.page.locator('#vspop-consent').isVisible()));
  await v.page.locator('#vspop-choices').click(); await v.page.locator('#vspop-no').click();
  await v.page.evaluate(() => document.getElementById('vspop-listen').addEventListener('click', e => e.preventDefault()));
  await v.page.locator('#vspop-listen').click();
  calls = await v.fb();
  ok('opting out later: consent revoked, no ViewContent afterwards', calls.includes('consent:revoke') && !calls.includes('track:ViewContent'), calls.join(', '));
  await v.ctx.close();
  v = await visit(browser, { tz: 'Europe/Berlin' });
  ok('ask where required, German time zone: banner first, zero Meta requests', await v.page.locator('#vspop-consent').isVisible() && v.log.fb.length === 0);
  await v.ctx.close();
  v = await visit(browser, { tz: 'America/Chicago', gpc: true });
  ok('Global Privacy Control: no pixel, no banner', v.log.fb.length === 0 && !(await v.page.locator('#vspop-consent').isVisible()));
  await v.ctx.close();

  // 5. Pixel off.
  set('consent_mode=pixel_off');
  v = await visit(browser);
  ok('pixel off: no banner, zero Meta requests', await v.page.locator('#vspop-consent').count() === 0 && v.log.fb.length === 0);
  await v.ctx.close();

  // 6. Destination rules.
  let s = set('consent_mode=ask_everyone', 'destination=track', 'track_url=https://evil.example/track/abc');
  ok('destination: a non-Spotify link is rejected and the artist profile stays', s.dest.url === ARTIST && s.opt.destination === 'artist');
  s = set('destination=track', 'track_url=https://open.spotify.com/track/5LemOZwzkweSo5O4IR4Ddw?si=abc123');
  ok('destination: a Spotify track link is accepted and cleaned', s.dest.url === 'https://open.spotify.com/track/5LemOZwzkweSo5O4IR4Ddw' && s.dest.type === 'track', s.dest.url);
  v = await visit(browser);
  ok('destination: the button now opens the track', await v.page.locator('#vspop-listen').getAttribute('href') === 'https://open.spotify.com/track/5LemOZwzkweSo5O4IR4Ddw');
  await v.ctx.close();
  s = set('destination=artist');
  ok('destination: switching back restores the artist profile', s.dest.url === ARTIST);
  s = set('pixel_id=abc');
  ok('settings: a non-numeric Pixel ID is rejected', s.opt.pixel_id === '');

  // 7. Counting hygiene: automation and bots are not counted.
  set('pixel_id=', '--reset-stats');
  v = await visit(browser, { webdriver: true }); await new Promise(r => setTimeout(r, 300));
  ok('automated browser: nothing counted', v.log.hits.length === 0 && set().rows.length === 0);
  await v.ctx.close();
  const r = await fetch(base + '/wp-admin/admin-ajax.php', { method: 'POST', headers: { 'User-Agent': 'facebookexternalhit/1.1', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'action=vspop_hit&e=click&t=x' });
  ok('bot user agent: endpoint answers 204 and counts nothing', r.status === 204 && set().rows.length === 0, String(r.status));
  const r2 = await fetch(base + '/wp-admin/admin-ajax.php', { method: 'POST', headers: { 'User-Agent': 'Mozilla/5.0 Test', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'action=vspop_hit&e=purchase&t=x' });
  ok('unknown event name: ignored', r2.status === 204 && set().rows.length === 0);
  for (let i = 0; i < 3; i++) await fetch(base + '/wp-admin/admin-ajax.php', { method: 'POST', headers: { 'User-Agent': 'Mozilla/5.0 Repeat', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'action=vspop_hit&e=click&t=Rep%20Tag<script>' });
  rows = set().rows;
  ok('repeat guard: three identical hits within 30 s count once; tag is sanitised', rows.length === 1 && rows[0].clicks === 1 && rows[0].tag === 'rep-tag-script', JSON.stringify(rows));

  // 8. Small phone, and the rest of the site is untouched.
  set('pixel_id=123456789012345', 'consent_mode=ask_everyone', '--reset-stats');
  v = await visit(browser, { viewport: { width: 360, height: 600 } });
  const b8 = await v.page.locator('#vspop-listen').boundingBox(), c8 = await v.page.locator('#vspop-consent').boundingBox();
  ok('360x600 with banner: button still fully visible above it', b8.y >= 0 && b8.y + b8.height <= c8.y, `button ${Math.round(b8.y)}-${Math.round(b8.y + b8.height)} / banner top ${Math.round(c8.y)}`);
  if (shots) await v.page.screenshot({ path: shots + '/landing-360-consent.png' });
  await v.ctx.close();
  for (const vp of [{ width: 390, height: 664 }, { width: 320, height: 568 }, { width: 412, height: 915 }]) {
    v = await visit(browser, { viewport: vp });
    const b = await v.page.locator('#vspop-listen').boundingBox(), c = await v.page.locator('#vspop-consent').boundingBox();
    ok(`${vp.width}x${vp.height} with banner: button fully visible above it, no sideways scroll`, b.y >= 0 && b.y + b.height <= c.y && await v.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `button ${Math.round(b.y)}-${Math.round(b.y + b.height)} / banner top ${Math.round(c.y)}`);
    await v.page.locator('#vspop-no').click();
    const b3 = await v.page.locator('#vspop-listen').boundingBox();
    ok(`${vp.width}x${vp.height} after the banner closes: button fully visible`, b3.y >= 0 && b3.y + b3.height <= vp.height, `button ${Math.round(b3.y)}-${Math.round(b3.y + b3.height)}`);
    if (shots && vp.width === 390) await v.page.screenshot({ path: shots + '/landing-390x664.png' });
    await v.ctx.close();
  }
  for (const p of ['/', '/music/', '/shop/', '/contact/']) {
    const res = await fetch(base + p); const html = await res.text();
    ok(`main site ${p}: still served by the theme, no pixel or landing code added`, res.status === 200 && html.includes('wp-content/themes/crsrikanth') && !/fbq\(|fbevents|vspop_hit|vspop-listen|window\.VSPOP/i.test(html));
  }

  await browser.close();
  const failed = results.filter(r => !r.pass);
  console.log(`\n${results.length - failed.length} of ${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
