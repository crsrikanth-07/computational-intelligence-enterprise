#!/usr/bin/env node
/**
 * Deploys the SVLS LABS site to the existing WordPress install (svlslabs.com).
 *
 * Environment (never hard-code, never print):
 *   WP_URL            e.g. https://svlslabs.com
 *   WP_USER           WordPress username
 *   WP_APP_PASSWORD   Application Password (Users -> Profile -> Application Passwords)
 *   WP_PASSWORD       optional: the account's login password, only used by a headless
 *                     browser to upload/activate the theme zip (the REST API cannot install themes)
 *
 * Usage:  node website/_tools/deploy-wp.js [--dry-run] [--skip-theme] [--zip path/to/svls-labs.zip]
 * Idempotent: re-running updates existing pages by slug instead of duplicating them.
 */
const fs = require('fs'); const path = require('path');
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run'); const SKIP_THEME = args.includes('--skip-theme');
const zipArg = args.indexOf('--zip') >= 0 ? args[args.indexOf('--zip') + 1] : path.resolve(__dirname, '../../wordpress-theme/svls-labs.zip');
const { WP_URL, WP_USER, WP_APP_PASSWORD, WP_PASSWORD } = process.env;
if (!WP_URL || !WP_USER || !WP_APP_PASSWORD) { console.error('Missing WP_URL / WP_USER / WP_APP_PASSWORD in the environment.'); process.exit(2); }
const BASE = WP_URL.replace(/\/+$/, '');
const AUTH = 'Basic ' + Buffer.from(`${WP_USER}:${WP_APP_PASSWORD.replace(/\s+/g, '')}`).toString('base64');
const THEME = 'svls-labs';
const report = { steps: [], warnings: [], errors: [] };
const log = (m) => { console.log(m); report.steps.push(m); };
const warn = (m) => { console.warn('WARN ' + m); report.warnings.push(m); };

async function api(p, opts = {}) {
  const res = await fetch(`${BASE}/wp-json${p}`, { ...opts, headers: { Authorization: AUTH, Accept: 'application/json', ...(opts.body && !(opts.body instanceof Buffer) ? { 'Content-Type': 'application/json' } : {}), ...(opts.headers || {}) } });
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
  const root = await fetch(`${BASE}/wp-json/wp/v2/`).then(r => r.status).catch(e => 'ERR ' + e.message);
  log(`REST API root: ${root}`);
  if (root !== 200) throw new Error('REST API not reachable (a security plugin may block /wp-json). Fix that first.');
  const me = await api('/wp/v2/users/me?context=edit');
  log(`Authenticated as user #${me.id} (${me.slug}); roles: ${(me.roles || []).join(',')}`);
  if (!(me.roles || []).includes('administrator')) warn('User is not an administrator; theme/settings steps may be refused.');
}

async function themeStatus() {
  try { const active = await api('/wp/v2/themes?status=active'); const st = active[0] && (active[0].stylesheet || active[0].slug); log(`Active theme: ${st}`); return st; }
  catch (e) { warn('Could not read active theme: ' + e.message); return null; }
}

async function installThemeViaBrowser() {
  if (!fs.existsSync(zipArg)) throw new Error(`Theme zip not found at ${zipArg}`);
  if (!WP_PASSWORD) { warn('WP_PASSWORD not set: cannot upload the theme automatically. Upload wordpress-theme/svls-labs.zip via Appearance -> Themes -> Add New -> Upload Theme, activate it, then re-run this script.'); return false; }
  let chromium; try { ({ chromium } = require('playwright')); } catch (e) { try { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); } catch (e2) { throw new Error('playwright not available for the theme upload'); } }
  const browser = await chromium.launch(); const page = await browser.newPage();
  try {
    await page.goto(`${BASE}/wp-login.php`, { waitUntil: 'domcontentloaded' });
    await page.fill('#user_login', WP_USER); await page.fill('#user_pass', WP_PASSWORD); await page.click('#wp-submit');
    await page.waitForURL(/wp-admin/, { timeout: 30000 });
    await page.goto(`${BASE}/wp-admin/theme-install.php?browse=upload`, { waitUntil: 'domcontentloaded' });
    await page.setInputFiles('input[name="themezip"]', zipArg);
    await page.click('#install-theme-submit');
    await page.waitForLoadState('networkidle');
    // Overwrite prompt (WP 5.5+): "Replace current with uploaded"
    const replace = page.locator('a.update-from-upload-overwrite, input[name="overwrite"], a:has-text("Replace")');
    if (await replace.count()) { await replace.first().click(); await page.waitForLoadState('networkidle'); }
    const activate = page.locator(`a[href*="action=activate"][href*="stylesheet=${THEME}"]`);
    if (await activate.count()) { await activate.first().click(); await page.waitForLoadState('networkidle'); log('Theme uploaded and activated via wp-admin.'); }
    else { warn('Upload finished but no Activate link found; check wp-admin -> Appearance -> Themes.'); }
    return true;
  } finally { await browser.close(); }
}

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
    if (themeActive && p.template) body.template = p.template;
    if (DRY) { log(`[dry-run] ${existing ? 'update' : 'create'} page /${p.parent ? p.parent + '/' : ''}${p.slug}/ template=${p.template || '(default)'}`); ids[p.slug] = existing ? existing.id : -1; continue; }
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
  try { const s = await api('/wp/v2/settings', { method: 'POST', body: JSON.stringify({ show_on_front: 'page', page_on_front: homeId, title: 'SVLS LABS', description: 'SAP, Cloud and Governed AI. Engineered to Spec.' }) }); log(`Front page set to #${s.page_on_front} (show_on_front=${s.show_on_front}).`); }
  catch (e) { warn('Could not set the static front page via REST (' + e.message + '). Set it in Settings -> Reading -> Your homepage displays: A static page -> Homepage: SVLS LABS.'); }
}

async function verify(ids) {
  const checks = [['/', 'home'], ['/services/sap/', 'sap'], ['/services/cloud/', 'cloud'], ['/services/ai/', 'ai'], ['/products/value-lens/', 'value-lens'], ['/products/sap-intelligence-suite/', 'sap-intelligence-suite'], ['/approach/', 'approach'], ['/about/', 'about'], ['/contact/', 'contact'], ['/privacy/', 'privacy'], ['/terms/', 'terms']];
  for (const [p] of checks) {
    try { const r = await fetch(BASE + p, { redirect: 'follow' }); const html = await r.text(); const themed = /themes\/svls-labs\/assets\/css\/site\.css/.test(html); const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ''])[1].replace(/<[^>]+>/g, '').trim().slice(0, 60); log(`${r.status} ${p} themed=${themed} h1="${h1}"`); if (r.status !== 200 || !themed) warn(`${p} is not serving the new theme yet.`); }
    catch (e) { warn(`${p}: ${e.message}`); }
  }
}

(async () => {
  try {
    await preflight();
    let active = await themeStatus();
    if (active !== THEME && !SKIP_THEME && !DRY) { const done = await installThemeViaBrowser(); if (done) active = await themeStatus(); }
    const themeActive = active === THEME;
    if (!themeActive) warn(`Theme "${THEME}" is not active; pages are created without templates and will render with the current theme until it is activated. Re-run after activation.`);
    const ids = await upsertPages(themeActive);
    if (ids.home && ids.home > 0) await setFrontPage(ids.home);
    if (!DRY) await verify(ids);
  } catch (e) { report.errors.push(e.message); console.error('ERROR ' + e.message); }
  fs.writeFileSync(path.resolve(__dirname, 'deploy-report.json'), JSON.stringify(report, null, 2));
  console.log('\nSummary: ' + report.steps.length + ' steps, ' + report.warnings.length + ' warnings, ' + report.errors.length + ' errors. Report: website/_tools/deploy-report.json');
  process.exit(report.errors.length ? 1 : 0);
})();
