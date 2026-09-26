#!/usr/bin/env node
/**
 * Drives wp-admin with the pre-installed Chromium (Playwright) for the steps the REST API cannot do and that a
 * plain HTTPS session cannot reach when Cloudflare puts a JavaScript challenge in front of wp-login.php.
 *
 * Environment (never hard-coded, never printed): WP_URL, WP_USER, WP_PASSWORD, optional HTTPS_PROXY.
 *
 * Usage:
 *   node website/_tools/wp-admin-browser.js install [--zip path]   upload wordpress-theme/svls-labs.zip, replace if present, activate
 *   node website/_tools/wp-admin-browser.js flush                  follow the admin-bar "Flush Cache" link (GoDaddy)
 *   node website/_tools/wp-admin-browser.js activate <stylesheet>  activate an installed theme (rollback helper, e.g. Divi)
 *   node website/_tools/wp-admin-browser.js shots <outdir>         full-page screenshots of the public pages (no login)
 *
 * The script stops (exit 3) if the login form shows a CAPTCHA or if the Cloudflare challenge does not clear on its
 * own within 45 s; it never tries to solve either. Screenshots of admin screens go to the scratch dir given by
 * WP_SHOTS_DIR (default: none).
 */
const fs = require('fs'); const path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const [mode = 'install', ...rest] = process.argv.slice(2);
const zipArg = rest.indexOf('--zip') >= 0 ? rest[rest.indexOf('--zip') + 1] : path.resolve(__dirname, '../../wordpress-theme/svls-labs.zip');
const { WP_URL, WP_USER, WP_PASSWORD } = process.env;
if (!WP_URL) { console.error('Missing WP_URL'); process.exit(2); }
const BASE = WP_URL.replace(/\/+$/, '');
const THEME = 'svls-labs';
const SHOTS = process.env.WP_SHOTS_DIR || '';
const log = (m) => console.log(m);
let shotN = 0;
async function shot(page, name) { if (!SHOTS) return; fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `${String(++shotN).padStart(2, '0')}-${name}.png`), fullPage: false }).catch(() => {}); }

async function launch() {
  const browser = await chromium.launch({ headless: true, proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
  return { browser, context, page: await context.newPage() };
}

async function isChallenge(page) { const t = await page.title().catch(() => ''); return /just a moment|attention required|checking your browser/i.test(t) || (await page.locator('#challenge-running, #challenge-stage, #cf-chl-widget, .cf-turnstile').count()) > 0; }
async function waitChallenge(page, ms = 45000) {
  const t0 = Date.now();
  while (await isChallenge(page)) {
    if (Date.now() - t0 > ms) return false;
    await page.waitForTimeout(1500);
  }
  return true;
}

async function login(page) {
  if (!WP_USER || !WP_PASSWORD) throw new Error('WP_USER / WP_PASSWORD not set');
  await page.goto(`${BASE}/wp-login.php`, { waitUntil: 'domcontentloaded' });
  if (!(await waitChallenge(page))) throw Object.assign(new Error('Cloudflare challenge on wp-login.php did not clear; stopping (not attempting to bypass it).'), { code: 3 });
  const captcha = page.locator('.wpsec_captcha_wrapper');
  if ((await captcha.count()) && await captcha.first().isVisible()) { await shot(page, 'login-captcha'); throw Object.assign(new Error('The login form shows a CAPTCHA (GoDaddy wpsec); a person must log in once from a browser to clear it. Stopping.'), { code: 3 }); }
  await page.fill('#user_login', WP_USER);
  await page.fill('#user_pass', WP_PASSWORD);
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {}), page.click('#wp-submit')]);
  if (!(await waitChallenge(page))) { await shot(page, 'login-challenge'); throw Object.assign(new Error('Cloudflare challenge after the login POST did not clear within 45 s; stopping (not attempting to bypass it).'), { code: 3 }); }
  // After a cleared challenge Cloudflare replays the POST; give WordPress a moment to land on /wp-admin/.
  for (let i = 0; i < 20 && !/\/wp-admin\//.test(page.url()); i++) await page.waitForTimeout(1000);
  if (!/\/wp-admin\//.test(page.url())) {
    const err = await page.locator('#login_error').textContent().catch(() => '');
    await shot(page, 'login-failed');
    throw new Error(`wp-admin login failed (landed on ${page.url().replace(BASE, '')})${err ? ': ' + err.replace(/\s+/g, ' ').trim().slice(0, 200) : ''}`);
  }
  await page.waitForSelector('#wpadminbar', { timeout: 30000 });
  log(`wp-admin login OK (${page.url().replace(BASE, '')}).`);
  await shot(page, 'dashboard');
}

function adminUrl(href) { return href.startsWith('http') ? href : `${BASE}/wp-admin/${href.replace(/^\/?wp-admin\//, '')}`; }

async function install(page) {
  if (!fs.existsSync(zipArg)) throw new Error(`Theme zip not found at ${zipArg}`);
  await page.goto(`${BASE}/wp-admin/theme-install.php?browse=upload`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[name="themezip"]', { timeout: 30000 });
  await page.setInputFiles('input[name="themezip"]', zipArg);
  log(`Upload form found; sending ${path.basename(zipArg)} (${(fs.statSync(zipArg).size / 1024).toFixed(0)} KB).`);
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 180000 }), page.click('#install-theme-submit')]);
  await waitChallenge(page, 30000);
  let text = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
  log(`Upload result: ${text.slice(0, 220)}`);
  await shot(page, 'upload-result');
  const replace = page.locator('a.update-from-upload-overwrite, a:has-text("Replace current with uploaded")');
  if (await replace.count()) {
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 180000 }), replace.first().click()]);
    await waitChallenge(page, 30000);
    text = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    log(`Replace current with uploaded: ${text.slice(0, 220)}`);
    await shot(page, 'replace-result');
  }
  if (/could not be installed|Installation failed|Parse error|Fatal error/i.test(text) && !/installed successfully|updated successfully|Theme updated/i.test(text)) throw new Error('Theme install failed: ' + text.slice(0, 300));
  let act = page.locator(`a[href*="action=activate"][href*="stylesheet=${THEME}"]`);
  if (!(await act.count())) { await page.goto(`${BASE}/wp-admin/themes.php`, { waitUntil: 'domcontentloaded' }); act = page.locator(`a[href*="action=activate"][href*="stylesheet=${THEME}"]`); }
  if (!(await act.count())) throw new Error('Upload finished but no Activate link for svls-labs was found on the result page or on themes.php.');
  const href = await act.first().getAttribute('href');
  await page.goto(adminUrl(href), { waitUntil: 'domcontentloaded' });
  await waitChallenge(page, 30000);
  await page.goto(`${BASE}/wp-admin/themes.php`, { waitUntil: 'domcontentloaded' });
  const activeCard = page.locator(`.theme.active[data-slug="${THEME}"], .theme.active:has(.theme-name:has-text("SVLS"))`);
  const ok = (await activeCard.count()) > 0;
  await shot(page, 'themes');
  log(`Activate ${THEME}: ${ok ? 'active on themes.php' : 'NOT shown as active on themes.php'}`);
  return ok;
}

async function activate(page, stylesheet) {
  await page.goto(`${BASE}/wp-admin/themes.php`, { waitUntil: 'domcontentloaded' });
  const act = page.locator(`a[href*="action=activate"][href*="stylesheet=${stylesheet}"]`);
  if (!(await act.count())) throw new Error(`No Activate link for "${stylesheet}" on themes.php (already active, or not installed).`);
  await page.goto(adminUrl(await act.first().getAttribute('href')), { waitUntil: 'domcontentloaded' });
  await page.goto(`${BASE}/wp-admin/themes.php`, { waitUntil: 'domcontentloaded' });
  const ok = (await page.locator(`.theme.active[data-slug="${stylesheet}"]`).count()) > 0;
  log(`Activate ${stylesheet}: ${ok ? 'active' : 'not confirmed'}`);
  return ok;
}

async function flush(page) {
  await page.goto(`${BASE}/wp-admin/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#wpadminbar', { timeout: 30000 });
  const links = await page.locator('#wpadminbar a, .notice a, a.button').evaluateAll(as => as.map(a => ({ href: a.href, text: (a.textContent || '').replace(/\s+/g, ' ').trim() })));
  const hits = links.filter(l => /flush\s*cache|purge\s*cache|clear\s*cache/i.test(l.text) || /flush[_-]?cache|purge[_-]?cache|wpaas.*cache|godaddy.*cache/i.test(l.href));
  if (!hits.length) { log('No Flush Cache link found in the admin bar.'); await shot(page, 'admin-no-flush'); return false; }
  for (const l of hits.slice(0, 2)) {
    await page.goto(l.href, { waitUntil: 'domcontentloaded' });
    const t = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ');
    log(`Cache flush via "${l.text}" (${l.href.replace(BASE, '').replace(/_wpnonce=[^&]+/, '_wpnonce=…')}) -> ${page.url().replace(BASE, '').replace(/_wpnonce=[^&]+/, '_wpnonce=…')}${/flushed|purged|cleared/i.test(t) ? ' (confirmed)' : ''}`);
  }
  await shot(page, 'after-flush');
  return true;
}

async function shots(page, outdir) {
  const pages = ['/', '/services/ai/', '/products/value-lens/'];
  fs.mkdirSync(outdir, { recursive: true });
  for (const vp of [{ w: 1440, h: 900, tag: 'desktop' }, { w: 390, h: 844, tag: 'mobile' }]) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    for (const p of pages) {
      await page.goto(`${BASE}${p}?nocache=${Date.now()}`, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
      const name = (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '-')) + `-${vp.tag}.png`;
      await page.screenshot({ path: path.join(outdir, name), fullPage: true });
      log(`shot ${name}`);
    }
  }
}

(async () => {
  const { browser, page } = await launch();
  let code = 0;
  try {
    if (mode === 'shots') { await shots(page, rest[0] || path.resolve(__dirname, 'live-shots')); }
    else {
      await login(page);
      if (mode === 'install') { if (!(await install(page))) code = 1; }
      else if (mode === 'flush') { if (!(await flush(page))) code = 1; }
      else if (mode === 'activate') { if (!(await activate(page, rest[0]))) code = 1; }
      else throw new Error(`Unknown mode ${mode}`);
    }
  } catch (e) { console.error('ERROR ' + e.message.split('\n')[0]); code = e.code || 1; }
  await browser.close();
  process.exit(code);
})();
