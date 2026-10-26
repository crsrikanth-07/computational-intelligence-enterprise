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

## LogicPilot renamed to CuTTI (2 October 2026)

- The product is now **CuTTI** ("From musical intent to editable production."), at `/products/cutti/`. `/products/logicpilot/` answers with a 301 to the new address; on the first request after the theme upload the theme renames the existing WordPress page to the new slug (no second page is created).
- **Demo video**: the client's "CuTTI Demo" (52 s, 1080p, 18.8 MB) re-encoded for the web: `assets/video/cutti-demo.mp4` (1080p with sound, 3.5 MB) on the product page, `assets/video/cutti-loop.mp4` (720p, silent, 1.2 MB) for the homepage loop. Both stream from the first byte (faststart).
- **Copy now matches the demo**: the request ("Build a dark melodic trap song in F♯ minor, 142 BPM, with piano, bell, pad, 808 and aggressive drums. Keep the verses sparse and make the final hook bigger."), five tracks of seeded, editable MIDI across Intro, Hook, Verse and Final Hook, built, verified and bounced in Logic Pro. The illustrated session uses the demo's track colours.
- **New artwork**: cover image and LinkedIn share image regenerated with the CuTTI name (`node website/_tools/make-cutti-art.js`); the LogicPilot launch artwork is no longer used.
- **Client to do**: upload the rebuilt zip with "Replace installed with uploaded", then open https://svlslabs.com/products/cutti/ and https://svlslabs.com/products/logicpilot/ (it should land on the CuTTI page). Set the Google Drive file "CuTTI Demo.mp4" back to Restricted if its sharing was opened.

## CuTTI live demo with music (4 October 2026)

- The client's "CuTTI Interim Demo with music" (2 min 52 s, 1080p, 18.9 MB, a live Logic Pro recording) replaces the earlier demo: `assets/video/cutti-demo.mp4` (1080p with music, 6.5 MB) on the product page; `assets/video/cutti-loop.mp4` (720p, silent, 48 s highlight from 0:41, 0.6 MB) on the homepage.
- The demo section now carries a five-step transcript of the on-screen conversation (Build the song, Listen, Mix, Loop the final hook, Bounce), quoting only the words visible in the video; captions that end in "…" in the video are not completed.
- Copy added from the demo: every change read back from Logic; transport, loop, mute and level among the actions; a new FAQ on the refused bounce (with the loop on, Logic would have bounced only the Final Hook).
- Client to do: upload the rebuilt zip with "Replace installed with uploaded".

## CuTTI demo replaced again (6 October 2026)

- New client video (1 min 5 s, 1080p, 26 MB): "One request. A full producer session in Logic Pro." Re-encoded to `assets/video/cutti-demo.mp4` (1080p, sound at 192 kbps because the audio is the finished master, 10.2 MB) and `assets/video/cutti-loop.mp4` (first 37 s, 720p, silent, 1.8 MB) for the homepage.
- Cover (`assets/img/cutti/demo-poster.webp`) is now the video's opening title frame; `_tools/make-cutti-art.js` renders only the share image.
- Copy follows the video's on-screen text: the Dark Pop request, 32 instruments on 45 named tracks, mixed and cut at every section, 147 of 147 steps verified, built on camera in 13 min 9 s (18× time-lapse), mixed and mastered by CuTTI (71 finishing steps, Mastering Assistant and Adaptive Limiter, −14 LUFS), "Not a loop. Not a stem." Hero points now match the video's end card: Original music, Built-in Logic Pro instruments, Every step verified. The hero illustration and share image show the Dark Pop session.
- Not repeated in page text: the video's "Human made" result from a third-party AI-music checker (it stays in the video only), and the unexplained "14 min 53 s" figure.
- Client to do: upload the rebuilt zip with "Replace installed with uploaded".

## CuTTI removed from svlslabs.com (7 October 2026)

The client is moving CuTTI to its own site. svlslabs.com is SAP & ERP, Cloud and Agentic & Applied AI again, with two products (Value Lens, SAP Intelligence Suite).

- Removed: the CuTTI page, its menu, Menu sheet and footer entries, the homepage launch spotlight (the SAP hero is section 01 again), the AI-page product band, the About and homepage product mentions (back to two products), the Contact intent, the sitemap entry, the Products hub card, the CuTTI videos, cover, share image, page stylesheet, colour tokens, spotlight styles, countdown and video-loop scripts, and the two CuTTI build tools.
- WordPress: on the first request after the upload the theme sets the `products/cutti` page to draft (not deleted, reversible under Pages -> Drafts). `/products/cutti/` and `/products/logicpilot/` answer with a temporary (302) redirect to `/products/` until the new CuTTI address is known; then the redirect can point there.
- Kept: everything else added in the same period (Menu sheet in `header.php`, version-tagged CSS/JS URLs, hub pages, phone number spacing).
- Client to do: upload the rebuilt zip with "Replace installed with uploaded". The theme upload also removes the CuTTI video files from the server.

## CuTTI back on svlslabs.com (13 October 2026)

- `/products/cutti/` rebuilt from the client's copy of 13 Oct 2026 ("One request. A full producer session in Logic Pro."), with the vertical demo video (720x1280, 50 s, 2.8 MB) in the hero. Available to purchase from 1 January 2027; the price shows only the founding-producer line, as the copy asks before checkout is live.
- Back in the Products menu (first, NEW label), Menu sheet, footer, Products hub, Contact intent ("CuTTI early access"), sitemap and deploy plan. The homepage spotlight and AI-page band are not restored.
- Not used from the copy: section 13 "About SVLS Labs" ("CuTTI is our first product") because it contradicts the SAP products on this site, and section 14 (the site has its own footer; the trademark line is on the page).
- WordPress: on the first request after the upload the theme republishes the drafted CuTTI page (or creates it); `/products/logicpilot/` 301s to `/products/cutti/`. Early-access emails arrive with the subject "CuTTI early access".
- Client to do: upload the rebuilt zip with "Replace installed with uploaded".

## Repositioned: innovative software for Enterprise and Entertainment (13 October 2026)

SVLS LABS now presents as an innovative software company with two portfolios (Enterprise Software; Entertainment & Media) and two flagship products (CuTTI, Value Lens). SAP is named only where it is the product's name or legally needed.

- Homepage leads with CuTTI (hero with the vertical demo video), then the two portfolios, the two flagships (SAP Intelligence Suite and CuTTI Score as "also from SVLS LABS"), how we build, the Enterprise practices (ERP, Cloud, Agentic & Applied AI), Entertainment & Media, four numbers and a closing call to action. New elegant layer in `assets/css/pages/showcase.css` (aurora light, gradient wordmark, glass cards, book spines; motion off under reduced-motion).
- New page `/media/` (Entertainment & Media): CuTTI and CuTTI Score, the music practice, and five 2026 books. The theme creates the WordPress page on the first request after the upload.
- Rewritten without SAP: About, ERP services (the URL stays `/services/sap/` so existing links keep working), Cloud, Agentic & Applied AI, Approach, Contact (new "Entertainment & Media enquiry" option), Value Lens ("ERP-like data", "ERP connector"), 404, Privacy, Terms (except the trademark notice), menu, Menu sheet, footer, hubs and share images.
- The downloadable overview PDF (same file name, so existing links keep working) is now a two-page company overview with no SAP; the control checklist says "ERP" instead of "SAP".
- LinkedIn: new banner and logos in `assets/social/`, page copy (tagline, About, details, launch post) in `LINKEDIN_PAGE.md`.
- QA: 14 pages with 0 axe violations, 0 console errors, 0 broken links or anchors, and no horizontal overflow at 390 px. html-validate is clean, `php -l` is clean, and there are no name or location leaks.
- Client to do: upload the rebuilt zip with "Replace installed with uploaded", then update the LinkedIn page from `LINKEDIN_PAGE.md`.

## Book links on Entertainment & Media (13 October 2026)

- Each of the five books on `/media/#books` now opens its store page in a new tab, using the publication records the client supplied: AbeBooks (Ten Tales), Kobo (August 18th; Kamil & Hassan), Adlibris (The House on the Hill), Rakuten Books (Gottesgabe). The whole card is clickable, and ISBNs are shown where known.
- Title corrected to the published spelling: "Ten Tales from Bellavere and Lindelfeld".

## SAP Intelligence Suite retired (13 October 2026)

SVLS LABS no longer markets SAP Intelligence Suite. The word "SAP" no longer appears anywhere in the site text.

- Removed: the product page, its stylesheet, its mark and its share image; the menu, Menu sheet and footer entries; the Products hub card; the homepage "also from" mention; links from the About, Approach, Value Lens and AI pages (the AI page's engineering card now links to "Talk to an architect"); the Contact demo option, product links and status line; the sitemap entry and deploy plan entries.
- Terms: the SAP trademark line now names the marks the site actually uses (Logic Pro, Claude).
- WordPress: on the first request after the upload the theme sets the `products/sap-intelligence-suite` page to draft (reversible under Pages → Drafts). Its URL 301-redirects to `/products/`.
- QA: 13 pages with 0 axe violations, 0 console errors and 0 broken links or anchors. html-validate is clean and `php -l` is clean.
- Client to do: upload the rebuilt zip with "Replace installed with uploaded".

## CuTTI Score (Beta) added (26 October 2026)

- New page `/products/cutti-score/`, built from the client's copy (version 0.9.8, figures measured 25 Oct 2026). Sections: a hero with a side-by-side illustration of the printed original and CuTTI Score's reading (confidence map, hand-off formats); "Made by musicians, for musicians"; What it does (7 items); How it works (4 steps); Why a beta (98–100% of notes on clean modern scores, mid-90s on older song and choral editions, scores of 150–218 pages tested end to end, handwritten music not yet supported); a beta request form; FAQ (6).
- Not published, per the copy's notes: competitor names or comparisons, the install steps for the un-notarized build (they belong in the welcome email), and the open-source engine licence note (legal to check before launch). The copy's "SVSL Labs" is written as "SVLS LABS".
- Added to the Products menu (with a Beta label), the Menu sheet, the footer, the Products hub, the Contact form ("CuTTI Score beta"), the sitemap and the deploy plan. The Media page card now says "Beta · Free for Mac" and links to the page. The homepage "Also from SVLS LABS" line and the company overview PDF now link to or mention the beta.
- Beta requests are emailed to service@svlslabs.com with the subject "CuTTI Score beta request".
- WordPress: on the first request after the upload the theme creates the `products/cutti-score` page.
- To update with each release: the "Where it is today" figures in `products/cutti-score/index.html` (section 05), taken from the release notes.
- QA: 0 axe violations, 0 console errors and 0 broken links or anchors on the new page and the pages that changed. html-validate is clean and `php -l` is clean.

## Repositioned as a vendor-neutral enterprise architecture company (26 October 2026)

SVLS LABS now presents as a senior, vendor-neutral enterprise architecture and software engineering company. See `POSITIONING.md` for the sitemap, navigation, page structure, visual direction and a before-and-after view.

- **Removed:** CuTTI, CuTTI Score, the Entertainment & Media page, books, music and Logic Pro references, the CuTTI video, images, styles and share images, and the aurora and gold-gradient styling.
- **New or rewritten pages:**
  - Home, Services overview, Enterprise Architecture, ERP and Application Modernisation (`/services/erp/`), Integration and Cloud (`/services/integration/`), AI and Agentic Architecture, Enterprise Software Engineering, Architecture Assessment.
  - AI Governance, Products, Approach, About.
  - Contact intents are rewritten, and assessment requests are emailed with the subject "Architecture assessment request".
- **New stylesheet:** `assets/css/pages/enterprise.css`, covering the topology diagram, five-stage method, pillars, ruled lists, principles, governance stack and product card.
- **WordPress:** on the first request after the upload, the theme does the following (release `2026-10-enterprise`):
  - renames services/sap to services/erp and services/cloud to services/integration;
  - creates the architecture, assessment and engineering practice pages and the top-level AI Governance page;
  - sets the CuTTI, CuTTI Score, LogicPilot, Media and SAP Intelligence Suite pages to draft;
  - 301-redirects the old URLs.
- **Also updated:** the company overview PDF (two pages, new positioning), the control diagram labels, the sitemap, the deploy plan, the LinkedIn banner and `LINKEDIN_PAGE.md`.
- **QA:**
  - 17 pages with 0 axe violations, 0 console errors and 0 broken links or anchors, and no horizontal overflow at 390 px.
  - html-validate and `php -l` are clean.
