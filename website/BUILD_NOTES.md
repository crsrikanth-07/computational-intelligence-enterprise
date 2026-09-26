# SVLS LABS website — BUILD_NOTES (for page builders)

The foundation (tokens, stylesheet, script, brand assets, diagrams, partials) and the homepage are built and QA-clean. Page builders add the inner pages using the vocabulary below. The specs remain the source of truth for copy and structure: `BRAND_SPEC.md` (tokens, type, logo, motion) and `SITE_SPEC.md` (copy, page structure, titles and descriptions).

## 0. Rules

1. **Do not edit** `assets/css/tokens.css`, `assets/css/site.css`, `assets/js/site.js`, `index.html`, anything in `assets/logo/`, `assets/diagrams/`, `favicon*`, `apple-touch-icon.png`, `site.webmanifest` or `_partials/`. If a page needs a component the foundation lacks, note it in your report rather than patching the shared files.
2. Page-specific CSS goes in `/assets/css/pages/<key>.css`, linked **after** `site.css` (put the `<link>` in the `{{HEAD_EXTRA}}` slot). Keep it tiny and use tokens only (`var(--s-5)`, `var(--rule)` ...). Never write a colour value outside `tokens.css`.
3. Copy is verbatim from SITE_SPEC. No new numbers, no new claims, hedges exactly as written. Banned words (SITE_SPEC 16.1) nowhere, including alt text, `<title>`, meta and SVG `<title>`.
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
/approach/  /about/  /contact/  /privacy/  /terms/  /404.html   (builders)
/assets/css/tokens.css               colour + type + spacing tokens, theme handling  (do not edit)
/assets/css/site.css                 everything else                                 (do not edit)
/assets/css/pages/<key>.css          page-specific overrides (builders, optional, tiny)
/assets/js/site.js                   one IIFE: nav, sheet, theme, reveal, forms, year (do not edit)
/assets/logo/                        mark.svg mark-mono.svg lockup.svg lockup-reversed.svg
                                     stacked.svg stacked-reversed.svg value-lens-mark.svg
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
   - `{{OG}}` the OG key (`sap`, `cloud`, `ai`, `value-lens`, `approach`, `about`, `contact`, `404`, `privacy`, `terms`)
   - `{{HEAD_EXTRA}}` your JSON-LD `<script type="application/ld+json">` (Service on the three service pages, SoftwareApplication with `"applicationCategory": "BusinessApplication"` and `"releaseNotes": "Private beta"` on Value Lens, nothing on the others; never a Person) plus the optional `<link rel="stylesheet" href="/assets/css/pages/<key>.css">`.
   The head already contains: viewport, canonical, OG/Twitter tags, theme-color for both schemes, favicons, manifest, the **pre-paint theme snippet** (reads `localStorage['svls-theme']` and sets `data-theme` on `<html>` before first paint, and removes the `no-js` class), font preconnects, the exact Google Fonts URL, the two woff2 preloads, `tokens.css`, `site.css`, and `site.js` deferred. `<body>` is opened at the end of the partial.
2. Paste `_partials/header.html` verbatim (skip link, sticky header, Services dropdown, Menu sheet). **Do not change it.** The current page is highlighted automatically by `site.js` from `location.pathname` (any `/services/...` path also underlines the "Services" trigger). Without JS nothing is highlighted, which is acceptable; if you want a static fallback you may add `aria-current="page"` to the matching `.site-nav__link` and `.sheet__link` in your copy, nothing else.
3. Write `<main id="main">…</main>`.
4. Paste `_partials/footer.html` verbatim. It closes `</body></html>`.
5. Generate your OG image: `node _tools/make-og.js <key> "<page H1 or title>" [--dark]` (see section 5).
6. Run the QA loop (section 6) until clean at both sizes.

Minimal skeleton of a page body:

```html
<main id="main">
  <section class="section" aria-labelledby="hero-title">
    <div class="container">
      <div class="section-mark"><span class="numeral">01</span><p class="eyebrow">Practice 01 · SAP &amp; ERP</p></div>
      <h1 id="hero-title" class="mt-6">S/4HANA, BTP and Integration Suite, delivered <span class="key">Clean Core</span> from the first transport.</h1>
      <p class="lead mt-5">…</p>
      <div class="btn-row mt-6">…</div>
      <p class="trust">A 45-minute call with an architect, not a salesperson. Replies within one business day. <a href="/approach/">How we run engagements</a></p>
    </div>
  </section>
</main>
```

Inner-page hero H1 uses the plain `<h1>` (52/58 → 36/40 fluid). `class="display"` is for the homepage only.

## 3. Component vocabulary

Every class below lives in `site.css`. Sizes are fluid (`clamp()` between the phone and desktop values in BRAND_SPEC 6.2). Spacing utilities: `.mt-2 … .mt-7` (8 … 48px), `.mb-6`, `.measure` (64ch), `.small`, `.muted`, `.mono`, `.eyebrow`, `.numeral`, `.stat`, `.mono-title`, `.h2/.h3/.h4` (size without changing the heading level), `.visually-hidden`.

### 3.1 Section anatomy
Every section: `.section` (128/96/64px vertical padding) → `.container` → `.section-head` (mono numeral + eyebrow on a hairline, H2 capped at 24ch, subcopy capped at 64ch). Use `.section--slim` for slim bands (partner band). Add `.band-surface` for the grey band, `.band-dark` for the dark band, `.has-grid` for the 64px grid texture (hero, About, 404, closing CTA only).

```html
<section class="section band-surface" id="figures" aria-labelledby="figures-title">
  <div class="container">
    <div class="section-head" data-reveal>
      <div class="section-mark"><span class="numeral">02</span><p class="eyebrow">Delivered figures</p></div>
      <h2 id="figures-title">Delivery you can put in a board pack.</h2>
      <p class="subcopy">Four figures from delivered work. Each one says where it was measured.</p>
    </div>
    …
  </div>
</section>
```
Eyebrows are written in normal case in the HTML and rendered uppercase by CSS.

### 3.2 Hairline grid cells
`.hgrid` + one of `.hgrid--4` (4 → 2 → 1), `.hgrid--3` (3 → 1 at 900px), `.hgrid--2` (2 → 1 at 600px). Each direct child gets a top hairline; cells after the first in a row get a left hairline (desktop/tablet only). Add `.hgrid--bottom` for a closing rule. Works on `<ul>`/`<ol>` (markers are removed) and `<div>`.

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
    <p class="stat stat-cell__num">200+</p>
    <p class="stat-cell__label">CPI flows built</p>
    <p class="stat-cell__ctx">Pattern library, contract per flow.</p>
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
    <div class="select"><select class="input" id="c-intent" name="intent" required><option value="discovery">Discovery call</option>…</select><svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M1 4l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></div>
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
What `site.js` does for `form[data-enhance]`: adds `novalidate`; prefills from `?intent=`, `?offer=`, `?role=` (select value / radio / checkbox by `value`); shows/hides `[data-show-when="name=value value"]` groups and makes their `[data-required]` controls required only while shown; validates on submit with inline `.field__error` messages naming the field ("Work email is required.", "Enter a valid work email."); POSTs with `fetch` + `Accept: application/json`; on success replaces the form with `.form__success` using `data-success`; on failure shows `.form__failed` with a `mailto:hello@svlslabs.com` link whose subject is `data-subject` and body is the filled fields. On the contact page use a hidden `intent` only if there is no select; the select's `name="intent"` is what the prefill targets. Use unique `id`s when two forms share a page (`d-`, `b-`, `c-` prefixes).

### 3.11 Badge, severity pills, status
- `<span class="badge">Private beta</span>` (PRIVATE BETA, amber fill, ink label; on `.band-dark` it remaps automatically). Always with the status sentence in the same section: "Private beta on synthetic SAP-like data. Production SAP connector in development."
- `<span class="pill pill--high">HIGH</span>`, `<span class="pill pill--medium">MEDIUM</span>` — label text is mandatory.
- `<span class="status-ok">Reviewed<svg …check…></svg></span>` for verified/reviewed; `.status-muted` for dismissed.

### 3.12 Product frame (Value Lens findings queue)
Copy the whole `.frame` block from `index.html` (inside `id="value-lens"`). It is a real `<table>` with ARIA roles, `data-label` on every cell (drives the stacked phone layout), an expanded row (`tr.is-expanded` + `tr.frame__detail` with three `.frame__block`s and two `aria-disabled` secondary buttons) and `.frame__foot`. It uses the dark band tokens: inside `.band-dark` nothing more is needed; on a white page add the class to the frame itself: `<div class="frame band-dark" …>` (this also adds `--shadow-2`). Long rule names carry `<wbr>` after the underscore so they wrap cleanly. Keep the synthetic values exactly.

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
- Micro-label row and proof row (hero): `.microlabels` and `.proof-row` (`<li><span class="proof-row__num">22+</span><span class="proof-row__label">…</span></li>`).
- Visible placeholder: `<span class="todo">TODO</span> (client): registered address`.
- Mono note: `<p class="mono-note">NDA-friendly · …</p>` (uppercase via CSS).
- Prose pages (privacy, terms): wrap in `<div class="prose">`.

### 3.16 Reveal
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

**OG image** (1200×630 PNG, white or `--dark`, hairline grid, stacked lockup left, title right in Inter Tight 700 40px, two lines when the title has two sentences):
```
node _tools/make-og.js <key> "<title>" [--dark]      →  /assets/og/og-<key>.png
node _tools/make-og.js sap "S/4HANA, BTP and Integration Suite, delivered Clean Core from the first transport."
node _tools/make-og.js value-lens "Value Lens: Margin Leak Finder for SAP O2C" --dark
```
Needs network for Google Fonts; it warns if Inter Tight did not load. `og-home.png` exists.

**Favicons**: `node _tools/render-icons.js` regenerates the PNGs from `/favicon.svg` (already done; only rerun if the mark changes, which it should not).

## 6. QA loop (mandatory per page)

```
node /tmp/claude-0/-home-user-computational-intelligence-enterprise/78a9f310-99db-58ce-b04c-97c860c77f02/scratchpad/tools/snap.js \
  /home/user/computational-intelligence-enterprise/website \
  /tmp/claude-0/-home-user-computational-intelligence-enterprise/78a9f310-99db-58ce-b04c-97c860c77f02/scratchpad/shots/<label> \
  /services/sap/index.html
```
Read the mobile and desktop PNGs, `summary.txt` and `report.json`. Zero console errors, zero failed requests, zero serious/critical axe issues, `docW == vw` at 390, no broken links or anchors (links to pages not yet built will show as broken until they exist). The homepage currently reports 18 "broken" links, all of which are the inner pages.

Chromium in this environment needed the proxy CA in the browser NSS store to load Google Fonts; that is already imported (`certutil -d sql:/root/.pki/nssdb -L` lists "CCR Upstream Proxy CA"). If screenshots show a fallback sans instead of Inter Tight, re-import from `/root/.ccr/agent-proxy-ca.crt`.

## 7. Foundation decisions worth knowing

- **Lockup viewBox is 288×64, not 320×64.** Real Inter Tight metrics make "SVLS" 107 units wide at 44px (the spec estimated 112); LABS starts at x=196 for the specified 8-unit gap and the ink ends at ~282, so the canvas is trimmed to keep clear space symmetric. Inline lockups in the header (32px; 28px below 900px; mark-only below 400px) and footer (40px) use the page webfont; the exported files use `<text>` with the same family stack and weight, so they render with Inter Tight where it is installed/loaded and with a sans-serif fallback elsewhere. Outline conversion for print is a client TODO.
- **Theme toggle**: desktop toggle (ring + half-ring) is shown from 900px, the System/Light/Dark chips live in the Menu sheet below 900px. Choice stored under `localStorage['svls-theme']`; "System" removes the key. Pre-paint snippet lives in `head.html`.
- **Menu sheet**: without JS the Menu control is `<a href="#site-nav">` (the footer nav). With JS it becomes a `<button>` with `aria-expanded`/`aria-controls`, the sheet traps focus (Close button included), locks body scroll, closes on Escape, backdrop click, Close, or a resize to ≥900px.
- **Services dropdown**: opens on hover, focus, click; Escape closes and returns focus; ArrowDown/ArrowUp/Home/End move; closes on focus-out or outside click. Without JS the `.no-js` CSS fallback opens it on hover/focus-within.
- **Font preloads** point at the current Google-served latin woff2 files for Inter Tight and Inter (variable fonts, one file per family). If Google rotates the URLs the preload is wasted (a console warning, not an error); the stylesheet still loads the fonts.
- **Stat-cell L-tick** aligns with the cell's text edge (24px in on non-first cells).
- **Product frame table**: 13px mono, 8px cell padding, nowrap on CASE/LEAKAGE/COVERAGE; STATUS wraps; phone layout is a stacked list driven by `data-label`.
- The homepage hero diagram and the control-model diagram are inlined copies of the files in `/assets/diagrams/`; if you change a file, change the inline copy too (or vice versa).
