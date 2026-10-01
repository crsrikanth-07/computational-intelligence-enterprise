# Deployment report: svlslabs.com (WordPress, option C)

Date: 2026-09-26, 19:40-19:53 UTC. Run from a Claude Code cloud session on branch `claude/svls-labs-website-redesign-33sphq`.

## Result

**The new SVLS LABS site is live on svlslabs.com.** The `svls-labs` theme (v1.0.0) is the active theme, the 13 pages exist with their templates, the static front page is the new `home` page (#11), and every public URL plus a random 404 URL is served by the new theme with no PHP errors, both with and without a cache-busting query string.

Status line: `DEPLOY: theme=active (uploaded by hand, Cloudflare Turnstile blocks scripted wp-admin login); pages=13/13 ok; front=ok; cache=manual (not needed: every URL served the new theme without a flush); live=all ok`

A follow-up run the same evening (see "Follow-up run" below) drafted the six superseded Divi pages, deactivated six leftover plugins, added 301 redirects to the theme for the next upload, and revoked the deploy Application Password.

## What ran

| Step | Result |
| --- | --- |
| `node website/_tools/deploy-wp.js --dry-run` | 17 steps, 0 errors, 1 expected warning (theme not active yet) |
| `node website/_tools/deploy-wp.js` (full run) | **stopped at the theme step**: `wp-login failed (HTTP 403, no login cookie)`. Nothing was changed. |
| Diagnosis of the 403 | Cloudflare answers every POST to `wp-login.php` with a challenge (`cf-mitigated: challenge`), whatever the User-Agent. With a real headless Chromium session the challenge is an interactive Turnstile checkbox ("Verify you are human"). The session did not attempt to solve or bypass it. The GoDaddy `wpsec` login CAPTCHA is present in the form but hidden until failed attempts, so it was not the blocker. |
| Theme upload and activation | **Done by the client in wp-admin** (Appearance -> Themes -> Upload Theme -> Activate). The session polled `/wp/v2/themes` and saw `svls-labs` appear at 19:49 UTC and become active at 19:50 UTC. |
| `node website/_tools/deploy-wp.js --skip-theme --skip-cache` | 29 steps, 0 warnings, 0 errors (see the page table below) |
| Independent verification (plain HTTPS, browser User-Agent, with and without `?nocache=`) | all 12 URLs served by `svls-labs`, no Divi markup, no PHP errors (table below) |
| Live screenshots (headless Chromium, 1440x900 and 390x844, full page) | `website/_tools/live-shots/` (home, /services/ai/, /products/value-lens/) |

## Pages created or updated

| URL | Page | Action | Template |
| --- | --- | --- | --- |
| `/` | #11 `home` | updated (stale `template-full-width-page-builder.php` cleared), set as static front page | `front-page.php` |
| `/services/` | #15 | updated, draft -> publish | default |
| `/services/sap/` | #1158 | created | `page-services-sap.php` |
| `/services/cloud/` | #1159 | created | `page-services-cloud.php` |
| `/services/ai/` | #1160 | created | `page-services-ai.php` |
| `/products/` | #1161 | created | default |
| `/products/value-lens/` | #1162 | created | `page-products-value-lens.php` |
| `/products/sap-intelligence-suite/` | #1163 | created | `page-products-sap-intelligence-suite.php` |
| `/approach/` | #1164 | created | `page-approach.php` |
| `/about/` | #1165 | created | `page-about.php` |
| `/contact/` | #17 | updated, draft -> publish | `page-contact.php` |
| `/privacy/` | #1167 | created | `page-privacy.php` |
| `/terms/` | #1168 | created | `page-terms.php` |

Settings (`/wp/v2/settings`): `show_on_front=page`, `page_on_front=11`, site title `SVLS LABS`, tagline `SAP, Cloud and Governed AI. Engineered to Spec.`

## Per-URL verification (live, 19:52 UTC)

`themed` = HTML references `wp-content/themes/svls-labs`; `css` = `<head>` links `assets/css/site.css` and `assets/css/theme.css`; tag counts are for `<head>` only (extra `<title>` elements inside inline SVG icons are excluded). Results were identical with and without the cache-busting query string.

| URL | Status | themed | Divi markup | css | H1 | PHP errors | title / canonical / og:title | Products menu |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 200 | yes | no | yes | SAP, Cloud and Governed AI. Engineered to Spec. | 0 | 1 / 1 / 1 | Value Lens, Private beta |
| `/services/sap/` | 200 | yes | no | yes | S/4HANA, BTP and Integration Suite, Delivered Clean Core from the First Transport | 0 | 1 / 1 / 1 | Value Lens, Private beta |
| `/services/cloud/` | 200 | yes | no | yes | Cloud Around the SAP Core, with the Ledger Intact. | 0 | 1 / 1 / 1 | Value Lens, Private beta |
| `/services/ai/` | 200 | yes | no | yes | Agents Explain. Humans Decide. SAP Stays the System of Record. | 0 | 1 / 1 / 1 | Value Lens, Private beta |
| `/products/value-lens/` | 200 | yes | no | yes | Value Lens (Private beta) | 0 | 1 / 1 / 1 | Value Lens, Private beta |
| `/products/sap-intelligence-suite/` | 200 | yes | no | yes | SAP Intelligence Suite. SAP Engineering in Plain English. | 0 | 1 / 1 / 1 | Value Lens, Private beta |
| `/approach/` | 200 | yes | no | yes | TOGAF Discipline. Clean Core by Default. Quality Gates You Can Inspect. | 0 | 1 / 1 / 1 | Value Lens, Private beta |
| `/about/` | 200 | yes | no | yes | A Specialist SAP Engineering Firm That Would Rather Show You Evidence than a Deck | 0 | 1 / 1 / 1 | Value Lens, Private beta |
| `/contact/` | 200 | yes | no | yes | Talk to an Architect. | 0 | 1 / 1 / 1 | Value Lens, Private beta |
| `/privacy/` | 200 | yes | no | yes | Privacy Policy | 0 | 1 / 1 / 1 | Value Lens, Private beta |
| `/terms/` | 200 | yes | no | yes | Terms of Use | 0 | 1 / 1 / 1 | Value Lens, Private beta |
| `/no-such-page-4lfpqx/` (random) | 404 | yes | no | yes | Nothing Here Has Been Measured. | 0 | 1 / 1 / 1 | Value Lens, Private beta |

Assets: `/wp-content/themes/svls-labs/assets/css/site.css` 200 (56,507 bytes, text/css), `/wp-content/themes/svls-labs/assets/css/theme.css` 200 (49,478 bytes), `/wp-content/themes/svls-labs/style.css` 200.

Cache: the GoDaddy page cache and Cloudflare served the new theme immediately (`cf-cache-status: MISS` on the first uncached fetch, `DYNAMIC` with a query string), so no manual flush was needed. The script's automatic "Flush Cache" step cannot run because it needs the same wp-admin login that Cloudflare challenges; if a stale page ever shows up, use the admin-bar GoDaddy Quick Links -> Flush Cache.

## Old pages (untouched, still published)

`/604-2/` (the old Divi "Home-Divi" page, moved off `/`), `/about-us-2/`, `/contact-us/`, `/privacy-policy-2/`, `/terms-and-conditions/`, `/our-products-and-services/` and `/cancellation-and-refund-policy/` all still return 200. They now render inside the new theme with their old Divi content (the Divi Builder shortcodes are still expanded by the "Simple Divi Shortcode" plugin while it is active). Nothing was deleted. Recommended: set these to Draft, or redirect them to the new URLs, once the new site is confirmed (see below). `/home/` redirects 301 to `/` as expected for the front page.

## Plugins (nothing changed)

Active: athemes-starter-sites, click-to-chat-for-whatsapp, contact-form-7, di-multipurpose-demo-importer, everest-forms, ga-google-analytics, jetpack, page-builder-add, regenerate-thumbnails, search-engine-visibility (GoDaddy), simple-divi-shortcode, sydney-toolbox, wpforms-lite, free-sales-funnel-squeeze-pages-landing-page-builder-templates-make.
Inactive: akismet, clicky-analytics, coblocks, elementor, gravityforms, hotjar, PluginOps-Extensions-Pack, post-grid-elementor-addon, wp-whatsapp-chat, sucuri-scanner, thrive-visual-editor, thrive-product-manager, wp-auto-content, wp-reset.

Still carried over from the old site until deactivated: the Click to Chat WhatsApp floating button (visible bottom-left in the live screenshots), the Google Analytics `gtag` snippet, and the Contact Form 7 / Everest Forms / Sydney Toolbox CSS and JS on every page. Divi stays installed (inactive) for rollback.

## Tooling added in this session

- `website/_tools/wp-admin-browser.js`: drives wp-admin with the pre-installed Chromium (Playwright) for `install` (upload + activate the theme zip), `flush` (admin-bar Flush Cache), `activate <stylesheet>` (rollback helper) and `shots <dir>` (public-page screenshots, no login). It stops with exit code 3 if the login shows a CAPTCHA or if the Cloudflare challenge does not clear on its own within 45 s; it never attempts to solve either. On this site the challenge is an interactive Turnstile checkbox, so only the `shots` mode was usable; the other modes work on sites without a login challenge.
- For Chromium to verify TLS through the session's egress proxy, the proxy's CA certificates (already in the system store) had to be added to the browser NSS store with `certutil` (`libnss3-tools`). No TLS verification was disabled.

## Follow-up run (20:00-20:05 UTC, approved by the client)

| Change | Result |
| --- | --- |
| Old Divi pages #604 (`/604-2/`), #625 (`/about-us-2/`), #684 (`/contact-us/`), #918 (`/privacy-policy-2/`), #923 (`/terms-and-conditions/`), #981 (`/our-products-and-services/`) | set to **Draft** via REST (reversible: Pages -> Drafts -> Publish). Their URLs now return the theme's branded 404. `/cancellation-and-refund-policy/` (#960) has no replacement and **stays published** (payment providers usually require it). |
| 301 redirects for those six URLs (`/604-2/` -> `/`, `/about-us-2/` -> `/about/`, `/contact-us/` -> `/contact/`, `/privacy-policy-2/` -> `/privacy/`, `/terms-and-conditions/` -> `/terms/`, `/our-products-and-services/` -> `/services/`) | added to the theme (`functions.php`, `template_redirect`; also in the generator `website/_tools/make-wp-theme.js`) and `wordpress-theme/svls-labs.zip` was rebuilt (`php -l` clean). **They go live with the next theme upload** (Appearance -> Themes -> Upload Theme -> Replace current with uploaded), which the form id needs anyway. Until then the old URLs are 404s. |
| Plugins deactivated via REST (`/wp/v2/plugins`) | athemes-starter-sites, di-multipurpose-demo-importer, page-builder-add, simple-divi-shortcode, sydney-toolbox, free-sales-funnel-squeeze-pages-landing-page-builder-templates-make. All six were companions of the old themes with no function on the new site; Sydney Toolbox's CSS no longer loads on any page. Reversible under Plugins -> Inactive -> Activate. |
| Plugins left active on purpose | click-to-chat-for-whatsapp (the WhatsApp button is a business channel; deactivate if the new design should not show it), contact-form-7, everest-forms, wpforms-lite (unused by the new theme; the forms now post to the theme's own handler), ga-google-analytics, jetpack, regenerate-thumbnails, search-engine-visibility. |
| Re-verification after the changes | all 11 pages 200, themed, no PHP errors, 1/1/1 head tags, menu label intact; random URL 404 themed; theme CSS 200; the six old URLs 404 (themed); refund page 200. |
| "Claude deploy" Application Password | **revoked** by the session itself (`DELETE /wp/v2/users/me/application-passwords/<uuid>`); a request with it now gets 401. The script cannot reach the site until a new one is created. |

## Post-upload check (26 September 2026, 20:50 UTC)

The client uploaded the theme rebuilt after the TODO batch. Checked from this session over HTTPS:

| Check | Result |
|---|---|
| 13 pages + 404 | 200 (404 for the missing path), latest theme, no lowercase "SVLS Labs", no TODO, phone and mailbox present, one meta description per page |
| Console errors, failed requests, broken links, mobile overflow | none on any page (Playwright, 1440 and 390 px) |
| Forms | handler answers 400 to the honeypot and to a missing email; one real test submission to the contact form returned {"ok":true} (wp_mail accepted it; the client confirms arrival at service@svlslabs.com) |
| PDFs | both served as application/pdf from the theme's downloads folder |
| Redirects | /about-us-2/, /contact-us/ 301 to the new pages; www and http 301 to https://svlslabs.com/ |
| Sitemap | /wp-sitemap.xml lists the 13 pages plus /services/, /products/ and the old /cancellation-and-refund-policy/; /sitemap.xml (old plugin) is empty; robots.txt had no Sitemap line |

Anomalies found and what was done:

1. **Old site icon** (the previous ChatGPT-generated logo, set under Customizer -> Site Identity) was still printed by WordPress after the theme's own icons. The theme now removes that output (`remove_action( 'wp_head', 'wp_site_icon', 99 )`). The client should also replace the Site Icon in the Customizer so wp-admin and the login page show the new mark.
2. **/services/ and /products/** (the parent pages) rendered as a bare title with one line of links. `page.php` now renders them as hub pages with one card per practice or product (`svls_hub()` in functions.php).
3. **/cancellation-and-refund-policy/** is still published from the old site and printed raw Divi shortcodes. The theme now strips Divi shortcodes from any leftover page, but the text itself is generic shop wording ("Thank you for shopping at SVLS LABS"). Client decision: draft it (Pages -> Quick Edit -> Status: Draft) or ask for a refund clause in /terms/ if a payment provider requires one.
4. **Plugins from the old site still load on every page**: Click to Chat (green WhatsApp button bottom-left, which overlaps the hero copy on phones), Contact Form 7 and Everest Forms (scripts and styles, unused), Jetpack (jQuery and jquery-migrate from wp.com, stats script). Client decision; see the list below.
5. **/favicon.ico** returns the host's 404 (GoDaddy answers missing static files before WordPress, and Cloudflare cached that 404 for 31 days). Browsers use the theme's icon links, so this is cosmetic. `favicon.ico` is now in the theme root; copying it to the web root through GoDaddy's file manager and purging the Cloudflare cache would close it.
6. **robots.txt** is a physical file at the web root (GoDaddy default: "User-Agent: *, Disallow:"), served before WordPress, so the theme's `robots_txt` filter (which adds the Sitemap line) never runs. Fix from GoDaddy's file manager: delete that file so WordPress serves its own robots.txt with the Sitemap line, or add `Sitemap: https://svlslabs.com/wp-sitemap.xml` to it. Alternatively submit the sitemap in Google Search Console.

## What to do next (client)

1. ~~Upload the rebuilt theme zip~~ Done 26 September 2026, 21:05 UTC: verified live (old site icon gone, hub pages render, refund page cleaned).
2. ~~Deactivate the old plugins~~ Done 26 September 2026, 21:12 UTC: Contact Form 7, Everest Forms, WPForms Lite and Click to Chat are deactivated (verified: no plugin scripts, no jQuery, no WhatsApp button; homepage on a phone is 18 requests, about 144 KB). Jetpack stays active (stats script and two wp.com stylesheets). **GA Google Analytics was deactivated in the same pass**, so the gtag no longer loads: reactivate it, or accept no analytics and remove the Google Analytics sentence from /privacy/. Delete the inactive plugins and unused themes after the rollback window; keep Divi installed until then.
3. **Draft the old refund page** or ask for a refund clause in /terms/.
4. **Site Icon**: Appearance -> Customize -> Site Identity -> replace the old image with `website/assets/social/linkedin-logo-light.png` (or the favicon SVG rendered at 512 px).
5. **Change the WordPress login password** of the deploy account if not already done. The Application Password is already revoked.
6. **Legal pages**: /privacy/ and /terms/ carry complete default text; have counsel confirm it (`DEPLOY.md` D.3).
7. **Rollback, if ever needed**: Appearance -> Themes -> activate Divi; Settings -> Reading -> Homepage: "Home-Divi" (page #604, publish it first from Pages -> Drafts); Plugins -> activate simple-divi-shortcode and page-builder-add. Nothing was deleted.
8. **Cloudflare / login**: the interactive Turnstile challenge on `wp-login.php` is a good protection and was left as is. If a future automated deployment is wanted, add a Cloudflare WAF skip rule for the deploy IP for the duration of the run, or upload theme updates by hand as done today.

## LogicPilot launch page (1 October 2026)

New product page `/products/logicpilot/` for LogicPilot, the MCP production assistant for Logic Pro (Agentic AI; launching 12 November 2026), built as a product-launch layout: oversized product name, launch date with a live countdown, an illustrative arrangement key visual, the 30-second development demo video (poster: the client's launch visual), why it exists, conversational edits, the seven-stage pipeline, producer-in-the-loop principles, a spec table with the Apple trademark notice, a launch-updates form and an FAQ.

- **Site-wide**: LogicPilot is in the Products dropdown and the Menu sheet with a NEW label, in every footer, in the homepage hero (announcement pill) and facts (now 3 products), on About, on the Agentic & Applied AI page (new band 04) and in the Contact intent list. Not on the SAP or Cloud pages.
- **Form**: posts to the theme handler like the others; the email to service@svlslabs.com has the subject "LogicPilot launch updates".
- **WordPress page**: created automatically. The theme creates the `products/logicpilot` page on the first request after the upload (once per release, only if the Products parent exists).
- **Media**: `assets/video/logicpilot-demo.mp4` (2.6 MB, H.264/AAC, streaming-ready), `assets/img/logicpilot/demo-poster.webp`, `assets/og/og-logicpilot.jpg` (LinkedIn/OG share image). The theme zip is about 4.4 MB.
- **Fixed in the same release**: the mobile Menu did not open on `/services/` and `/products/` (the Menu sheet lived in each page template instead of `header.php`); the phone number link text now uses a non-breaking space; the form-failure message no longer shows a TODO label.
- **Client to do**: upload the rebuilt zip with "Replace current with uploaded", then open https://svlslabs.com/products/logicpilot/ and submit the launch-updates form once.
- **Note**: the demo video's burned-in caption reads "A product by SVLS Labs LLP" in mixed case; the site text uses SVLS LABS. Re-export the video if the caption should match.
