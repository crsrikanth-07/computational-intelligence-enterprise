# SVLS LABS — THEME_SPEC ("Signal Premium", applied site-wide with tweaks)

Status: final visual system for svlslabs.com. The client chose the Signal Premium option and asked for it "with tweaks"; this document records the result so future edits stay consistent. It **supersedes BRAND_SPEC sections 5 (colour), 6 (typography), 10 (spacing, radius, shadow, borders) and 12 (motion)**. Everything else in BRAND_SPEC stands: name usage, positioning, tagline, voice, banned words, the logo system and its rules, iconography vocabulary, the Value Lens sub-brand rules, the accessibility baseline, and the copy rules in SITE_SPEC and its addenda. Copy is never changed by the theme.

Where BRAND_SPEC 5.1 said "no gradients, no shadows with colour, no second hue", this theme permits exactly the gradients, glows and the coral tint listed here and nothing more.

---

## 1. Files and load order

```
/assets/css/tokens.css     brand tokens (unchanged; the base for everything)
/assets/css/site.css       structure and components (unchanged)
/assets/css/pages/<key>.css   optional page layout (tokens only)
/assets/css/theme.css      THE THEME: loaded last, restyles only, never changes markup order or copy
/assets/js/site.js         behaviour (unchanged)
/assets/js/theme.js        polish only: adds .is-scrolled to the sticky header; nothing depends on it
```

Head order on every page (see `_partials/head.html`, slot `{{PAGE_CSS}}`): fonts (the BRAND_SPEC URL, then the Inter Tight 800 request) → tokens.css → site.css → the page stylesheet → theme.css → site.js → theme.js. `theme-color` is `#0E1116` for both colour schemes because the header is charcoal in both.

The Google Fonts request for the theme's display weight is separate and exact:
`https://fonts.googleapis.com/css2?family=Inter+Tight:wght@800&display=swap`.

---

## 2. Tokens (supersedes BRAND_SPEC 5.2 for the values below; tokens.css stays the base)

### 2.1 Theme tokens (`:root` in theme.css)

| Token | Light page | Dark page (system dark or `data-theme="dark"`) | Use |
|---|---|---|---|
| `--sg-ink` | `#0E1116` | same | charcoal: every hero, the header, dark bands, the footer, the 404 page |
| `--sg-ink-2` | `#141A22` | same | raised charcoal surfaces (cards on charcoal) |
| `--sg-coral` | `#FF6A50` | same | accent on charcoal (graphic): trace pulse, hot node, pill points, glows |
| `--sg-coral-text` | `#FF8A74` | same | coral safe for 12px text on charcoal (arrow links on dark, footer eyebrows) |
| `--sg-verm` | `#E4432B` | same | vermilion (graphic): stat ticks, gradient start |
| `--sg-page` | `#FFFFFF` | `#0B0E13` | white band |
| `--sg-band` | `#F5F6F8` | `#10151C` | soft band |
| `--sg-card` | `#FFFFFF` | `#141923` | card fill |
| `--sg-card-2` | `#F9FAFB` | `#171D26` | table row hover |
| `--sg-line` | `rgba(16,20,24,.08)` | `rgba(255,255,255,.08)` | card hairline |
| `--sg-line-strong` | `rgba(16,20,24,.14)` | `rgba(255,255,255,.14)` | hovered card hairline, list rules, input borders |
| `--sg-shadow` | `0 1px 2px rgba(16,20,24,.04), 0 14px 32px -14px rgba(16,20,24,.12)` | black-based | resting card |
| `--sg-shadow-hover` | deeper, `-18px` spread | black-based | lifted card |
| `--sg-radius` / `--sg-radius-lg` | `6px` / `12px` | same | cards / panels, tables, diagrams, forms |
| `--sg-hairline` | `linear-gradient(90deg, line-strong, line 55%, transparent)` | same | section-mark rule, card sub-rules |
| `--sg-gradient` | `linear-gradient(90deg, #E4432B, #FF6A50)` | same | key-word underline, method spine, partner-band bar, product-feature top bar |
| `--sg-btn` / `--sg-btn-hover` | `linear-gradient(135deg, #D53B22, #C8351F)` / `... #BA311C` | same | primary button fill (white label 4.7:1 on the lightest stop) |
| `--sg-btn-glow` / `-hover` | `0 10px 24px -10px rgba(228,67,43,.55)` / `0 18px 32px -12px rgba(255,106,80,.65)` | same | primary button glow |
| `--sg-halo` | black drop + coral glow + inner highlight | same | product frame and workbench |

Base token adjustments on `:root`: `--surface: var(--sg-band)`, `--r-1: 4px`, `--r-2: 8px`, `--shadow-2: 0 24px 64px -24px rgba(16,20,24,.35)`, `--nav-h: 68px`.

### 2.2 Charcoal contexts

`.hero`, `.site-header`, `.sheet`, `.band-dark` (dark bands, footer, the 404 `<main>`) and `.nf` share one token set in both colour schemes: `--bg: #0E1116`, `--surface: #141A22`, `--rule: rgba(255,255,255,.09)`, `--text: #F5F6F8`, `--text-muted: #AEB6C2`, `--primary: #F3F4F6`, `--accent: #FF6A50`, `--accent-text: #FF7A62`, `--on-accent: #0B0E13`, `--success: #4CC38A`, `--warn: #E6B05C` (also `--warn-fill`, with `--on-warn: #0B0E13`), `--svls-accent: #FF6A50`, `color-scheme: dark`. Cards inside them use `--sg-card: #141A22` and white hairlines.

### 2.3 Verified contrast pairs added by the theme (WCAG 2.x)

| Foreground | Background | Ratio | Use |
|---|---|---|---|
| `#F5F6F8` | `#0E1116` | 17.5:1 | hero and dark-band text |
| `#B4BCC8` | `#0E1116` | 9.6:1 | hero lead |
| `#AEB6C2` | `#0E1116` | 8.9:1 | hero status, muted on charcoal |
| `#98A2B0` | `#0E1116` | 6.8:1 | trust line, frame footer |
| `#FF7A62` | `#0E1116` | 7.1:1 | links and numerals on charcoal |
| `#FF8A74` | `#0E1116` | 8.0:1 | 12px coral text on charcoal |
| `#FFFFFF` | `#D53B22` | 4.7:1 | primary button label on the lightest gradient stop |
| `#9A6412` | `#FCF5EB` (MEDIUM pill tint on white) | 4.6:1 | MEDIUM pill on light cards |
| `#E6B05C` | `#141A22` | 8.9:1 | MEDIUM pill and TODO label on charcoal |
| `rgba(243,244,246,.78)` on `#0E1116` | | 12:1 | nav items |

Rule kept from BRAND_SPEC 5.3: text-bearing elements use `--accent-text` (light `#C8351F`, charcoal `#FF7A62`, dark page `#FF6A50`); `--accent` and `--sg-coral` are graphic only.

---

## 3. Typography (supersedes BRAND_SPEC 6.2 sizes and weights)

Fonts stay Inter Tight / Inter / JetBrains Mono. The theme adds Inter Tight 800.

| Role | Size | Weight / tracking |
|---|---|---|
| Display (homepage H1) | `clamp(42px, 2.9vw + 30px, 76px)`, line-height 1.02, max 16ch | Inter Tight 800, -0.03em |
| H1 (inner heroes) | `clamp(36px, ..., 52px)` from site.css, line-height 1.04, max 26ch | Inter Tight 800, -0.03em |
| H2 | `clamp(30px, 1.5vw + 22px, 44px)`, line-height 1.1, max 26ch | Inter Tight 700, -0.03em (Title Case copy untouched) |
| H3 | `clamp(20px, 0.4vw + 18px, 23px)`; practice cards 22px | Inter Tight 600, -0.015em |
| H4 | site.css sizes | 600, -0.005em |
| Lead | `clamp(17px, 0.35vw + 15.6px, 20px)` in heroes, max 56ch | Inter 400 |
| Body / small | site.css sizes; `.small`, `.status`, `.trust` +0.002em | |
| Eyebrow | 12/16 mono uppercase | 600, +0.1em |
| Numeral | 13/16 mono | 600, +0.08em; in `.section-mark` a 24px coral pill (12px, +0.1em) |
| Stat | `clamp(38px, 1.6vw + 28px, 52px)` | Inter Tight 700, -0.03em, tabular numerals (the brand's mono stat is retired) |
| Mono in frames and workbench | 14/20 | JetBrains Mono 400 |

Tabular numerals stay on `body` (`font-feature-settings: "tnum"`). Measures: body 64ch, lead 56ch, H1 26ch, H2 26ch.

**Key-word underline** (`.key`): a 0.07em gradient bar (`--sg-gradient`) drawn as a background at the text's bottom edge, `box-decoration-break: clone` so it repeats per line when the phrase wraps. One phrase per section, only where SITE_SPEC names it (unchanged rule).

---

## 4. Layout, bands and rhythm

- Container, grid, gutters and section paddings are unchanged from BRAND_SPEC 7 / site.css. After a charcoal hero the next section keeps its full top padding (theme resets the `.hero--plain + .section` reduction).
- **Bands alternate automatically.** Counting the hero as band 1 (charcoal), the sections of `<main>` alternate soft (`--sg-band`) and white (`--sg-page`): even sections soft, odd sections white. Dark bands (`.band-dark`) keep their place in the count. A page stylesheet no longer decides band colour; `.band-surface` is cosmetic only. Check the rhythm when adding or removing a section.
- Slim bands (partner, lead magnet, cross-link) put their copy and action in one 12px-radius card with a 4px vertical gradient bar at the left edge; the band's own hairlines are removed.
- The section mark keeps its hairline as a gradient (`--sg-hairline`) with the numeral in a coral pill.

---

## 5. Components

### 5.1 Header and navigation
Charcoal translucent bar (`rgba(14,17,22,.84)`, 16px blur, 150% saturate), 68px tall, inset bottom hairline; `.is-scrolled` (theme.js) adds a soft drop shadow. Nav items at 78% white, white on hover and for the current page with a 2px coral underline offset 9px. Dropdown panels are dark glass (`rgba(18,23,31,.96)`, 16px blur, 10px radius, 8px padding, 6px-radius rows, white titles, `#A9B1BD` descriptions). The Menu button is a 44px outlined pill; the Menu sheet is charcoal with coral group labels and white/ink theme chips. "Book a discovery call" in the bar is the primary button at 44px.

### 5.2 Hero (every page)
Every page opens on charcoal. `.hero` carries: a gradient atmosphere (`::before`: two coral/vermilion radial glows, the 64px grid at 4% white, a vertical charcoal gradient), a grain layer (`::after`, 7% screen), and `div.hero-art` (aria-hidden) placed right after the opening `<section>` tag:
- Homepage (`.hero.hero--home`): the faint mark (720px, 4.5% white, coral bracket at 12%) plus the data-trace SVG (two lines, five nodes, one hot coral node, the coral pulse). Paddings 44/56 → 56/64 → 64/80.
- Inner pages (`.hero-art--lite`): the faint mark only (560px, top -36%, 340px on phones). Paddings 40/48 → 48/56 → 56/72. The 404 `.nf` section gets the same treatment.
Copy on charcoal: eyebrow 72% white, H1 white (800), lead `#B4BCC8`, status `#AEB6C2`, trust `#98A2B0` with coral links, buttons per 5.3. Micro-label rows: 9% white hairlines, 66% white text. Proof rows: a glass panel (12px radius, 9% white border) with 30–34px Inter Tight 700 figures.
Figures in the right column: the landscape diagram sits in a glass card (14px radius, 10px blur, a coral top highlight, coral point before the caption); a product frame or workbench in `.hero__aside` gets a coral radial halo behind it.

### 5.3 Buttons and links (all 44px targets or taller)
- Primary: `--sg-btn` gradient, white 600 label, 6px radius, inset highlight + `--sg-btn-glow`; hover deepens the fill and the glow (no movement). Focus: 2px `--accent` ring, offset 3px.
- Secondary on light: `--sg-card` fill, 1px `color-mix(--primary 26%)` border, `--primary` text; hover fills `--primary`. On charcoal (hero, dark bands, header, sheet): 5% white fill, 24% white border, white text; hover 12% / 42%.
- `.btn--nav` and `.btn--sm` are 44px. Disabled frame actions keep the outlined look with no hover change.
- Text links: 1px underline offset 4px, thickening to 2px (site.css). Arrow links keep the line-and-point glyph; on charcoal the text is `--sg-coral-text` and the point is coral. No arrow translation on hover.

### 5.4 Chips, badge, pills
Chips: 34px pills (999px), 600 weight, card fill, strong hairline; multi-line chips (stack, roles) use 8px radius. Badge: 24px pill, amber fill, ink label (charcoal contexts remap automatically). Severity pills: 24px, a 6px glowing point before the label, fill/border/glow built from `currentColor` (10% / 50% / 28%); HIGH uses `--accent-text` (coral `--sg-coral-text` in frames and on charcoal) with the point pulsing; MEDIUM uses `--warn`. The label text is always present (BRAND_SPEC 11.4 stands).

### 5.5 Cards (the card language)
Every `.hgrid` cell (offer blocks, stat cells, control cards, method cells, credential cells, rule cells, commercial shapes, coverage rows, tool cells, 404 links, list columns, form columns) renders as a card: 28px padding (24px 20px on phones), 1px `--sg-line`, 6px radius, `--sg-card` fill, `--sg-shadow`; grid gap 20px; no hairline borders remain. Hover (pointer devices only): 2px lift, `--sg-shadow-hover`, `--sg-line-strong` border. Cards that are forms or plain lists do not lift.
- Stat cells: 10px vermilion L-tick (coral on charcoal) at 20px/28px, Inter Tight stat, 16px 600 label, 14px context.
- Practice/offer cards: 44px glyph tile (coral 9% tint, 22% border, 10px radius), coral numeral, 22px H3, muted body, gradient sub-rule before the "Typical engagement"/"Deliverables" block, arrow links at the foot (two allowed).
- Method steps: cards with a 3px top spine (`--sg-line-strong`; the first step carries the gradient), 34px circular coral numeral, 18px H4, muted body; artefact lists inside use a gradient sub-rule. Milestone timeline (Value Lens roadmap): compact cards (14px 16px), pill numerals, 2px spine.
- Control cards: an 8px gradient square before the mono title, gradient sub-rule; `.control h3` at 20px where the card carries a heading instead.
- Six steps (Value Lens, dark band): the same card on charcoal, coral numerals.
- FAQ: each `<details>` is a card (0 24px padding, 18px summary padding, 12px gap between cards); open state strengthens the border and turns the plus glyph coral.
- Spec tables: 12px-radius card with a soft header row, 14px 16px cells, row hover `--sg-card-2`. Diagrams (`.control-diagram`, `.diagram`): 12px-radius white card, 28px 32px padding.
- Product feature block: 12px-radius card with a 3px gradient top bar. Book cover: charcoal gradient with a 5px coral spine.
- Story strip (About): microlabel cells as small cards. Legal sections: gradient hairlines and coral numerals; the review notice is a card with a 4px amber bar.

### 5.6 Product frame and workbench
Frame: `#10141B` surface, 11% white border, 14px radius, `--sg-halo` (black drop + coral glow), header with a white product name, 14px mono table with 11px 10px cells, expanded row and detail panel tinted coral 6%, detail panel 8px radius on 28% black, footer on 20% black. Stacks by `data-label` below 700px and whenever the frame is narrower than 540px (site.css); the detail blocks go to one column.
Workbench: `#10141B` surface, 12px radius, `--sg-halo`, request bar with a glowing coral point, coral mode titles, 14px mono lines; tiles stack below 600px. `.workbench--lg` (Suite hero) uses 20px padding and a 15px bar.

### 5.7 Forms
Inputs, selects and textareas: 8px radius, `--sg-line-strong` border, card fill, inset shadow; focus: vermilion border + 3px 22% vermilion ring (no outline). Checkboxes and radios use vermilion `accent-color`. Errors: `--accent-text` message (site.css) plus a 16% accent ring on the field. The contact form and the Value Lens beta form sit in a 12px-radius card (28px 24px → 32px); the homepage's dual forms are hgrid cards. Success: card with a 4px green bar; failure notice: card with a 4px accent bar. The beta section swaps the grid texture for the CTA dot field.

### 5.8 Closing CTA band
Dot field (`--sg-line-strong` 1px dots on a 28px grid, aligned to the container) with a centred coral radial glow; forms as cards; trust line in `--text` 500.

### 5.9 Footer
Charcoal (`.band-dark`), 1px gradient hairline along the top edge (transparent → vermilion → coral → vermilion → transparent), a coral radial glow bottom-right, 44px reversed lockup, white strap in Inter Tight 600, coral column eyebrows, `#D5DAE1` links (white on hover with a coral underline), bottom row in `#AEB6C2` with the amber `TODO` labels, and the Value Lens status line as a pill with an amber point (12px radius below 600px so it wraps cleanly).

### 5.10 404
`main.band-dark` with the `.nf` section styled as a hero (atmosphere, grain, faint mark), white mark and H1, six link cards on charcoal, primary button.

---

## 6. Dark mode (whole page)
System preference unless the user chose Light, or `data-theme="dark"` from the toggle (unchanged behaviour). The theme maps the page to `--sg-page #0B0E13` / `--sg-band #10151C` / `--sg-card #141923` with white hairlines and black-based shadows; the charcoal contexts do not change. Every colour in theme.css is either a token, a charcoal-context literal, or built from `currentColor`, so nothing needs a per-page dark rule. Verified in forced dark on all twelve pages at 1440 and 390.

---

## 7. Motion (supersedes BRAND_SPEC 12)
Exactly three motions: the hero trace pulse (`sg-trace`, 7s linear, homepage only), the card lift (2px, `--t-base`, pointer devices only) and the glow pulse on HIGH pills (`sg-pulse`, 2.2s). Buttons change fill and glow without moving; arrow links do not slide. The scroll reveal (site.js) keeps its 14px rise. Under `prefers-reduced-motion: reduce` site.css already disables every transition and animation; the theme additionally shows the trace as a still line at 45% and removes every lift. Nothing on any page depends on JavaScript to be readable; theme.js only adds a header shadow.

---

## 8. OG images (`_tools/make-og.js`)
1200 × 630 on `#0E1116`: 4% white hairline grid, a coral glow top-right, the faint mark behind the copy, a 3px vermilion-to-coral edge along the top, the reversed stacked lockup at left, a gradient vertical rule, the eyebrow `SVLS LABS` in `#FF8A74`, the page title in Inter Tight 800 (42px, 36px over 70 characters, two lines at the first sentence end), and `svlslabs.com` with a glowing coral point. Usage: `node _tools/make-og.js <key> "<page H1>"`; `--light` renders the old white variant. All twelve images are regenerated with each page's H1 (home: the tagline). Favicons are unchanged.

---

## 9. Rules for future edits
1. Do not put colour values in page stylesheets; use tokens or the `--sg-*` tokens from theme.css.
2. New grids use `.hgrid` (they become cards for free). New dark sections use `.band-dark` (they get the charcoal set, the gradient atmosphere and dark cards for free).
3. New pages copy `_partials/head.html` (theme links included), open with a `.hero` section carrying `div.hero-art.hero-art--lite` right after the opening tag, and keep the section count in mind for band alternation.
4. `--accent`/`--sg-coral`/`--sg-verm` never colour text; text uses `--accent-text`, `--sg-coral-text` (charcoal only) or `--warn`.
5. Add no motion beyond section 7. Add no new gradient beyond `--sg-gradient`, the button fill, the hero and dark-band atmospheres and the footer hairline.
6. Regenerate the page's OG image with `_tools/make-og.js` whenever an H1 changes.
7. Copy rules are untouched by the theme: SITE_SPEC and its addenda (A, B, C, D) still govern every word; 25+ years only; no résumé figures; "integration flow" in running copy, "iFlow" only inside the Suite's product mode name.
