# Deployment report: svlslabs.com (WordPress, option C)

Date: 2026-09-26. Run from a Claude Code cloud session on branch `claude/svls-labs-website-redesign-33sphq`.

## Result

**The live site was NOT changed.** The session's permission policy blocked the production deployment command (`node website/_tools/deploy-wp.js`, classified "Production Deploy") and I did not attempt to route around it. Everything up to that point ran and passed, and the deployment script was fixed so that it no longer needs a headless browser. One command, run by a person with the four environment variables set, completes the deployment:

```
node website/_tools/deploy-wp.js
```

Status line: `DEPLOY: theme=failed (blocked, not attempted); pages=0/13; front=manual; cache=manual; live=issues: production deploy denied by session permission policy, site unchanged`

## What ran (read-only, all passed)

| Step | Result |
| --- | --- |
| `GET /wp-json/wp/v2/` | 200 (REST API reachable) |
| `GET /wp/v2/users/me?context=edit` with the Application Password | user #2, roles `administrator` |
| Active theme (`/wp/v2/themes?status=active`) | `Divi` 4.27.9 |
| Installed themes | Divi, di-multipurpose, go, twentynineteen, twentyseventeen, twentysixteen, twentytwenty, twentytwentyone, twentytwentytwo, twentytwentythree, twentytwentyfive |
| Front page setting | `show_on_front=page`, `page_on_front=604` ("Home-Divi", slug `604-2`) |
| Permalinks | pretty (`/our-products-and-services/`), so nested URLs will resolve |
| `wordpress-theme/svls-labs.zip` vs `wordpress-theme/svls-labs/` | identical (78 files, `svls-labs/` at the zip root) |
| `php -l` on every theme template (PHP 8.4) | no syntax errors |
| `node website/_tools/deploy-wp.js --dry-run` | 17 steps, 0 errors, 1 expected warning (theme not active yet) |
| Live homepage source (current Divi site) | 1 `<title>`, 1 canonical, 0 `og:title`, WordPress 7.1.2, Cloudflare in front |

### Dry-run page plan (what the script will do)

| URL | Action | Existing page | Template |
| --- | --- | --- | --- |
| `/` (`home`) | update #11 (published, currently `template-full-width-page-builder.php`, cleared) | yes | `front-page.php` via Settings -> Reading |
| `/services/` | update #15 (draft -> publish) | yes | default |
| `/services/sap/` | create | no | `page-services-sap.php` |
| `/services/cloud/` | create | no | `page-services-cloud.php` |
| `/services/ai/` | create | no | `page-services-ai.php` |
| `/products/` | create | no | default |
| `/products/value-lens/` | create | no | `page-products-value-lens.php` |
| `/products/sap-intelligence-suite/` | create | no | `page-products-sap-intelligence-suite.php` |
| `/approach/` | create | no | `page-approach.php` |
| `/about/` | create | no | `page-about.php` |
| `/contact/` | update #17 (draft -> publish) | yes | `page-contact.php` |
| `/privacy/` | create | no | `page-privacy.php` |
| `/terms/` | create | no | `page-terms.php` |

The old pages are untouched by the plan: `about-us-2`, `contact-us`, `privacy-policy-2`, `terms-and-conditions`, `our-products-and-services`, `cancellation-and-refund-policy` and the current front page #604 keep their URLs (#604 moves from `/` to `/604-2/` once the front page changes). No page and no plugin is deleted.

## What was blocked, and why

1. **Headless browser against the live site.** Playwright's Chromium in this container does not trust the session's TLS-inspecting egress proxy (`net::ERR_CERT_AUTHORITY_INVALID`). The two ways to make it trust the proxy CA (installing `certutil` to add the CA to the browser store, or pinning that CA's public key with a Chromium flag) were both denied by the session policy as TLS weakening. Node's `fetch` verifies TLS correctly through the configured CA bundle, so the script was rewritten to drive wp-admin with plain HTTPS requests instead of a browser (see below). No live screenshots could be taken for the same reason; `website/_tools/live-shots/` is therefore empty.
2. **The deployment run.** `node website/_tools/deploy-wp.js` was denied as a production deploy. Not attempted again by any other route.

## Script change (`website/_tools/deploy-wp.js`)

- The theme upload no longer uses Playwright. `AdminSession` logs in at `wp-login.php` with `WP_PASSWORD` (cookie jar in memory, nothing written), posts `svls-labs.zip` to `update.php?action=upload-theme` with the page nonce, follows "Replace current with uploaded" if WordPress reports the theme already exists, and follows the `themes.php?action=activate&stylesheet=svls-labs` link. These are exactly the requests a browser sends for Appearance -> Themes -> Upload -> Activate.
- New step: after activation and the page updates, it opens `/wp-admin/` in the same session and follows the admin-bar "Flush Cache" link (GoDaddy Quick Links); `--skip-cache` disables it. If no such link is found it warns and the cache is flushed by hand.
- With the theme active, the page template is always sent, so `''` clears the stale page-builder template on the existing `home` page (#11).
- Verification now also fetches a random 404 URL, bypasses the page cache with a query string, counts `<title>`, canonical and `og:title` tags, looks for PHP errors/warnings in the HTML, and checks that the Products menu carries "Value Lens" with the "Private beta" label. Rows go to `website/_tools/deploy-report.json` under `verify`.
- Nothing secret is printed or written; the report file carries only statuses, URLs, ids and the account slug (it is not committed).

## Plugins found on the site (nothing changed)

Active: athemes-starter-sites, click-to-chat-for-whatsapp, contact-form-7, di-multipurpose-demo-importer, everest-forms, ga-google-analytics, jetpack, page-builder-add, regenerate-thumbnails, search-engine-visibility (GoDaddy), simple-divi-shortcode, sydney-toolbox, wpforms-lite, free-sales-funnel-squeeze-pages-landing-page-builder-templates-make.
Inactive: akismet, clicky-analytics, coblocks, elementor, gravityforms, hotjar, PluginOps-Extensions-Pack, post-grid-elementor-addon, wp-whatsapp-chat, sucuri-scanner, thrive-visual-editor, thrive-product-manager, wp-auto-content, wp-reset.

Observed on the live homepage today and expected to carry over to the new theme until deactivated: the Click to Chat WhatsApp button (a floating widget the new design does not include), the Google Analytics `gtag` snippet, and the Contact Form 7, Everest Forms and Sydney Toolbox CSS/JS on every page. Jetpack is active but is not printing Open Graph tags (0 `og:title` today), so the theme's own tags should not be duplicated. No SEO or caching plugin (Yoast, Rank Math, Autoptimize, WP Rocket, LiteSpeed) is installed; page caching is the GoDaddy/Cloudflare layer.

## Per-URL verification

Not performed: the theme is not deployed. The script prints and records this table on the real run (status, served by `svls-labs`, H1, PHP errors, tag counts, Value Lens "Private beta" label). Screenshots (1440x900 and 390x844, full page, for `/`, `/services/ai/`, `/products/value-lens/`) still need a browser that can reach the live site; take them from a normal desktop browser or a Playwright run outside this container.

## What to do next

1. **Run the deployment** (a person, or a session where the production deploy is allowed): with `WP_URL`, `WP_USER`, `WP_APP_PASSWORD`, `WP_PASSWORD` set, run `node website/_tools/deploy-wp.js`. Expect: login OK, upload, activate, 13 pages created/updated, front page set to the `home` page, cache flushed, verification rows all `200 ... themed=true` and the check URL `404 ... themed=true`. If the upload step fails, upload `wordpress-theme/svls-labs.zip` by hand (Appearance -> Themes -> Add New -> Upload Theme, "Replace current with uploaded" if asked, Activate "SVLS Labs") and re-run with `--skip-theme`.
2. **Flush the GoDaddy cache** if the script reports no "Flush Cache" link: wp-admin admin bar -> GoDaddy Quick Links -> Flush Cache (and purge Cloudflare if the site is proxied there).
3. **Verify** per `DEPLOY.md` A.6 and take the screenshots listed above; put them under `website/_tools/live-shots/`.
4. **Rollback** if a page is blank or fatal: Appearance -> Themes -> activate Divi; the old pages are still there and #604 can be set back as the front page under Settings -> Reading.
5. **Client TODOs before announcing** (`DEPLOY.md` section D): replace `TODO_FORM_ID` with the Formspree form id in the four forms, confirm the `hello@svlslabs.com` mailbox and phone number, confirm the registered address, complete the Privacy and Terms sections with counsel.
6. **Rotate credentials**: change the WordPress password of the deploy account and delete/recreate the "deploy" Application Password (Users -> Profile -> Application Passwords) once the deployment is done.
7. **Optionally deactivate** the old page-builder and widget plugins after the new site is verified (Divi Builder shortcode plugin, page-builder-add, athemes-starter-sites, di-multipurpose-demo-importer, sydney-toolbox, the sales-funnel plugin, Click to Chat, Everest Forms / WPForms / Contact Form 7 if no longer used). Deactivate first, verify every page, delete later. Keep Divi installed until the rollback window is over.
