# SVLS LABS website

Static site for svlslabs.com: plain HTML, CSS and JavaScript, no build step, no frameworks, no runtime dependencies, no CDN scripts. The only external resource is Google Fonts. Copy and structure follow the client specifications (BRAND_SPEC v1.1, SITE_SPEC, Addendum A v2, Addendum B, Addendum C, Addendum D) and the visual system in `THEME_SPEC.md` ("Signal Premium", applied site-wide). This file is the entry point; `BUILD_NOTES.md` holds the component vocabulary for anyone editing pages.

## Structure

```
website/
  index.html                          homepage
  services/sap/  services/cloud/  services/ai/      practice pages (index.html in each)
  products/value-lens/                Value Lens (private beta), with the Addendum D depth sections
  products/sap-intelligence-suite/    SAP Intelligence Suite (generalised, Addendum A v2)
  approach/  about/  contact/  privacy/  terms/     one index.html each
  404.html                            not-found page (noindex; the host must serve it for missing paths)
  sitemap.xml  robots.txt  humans.txt site.webmanifest
  favicon.svg  favicon-32.png  favicon-16.png  apple-touch-icon.png
  assets/css/tokens.css               brand tokens: the base colour, type and spacing values (BRAND_SPEC 5.2)
  assets/css/site.css                 every shared component (layout, nav, buttons, grids, forms, footer, motion)
  assets/css/pages/<key>.css          small page-specific layout (ai, approach, contact, value-lens, suite, about, legal); tokens only
  assets/css/theme.css                THE THEME (loaded last): charcoal heroes, cards, bands, gradients, dark mode; its own --sg-* token block
  assets/js/site.js                   one IIFE: theme choice, dropdowns, Menu sheet, current nav, reveal, forms, year
  assets/js/theme.js                  adds .is-scrolled to the sticky header (polish only)
  assets/logo/                        mark, lockups, stacked lockups, product marks (SVG)
  assets/diagrams/                    landscape, method, control-model, practice glyphs, reference-cloud, valuelens-flow (SVG)
  assets/og/og-<key>.png              1200x630 social images, one per page, charcoal (THEME_SPEC 8)
  _partials/                          head.html, header.html, footer.html: the canonical markup every page copies (NOT deployed)
  _tools/                             make-og.js (social images), render-icons.js (favicons), deploy-wp.js (WordPress REST upload) (NOT deployed)
  THEME_SPEC.md                       the visual system (supersedes BRAND_SPEC 5, 6, 10, 12)
  BUILD_NOTES.md                      component vocabulary and foundation decisions for anyone editing pages
  .htmlvalidate.json .htmlvalidateignore   html-validate configuration (partials are fragments and are ignored)
```

Every page uses root-relative URLs (`/assets/css/site.css`, `/services/sap/`), so the `website/` folder must be the document root. Eleven pages are listed in `sitemap.xml` (the 404 page is `noindex`).

## Local preview

From the repository root:

```
npx serve website
# or
python3 -m http.server -d website 8080
```

Then open http://localhost:3000/ (serve) or http://localhost:8080/ (Python). Directory URLs such as `/services/sap/` resolve to their `index.html` on both servers. Google Fonts must be reachable for Inter Tight, Inter and JetBrains Mono; without them the pages fall back to system fonts.

## Theme notes (see THEME_SPEC.md for the full system)

- Load order in every `<head>`: the BRAND_SPEC Google Fonts URL, then the separate `Inter Tight:wght@800` request, `tokens.css`, `site.css`, the optional page stylesheet, `theme.css`, then `site.js` and `theme.js` (deferred). `theme-color` is `#0E1116` for both schemes.
- Every page opens on a charcoal hero (`.hero` with `div.hero-art`; inner pages use `.hero-art--lite`). The header, footer, dark bands and the 404 page share the charcoal token set.
- Card language: every `.hgrid` cell, method step, FAQ item, spec table and diagram renders as a card (6px radius, hairline, soft shadow, 2px hover lift on pointer devices). Slim bands are one card with a gradient bar.
- Bands alternate automatically (hero = band 1, then soft, white, soft...); `.band-dark` keeps its place. Keep the section count in mind when adding or removing a section.
- Colour lives only in `tokens.css` and the `--sg-*` block at the top of `theme.css`. Page stylesheets use tokens only. `--accent`, `--sg-coral` and `--sg-verm` never colour text; text uses `--accent-text` or `--sg-coral-text`.
- Dark mode: system preference unless the user chose Light, or `data-theme="dark"` from the toggle; the theme maps the page to the charcoal set without per-page work.
- Motion is limited to the hero trace pulse (homepage), the card lift and the HIGH pill glow; `prefers-reduced-motion` disables all of it.
- Minimum text size is 12px everywhere (the PRIVATE BETA nav tag and the section numeral pill included); touch targets are 44px or taller.
- OG images: `node _tools/make-og.js <key> "<page H1>"` regenerates a page's 1200x630 image on charcoal; regenerate whenever an H1 changes.

## Copy rules that are client instructions

- **25+ years** of SAP delivery experience across our key architects, everywhere. Never "22+", "two decades", "20+", "since 2004" or a person's years.
- **No résumé-derived or other-employer figures** (Addendum C): no "200+ flows", "~10 deployments", "~80%", "up to 90%", "$10M+", MCP operation counts, Suite library counts or example requests. Allowed facts: founded 2020, 25+ years, two products, the GitHub-evidenced research (Addendum B).
- **Plain language for integration**: "integration flow" in running copy. "iFlow" appears only in the Suite's exact mode name "CPI iFlow generation" (see the TODO list if that must change too).
- **The third practice is "Agentic & Applied AI"** (client instruction, 2026-09-26: the AI work published on GitHub is broader than agents). The name is used in the nav dropdown and Menu sheet, the footer Practices column, the homepage practice card and links, the proof-strip line, the hero eyebrows ("Governed agentic & applied AI"), the About story strip, the Contact intent option, the 404 card and description, and the `/services/ai/` eyebrow, title, description and JSON-LD. The applied-AI evidence itself lives in `/services/ai/#methods` (eight method cards), the homepage `RESEARCH` chip row, the About research section and the `5` proof cell.
- No person is named anywhere (copy, alt text, SVG titles, metadata, file names). Voice: "our architects", "our team".
- Title Case on the tagline and every H1 and H2 (BRAND_SPEC 4.2: short prepositions such as "to" and "with" stay lowercase); H3s, eyebrows, buttons, links and body stay sentence case. Headlines end with a full stop.
- Value Lens is always "private beta" with the status sentence "Private beta on synthetic SAP-like data. Production SAP connector in development." wherever it is featured; the Suite carries "In use in SVLS LABS delivery. Available to customers on request; deployed in your landscape, reviewed by your architects." wherever it is featured.
- The only location on the site is the registered office address (footer, About, Contact, Privacy, JSON-LD). No other country, region, time zone or presence claim.
- Banned words (SITE_SPEC 16.1) nowhere in visible text, metadata or alt text; certifications and platforms are described generically, never as enumerated lists.

## Checks that were run (final integration, 2026-09-26)

- `html-validate` (`website/.htmlvalidate.json`): clean on all 12 pages.
- Playwright QA (`snap.js` in the build scratchpad): every page at 390px and 1440px with 0 console errors, 0 failed requests, 0 broken links, 0 broken anchors, 0 axe violations (wcag2a, wcag2aa, wcag21aa, best-practice), and `docW == vw` on mobile and desktop. Desktop and mobile captures of every page were reviewed.
- Homepage interaction script (`interact.js`): dropdowns, Menu sheet, theme toggle, reveal, forms; no HTML text below 12px.
- Greps that must be empty and are: "22+", "since 2004", "two decades"; founder name variants; "smartapp"; every string on the Addendum C REMOVE list; the Addendum B domain words; banned words in visible text (the only regex hit is the technical noun "transformations" in the SAP FAQ, verbatim SITE_SPEC 4.6).
- Header and footer byte-identical on every page (compared with `_partials/`, ignoring the current-page marker); every head carries the fonts (including Inter Tight 800), `tokens.css`, `site.css`, `theme.css`, `site.js`, `theme.js`, `<title>` and description per SITE_SPEC 14 / Addendum A.8 / C.6 (with the client's practice rename on `/services/ai/` and `/404.html`), canonical, OG (file present, charcoal), Twitter, theme-color, favicons, manifest and JSON-LD (never a Person); one `<h1>` per page; sitemap and robots current.

## Known limitations (not defects)

- Equal-height card rows leave space at the foot of shorter cards (practice cards, stat cells, the cells beside the book card); links are not pinned to the card foot.
- A few hero micro-labels wrap to two lines at 1440px (the third on `/services/ai/`, `/approach/` and `/about/`, the second on `/services/sap/`).
- The Value Lens hero frame's "Dismissed · reason: approved promotion" status wraps to three lines at 1440px inside the STATUS column; legible, not clipped.
- Inline text links inside sentences and the native 20px checkbox/radio boxes are smaller than 44px; they are exempt under WCAG 2.5.8 (inline links, labelled controls).
- Full-page Playwright captures show the sticky header mid-page because the site's smooth scroll is still in flight when the capture starts; viewport captures show it at the top.
- The 404 page centres its content in the viewport, leaving charcoal above and below at 1440x900 by design.

## Client TODO placeholders

Every placeholder renders visibly with an amber mono `TODO` label (SITE_SPEC 16.3). Lines are 1-based in the current files.

### `index.html`

- `index.html:687` form action https://formspree.io/f/TODO_FORM_ID: replace with the Formspree form id or enable Netlify Forms
- `index.html:710` form action https://formspree.io/f/TODO_FORM_ID: replace with the Formspree form id or enable Netlify Forms
- `index.html:802` 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India · hello@svlslabs.com (place...

### `services/sap/index.html`

- `services/sap/index.html:290` TODO (client): the PDF. Until it exists, the link opens the contact form with the checklist preselected.
- `services/sap/index.html:415` 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India · hello@svlslabs.com (place...

### `services/cloud/index.html`

- `services/cloud/index.html:407` 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India · hello@svlslabs.com (place...

### `services/ai/index.html`

- `services/ai/index.html:401` TODO (client): the PDF. Until it exists, the link opens the contact form with the checklist preselected.
- `services/ai/index.html:510` 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India · hello@svlslabs.com (place...

### `products/value-lens/index.html`

- `products/value-lens/index.html:854` form action https://formspree.io/f/TODO_FORM_ID: replace with the Formspree form id or enable Netlify Forms
- `products/value-lens/index.html:922` Beta participation terms are agreed per organisation. TODO (client): pricing statement.
- `products/value-lens/index.html:1014` 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India · hello@svlslabs.com (place...

### `products/sap-intelligence-suite/index.html`

- `products/sap-intelligence-suite/index.html:414` 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India · hello@svlslabs.com (place...

### `approach/index.html`

- `approach/index.html:442` 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India · hello@svlslabs.com (place...

### `about/index.html`

- `about/index.html:413` 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India · hello@svlslabs.com (place...

### `contact/index.html`

- `contact/index.html:179` form action https://formspree.io/f/TODO_FORM_ID: replace with the Formspree form id or enable Netlify Forms
- `contact/index.html:255` 4th Floor, Aparna AstuteShaikpet, Door No. 8-1-299/103&104/AA/4F-2Jubilee Hills, Hyderabad 500008Telangana, IndiaTODO: phone.
- `contact/index.html:259` hello@svlslabs.com. TODO (client): confirm mailbox.
- `contact/index.html:341` 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India · hello@svlslabs.com (place...

### `privacy/index.html`

- `privacy/index.html:157` Last updated: TODO (client)
- `privacy/index.html:179` TODO (client): the contact point for privacy questions.
- `privacy/index.html:185` TODO (client): confirm the fields and whether analytics is enabled.
- `privacy/index.html:191` TODO (client): counsel to complete this section.
- `privacy/index.html:197` TODO (client): name the form endpoint provider, where submissions are stored and for how long.
- `privacy/index.html:203` TODO (client): the rights that apply to you and how to exercise them.
- `privacy/index.html:209` TODO (client): confirm the mailbox and add the postal address.
- `privacy/index.html:215` The six sections above are the headings the client's counsel completes. Each carries a TODO (client) label until it is done.
- `privacy/index.html:282` 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India · hello@svlslabs.com (place...

### `terms/index.html`

- `terms/index.html:157` Last updated: TODO (client)
- `terms/index.html:178` TODO (client): counsel to complete this section.
- `terms/index.html:185` TODO (client): counsel to confirm the beta terms reference.
- `terms/index.html:191` TODO (client): counsel to complete this section.
- `terms/index.html:196` Governing law and jurisdiction: TODO (client).
- `terms/index.html:197` TODO (client): counsel to state the governing law and jurisdiction.
- `terms/index.html:203` TODO (client): confirm the mailbox and add the postal address.
- `terms/index.html:209` The five sections above are the headings the client's counsel completes. Each carries a TODO (client) label until it is done.
- `terms/index.html:276` 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India · hello@svlslabs.com (place...

### `404.html`

- `404.html:247` 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India · hello@svlslabs.com (place...

### `_partials/footer.html` (rendered in the footer of every page)

- `_partials/footer.html:51` 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India · hello@svlslabs.com (place...

### Decisions and deliverables without a placeholder line

- SAP Intelligence Suite: confirm the commercial status wording "In use in SVLS LABS delivery. Available to customers on request; deployed in your landscape, reviewed by your architects." (Addendum A.1). See `products/sap-intelligence-suite/index.html:183`, `index.html:576`, `about/index.html:210`, `contact/index.html:283`.
- SAP Intelligence Suite: product name. SAP trademark guidance usually asks third parties not to lead a product name with "SAP" ("Intelligence Suite for SAP" is the safer descriptive form). The site ships the client's current name in the H1, lockups, nav, footer and JSON-LD; decide before launch (Addendum A.1). See `products/sap-intelligence-suite/index.html:181`, `products/sap-intelligence-suite/index.html:49`, `_partials/header.html:32`.
- SAP Intelligence Suite: the first mode is shown under its exact product name "CPI iFlow generation" (Addendum A.1). Everywhere else the site says "integration flow" because customers do not read "iFlow". If the mode name is also too technical, rename it to "CPI integration flow generation" in the three places listed. See `index.html:587`, `products/sap-intelligence-suite/index.html:195`, `products/sap-intelligence-suite/index.html:224`.
- Lead-magnet PDFs: the capability overview, the Governed Agent Control Checklist and the Clean Core integration checklist do not exist yet; every link routes to /contact/ with the intent preselected (SITE_SPEC 1.4, 4.5, 6.6). See `services/sap/index.html:289`, `services/ai/index.html:400`, `index.html:743`, `approach/index.html:170`.
- Value Lens tools section: the `sales_order.get` card carries only its name because Addendum D.3 gives it no description; supply one line if the row should read evenly. See `products/value-lens/index.html:326`.
- Trademark screen for the mark and the name "Value Lens" (class 42 and class 9) before public rollout; no ™ until cleared (BRAND_SPEC 8.8).
- Outline conversion of the exported lockup SVGs (assets/logo/lockup*.svg, stacked*.svg) for print; the inline lockups use the webfont (BUILD_NOTES 7).
- Host configuration: serve /404.html for missing paths; directory-style URLs (/services/sap/) must resolve to index.html; serve the site from the `website/` folder as document root (root-relative URLs).
- GitHub: create an organisation account and mirror the presentable repositories before any repository link is added (Addendum B.3.2 and B.3.3); until then the site says "published on GitHub" without a link. Then add the two text links named in B.3.2 to the About research section. See `about/index.html:277`.
- Book: confirm it is on sale before any copy says "published" (the site says "authored"); reconcile the back-cover chapter count with the KDP metadata before print (Addendum B.6.4).
- Fonts: the two woff2 preloads in every head point at the current Google-served files; if Google rotates the URLs the preload is wasted (a console warning, not an error).

## Editing rules that must survive future changes

- Edit a partial, then paste it into every page (the current-page marker is set by `site.js` at runtime); a diff script verified parity at integration.
- New pages copy `_partials/head.html`, open with a `.hero` section carrying `div.hero-art.hero-art--lite`, and keep the band count in mind. New grids use `.hgrid`; new dark sections use `.band-dark`.
- Never write a colour value outside `tokens.css` and the theme token block; never add motion or gradients beyond THEME_SPEC 7 and 9.
- Copy rules above are client instructions and win over any older wording in the specifications.
