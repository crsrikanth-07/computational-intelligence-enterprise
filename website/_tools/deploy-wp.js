#!/usr/bin/env node
/**
 * Deploys the SVLS LABS site to the existing WordPress install (svlslabs.com).
 *
 * Environment (never hard-code, never print):
 *   WP_URL            e.g. https://svlslabs.com
 *   WP_USER           WordPress username
 *   WP_APP_PASSWORD   Application Password (Users -> Profile -> Application Passwords)
 *   WP_PASSWORD       optional: the account's login password, only used for a wp-admin session (cookie login)
 *                     to upload/activate the theme zip and flush the host cache (the REST API cannot install themes)
 *
 * Usage:  node website/_tools/deploy-wp.js [--dry-run] [--skip-theme] [--skip-cache] [--zip path/to/svls-labs.zip]
 * Idempotent: re-running updates existing pages by slug instead of duplicating them.
 *
 * The wp-admin steps use plain HTTPS requests (Node fetch + a cookie jar) against wp-login.php, update.php and
 * themes.php, i.e. the same requests a browser sends for Appearance -> Themes -> Upload -> Activate. A headless
 * browser is not required.
 */
const fs = require('fs'); const path = require('path');
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run'); const SKIP_THEME = args.includes('--skip-theme'); const SKIP_CACHE = args.includes('--skip-cache');
const zipArg = args.indexOf('--zip') >= 0 ? args[args.indexOf('--zip') + 1] : path.resolve(__dirname, '../../wordpress-theme/svls-labs.zip');
const { WP_URL, WP_USER, WP_APP_PASSWORD, WP_PASSWORD } = process.env;
if (!WP_URL || !WP_USER || !WP_APP_PASSWORD) { console.error('Missing WP_URL / WP_USER / WP_APP_PASSWORD in the environment.'); process.exit(2); }
const BASE = WP_URL.replace(/\/+$/, '');
const AUTH = 'Basic ' + Buffer.from(`${WP_USER}:${WP_APP_PASSWORD.replace(/\s+/g, '')}`).toString('base64');
const THEME = 'svls-labs';
const report = { steps: [], warnings: [], errors: [], verify: [] };
const log = (m) => { console.log(m); report.steps.push(m); };
const warn = (m) => { console.warn('WARN ' + m); report.warnings.push(m); };
const UA = 'svls-deploy/1.0 (+deploy-wp.js)';

async function api(p, opts = {}) {
  const res = await fetch(`${BASE}/wp-json${p}`, { ...opts, headers: { Authorization: AUTH, Accept: 'application/json', 'User-Agent': UA, ...(opts.body && !(opts.body instanceof Buffer) ? { 'Content-Type': 'application/json' } : {}), ...(opts.headers || {}) } });
  const text = await res.text(); let json = null; try { json = JSON.parse(text); } catch (e) { /* not json */ }
  if (!res.ok) { const err = new Error(`${opts.method || 'GET'} ${p} -> ${res.status} ${json && json.message ? json.message : text.slice(0, 200)}`); err.status = res.status; err.json = json; throw err; }
  return json;
}

// Page plan: slug -> {title, template, parent?, content}. Templates match wordpress-theme/svls-labs/*.php.
const PLAN = [
  { slug: 'home', title: 'SVLS LABS', template: '', front: true, content: '<!-- Rendered by front-page.php of the SVLS Labs theme -->' },
  { slug: 'services', title: 'Services', template: '', content: '<p><a href="/services/sap/">SAP &amp; ERP</a> · <a href="/services/cloud/">Cloud</a> · <a href="/services/ai/">Agentic &amp; Applied AI</a></p>' },
  { slug: 'sap', parent: 'services', title: 'SAP & ERP', template: 'page-services-sap.php' },
  { slug: 'cloud', parent: 'services', title: 'Cloud', template: 'page-services-cloud.php' },
  { slug: 'ai', parent: 'services', title: 'Agentic & Applied AI', template: 'page-services-ai.php' },
  { slug: 'products', title: 'Products', template: '', content: '<p><a href="/products/value-lens/">Value Lens (private beta)</a> · <a href="/products/sap-intelligence-suite/">SAP Intelligence Suite</a></p>' },
  { slug: 'value-lens', parent: 'products', title: 'Value Lens', template: 'page-products-value-lens.php' },
  { slug: 'sap-intelligence-suite', parent: 'products', title: 'SAP Intelligence Suite', template: 'page-products-sap-intelligence-suite.php' },
  { slug: 'approach', title: 'Approach', template: 'page-approach.php' },
  { slug: 'about', title: 'About', template: 'page-about.php' },
  { slug: 'contact', title: 'Contact', template: 'page-contact.php' },
  { slug: 'privacy', title: 'Privacy Policy', template: 'page-privacy.php' },
  { slug: 'terms', title: 'Terms of Use', template: 'page-terms.php' },
];

async function preflight() {
  const root = await fetch(`${BASE}/wp-json/wp/v2/`, { headers: { 'User-Agent': UA } }).then(r => r.status).catch(e => 'ERR ' + e.message);
  log(`REST API root: ${root}`);
  if (root !== 200) throw new Error('REST API not reachable (a security plugin may block /wp-json). Fix that first.');
  const me = await api('/wp/v2/users/me?context=edit');
  log(`Authenticated as user #${me.id} (${me.slug}); roles: ${(me.roles || []).join(',')}`);
  if (!(me.roles || []).includes('administrator')) warn('User is not an administrator; theme/settings steps may be refused.');
  if (!fs.existsSync(zipArg)) throw new Error(`Theme zip not found at ${zipArg}`);
}

async function themeStatus() {
  try { const active = await api('/wp/v2/themes?status=active'); const st = active[0] && (active[0].stylesheet || active[0].slug); log(`Active theme: ${st}`); return st; }
  catch (e) { warn('Could not read active theme: ' + e.message); return null; }
}

/* ---------- wp-admin session (cookie login) ---------- */
class AdminSession {
  constructor() { this.jar = new Map(); }
  cookieHeader() { return [...this.jar.entries()].map(([k, v]) => `${k}=${v}`).join('; '); }
  absorb(res) { const set = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : []; for (const c of set) { const [pair] = c.split(';'); const i = pair.indexOf('='); if (i > 0) { const k = pair.slice(0, i).trim(); const v = pair.slice(i + 1).trim(); const attrs = c.toLowerCase(); if (/max-age=0|expires=thu, 01 jan 1970/.test(attrs)) this.jar.delete(k); else this.jar.set(k, v); } } }
  async request(url, opts = {}, hops = 0) {
    const full = url.startsWith('http') ? url : BASE + url;
    const res = await fetch(full, { ...opts, redirect: 'manual', headers: { 'User-Agent': UA, Cookie: this.cookieHeader(), ...(opts.headers || {}) } });
    this.absorb(res);
    if ([301, 302, 303, 307, 308].includes(res.status) && hops < 6 && opts.follow !== false) {
      const loc = res.headers.get('location'); await res.arrayBuffer();
      const next = new URL(loc, full).toString();
      const keep = [307, 308].includes(res.status);
      return this.request(next, keep ? opts : { headers: opts.headers, follow: opts.follow }, hops + 1);
    }
    return res;
  }
  async login() {
    const first = await this.request('/wp-login.php');
    await first.text();
    if (!this.jar.has('wordpress_test_cookie')) this.jar.set('wordpress_test_cookie', 'WP%20Cookie%20check');
    const form = new URLSearchParams({ log: WP_USER, pwd: WP_PASSWORD, 'wp-submit': 'Log In', redirect_to: `${BASE}/wp-admin/`, testcookie: '1' });
    const res = await this.request('/wp-login.php', { method: 'POST', body: form.toString(), headers: { 'Content-Type': 'application/x-www-form-urlencoded', Referer: `${BASE}/wp-login.php` } });
    const html = await res.text();
    const loggedIn = [...this.jar.keys()].some(k => k.startsWith('wordpress_logged_in_'));
    if (!loggedIn) { const err = (html.match(/<div id="login_error">([\s\S]*?)<\/div>/) || [, ''])[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); throw new Error('wp-login failed' + (err ? `: ${err.slice(0, 200)}` : ` (HTTP ${res.status}, no login cookie)`)); }
    log(`wp-admin login OK (HTTP ${res.status}).`);
  }
}

function htmlLinks(html) { const out = []; const re = /<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi; let m; while ((m = re.exec(html))) out.push({ href: m[1].replace(/&amp;/g, '&'), text: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() }); return out; }
function stripTags(html) { return html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }

async function installThemeViaAdmin(session) {
  const page = await session.request('/wp-admin/theme-install.php?browse=upload');
  const html = await page.text();
  const nonce = (html.match(/name="_wpnonce"\s+value="([^"]+)"/) || html.match(/id="_wpnonce"[^>]*value="([^"]+)"/) || [])[1];
  const action = (html.match(/<form[^>]*class="wp-upload-form"[^>]*action="([^"]+)"/) || [])[1] || `${BASE}/wp-admin/update.php?action=upload-theme`;
  if (!nonce) throw new Error(`Could not find the upload nonce on theme-install.php (HTTP ${page.status}).`);
  log('Upload form found on theme-install.php.');
  const fd = new FormData();
  fd.append('_wpnonce', nonce); fd.append('_wp_http_referer', '/wp-admin/theme-install.php?browse=upload');
  fd.append('themezip', new Blob([fs.readFileSync(zipArg)], { type: 'application/zip' }), path.basename(zipArg));
  fd.append('install-theme-submit', 'Install Now');
  let res = await session.request(action.replace(/&amp;/g, '&'), { method: 'POST', body: fd, headers: { Referer: `${BASE}/wp-admin/theme-install.php?browse=upload` } });
  let out = await res.text();
  let text = stripTags(out);
  log(`Upload POST -> HTTP ${res.status}: ${text.slice(0, 200)}`);
  let links = htmlLinks(out);
  const overwrite = links.find(l => /update-from-upload-overwrite/.test(out.slice(Math.max(0, out.indexOf(l.href) - 200), out.indexOf(l.href) + 50)) || /Replace current with uploaded/i.test(l.text));
  if (overwrite) {
    res = await session.request(overwrite.href, { headers: { Referer: `${BASE}/wp-admin/update.php` } }); out = await res.text(); text = stripTags(out); links = htmlLinks(out);
    log(`Overwrite (Replace current with uploaded) -> HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  if (/Fatal error|Parse error|Installation failed|The package could not be installed/i.test(text) && !/installed successfully|updated successfully/i.test(text)) throw new Error('Theme install failed: ' + text.slice(0, 300));
  let activate = links.find(l => /action=activate/.test(l.href) && new RegExp(`stylesheet=${THEME}(&|$)`).test(l.href));
  if (!activate) {
    // Fall back to the Themes screen, where the card carries the activate link.
    const themes = await session.request('/wp-admin/themes.php'); const th = await themes.text();
    const m = th.match(new RegExp(`(https?:[^"']*themes\\.php\\?action=activate[^"']*stylesheet=${THEME}[^"']*)`)) || th.match(new RegExp(`(themes\\.php\\?action=activate[^"']*stylesheet=${THEME}[^"']*)`));
    if (m) activate = { href: m[1].replace(/&amp;/g, '&').replace(/\\\//g, '/'), text: 'Activate' };
  }
  if (!activate) { warn('Upload finished but no Activate link found; check wp-admin -> Appearance -> Themes.'); return false; }
  const act = await session.request(activate.href.startsWith('http') ? activate.href : `/wp-admin/${activate.href.replace(/^\/?wp-admin\//, '')}`, { headers: { Referer: `${BASE}/wp-admin/themes.php` } });
  await act.text();
  log(`Activate -> HTTP ${act.status} (${act.url})`);
  return true;
}

async function flushHostCache(session) {
  const res = await session.request('/wp-admin/'); const html = await res.text();
  const links = htmlLinks(html).filter(l => /flush\s*cache|purge\s*cache|clear\s*cache/i.test(l.text) || /flush[_-]?cache|purge[_-]?cache/i.test(l.href));
  if (!links.length) { warn('No "Flush Cache" link found in wp-admin (GoDaddy Quick Links); flush the cache by hand from the admin bar.'); return false; }
  for (const l of links.slice(0, 2)) {
    const r = await session.request(l.href, { headers: { Referer: `${BASE}/wp-admin/` } }); const t = stripTags(await r.text());
    log(`Cache flush via "${l.text}" (${l.href.replace(/_wpnonce=[^&]+/, '_wpnonce=…')}) -> HTTP ${r.status}${/flushed|purged|cleared/i.test(t) ? ' (confirmed)' : ''}`);
  }
  return true;
}

/* ---------- pages ---------- */
async function findPage(slug, parentId) {
  const q = `/wp/v2/pages?slug=${encodeURIComponent(slug)}&status=any&per_page=20${parentId ? `&parent=${parentId}` : ''}`;
  const list = await api(q); return list.find(p => p.slug === slug && (parentId ? p.parent === parentId : p.parent === 0)) || list[0] || null;
}

async function upsertPages(themeActive) {
  const ids = {};
  for (const p of PLAN) {
    const parentId = p.parent ? ids[p.parent] : 0;
    const existing = await findPage(p.slug, parentId);
    const body = { title: p.title, slug: p.slug, status: 'publish', parent: parentId || 0, content: p.content || `<!-- Rendered by ${p.template} of the SVLS Labs theme -->` };
    // With the theme active, always send the template: '' clears a stale page-builder template left by the old theme.
    if (themeActive) body.template = p.template;
    if (DRY) { log(`[dry-run] ${existing ? `update page #${existing.id} (${existing.status}, template=${existing.template || '(default)'})` : 'create page'} /${p.parent ? p.parent + '/' : ''}${p.slug}/ template=${p.template || '(default)'}`); ids[p.slug] = existing ? existing.id : -1; continue; }
    let page;
    try { page = existing ? await api(`/wp/v2/pages/${existing.id}`, { method: 'POST', body: JSON.stringify(body) }) : await api('/wp/v2/pages', { method: 'POST', body: JSON.stringify(body) }); }
    catch (e) {
      if (e.status === 400 && /template/i.test(e.message)) { warn(`Template ${p.template} rejected for /${p.slug}/ (theme not active?). Saved without template.`); delete body.template; page = existing ? await api(`/wp/v2/pages/${existing.id}`, { method: 'POST', body: JSON.stringify(body) }) : await api('/wp/v2/pages', { method: 'POST', body: JSON.stringify(body) }); }
      else throw e;
    }
    ids[p.slug] = page.id; log(`${existing ? 'Updated' : 'Created'} page #${page.id} ${page.link} template=${page.template || '(default)'}`);
  }
  return ids;
}

async function setFrontPage(homeId) {
  if (DRY) { log('[dry-run] set static front page'); return; }
  try { const s = await api('/wp/v2/settings', { method: 'POST', body: JSON.stringify({ show_on_front: 'page', page_on_front: homeId, page_for_posts: 0, title: 'SVLS LABS', description: 'SAP, Cloud and Governed AI. Engineered to Spec.' }) }); log(`Front page set to #${s.page_on_front} (show_on_front=${s.show_on_front}).`); }
  catch (e) { warn('Could not set the static front page via REST (' + e.message + '). Set it in Settings -> Reading -> Your homepage displays: A static page -> Homepage: SVLS LABS.'); }
}

const PUBLIC = ['/', '/services/sap/', '/services/cloud/', '/services/ai/', '/products/value-lens/', '/products/sap-intelligence-suite/', '/approach/', '/about/', '/contact/', '/privacy/', '/terms/'];
async function verify() {
  const urls = [...PUBLIC, `/svls-deploy-check-${Date.now().toString(36)}/`];
  for (const p of urls) {
    const sep = p.includes('?') ? '&' : '?';
    try {
      const r = await fetch(`${BASE}${p}${sep}nocache=${Date.now()}`, { redirect: 'follow', headers: { 'User-Agent': UA, 'Cache-Control': 'no-cache' } }); const html = await r.text();
      const themed = /themes\/svls-labs\/assets\/css\/site\.css/.test(html);
      const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ''])[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
      const phpErr = (html.match(/<b>(Fatal error|Warning|Notice|Parse error|Deprecated)<\/b>:|(?:^|\n)(?:Fatal error|Warning|Notice|Parse error): /g) || []).length;
      const count = (re) => (html.match(re) || []).length;
      const row = { url: p, status: r.status, themed, h1, phpErrors: phpErr, titles: count(/<title[\s>]/g), canonicals: count(/<link[^>]+rel="canonical"/g), ogTitles: count(/property="og:title"/g), valueLensBeta: /Value Lens[\s\S]{0,400}Private beta/.test(html) };
      report.verify.push(row);
      log(`${r.status} ${p} themed=${themed} h1="${h1}" php-errors=${phpErr} title=${row.titles} canonical=${row.canonicals} og:title=${row.ogTitles}`);
      const is404 = p.startsWith('/svls-deploy-check');
      if (is404 ? (r.status !== 404 || !themed) : (r.status !== 200 || !themed)) warn(`${p} is not serving the new theme yet.`);
      if (phpErr) warn(`${p} shows PHP errors/warnings in the HTML.`);
    }
    catch (e) { warn(`${p}: ${e.message}`); }
  }
}

(async () => {
  let session = null;
  try {
    await preflight();
    let active = await themeStatus();
    if (active !== THEME && !SKIP_THEME && !DRY) {
      if (!WP_PASSWORD) warn('WP_PASSWORD not set: cannot upload the theme automatically. Upload wordpress-theme/svls-labs.zip via Appearance -> Themes -> Add New -> Upload Theme, activate it, then re-run this script.');
      else { session = new AdminSession(); await session.login(); const done = await installThemeViaAdmin(session); if (done) active = await themeStatus(); }
    }
    const themeActive = active === THEME;
    if (!themeActive) warn(`Theme "${THEME}" is not active; pages are created without templates and will render with the current theme until it is activated. Re-run after activation.`);
    const ids = await upsertPages(themeActive);
    if (ids.home && ids.home > 0) await setFrontPage(ids.home);
    if (!DRY && !SKIP_CACHE && WP_PASSWORD) { try { if (!session) { session = new AdminSession(); await session.login(); } await flushHostCache(session); } catch (e) { warn('Cache flush failed: ' + e.message); } }
    if (!DRY) await verify();
  } catch (e) { report.errors.push(e.message); console.error('ERROR ' + e.message); }
  fs.writeFileSync(path.resolve(__dirname, 'deploy-report.json'), JSON.stringify(report, null, 2));
  console.log('\nSummary: ' + report.steps.length + ' steps, ' + report.warnings.length + ' warnings, ' + report.errors.length + ' errors. Report: website/_tools/deploy-report.json');
  process.exit(report.errors.length ? 1 : 0);
})();
