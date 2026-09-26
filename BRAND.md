# SVLS LABS brand guide (one page)

For anyone producing a page, a post, a slide or a PDF for SVLS LABS. This page gives the rules; `website/THEME_SPEC.md` gives every value and component in detail, and the website itself (`website/`) is the reference implementation.

## 1. Name and tagline

- Company: **SVLS LABS** (always uppercase in running text and headlines). Legal entity: **SVLS LABS LLP**. Product: **Value Lens**. Suite: **SAP Intelligence Suite** (name under review, see section 7).
- Tagline, locked, always two sentences with both full stops: **"SAP, Cloud and Governed AI. Engineered to Spec."** Used as the homepage H1, the footer strap, the OG image, LinkedIn and email signatures.
- Approved secondary lines (never as the homepage H1): "Clean core. Clean cloud. Governed agents." and "Agents explain. Humans decide. SAP stays the system of record."
- The three practices are **SAP & ERP**, **Cloud** and **Agentic & Applied AI** (client instruction, 2026-09-26: the AI work published on GitHub is broader than agents; "Agentic AI" alone is no longer used as the practice name).

## 2. Logo

Files in `website/assets/logo/`:

| File | Use |
| --- | --- |
| `mark.svg` (64x64) | the mark alone: ink bracket, ring, vermilion bracket |
| `mark-mono.svg` | single-colour version (embroidery, one-colour print, 8% watermark) |
| `lockup.svg` (284x64) | horizontal lockup on white or the light grey surface |
| `lockup-reversed.svg` | horizontal lockup on charcoal (`#0E1116`, `#0B0E13`, `#101418`, `#14213D`) |
| `stacked.svg`, `stacked-reversed.svg` (320x320) | social avatars, OG images, print squares. The stacked reversed lockup is the LinkedIn avatar; the bare mark is not used as an avatar in the first year |
| `value-lens-mark.svg`, `sap-intelligence-suite-mark.svg` | product marks (a finding inside the ring) |
| `favicon.svg`, `favicon-32.png`, `favicon-16.png`, `apple-touch-icon.png` (site root) | browser and home-screen icons (ink square with the reversed mark) |

Rules:

- Clear space: half the mark's width on all sides. Minimum size: 24px for the mark with wordmark, 32px for the mark alone; the mono mark never alone below 24px.
- Colour: the ink shapes are `#101418` on light and `#FFFFFF` on charcoal; the accent bracket is `#E4432B` on light and `#FF6A50` on charcoal (never `#E4432B` on dark).
- Never: outline, gradient, shadow, rotation, skew, animation of the geometry, a photograph behind it, a second colour on the ring, recolouring the ink bracket. Not permitted on any background other than white, the light grey surface or the charcoal set.
- The exported lockups use the Inter Tight webfont as live text. For print, convert the text to outlines first (client TODO in DEPLOY.md).

## 3. Colour (from THEME_SPEC 2)

| Token | Value | Use |
| --- | --- | --- |
| Charcoal `--sg-ink` | `#0E1116` | every hero, the header, dark bands, the footer, the 404 page |
| Raised charcoal `--sg-ink-2` | `#141A22` | cards on charcoal |
| Coral `--sg-coral` | `#FF6A50` | accent on charcoal, graphic only (points, glows, pulses) |
| Coral text `--sg-coral-text` | `#FF8A74` | the only coral used for text on charcoal (12px and up) |
| Vermilion `--sg-verm` / `--accent` | `#E4432B` | accent on light, graphic only (bracket, ticks, underlines, focus ring) |
| Accent text `--accent-text` | `#C8351F` | links, button fills and any accent text on light |
| Ink `--text` | `#101418` | body and headline text on light |
| Ink navy `--primary` | `#14213D` | secondary buttons, nav hover, numerals |
| Page / band / card (light) | `#FFFFFF` / `#F5F6F8` / `#FFFFFF` | alternating bands, cards |
| Page / band / card (dark mode) | `#0B0E13` / `#10151C` / `#141923` | the same, on a dark page |
| Success / warning | `#1E7F4F` / `#9A6412` (light); `#4CC38A` / `#E6B05C` (charcoal) | verified states; MEDIUM pills, the PRIVATE BETA badge and TODO labels |

The gradient `#E4432B -> #FF6A50` is allowed only where THEME_SPEC lists it (key-word underline, method spine, band bars, the primary button). Vermilion and coral never colour text; text uses the `-text` variants. Every pair in THEME_SPEC 2.3 meets WCAG AA; do not invent new pairs.

## 4. Type (from THEME_SPEC 3)

- **Inter Tight** for headlines (800 for H1s, 700 for H2s, 600 for H3s, tight tracking -0.03em), **Inter** for body (400 to 600), **JetBrains Mono** for eyebrows, numerals, tool names and diagram labels. Google Fonts; system sans-serif fallback.
- Sizes: display H1 42 to 76px, inner H1 36 to 52px, H2 30 to 44px, H3 20 to 23px, lead 17 to 20px, eyebrow 12px mono uppercase. Nothing below 12px anywhere. Tabular numerals everywhere.
- Measures: body 64 characters, lead 56, headlines 26.
- One key-word underline per section at most (a gradient bar under one phrase), only where the copy specification names it.

## 5. Voice

Tone: precise, calm, evidence-led, specific, unadorned. An architect talking to a CFO: short sentences (under 20 words on average), concrete SAP nouns, numbers with their context, no adjective that cannot be measured.

- **Title Case on the tagline and every H1 and H2** ("Delivery You Can Put in a Board Pack."). Short words stay lowercase unless they open the sentence: a, an, the, and, or, to, of, in, on, at, by, for, with, from, as. Acronyms and SAP names keep their casing (S/4HANA, BTP, O2C). Hyphenated words capitalise both parts (Read-Back). H3s, eyebrows, buttons, links, body and metadata stay sentence case.
- Headlines end with a full stop. Buttons do not. No exclamation marks, no emoji, no italics for emphasis, no questions in headlines (the one Value Lens question is the only exception).
- British spelling with -ise (organisation, optimisation), except inside product and SAP names. No Oxford comma. Digits, never number words; `~` for approximations, `up to` for ceilings, `+` only after a whole number.
- "We" is SVLS LABS; "you" is the buyer's organisation. Never "clients love", never "partners" as a word for customers.
- SAP names as SAP writes them: S/4HANA, SAP BTP, SAP Integration Suite, RISE with SAP, SAP AI Core, Joule. "CPI" after "Integration Suite / CPI" on first use per page. Say **"integration flow"** in running copy; "iFlow" appears only inside the Suite's product mode name "CPI iFlow generation".
- Banned anywhere (copy, metadata, alt text, collateral): cutting-edge, innovative, innovation, seamless, synergy, leverage, best-in-class, world-class, next-generation, holistic, robust, journey, empower, unlock, revolutionise, transform, game-changing, AI-powered, passionate, solutions, end-to-end, trusted by, industry-leading, state-of-the-art, autonomous, production-ready, "right the first time".

## 6. Claims: the fixed forms

- **25+ years.** The only experience figure is **"25+ years of SAP delivery experience across our key architects"**. Never "22+", "20+", "two decades", "since 2004", "the company has 25 years" (it was founded in 2020) or a person's years.
- **Founded 2020.** The company facts that may appear: founded 2020, 25+ years, two products, the research published on GitHub, the book "authored by our team".
- **No résumé-derived or other-employer figures**: no "200+ flows", "~10 deployments", "~80%", "up to 90%", "$10M+", operation counts, library counts or example requests.
- **No person is named**, pictured, linked or implied: no founder, no CEO, no personal email, phone or LinkedIn. Voice is "our architects", "our team", "the leadership team". Certifications are "held in the team", described generically, never as an enumerated list.
- **Product status sentences**, verbatim, wherever the product is featured:
  - Value Lens: **"Private beta on synthetic SAP-like data. Production SAP connector in development."** Never "live", "in production", "customers use", "GA".
  - SAP Intelligence Suite: **"In use in SVLS LABS delivery. Available to customers on request; deployed in your landscape, reviewed by your architects."**
- Agents "explain", "propose", "read before write", "confirm to act"; never "autonomous", never "decide" for the agent, never "rollback" (SAP postings are reversed).
- The only location is the registered office: SVLS LABS LLP, 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India. No other country, region, time zone or presence claim.

## 7. Open items that touch the brand

- Trademark screening of the mark and the name "Value Lens" (classes 42 and 9) before public rollout; no ™ until cleared.
- SAP Intelligence Suite: SAP's trademark guidance usually asks third parties not to lead a product name with "SAP"; "Intelligence Suite for SAP" is the safer descriptive form. Decide before launch.
- Outline conversion of the lockup SVGs for print.

Detail: `website/THEME_SPEC.md` (tokens, contrast pairs, components, motion, OG images), `website/README.md` (copy rules and the client TODO list), `website/BUILD_NOTES.md` (component vocabulary).
