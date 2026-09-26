# Deploying svlslabs.com

What is in this repository for deployment:

| Path | What it is |
| --- | --- |
| `website/` | the finished static site (12 pages, assets, sitemap, robots, 404). Its own `README.md` is the entry point; `THEME_SPEC.md` the visual system; `BUILD_NOTES.md` the component vocabulary |
| `wordpress-theme/svls-labs/` | the same site as an installable WordPress theme, generated from `website/` (see its `README-THEME.md`) |
| `wordpress-theme/svls-labs.zip` | the upload package for WordPress (Appearance -> Themes -> Upload) |
| `website/_tools/make-wp-theme.js` | regenerates the theme from `website/` after any change: `node website/_tools/make-wp-theme.js website wordpress-theme/svls-labs svls-labs`, then re-zip |
| `website/_tools/deploy-wp.js` | the automated WordPress deployment (option C) |
| `BRAND.md` | the one-page brand guide for the client |

Pick option A (keep WordPress) or option B (static hosting). Option C is option A run by a script. Sections D and E apply to both.

Two decisions block going live in either option: the form endpoint (`TODO_FORM_ID`, section D.1) and the contact mailbox (D.2). Everything else in section D can follow launch, but each placeholder renders as a visible amber `TODO` label until it is done.

---

## A. Option A: WordPress (the existing svlslabs.com install)

The theme reproduces the static site exactly (each template carries the page's own `<title>`, description, canonical, Open Graph, page stylesheet and JSON-LD; the header and footer are shared). Content is not edited in the WordPress editor: the templates hold the copy, and the WordPress "pages" only exist to give each template a URL.

### A.1 Before you start

1. Take a full backup (files and database) or a host snapshot. Note the currently active theme (Appearance -> Themes) and the list of active plugins (Plugins -> Installed).
2. Settings -> Permalinks must be "Post name" (`/sample-post/`) so the URLs come out as `/services/sap/`. If it is "Plain", change it now and save.
3. Make sure Settings -> Reading -> "Discourage search engines from indexing this site" is unticked (check again after go-live).
4. Note any SEO plugin (Yoast, Rank Math, All in One SEO) and any caching or optimisation plugin (WP Rocket, Autoptimize, LiteSpeed Cache, W3 Total Cache); see A.5.

### A.2 Upload the theme

1. Appearance -> Themes -> Add New -> Upload Theme -> choose `wordpress-theme/svls-labs.zip` -> Install Now.
2. If WordPress reports that the theme is already installed, choose "Replace current with uploaded".
3. Do not activate yet: use "Live Preview" first if you want to look at it against an existing page, then activate when the pages in A.3 exist. (Activating first is harmless: existing pages simply render with the plain fallback layout until the pages below are created.)

### A.3 Create the pages (Pages -> Add New)

Slugs and parents must match exactly; the theme chooses the template from the page's path (the Template dropdown under Page Attributes can override it). Content can stay empty. Publish each one.

| URL | Title (any) | Slug | Parent | Template (chosen automatically) | Template dropdown name |
| --- | --- | --- | --- | --- | --- |
| `/` | Home | `home` | none | `front-page.php` (via Settings -> Reading) | not needed |
| `/services/` | Services | `services` | none | `page.php` (plain) | Default template |
| `/services/sap/` | SAP & ERP | `sap` | Services | `page-services-sap.php` | SAP & ERP Services: S/4HANA, BTP, CPI |
| `/services/cloud/` | Cloud | `cloud` | Services | `page-services-cloud.php` | Cloud Services for SAP Landscapes |
| `/services/ai/` | Agentic & Applied AI | `ai` | Services | `page-services-ai.php` | Governed Agentic & Applied AI on SAP BTP |
| `/products/` | Products | `products` | none | `page.php` (plain) | Default template |
| `/products/value-lens/` | Value Lens | `value-lens` | Products | `page-products-value-lens.php` | Value Lens: Margin Leak Finder for SAP O2C |
| `/products/sap-intelligence-suite/` | SAP Intelligence Suite | `sap-intelligence-suite` | Products | `page-products-sap-intelligence-suite.php` | SAP Intelligence Suite: Integration Flows, ABAP, RAP |
| `/approach/` | Approach | `approach` | none | `page-approach.php` | Governed Delivery Approach |
| `/about/` | About | `about` | none | `page-about.php` | About SVLS LABS |
| `/contact/` | Contact | `contact` | none | `page-contact.php` | Contact SVLS LABS |
| `/privacy/` | Privacy Policy | `privacy` | none | `page-privacy.php` | Privacy Policy |
| `/terms/` | Terms of Use | `terms` | none | `page-terms.php` | Terms of Use |

Notes:

- Create `Services` and `Products` before their children so the parent can be selected. Those two parent pages are not part of the static site; give each a one-line paragraph of links to its children (for example "SAP & ERP · Cloud · Agentic & Applied AI") or leave them empty; keep them out of any menu.
- If an old page already uses one of these slugs (for example an old `about`), edit that page instead of creating a new one so the URL stays the same, and clear its old page-builder content.
- The 404 page is `404.php`; no WordPress page is needed. Missing URLs get it automatically.
- The theme reads the page path, so nothing needs to be selected in the Template dropdown. Select it by hand only if a page renders with the plain fallback layout.

### A.4 Activate and set the front page

1. Appearance -> Themes -> SVLS Labs -> Activate.
2. Settings -> Reading -> "Your homepage displays": A static page -> Homepage: Home. Save. (Leave "Posts page" empty.)
3. Settings -> General: Site Title `SVLS LABS`, Tagline `SAP, Cloud and Governed AI. Engineered to Spec.` (the templates do not print these, but WordPress uses them in feeds and admin).
4. Settings -> Permalinks -> Save Changes once more (flushes the rewrite rules so the nested URLs resolve).

### A.5 After go-live: plugins

- **Deactivate the page-builder plugins** the old site used (Elementor, WPBakery, Divi Builder, Beaver Builder, Brizy or similar) and their add-ons. The new theme does not use them; left active they load their CSS and JS on every page. Deactivate first, verify every page, then delete.
- **SEO plugin**: the templates already print the title, description, canonical, Open Graph, Twitter and JSON-LD tags. Either deactivate the SEO plugin or switch off its title, meta description, canonical and Open Graph/Twitter output; otherwise every tag appears twice. Keep its XML sitemap if you prefer it over `/wp-sitemap.xml`.
- **Caching and optimisation plugins**: exclude the theme's CSS and JS from combining, deferring, delaying and inlining (the head order tokens.css -> site.css -> page css -> theme.css is deliberate, and `site.js`/`theme.js` are already deferred). Page caching is fine. Purge all caches after activation.
- **Forms**: the contact, beta and lead-magnet forms post to Formspree (section D.1). No WordPress form plugin is involved; a form plugin that used to serve the old site can be deactivated.
- **Keep the old theme installed** (do not delete it) until everything in A.6 passes; rolling back is Appearance -> Themes -> activate the old theme, and the old pages still exist.

### A.6 Verify (on the live domain)

- Every URL in A.3 returns 200 with the new design (charcoal hero, header with Services/Products dropdowns). A page rendering as a plain "title plus text" layout has the wrong slug or parent.
- `/` is the homepage (not a blog listing); `/some-missing-page/` shows the designed 404 page.
- View source on `/services/sap/`: exactly one `<title>`, one `<link rel="canonical">`, one `og:title`; the stylesheets are `/wp-content/themes/svls-labs/assets/css/...`.
- The Services and Products dropdowns, the Menu sheet on a phone width, the theme toggle, and the contact form validation work.
- Favicon shows in the tab; `/robots.txt` allows crawling and lists a sitemap; `/wp-sitemap.xml` (or the SEO plugin's sitemap) lists the 11 indexable pages and not the 404.
- Nothing from the old theme leaks in: no old fonts, no builder CSS in the source, no cookie banner or chat widget the client did not ask for.

---

## B. Option B: static hosting (Cloudflare Pages, Netlify or GitHub Pages)

The `website/` folder is deployable as is: root-relative URLs, directory-style paths (`/services/sap/` -> `services/sap/index.html`), `404.html` at the root, `sitemap.xml`, `robots.txt`, `site.webmanifest`. No build step.

### B.1 Cloudflare Pages

1. Workers & Pages -> Create -> Pages -> Connect to Git -> this repository. Build command: none. Build output directory: `website`. Deploy.
2. Custom domains: add `svlslabs.com` and `www.svlslabs.com` (Cloudflare creates the records if the zone is on Cloudflare; otherwise it shows the CNAME to set). TLS is automatic.
3. `404.html` at the root is served for missing paths automatically; directory URLs resolve to `index.html`; `/services/sap` redirects to `/services/sap/`.
4. Optional: Bulk Redirects for the old WordPress URLs that changed (see B.4).

### B.2 Netlify

1. Add new site -> Import from Git -> this repository. Build command: none. Publish directory: `website`. Deploy.
2. Domain management -> add `svlslabs.com` (primary) and `www.svlslabs.com`; Netlify DNS or the ALIAS/A + CNAME it lists. TLS via Let's Encrypt is automatic once DNS resolves.
3. `404.html` is served for missing paths automatically. "Pretty URLs" keeps trailing slashes as the site links them.
4. Forms: the site posts to Formspree by default (D.1). To use Netlify Forms instead, add `data-netlify="true"` and a `name` attribute to each `<form>` listed in D.1 and remove the Formspree `action`; `site.js` submits with `fetch` and expects a 2xx response, which Netlify Forms returns.

### B.3 GitHub Pages

GitHub Pages serves the repository root or `/docs`, not an arbitrary folder, so use the Actions deployment:

1. Settings -> Pages -> Source: GitHub Actions.
2. Add `.github/workflows/pages.yml` with the standard three steps: `actions/checkout`, `actions/upload-pages-artifact` with `path: website`, `actions/deploy-pages`. Trigger on push to the default branch.
3. Settings -> Pages -> Custom domain: `svlslabs.com`; tick "Enforce HTTPS" once the certificate is issued. GitHub writes a `CNAME` file; commit it into `website/` (the upload path) or it will be lost on the next deploy.
4. DNS: A records for the apex to GitHub's four Pages IPs, CNAME `www` -> `<org>.github.io`. `404.html` at the root is used automatically.
5. Repository visibility: Pages from a private repository needs a paid plan; a public repository publishes the site source as well (nothing in `website/` is confidential, but confirm with the client).

### B.4 DNS cutover checklist

1. 24 to 48 hours before: lower the TTL of the `svlslabs.com` A/AAAA/CNAME and `www` records to 300 seconds.
2. Deploy to the new host and verify on the host's preview URL (`*.pages.dev`, `*.netlify.app`, `*.github.io`): all 12 pages, the 404, the manifest, the OG images at `/assets/og/`.
3. Add the custom domain at the host and wait until it reports the certificate as issued (Cloudflare and Netlify can issue before the switch when the zone is theirs; GitHub issues after DNS resolves).
4. Write down every old URL that had traffic (Search Console -> Pages, or the old analytics) and set redirects at the new host for any path that changed (Cloudflare Bulk Redirects, Netlify `_redirects` in `website/`, or a small `index.html` with a meta refresh per old path on GitHub Pages).
5. Switch the records: apex -> new host, `www` -> new host; keep every other record (MX, SPF/TXT, DKIM, DMARC, any `_acme-challenge`) untouched. Mail must not move with the website.
6. Verify from outside (a phone off Wi-Fi, `dig +short svlslabs.com`): 200 on `/`, valid certificate, `www` redirects to the apex (or the reverse, one canonical host only), `http://` redirects to `https://`.
7. Leave the old WordPress host running, but not reachable by the public, for at least a week; then export anything the client wants to keep (old posts, media) and decommission. Do not enable HSTS preload until the site has been stable on HTTPS for a month.
8. Raise the TTLs back to 3600 or more after 48 hours.

---

## C. Option C: automated WordPress deployment from a Claude session

`website/_tools/deploy-wp.js` performs option A through the WordPress REST API (pages, front page, verification) and, when allowed, uploads the theme through a headless browser (the REST API cannot install themes). It is idempotent: re-running updates the same pages by slug.

### C.1 Environment

Set these in the session environment (never in a file in the repository, never printed):

| Variable | Value |
| --- | --- |
| `WP_URL` | `https://svlslabs.com` |
| `WP_USER` | an Administrator account |
| `WP_APP_PASSWORD` | an Application Password for that account: Users -> Profile -> Application Passwords -> name it "deploy" -> Add New; copy the 24-character password (spaces are ignored). Requires HTTPS on the site |
| `WP_PASSWORD` | optional, the account's normal login password, used only by the headless browser to upload and activate the theme zip. Without it the script stops with a warning and the theme is uploaded by hand (A.2), after which the script is re-run |

### C.2 Pre-flight

```
curl -sS -o /dev/null -w '%{http_code}\n' https://svlslabs.com/wp-json/wp/v2/
curl -sS -u "$WP_USER:$WP_APP_PASSWORD" https://svlslabs.com/wp-json/wp/v2/users/me?context=edit | head -c 300
```

Expected: `200` for the first call (a JSON index of routes), and a JSON user object with `"roles":["administrator"]` for the second. If the first returns 401/403/404, a security plugin (Wordfence, iThemes, "Disable REST API") or the host's WAF is blocking `/wp-json`; allow it for authenticated requests, or fall back to option A by hand. If the second returns 401, Application Passwords are disabled (`wp_is_application_passwords_available`) or the site is not on HTTPS.

Then a dry run, which changes nothing:

```
node website/_tools/deploy-wp.js --dry-run
```

### C.3 Run

```
cd wordpress-theme && rm -f svls-labs.zip && zip -qr svls-labs.zip svls-labs && cd ..
node website/_tools/deploy-wp.js            # theme via browser (needs WP_PASSWORD and playwright), pages via REST
node website/_tools/deploy-wp.js --skip-theme   # when the theme was uploaded by hand
```

What the script does, in order: pre-flight (REST root, authenticated user, role) -> reads the active theme (`/wp/v2/themes?status=active`) -> if `svls-labs` is not active and `WP_PASSWORD` is set, logs in with Playwright, uploads `wordpress-theme/svls-labs.zip` at `wp-admin/theme-install.php?browse=upload`, accepts "Replace current with uploaded" and activates -> creates or updates the 13 pages in A.3 with the correct parents and templates (`/wp/v2/pages`) -> sets the static front page and the site title and tagline (`/wp/v2/settings`) -> fetches each public URL and checks it is served by the new theme and prints the H1. The result is written to `website/_tools/deploy-report.json` (steps, warnings, errors); the exit code is 1 on any error.

Media: none needs uploading. Every image, diagram, OG image and icon ships inside the theme (`/wp-content/themes/svls-labs/assets/...`), so `/wp/v2/media` is not used. The templates point the `og:image` and JSON-LD `logo` at the theme directory.

After the run: A.5 (plugins) and A.6 (verification) still apply; the script cannot deactivate plugins or configure an SEO plugin through REST.

### C.4 When the browser step is not possible

Upload the zip by hand (A.2), activate, then `node website/_tools/deploy-wp.js --skip-theme`. Pages created while the old theme was active are saved without a template and re-saved with the right template on the next run after activation.

---

## D. Client TODO list

Every placeholder renders with a visible amber `TODO` label until it is resolved. Lines are 1-based in the current files under `website/`. After changing any page, regenerate the WordPress theme (`node website/_tools/make-wp-theme.js website wordpress-theme/svls-labs svls-labs` and re-zip) if option A or C is in use.

### D.1 Form endpoint (blocks launch)

Replace `https://formspree.io/f/TODO_FORM_ID` with the Formspree form id (or enable Netlify Forms, B.2):

- `website/index.html:687` (discovery call form) and `website/index.html:710` (beta form)
- `website/products/value-lens/index.html:854` (beta request form)
- `website/contact/index.html:179` (contact form)

Formspree: create one form per purpose or one shared form; the forms send `intent`/`offer` fields so one endpoint is enough. Test a submission from the live domain and confirm the notification mailbox.

### D.2 Contact details (blocks launch)

- Mailbox `hello@svlslabs.com`: confirm it exists and is monitored. `website/contact/index.html:259` ("TODO (client): confirm mailbox"); the footer bottom row on every page carries "(placeholder)" after the address, from `website/_partials/footer.html:51`, rendered at `website/index.html:802`, `website/services/sap/index.html:415`, `website/services/cloud/index.html:407`, `website/services/ai/index.html:510`, `website/products/value-lens/index.html:1014`, `website/products/sap-intelligence-suite/index.html:414`, `website/approach/index.html:442`, `website/about/index.html:413`, `website/contact/index.html:341`, `website/privacy/index.html:282`, `website/terms/index.html:276`, `website/404.html:247`.
- Phone: `website/contact/index.html:255` ("TODO: phone") and the footer bottom row (same lines as above, "TODO phone").
- Registered address: the site prints "SVLS Labs LLP, 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India" as supplied, in the footer, on About, Contact, Privacy and in the Organization JSON-LD of every page. Confirm it is the address to publish; no other location appears anywhere.
- Privacy and Terms contact points: `website/privacy/index.html:179`, `:209` and `website/terms/index.html:203` (mailbox and postal address).

### D.3 Legal pages (counsel)

- `website/privacy/index.html:157` last-updated date; `:185` confirm the form fields and whether analytics is enabled; `:191`, `:197` (form endpoint provider, storage and retention), `:203` (rights), `:209`; the notice at `:215` lists the six sections to complete.
- `website/terms/index.html:157` last-updated date; `:178`, `:185` (beta terms reference), `:191`, `:196` and `:197` (governing law and jurisdiction), `:203`; the notice at `:209` lists the five sections.

### D.4 SAP Intelligence Suite: commercial wording and product name

- Status sentence, shown wherever the Suite is featured: "In use in SVLS LABS delivery. Available to customers on request; deployed in your landscape, reviewed by your architects." Confirm or replace it at `website/products/sap-intelligence-suite/index.html:183` and `:359`, `website/index.html:576`, `website/about/index.html:210`, `website/contact/index.html:283`.
- Library figures: none ship (no flow counts, operation counts, deployment counts or example requests, per Addendum C). If the client wants a figure published, it must be a company figure, not a résumé figure, and it goes through the copy rules in `website/README.md`.
- The first Suite mode is shown under its exact product name "CPI iFlow generation" at `website/index.html:587`, `website/products/sap-intelligence-suite/index.html:195` and `:224`; everywhere else the site says "integration flow". If the mode name is also too technical for customers, rename it to "CPI integration flow generation" in those three places (the label wraps to two lines in the workbench tiles).
- SAP trademark naming note: SAP's trademark guidance generally asks third parties not to lead a product name with "SAP". "Intelligence Suite for SAP" is the safer descriptive form. The site ships the client's current name in the H1 (`website/products/sap-intelligence-suite/index.html:181`), the JSON-LD (`:49`), the Products dropdown (`website/_partials/header.html:32`, copied into every page), the footer and the product lockup. Decide before launch; a rename touches those places, the `<title>`/OG title and the OG image (`node website/_tools/make-og.js suite "<new H1>"`).
- Value Lens pricing statement: `website/products/value-lens/index.html:922` ("Beta participation terms are agreed per organisation. TODO (client): pricing statement.").

### D.5 Lead-magnet PDFs

The capability overview, the Governed Agent Control Checklist and the Clean Core integration checklist do not exist yet; every link routes to `/contact/` with the intent preselected. Placeholders: `website/services/sap/index.html:290`, `website/services/ai/index.html:401`; the link targets at `website/services/sap/index.html:289`, `website/services/ai/index.html:400`, `website/index.html:743`, `website/approach/index.html:170`. When a PDF exists, point the link at it and remove the placeholder line.

### D.6 Trademark screening

Screen the mark and the name "Value Lens" in class 42 (software and IT services) and class 9 (software) in the relevant jurisdictions before public rollout (BRAND_SPEC 8.8). No ™ symbol is used until cleared. The same screen should cover "SAP Intelligence Suite" (D.4).

### D.7 Lockup outline conversion

`website/assets/logo/lockup.svg`, `lockup-reversed.svg`, `stacked.svg` and `stacked-reversed.svg` set the wordmark as live text in Inter Tight. For print, stationery and any placement without the webfont, convert the text to outlines (Illustrator or Inkscape "object to path") and keep the outlined copies beside the originals. The inline lockups in the site header and footer are unaffected (the webfont is loaded).

### D.8 Other items carried from the build

- GitHub: create an organisation account and mirror the presentable repositories before any repository link is added; the About research section says "published on GitHub" without a link (`website/about/index.html:277`). Then add the two text links named in Addendum B.3.2.
- Book: confirm it is on sale before any copy says "published" (the site says "authored"); reconcile the back-cover chapter count with the KDP metadata before print.
- Value Lens `sales_order.get` card carries only its name (`website/products/value-lens/index.html:326`); supply one line if the row should read evenly.
- Fonts: the two woff2 preloads in every head point at the current Google-served files; if Google rotates the URLs the preload is wasted (a console warning, not an error).
- Static hosts only: serve `404.html` for missing paths and resolve directory URLs to `index.html` (all three hosts in B do this by default).

---

## E. Post-launch checks

1. **Open Graph and social previews**: paste `https://svlslabs.com/`, `/services/ai/`, `/products/value-lens/` into the LinkedIn Post Inspector, Facebook Sharing Debugger and a Twitter/X card validator. Expect the charcoal 1200x630 image with the page title, the exact `<title>` and description. On WordPress the image URL is `/wp-content/themes/svls-labs/assets/og/og-<key>.png`; on static hosting `/assets/og/og-<key>.png`. Re-scrape after any title change.
2. **Google Search Console**: verify the domain property (DNS TXT record), submit the sitemap (`https://svlslabs.com/sitemap.xml` on static hosting; `https://svlslabs.com/wp-sitemap.xml` or the SEO plugin's sitemap on WordPress), request indexing of the 11 pages, and check Pages -> "Not indexed" after a week for old WordPress URLs that need redirects. Confirm `404.html` is not in the sitemap and carries `noindex`. Bing Webmaster Tools can import the Search Console property.
3. **Analytics placeholder**: no analytics or tracking script ships (the privacy page says so at `website/privacy/index.html:185`). If the client wants analytics, choose a tool, add its snippet to `website/_partials/head.html` and every page head (or through the WordPress theme's `functions.php` on `wp_head`), update the privacy page sections and add consent handling if the tool sets cookies. Do not add it before the privacy page is complete.
4. **Forms end to end**: submit the contact form, the discovery form and the beta form from the live domain; confirm the success card, the notification email and the stored submission at the provider.
5. **Crawl and validity**: `robots.txt` allows `/`; every page 200; no mixed content; `https://www.svlslabs.com` and `http://` redirect to the canonical host; the 404 page returns HTTP 404 (not 200).
6. **Rendering**: light and dark mode, 390px and 1440px, the Services and Products dropdowns and the Menu sheet, the theme toggle, the sticky header shadow, the favicon in a light and a dark tab bar. Lighthouse on `/` and `/products/value-lens/` for regressions caused by the host or by WordPress plugins (fonts and CSS order in particular).
7. **Old URLs**: compare the old site's indexed URLs against the new 11 and add 301 redirects for any that changed (WordPress: Redirection plugin or the host; static: B.4 step 4).
8. **Monitoring**: uptime check on `/` and `/contact/`; certificate expiry alert; on WordPress, automatic core and plugin updates on, and the theme excluded from any "auto-update themes" setting that could overwrite it with a repository theme of the same name (there is none, but the setting costs nothing).
9. **Two weeks after launch**: remove the old theme and the deactivated builder plugins (option A), or decommission the old host (option B), once Search Console shows no crawl errors from the switch.
