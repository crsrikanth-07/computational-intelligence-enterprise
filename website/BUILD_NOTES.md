# SVLS LABS website — BUILD_NOTES (for page builders)

> **Final integration (2026-09-26).** Client instruction applied site-wide: the third practice is named **"Agentic & Applied AI"** (nav dropdown and Menu sheet, footer Practices column, homepage practice card 03 and its link, the proof-strip context line, the homepage and About hero eyebrows "Governed agentic & applied AI", the About story strip, the Contact intent option, the 404 link card and description, and the `/services/ai/` eyebrow, `<title>` "Governed Agentic & Applied AI on SAP BTP | SVLS LABS", meta description and JSON-LD). The old label "Agentic AI" survives only inside the verbatim Addendum B subcopy "Agentic AI is the visible layer." Also in this pass: `.nav-beta` (PRIVATE BETA tag) and the `.section-mark .numeral` pill are 12px (BRAND_SPEC 6.2 floor; THEME_SPEC 3 updated). Still true: 25+ years only (never 22+, "two decades" or "since 2004"), no "200+" or other résumé figures, "integration flow" in running copy; "iFlow" appears only in the Suite's exact mode name "CPI iFlow generation" (Addendum A.1), which the client may rename to "CPI integration flow generation" in three places (`index.html`, the Suite hero tile and the Suite mode card) if that term is also too technical.

> **Theme rollout (2026-09-26): "Signal Premium", site-wide, with tweaks.** `THEME_SPEC.md` is the visual system now (it supersedes BRAND_SPEC 5, 6, 10 and 12). Every page loads, in this order, `tokens.css` → `site.css` → its page stylesheet → **`theme.css`**, then `site.js` → **`theme.js`** (the head partial has a `{{PAGE_CSS}}` slot for the page stylesheet), plus the separate Inter Tight 800 font request and `theme-color #0E1116` for both schemes. What the theme changes for builders: (1) **every page opens on a charcoal hero**: the homepage hero is `.hero.hero--home` and carries the full `div.hero-art` (faint mark + data trace); every inner hero and the 404 section carry `div.hero-art.hero-art--lite` (faint mark only) right after the opening `<section>` tag; copy the block from any inner page. (2) **Card language**: every `.hgrid` cell, `.method__step`, `.steps > li`, `.faq`, `.spec-table` and `.diagram` renders as a card (6px radius, hairline, soft shadow, 2px hover lift); do not draw hairlines for grids any more. (3) **Bands alternate automatically** (hero = band 1, then soft, white, soft...; `.band-dark` keeps its place), so `.band-surface` no longer decides colour. (4) Buttons are gradient primary / outlined secondary, 44px minimum; pills glow; forms sit on cards; the footer is charcoal with a gradient hairline; dark mode maps to the charcoal set without per-page work. (5) OG images are charcoal: `node _tools/make-og.js <key> "<page H1>"` (all twelve regenerated). Client copy corrections applied in the same pass: 25+ years everywhere (never 22+ or "two decades"); no "200+" or other résumé figures; "integration flow" in running copy ("iFlow" only in the Suite's mode name); the AI practice now says "applied AI methods" in the nav and 404 descriptions, the homepage practice card links to `/services/ai/#methods`, the AI hero lead names the method families, and the footer Practices column carries "Applied AI research".

> **Addendum D (2026-09-26).** `/products/value-lens/` now carries the Value Lens depth sections in the D insert order (`#inside-the-beta`, `#architecture`, `#tools`, `#detection`, `#coverage`, `#agent`, `#audit`, the D.9 milestone timeline inside `#scope`, `#guardrails`, `#stack`, four D.11 FAQ entries) and the homepage Value Lens band links to `#inside-the-beta` (D.12). Page-specific CSS for these lives in `assets/css/pages/value-lens.css` (tokens only); the architecture diagram is inline SVG drawn twice (wide from 1024px, tall below).

> **Research pass (2026-09-26).** Addendum B is applied and QA-clean on the four pages it names (`/services/ai/#methods` grid, B.2.1 FAQ, the `5` proof cell; About 9.5 body; homepage 08 `RESEARCH` chip row and the mono line under the book card; Suite B.5.1 FAQ entries). Client rule: the About lead now says "25+ years of SAP delivery experience" instead of "two decades" (never 22+ or 20). "iFlow" is used only in the Suite mode name (Addendum A exact name); elsewhere copy says "integration flow" so non-technical readers follow it.

> **Integration pass (2026-09-26).** All pages are built. `README.md` is now the entry point (structure, preview, client TODOs). Addendum C (`COPY_CORRECTIONS.md`) is applied: no résumé-derived figures remain and the control model is three one-sentence cards. Shared components added to `site.css` since these notes were written: `h2.eyebrow` (eyebrow as section heading), `.hero--plain` (hero without a figure), `.hero__aside`, `.slim-band` (lead magnet / cross-link bands), `.diagram` (wide/tall drawing pair), `.method__extra`, `.list-numbered`, `.aside-rule`, `.form__row`, `.links--after`, `code`. The examples below still describe the vocabulary correctly; where they name a figure, the live copy follows Addendum C.

The foundation (tokens, stylesheet, script, brand assets, diagrams, partials) and the homepage are built, reviewed and QA-clean. Page builders add the inner pages using the vocabulary below. The specs remain the source of truth for copy and structure: `BRAND_SPEC.md` v1.1 (tokens, type, logo, motion, **Title Case rule**), `SITE_SPEC.md` (copy, page structure, titles and descriptions) and **`PRODUCTS_ADDENDUM.md` (Addendum A: the second product, SAP Intelligence Suite; it supersedes SITE_SPEC 1.1, 1.2, 1.3 column 3, 1.4, 3.7 and adds `/products/sap-intelligence-suite/` and section 14 entries). Read it right after SITE_SPEC.**

## 0. Rules

1. **Do not edit** `assets/css/tokens.css`, `assets/css/site.css`, `assets/css/theme.css`, `assets/js/site.js`, `assets/js/theme.js`, `index.html`, anything in `assets/logo/`, `assets/diagrams/`, `favicon*`, `apple-touch-icon.png`, `site.webmanifest` or `_partials/`. If a page needs a component the foundation lacks, note it in your report rather than patching the shared files. Theme changes go through `THEME_SPEC.md` first.
2. Page-specific CSS goes in `/assets/css/pages/<key>.css`, linked **after** `site.css` and **before** `theme.css` (the `{{PAGE_CSS}}` slot in the head partial), so the theme's card and band rules win. Keep it tiny and use tokens only (`var(--s-5)`, `var(--rule)`, or the theme's `var(--sg-*)`). Never write a colour value outside `tokens.css` and `theme.css`.
3. Copy is verbatim from SITE_SPEC / the Addendum. No new numbers, no new claims, hedges exactly as written. Banned words (SITE_SPEC 16.1) nowhere, including alt text, `<title>`, meta and SVG `<title>`. **Title Case (BRAND_SPEC 4.2, client rule v1.1): the tagline and every H1 and H2 use Title Case exactly as SITE_SPEC now prints them ("Delivery You Can Put in a Board Pack."). H3s, eyebrows, body, buttons, links, the status sentences and `<title>`/meta stay as written.** The Suite has its own mandatory status sentence wherever it is featured: "In use in SVLS LABS delivery. Available to customers on request; deployed in your landscape, reviewed by your architects."
4. No person is ever named. Voice is "our architects" / "our team" / "the leadership team".
5. Root-relative URLs (`/services/sap/`, `/assets/css/site.css`), directory-style internal links with trailing slash.
6. Accent rule: `--accent` (#E4432B) is graphics-only (underlines, ticks, points, focus ring). Any text or button fill uses `--accent-text`. The stylesheet already does this for every component; page CSS must too.
7. Every "TODO (client)" placeholder renders visibly with `<span class="todo">TODO</span>` (amber mono label). Never hide one with CSS.
8. One `<h1>` per page, one `<main id="main">`, landmarks, `data-reveal` only on blocks that are not hairline cells (hairlines do not animate).

## 1. File layout

```
/index.html                          homepage (canonical header/footer markup)
/services/sap/index.html             (builders) /services/cloud/  /services/ai/
/products/value-lens/index.html      (builders)
/products/sap-intelligence-suite/index.html   (builders; Addendum A.7)
/approach/  /about/  /contact/  /privacy/  /terms/  /404.html   (builders)
/.htmlvalidate.json                  html-validate config (explicit table/list roles are deliberate)
/assets/css/tokens.css               colour + type + spacing tokens, theme handling  (do not edit)
/assets/css/site.css                 everything else                                 (do not edit)
/assets/css/pages/<key>.css          page-specific overrides (builders, optional, tiny)
/assets/js/site.js                   one IIFE: nav, sheet, theme, reveal, forms, year (do not edit)
/assets/logo/                        mark.svg mark-mono.svg lockup.svg lockup-reversed.svg
                                     stacked.svg stacked-reversed.svg value-lens-mark.svg
                                     sap-intelligence-suite-mark.svg (Addendum A.2)
/assets/diagrams/                    landscape.svg method.svg control-model.svg practice-01/02/03.svg
                                     tick.svg arrow-link.svg check.svg
/assets/og/og-<key>.png              1200x630 per page (generate yours with _tools/make-og.js)
/favicon.svg /favicon-32.png /favicon-16.png /apple-touch-icon.png /site.webmanifest
/_partials/head.html header.html footer.html      copy these; not deployed
/_tools/make-og.js render-icons.js                 helpers; not deployed
```

`_partials/` and `_tools/` are excluded from deployment.

## 2. Starting a page

1. Copy `_partials/head.html` to the top of your file and replace the placeholders:
   - `{{TITLE}}` and `{{DESCRIPTION}}` exactly from SITE_SPEC section 14
   - `{{PATH}}` the page path with trailing slash (`/services/sap/`; use `/404.html` for the 404 page)
   - `{{OG}}` the OG key (`sap`, `cloud`, `ai`, `value-lens`, `suite`, `approach`, `about`, `contact`, `404`, `privacy`, `terms`)
   - `{{PAGE_CSS}}` the optional `<link rel="stylesheet" href="/assets/css/pages/<key>.css">` (or nothing), and `{{HEAD_EXTRA}}` your JSON-LD `<script type="application/ld+json">` (Service on the three service pages, SoftwareApplication with `"applicationCategory": "BusinessApplication"` and `"releaseNotes": "Private beta"` on Value Lens, SoftwareApplication with `"applicationCategory": "DeveloperApplication"`, `"operatingSystem": "Web"` and a provider Organization on the Suite page plus Organization, nothing on the others; never a Person).
   The head already contains: viewport, canonical, OG/Twitter tags, theme-color for both schemes, favicons, manifest, the **pre-paint theme snippet** (reads `localStorage['svls-theme']` and sets `data-theme` on `<html>` before first paint, and removes the `no-js` class), font preconnects, the exact Google Fonts URL, the two woff2 preloads, `tokens.css`, `site.css`, and `site.js` deferred. `<body>` is opened at the end of the partial.
2. Paste `_partials/header.html` verbatim (skip link, sticky header, Services and Products dropdowns, Menu sheet with Services and Products groups). **Do not change it.** The current page is highlighted automatically by `site.js` from `location.pathname` (a dropdown trigger is underlined when its panel contains the current page, so `/services/...` underlines Services and `/products/...` underlines Products). Without JS nothing is highlighted, which is acceptable; if you want a static fallback you may add `aria-current="page"` to the matching `.site-nav__link` and `.sheet__link` in your copy, nothing else.
3. Write `<main id="main">…</main>`.
4. Paste `_partials/footer.html` verbatim. It closes `</body></html>`.
5. Generate your OG image: `node _tools/make-og.js <key> "<page H1>"` (charcoal by default; see section 5).
6. Run the QA loop (section 6) until clean at both sizes.

Minimal skeleton of a page body:

```html
<main id="main">
  <section class="hero hero--plain" aria-labelledby="hero-title">
    <div class="hero-art hero-art--lite" aria-hidden="true">
      <svg class="hero-art__mark" viewBox="0 0 64 64" focusable="false">
        <path d="M4 24V4h20v4H8v16z" fill="currentColor"/>
        <circle cx="32" cy="32" r="13.5" fill="none" stroke="currentColor" stroke-width="5"/>
        <path d="M60 40v20H40v-4h16V40z" fill="var(--svls-accent, #E4432B)"/>
      </svg>
    </div>
    <div class="container">
      <div class="section-mark"><span class="numeral">01</span><p class="eyebrow">Practice 01 · SAP &amp; ERP</p></div>
      <h1 id="hero-title" class="mt-6">S/4HANA, BTP and Integration Suite, Delivered <span class="key">Clean Core</span> from the First Transport.</h1>
      <p class="lead mt-5">…</p>
      <div class="btn-row mt-6">…</div>
      <p class="trust">A 45-minute call with an architect, not a salesperson. Replies within one business day. <a href="/approach/">How we run engagements</a></p>
    </div>
  </section>
</main>
```

Inner-page hero H1 uses the plain `<h1>` (52/58 → 36/40 fluid, Inter Tight 800 under the theme). `class="display"` is for the homepage only. The hero renders as a shorter charcoal band; the `.hero-art--lite` block above is the faint mark every inner page carries.

## 3. Component vocabulary

Every class below lives in `site.css`. Sizes are fluid (`clamp()` between the phone and desktop values in BRAND_SPEC 6.2). Spacing utilities: `.mt-2 … .mt-7` (8 … 48px), `.mb-6`, `.measure` (64ch), `.small`, `.muted`, `.mono`, `.eyebrow`, `.numeral`, `.stat`, `.mono-title`, `.h2/.h3/.h4` (size without changing the heading level), `.visually-hidden`.

### 3.1 Section anatomy
Every section: `.section` (128/96/64px vertical padding) → `.container` → `.section-head` (mono numeral + eyebrow on a hairline, H2 in Title Case capped at 24ch, subcopy capped at 64ch). Use `.section--slim` for slim bands (partner band). Add `.band-surface` for the grey band, `.band-dark` for the dark band, `.has-grid` for the 64px grid texture (hero, About, 404, closing CTA only).

```html
<section class="section band-surface" id="figures" aria-labelledby="figures-title">
  <div class="container">
    <div class="section-head" data-reveal>
      <div class="section-mark"><span class="numeral">02</span><p class="eyebrow">Delivered figures</p></div>
      <h2 id="figures-title">Delivery You Can Put in a Board Pack.</h2>
      <p class="subcopy">Four figures from delivered work. Each one says where it was measured.</p>
    </div>
    …
  </div>
</section>
```
Eyebrows are written in normal case in the HTML and rendered uppercase by CSS.

### 3.2 Hairline grid cells
`.hgrid` + one of `.hgrid--4` (4 → 2 → 1), `.hgrid--3` (3 → 1 at 900px), `.hgrid--2` (2 → 1 at 600px). site.css draws hairlines between cells; **theme.css turns every cell into a card** (28px padding, hairline border, 6px radius, soft shadow, 2px lift on hover for content cards), so a grid of cards needs nothing more than the markup below. `.hgrid--bottom` is harmless (the theme removes the closing rule). Works on `<ul>`/`<ol>` (markers are removed) and `<div>`.

```html
<div class="hgrid hgrid--3 hgrid--bottom">
  <article>…</article><article>…</article><article>…</article>
</div>
```

### 3.3 Stat cell (proof strip)
Inside `.hgrid--4`. L-tick at top-left, mono stat numeral, 17px label, small muted context line.

```html
<ul class="hgrid hgrid--4 hgrid--bottom" role="list">
  <li class="stat-cell">
    <p class="stat stat-cell__num">25+</p>
    <p class="stat-cell__label">years of SAP delivery experience</p>
    <p class="stat-cell__ctx">Across our key architects.</p>
  </li>
  …
</ul>
```

### 3.4 Practice column / offer block
Inside `.hgrid--3`. 24px glyph in `--primary` (inline the practice SVG), numeral, H3, body, "Typical engagement"/"Deliverables" line with an eyebrow label, arrow link.

```html
<article class="practice">
  <svg class="practice__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">…practice-01.svg contents…</svg>
  <span class="numeral practice__num">01</span>
  <h3>SAP &amp; ERP</h3>
  <p class="practice__body">…</p>
  <p class="practice__typical"><span class="eyebrow">Deliverables</span>target architecture, extension register, …</p>
  <a class="arrow-link" href="/services/sap/">See the SAP &amp; ERP practice<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a>
</article>
```

### 3.5 Method timeline (4 → 2 → 1)
Points on a hairline are drawn by CSS (first point vermilion); `method.svg` exists for the Approach page if you want the standalone strip above an artefact list.

```html
<ol class="method" role="list">
  <li class="method__step"><span class="numeral">01</span><h3 class="h4">Specify — two weeks, fixed scope, fixed price.</h3><p>…</p></li>
  …
</ol>
<div class="method__after">
  <a class="btn btn--secondary" href="/contact/?intent=discovery&amp;offer=two-week">Start with a two-week discovery</a>
  <a class="arrow-link" href="/approach/">Read the Governed Delivery approach<svg …></svg></a>
</div>
```
Step titles are `h3.h4` (styled as H4) so heading levels stay in order under the H2.

### 3.6 Control-model list (three columns) + diagram
```html
<div class="hgrid hgrid--3 hgrid--bottom">
  <div class="control">
    <span class="mono-title">Read-before-write</span>
    <p class="control__body">…</p>
    <p class="control__prevents"><span class="eyebrow">Prevents</span>…</p>
  </div>…
</div>
<div class="control-diagram" aria-hidden="true"> …inline control-model.svg… </div>
```
The full control-model section (columns, diagram, spec table, pull-quote, links) is in `index.html` under `id="control-model"`; copy it whole to `/services/ai/` and keep the anchor `id="control-model"`. `.control-diagram` is hidden below 600px (its labels would render under 5px); the same information is in the table.

### 3.7 Spec table (mono keys, Inter values)
```html
<table class="spec-table">
  <thead><tr><th scope="col">Control</th><th scope="col">What it means in practice</th></tr></thead>
  <tbody><tr><th scope="row">Read-before-write</th><td>Current SAP state is read and shown before any proposal</td></tr>…</tbody>
</table>
```
Stacks on phone. Put it in `.grid` with `.col-7` next to a `.pullquote.col-5` (`<aside class="pullquote col-5"><h3>…</h3><p class="small muted">qualifier</p></aside>`).

### 3.8 FAQ
```html
<div class="faq-list">
  <details class="faq">
    <summary>Do you work on RISE with SAP…?<svg class="faq__glyph" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M0 8h16" stroke="currentColor" stroke-width="1.5"/><path class="v" d="M8 0v16" stroke="currentColor" stroke-width="1.5"/></svg></summary>
    <div class="faq__body"><p>All four: …</p></div>
  </details>
  …
</div>
```
The glyph is a plus that becomes a minus when open (`.v` hides).

### 3.9 CTA band + trust line
```html
<section class="section has-grid cta-band" aria-labelledby="close-title">
  <div class="container">
    <div class="section-head">…numeral/eyebrow, H2, subcopy…</div>
    <div class="btn-row">
      <a class="btn btn--primary" href="/contact/?intent=discovery">Book a discovery call</a>
      <a class="btn btn--secondary" href="/contact/?intent=discovery&amp;offer=two-week">Start with a two-week discovery</a>
    </div>
    <p class="trust">A 45-minute call with an architect, not a salesperson. Replies within one business day.</p>
    <div class="cta-links"><a class="arrow-link" href="/approach/">How we run engagements<svg …></svg></a></div>
    <p class="mono-note"><a href="/contact/?intent=partnership">SAP partners: ask about integration and BTP capacity.</a></p>
  </div>
</section>
```
Global CTA labels and targets (SITE_SPEC 1.4 + Addendum A.5): Book a discovery call `/contact/?intent=discovery` · Request Value Lens beta access `/products/value-lens/#beta` · Start with a two-week discovery `/contact/?intent=discovery&offer=two-week` · Talk to us about partner capacity `/contact/?intent=partnership` · Download the capability overview `/contact/?intent=overview` · **Request a Suite demo `/contact/?intent=suite-demo` (secondary; primary on the Suite page hero)**.
For the homepage-style dual inline forms see `index.html` `id="next-step"` (`.hgrid--2.cta-band__forms` with a `.form-title` + `.form` in each cell, then `.cta-band__after`).

Partner band: `<section class="section section--slim band-surface partner-band">` → `.section-mark`, then `.grid` with `.col-8` (H3 + `.partner-band__body`) and `.col-4.partner-band__action` (secondary button + `.mono-note`). Copy it from `index.html` `id="partners"`.

### 3.10 Forms
```html
<form class="form" method="POST" action="https://formspree.io/f/TODO_FORM_ID" data-netlify="true" name="contact"
      data-enhance data-success="Thank you. We reply within one business day." data-subject="Website enquiry">
  <input type="hidden" name="intent" value="discovery">
  <input type="hidden" name="form-name" value="contact">
  <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" hidden>
  <div class="field"><label class="field__label" for="c-name">Name</label><input class="input" id="c-name" name="name" type="text" autocomplete="name" required></div>
  <div class="field"><label class="field__label" for="c-email">Work email</label><input class="input" id="c-email" name="email" type="email" autocomplete="email" required></div>
  <div class="field">
    <label class="field__label" for="c-intent">I am contacting you about</label>
    <div class="select"><select class="input" id="c-intent" name="intent" required><option value="discovery">Discovery call</option>…<option value="suite-demo">SAP Intelligence Suite demo</option>…</select><svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M1 4l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></div>
  </div>
  <fieldset class="fieldset" data-show-when="intent=beta demo">
    <legend>Your role</legend>
    <div class="choices">
      <label class="choice"><input type="radio" name="role" value="finance" data-required><span>Finance</span></label>…
    </div>
  </fieldset>
  <div class="field"><label class="field__label" for="c-msg">Message <span class="opt">(optional)</span></label><textarea class="input" id="c-msg" name="message" rows="4" placeholder="Landscape, timeline, what good looks like"></textarea></div>
  <label class="choice"><input type="checkbox" name="offer" value="two-week"><span>Start with the two-week discovery (fixed scope, fixed price).</span></label>
  <button class="btn btn--primary" type="submit">Send</button>
  <p class="form__privacy">We use your details only to reply to you. See <a href="/privacy/">Privacy</a>.</p>
</form>
```
What `site.js` does for `form[data-enhance]`: adds `novalidate`; prefills from `?intent=`, `?offer=`, `?role=` (select value / radio / checkbox by `value`); shows/hides `[data-show-when="name=value value"]` groups and makes their `[data-required]` controls required only while shown; validates on submit with inline `.field__error` messages naming the field ("Work email is required.", "Enter a valid work email."); POSTs with `fetch` + `Accept: application/json`; on success replaces the form with `.form__success` using `data-success`; on failure shows `.form__failed` with a `mailto:service@svlslabs.com` link whose subject is `data-subject` and body is the filled fields. On the contact page use a hidden `intent` only if there is no select; the select's `name="intent"` is what the prefill targets. Use unique `id`s when two forms share a page (`d-`, `b-`, `c-` prefixes).

### 3.11 Badge, severity pills, status
- `<span class="badge">Private beta</span>` (PRIVATE BETA, amber fill, ink label; on `.band-dark` it remaps automatically). Always with the status sentence in the same section: "Private beta on synthetic SAP-like data. Production SAP connector in development."
- `<span class="pill pill--high">HIGH</span>`, `<span class="pill pill--medium">MEDIUM</span>` — label text is mandatory.
- `<span class="status-ok">Reviewed<svg …check…></svg></span>` for verified/reviewed; `.status-muted` for dismissed.

### 3.12 Product frame (Value Lens findings queue)
Copy the whole `.frame` block from `index.html` (inside `id="value-lens"`). It is a `<section class="frame" aria-label="…">` (a named region) holding a real `<table>` with explicit ARIA roles (the phone layout sets `display: block`, which would otherwise drop the table semantics), `data-label` on every cell (drives the stacked phone layout), an expanded row (`tr.is-expanded` + `tr.frame__detail` with three `.frame__block`s and two `aria-disabled` secondary buttons) and `.frame__foot`. It uses the dark band tokens: inside `.band-dark` nothing more is needed; on a white page add the class to the frame itself: `<div class="frame band-dark" …>` (this also adds `--shadow-2`). Long rule names carry `<wbr>` after the underscore so they wrap cleanly. Keep the synthetic values exactly. The table becomes the stacked `data-label` list below 700px **and whenever the frame itself is narrower than 540px** (a container query on `.frame`), because the six-column table clips below that width: a `.col-6` frame stacks between 1024 and 1199px and a `.col-5` frame stacks at every desktop width. The expanded row's three blocks go to one column at the same time. Put the full-size frame in `.col-6` or wider; nothing else is needed.

### 3.13 Bands, texture, dark mode
- `.band-surface` grey band (chips get a `--bg` fill automatically). `.band-dark` dark band (all tokens remap: text, rules, accent, buttons, badge, links, the inline logo bracket via `--svls-accent`). `.has-grid` = 64px hairline texture aligned to the container's left edge.
- Whole-page dark mode is handled by tokens: system preference unless the user chose Light, or `data-theme="dark"` from the toggle. Nothing to do per page; just never hard-code a colour.
- Inline logo/marks recolour through `currentColor` + `var(--svls-accent)`.

### 3.14 Key-word underline
One phrase per section at most, only where SITE_SPEC names it: `<span class="key">Clean Core</span>` (3px `--accent`, offset 6px, skip-ink off).

### 3.15 Buttons, links, chips, lists, book, TODO
- Buttons: `.btn.btn--primary`, `.btn.btn--secondary`, `.btn--nav` (44px), `.btn--sm` (36px). Put several in `.btn-row` (full width on phone). Dark-band styles are automatic.
- Text link: plain `<a>` inside `.prose`, `.trust`, `.faq__body`, `.cta-links`, or add class `link`. Arrow link: `.arrow-link` + the 12px line-and-point SVG (see 3.4).
- Chips: `<ul class="chips" role="list"><li class="chip">PS/EPPM</li>…</ul>`; labelled rows: `.chip-rows > .chip-row` (`<p class="eyebrow">Modules</p>` + `.chips`).
- Lists: `.list-points` (filled point: things we do), `.list-rings` (ring: things we never do), `.list-mono` (mono lines with hairlines).
- Book card: `.book > .book__cover[role=img][aria-label] > span` + `.book__caption` (title only, no author).
- Micro-label row and proof row (hero): `.microlabels` and `.proof-row` (`<li><span class="proof-row__num">25+</span><span class="proof-row__label">…</span></li>`).
- Visible placeholder: `<span class="todo">TODO</span> (client): registered address`.
- Mono note: `<p class="mono-note">NDA-friendly · …</p>` (uppercase via CSS).
- Prose pages (privacy, terms): wrap in `<div class="prose">`.

### 3.16 Product feature block, product lockup, workbench mock (Addendum A.6)
The homepage carries the SAP Intelligence Suite block at the end of section 07 (`index.html`, `.product-feature` inside `id="ai-assisted"`). Copy it for the Suite page hero (the mock goes in the right column, larger) and reuse the pieces:
- `.product-feature` hairline frame with `--r-2` corners → `.grid.product-feature__grid` → `.col-6.product-feature__copy` (lockup, H3, `.product-feature__body`, `.status`, `.btn-row`) + `.col-6` mock. Stacks on phone.
- Product lockup (BRAND_SPEC 11.2): `.product-lockup` → `svg.product-lockup__mark` (32px, the Suite mark inlined: master mark with three accent bars at y 27/31/35) + `.product-lockup__text` → `.product-lockup__name` ("SAP Intelligence Suite", Inter Tight 600, baseline on the bracket's lower edge) + `.product-lockup__by` ("by SVLS LABS", mono 12px; standalone lockups only, not in a nav or frame header). No BETA badge on the Suite.
- Workbench visual (Addendum A v2, generic): `.workbench[role=group][aria-label]` → `p.workbench__bar.workbench__bar--placeholder` (the placeholder request `Describe the interface, the object or the process`) → `.workbench__cols` (three `.workbench__col`, each `p.eyebrow` mode title + one `p.workbench__line`) → `p.workbench__foot` (`TRAINED ON YOUR LIBRARY · RUNS IN YOUR LANDSCAPE · ARCHITECT-REVIEWED`, uppercased by CSS). Add `.workbench--lg` for the Suite page hero. No example requests, no library figures, no operation counts, no version numbers (Addendum C v2 / A v2). Facts only from Addendum A.1; never another vendor's product name next to it.
- The Suite status sentence (`.status`) sits inside every block that features the product. Use `.status` (small, muted) for both products' status sentences.

### 3.17 Reveal
Add `data-reveal` to section heads, figures, frames, forms — not to hairline cells. `site.js` adds `.reveal` and then `.is-visible` at 15% visibility (once). Without JS, with reduced motion, or for blocks already on screen at load, nothing is hidden.

## 4. Diagrams

Files in `/assets/diagrams/` use `currentColor` for structure and `var(--svls-accent, #E4432B)` for the single vermilion element, so they recolour inside `.band-dark` and in dark mode when **inlined**. Inline them (paste the `<svg>` markup; the homepage does this for `landscape.svg` and `control-model.svg`). As `<img>` they render ink-on-transparent with the vermilion fallback and no page font (labels fall back to a system monospace).

| File | Use |
|---|---|
| `landscape.svg` 560×360 | homepage hero (already inlined) |
| `method.svg` 960×48 | four points 01–04 on a hairline (Approach page gates) |
| `control-model.svg` 960×120 | three bracket gates between SAP and SAP (inlined on the homepage; reuse on `/services/ai/`) |
| `practice-01/02/03.svg` 24px | glyphs above practice/offer titles, in `--primary` (`.practice__glyph`) |
| `tick.svg` 8px | the L-tick (the stat cell draws it in CSS; the file is for other uses) |
| `arrow-link.svg` 12px | the arrow-link glyph (inline it inside `.arrow-link`) |
| `check.svg` 16px | the ✓ for reviewed/verified |

Keep `role="img"` + `<title id>` when the drawing conveys meaning; use `aria-hidden="true"` (and drop the title) when it repeats adjacent text. New diagrams (e.g. `reference-cloud.svg`, `valuelens-flow.svg`) follow BRAND_SPEC 9.1: butt caps, miter joins, no arrows, terminal points, JetBrains Mono uppercase labels, one accent element. Note: a fixed-aspect SVG shrinks its labels on phones (the hero diagram's 12-unit labels render at ~8px at 390px width). Prefer wide, short drawings for full-width use, or hide a purely decorative one below 600px as `.control-diagram` does.

## 5. Tools

**OG image** (1200×630 PNG on charcoal per THEME_SPEC 8: faint grid, coral glow, faint mark, reversed stacked lockup left, title right in Inter Tight 800, two lines when the title has two sentences; `--light` renders the old white variant). Pass the page H1 in Title Case exactly as SITE_SPEC prints it:
```
node _tools/make-og.js <key> "<title>" [--light]     →  /assets/og/og-<key>.png
node _tools/make-og.js sap "S/4HANA, BTP and Integration Suite, Delivered Clean Core from the First Transport."
node _tools/make-og.js value-lens "Value Lens. The Margin Leak Finder for Order-to-Cash."
node _tools/make-og.js suite "SAP Intelligence Suite. SAP Engineering in Plain English."
```
Needs network for Google Fonts; it warns if Inter Tight did not load. All twelve images were regenerated on the charcoal theme with each page's H1 (home: the tagline).

**Favicons**: `node _tools/render-icons.js` regenerates the PNGs from `/favicon.svg` (already done; only rerun if the mark changes, which it should not).

## 6. QA loop (mandatory per page)

```
node /tmp/claude-0/-home-user-computational-intelligence-enterprise/78a9f310-99db-58ce-b04c-97c860c77f02/scratchpad/tools/snap.js \
  /home/user/computational-intelligence-enterprise/website \
  /tmp/claude-0/-home-user-computational-intelligence-enterprise/78a9f310-99db-58ce-b04c-97c860c77f02/scratchpad/shots/<label> \
  /services/sap/index.html
```
Read the mobile and desktop PNGs, `summary.txt` and `report.json`. Zero console errors, zero failed requests, zero serious/critical axe issues, `docW == vw` at 390, no broken links or anchors (links to pages not yet built will show as broken until they exist). The homepage currently reports 20 "broken" links, all of which are inner pages or contact intents on them.

Also run `html-validate` from the tools folder (it picks up `/.htmlvalidate.json`): `/tmp/claude-0/-home-user-computational-intelligence-enterprise/78a9f310-99db-58ce-b04c-97c860c77f02/scratchpad/tools/node_modules/.bin/html-validate <page>.html`. It must be clean. A Playwright interaction script that exercises the dropdowns, sheet, theme toggle, reveal and forms lives at `…/scratchpad/tools/interact.js` (`node interact.js <siteRoot> <outDir>`); it is written for the homepage but its nav, sheet and theme checks apply to any page.

Chromium in this environment needed the proxy CA in the browser NSS store to load Google Fonts; that is already imported (`certutil -d sql:/root/.pki/nssdb -L` lists "CCR Upstream Proxy CA"). If screenshots show a fallback sans instead of Inter Tight, re-import from `/root/.ccr/agent-proxy-ca.crt`.

## 7. Foundation decisions worth knowing

- **Lockup viewBox is 284×64, not 320×64.** Real Inter Tight metrics make "SVLS" 107 units wide at 44px (the spec estimated 112); LABS starts at x=195, which gives an 8.3-unit ink-to-ink gap between the S and the L (measured with canvas `measureText` on the loaded font, not on advance boxes), and the ink ends at ~280, so the canvas is trimmed to 284 for a 4-unit inset on both sides. The stacked lockup's wordmark (x 48 / 175.5) is centred under the mark with the same proportional gap. Inline lockups in the header (32px; 28px below 900px; mark-only below 400px) and footer (40px) use the page webfont; the exported files use `<text>` with the same family stack and weight, so they render with Inter Tight where it is installed/loaded and with a sans-serif fallback elsewhere. Outline conversion for print is a client TODO.
- **Header height is 68px under the theme** (`--nav-h`), charcoal and translucent on every page; `theme.js` adds `.is-scrolled` for the drop shadow.
- **Theme toggle**: desktop toggle (ring + half-ring) is shown from 1024px (SITE_SPEC says 1200; at 900–1023 the six nav items plus the button fill the bar, so the toggle is hidden there), the System/Light/Dark chips live in the Menu sheet below 900px. Choice stored under `localStorage['svls-theme']`; "System" removes the key. Pre-paint snippet lives in `head.html`.
- **Menu sheet**: without JS the Menu control is `<a href="#site-nav">` (the footer nav). With JS it becomes a `<button>` with `aria-expanded`/`aria-controls`, the sheet traps focus (Close button included), locks body scroll, closes on Escape, backdrop click, Close, or a resize to ≥900px.
- **Dropdowns (Services, Products)**: `site.js` wires every `.has-dropdown` independently and keeps **at most one panel open** (opening one closes the other). Open on hover, focus, click; a click on a panel that hover already opened keeps it open (pinned until mouseleave) instead of toggling it shut; Escape closes and returns focus; ArrowDown/ArrowUp/Home/End move within the open panel; closes on focus-out or outside click. No shadow on the panel (BRAND_SPEC 10 allows shadows only on the nav edge, the product frame and the mobile sheet). Panels are `width: max-content`, at least 460px, capped at 560px from 1024px (every description on one line) and at 460px below that, where the Products panel would otherwise run past the viewport's right edge at 900px (its Suite description wraps to two lines there, by design). Without JS the `.no-js` CSS fallback opens a panel on hover/focus-within.
- **Font preloads** point at the current Google-served latin woff2 files for Inter Tight and Inter (variable fonts, one file per family). If Google rotates the URLs the preload is wasted (a console warning, not an error); the stylesheet still loads the fonts.
- **Stat-cell L-tick** aligns with the cell's text edge (24px in on non-first cells).
- **Product frame table**: 14px mono (per spec), 8px cell padding, nowrap on CASE/LEAKAGE/COVERAGE; STATUS wraps; phone layout is a stacked list driven by `data-label`. `POLICY v1.3` keeps its lowercase v under the uppercase transform via `<span class="keep-case">v1.3</span>`; use the same for any tool name or version inside an uppercased element.
- **Hero diagram labels are 14 units** (not 12) so they render at 12px in the 5-column slot at 1200px (BRAND_SPEC 6.2: no text below 12px). On a 390px phone they render at ~9px; that is the remaining limitation of a fixed-aspect drawing. `control-model.svg` keeps 12 units because it renders wider than 1x.
- **Hit areas**: `.arrow-link` carries `padding-block: 9px; margin-block: -9px` (44px target without moving the layout), the sheet's theme chips extend their hit area with `::before`, and the mark-only brand link is at least 44px wide.
- **Headings**: H2 sits `--s-7` (48px) under the section mark from 600px (`--s-6` on phone), per BRAND_SPEC 6.2 heading margins; display/H1 tracking is -0.02em from 600px and H2 tracking -0.02em from 1024px.
- The homepage hero diagram and the control-model diagram are inlined copies of the files in `/assets/diagrams/`; if you change a file, change the inline copy too (or vice versa).

## 8. Client TODOs to carry into DEPLOY.md (from the Addendum and this build)

- Replace `TODO_FORM_ID` (Formspree) or enable Netlify Forms; confirm the `service@svlslabs.com` mailbox; registered address and phones (footer, contact, about).
- The three lead-magnet PDFs (capability overview, Governed Agent Control Checklist, Clean Core integration checklist).
- SAP Intelligence Suite (Addendum A.1 v2): confirm the commercial status wording and decide on the product name: SAP trademark guidance usually asks third parties not to lead a product name with "SAP" ("Intelligence Suite for SAP" is the safer descriptive form). The site ships the client's current name. No library figures or example requests ship (Addendum C).
- Addendum B: the research copy says "published on GitHub" without a link because the repositories sit under a personal account. TODO (client): create an organisation GitHub account and mirror the presentable repositories; then add the two text links named in RESEARCH_ADDENDUM B.3.2 to the About page. Confirm the book is on sale before any copy says "published".
- Trademark screen for the mark and "Value Lens" (BRAND_SPEC 8.8). Outline conversion of the exported lockup SVGs for print.
