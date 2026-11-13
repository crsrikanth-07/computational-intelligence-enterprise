// End-to-end checks for the book landing page against a local WordPress.
// Usage: node book-landing.test.js <baseUrl> <wpRoot> <setoptPhp> [screenshotDir]
// No store is contacted: every external link is intercepted and answered locally.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const { execFileSync } = require('child_process');
const [base, wpRoot, setopt, shots] = process.argv.slice(2);
const results = [];
const ok = (name, pass, detail = '') => { results.push({ name, pass }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  [' + detail + ']' : ''}`); };
const set = (...kv) => JSON.parse(execFileSync('php', [setopt, wpRoot, ...kv]).toString().trim().split('\n').pop());
const sum = (rows, ev, tag) => rows.filter(r => r.event === ev && (tag === undefined || r.tag === tag)).reduce((a, r) => a + Number(r.n), 0);

async function visit(browser, { path = '/read/', viewport = { width: 390, height: 844 }, webdriver = false } = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0.0' });
  if (!webdriver) await ctx.addInitScript(() => Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }));
  const log = { external: [], errors: [] };
  await ctx.route(u => !u.href.startsWith(base), r => { log.external.push(r.request().url()); return r.fulfill({ status: 200, contentType: 'text/html', body: '<title>store stub</title>' }); });
  const page = await ctx.newPage();
  page.on('pageerror', e => log.errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') log.errors.push(m.text()); });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  return { ctx, page, log };
}

(async () => {
  const browser = await chromium.launch();
  set('--activate', '--reset-stats');

  let v = await visit(browser, { path: '/read/?utm_source=YouTube' });
  const h1 = (await v.page.locator('h1').innerText()).trim().toUpperCase();
  ok('page: title, byline and big button', h1 === 'TALES FROM BELLAVERE AND LINDENFELD' && (await v.page.locator('.by').innerText()).includes('CR Srikanth') && (await v.page.locator('.btn').innerText()).trim().toUpperCase() === 'GET THE EBOOK');
  ok('page: big button opens the Books2Read universal link', await v.page.locator('.btn').getAttribute('href') === 'https://books2read.com/u/3GDgV8');
  const storeLabels = await v.page.locator('.stores a').allInnerTexts();
  ok('page: other stores listed, empty Amazon slots hidden', storeLabels.length === 4 && !storeLabels.some(t => /amazon/i.test(t)), storeLabels.join(', '));
  ok('page: noindex (the book page is the one for search engines)', /noindex/.test(await v.page.locator('meta[name="robots"]').getAttribute('content')));
  ok('page: links to the SEO book page', await v.page.locator('.about a').getAttribute('href') === base + '/books/tales-from-bellavere-and-lindenfeld/');
  ok('page: no third-party requests on load', v.log.external.length === 0, v.log.external.join(' '));
  ok('page: no horizontal overflow at 390px', await v.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  const b = await v.page.locator('.btn').boundingBox();
  ok('page: big button visible without scrolling', b.y + b.height <= 844, `bottom ${Math.round(b.y + b.height)}`);
  if (shots) await v.page.screenshot({ path: shots + '/read-390.png' });
  await Promise.all([v.page.waitForURL(/books2read/), v.page.locator('.btn').click()]);
  await new Promise(r => setTimeout(r, 400));
  let rows = set().rows;
  ok('counts: one view and one Books2Read click under "youtube"', sum(rows, 'view', 'youtube') === 1 && sum(rows, 'universal', 'youtube') === 1, JSON.stringify(rows));
  ok('page: no JavaScript errors', v.log.errors.length === 0, v.log.errors.join(' | '));
  await v.ctx.close();

  v = await visit(browser, { path: '/read/?utm_source=instagram_boost' });
  await Promise.all([v.page.waitForURL(/apple\.com/), v.page.locator('.stores a', { hasText: 'Apple Books' }).click()]);
  await new Promise(r => setTimeout(r, 400));
  rows = set().rows;
  ok('counts: a store chip click is counted under its own store and source', sum(rows, 'apple', 'instagram_boost') === 1, JSON.stringify(rows));
  await v.ctx.close();

  let s = set('links.amazon_ebook=https://evil.example/dp/B0X');
  ok('settings: a non-Amazon link in an Amazon slot is refused', s.opt.links.amazon_ebook === '');
  s = set('links.amazon_ebook=https://www.amazon.com/dp/B0HNTSH7FL');
  ok('settings: an Amazon link is accepted', s.opt.links.amazon_ebook === 'https://www.amazon.com/dp/B0HNTSH7FL');
  v = await visit(browser);
  ok('page: a filled Amazon slot appears as a store button', (await v.page.locator('.stores a').allInnerTexts()).includes('Amazon Kindle'));
  await v.ctx.close();
  s = set('links.amazon_ebook=', 'links.universal=');
  v = await visit(browser);
  ok('page: without Books2Read the first filled store becomes the big button', await v.page.locator('.btn').getAttribute('data-store') === 'apple');
  await v.ctx.close();
  set('links.universal=https://books2read.com/u/3GDgV8');

  set('--reset-stats');
  v = await visit(browser, { webdriver: true }); await new Promise(r => setTimeout(r, 300));
  ok('automated browser: nothing counted', set().rows.length === 0);
  await v.ctx.close();
  const post = (ua, body) => fetch(base + '/wp-admin/admin-ajax.php', { method: 'POST', headers: { 'User-Agent': ua, 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  let r = await post('Googlebot/2.1', 'action=crs_book_hit&e=view&t=x');
  ok('bot user agent: 204 and nothing counted', r.status === 204 && set().rows.length === 0);
  r = await post('Mozilla/5.0 Test', 'action=crs_book_hit&e=amazon_ebook&t=x');
  ok('click on a store that is not on the page: ignored', r.status === 204 && set().rows.length === 0);
  for (let i = 0; i < 3; i++) await post('Mozilla/5.0 Repeat', 'action=crs_book_hit&e=view&t=Rep%20Tag');
  rows = set().rows;
  ok('repeat guard: three identical hits count once; tag sanitised', rows.length === 1 && Number(rows[0].n) === 1 && rows[0].tag === 'rep-tag', JSON.stringify(rows));

  for (const vp of [{ width: 320, height: 568 }, { width: 360, height: 640 }, { width: 412, height: 915 }]) {
    v = await visit(browser, { viewport: vp });
    const bb = await v.page.locator('.btn').boundingBox();
    ok(`${vp.width}x${vp.height}: no sideways scroll, big button visible without scrolling`, await v.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth) && bb.height >= 48 && bb.y + bb.height <= vp.height, `button ${Math.round(bb.y)}-${Math.round(bb.y + bb.height)}`);
    await v.ctx.close();
  }
  for (const p of ['/spotify/', '/books/tales-from-bellavere-and-lindenfeld/', '/']) {
    const res = await fetch(base + p); const html = await res.text();
    ok(`other pages still work: ${p}`, res.status === 200 && !html.includes('crs_book_hit'));
  }
  set('--reset-stats');
  await browser.close();
  const failed = results.filter(x => !x.pass);
  console.log(`\n${results.length - failed.length} of ${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
