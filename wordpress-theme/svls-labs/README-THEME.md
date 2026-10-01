# SVLS LABS WordPress theme

Generated from the static site in `website/` by `make-wp-theme.js`. Copy and markup come from the static HTML; edit the static site first, regenerate, and re-upload.

## Install

1. Zip this folder as `svls-labs.zip` (the zip must contain the `svls-labs/` folder at its top level).
2. WordPress admin -> Appearance -> Themes -> Add New -> Upload Theme -> choose the zip -> Install -> Activate.

## Pages to create (Pages -> Add New)

The theme picks the template from the page's path automatically (`functions.php`, `template_include`), so the slugs and parents below are what matter. The Template dropdown in the editor (Page Attributes) can still override the choice.

| URL | WordPress slug | Parent page | Template file | Template dropdown name |
| --- | --- | --- | --- | --- |
| `/about/` | `about` | none | `page-about.php` | About SVLS LABS |
| `/approach/` | `approach` | none | `page-approach.php` | Governed Delivery Approach |
| `/contact/` | `contact` | none | `page-contact.php` | Contact SVLS LABS |
| `/privacy/` | `privacy` | none | `page-privacy.php` | Privacy Policy |
| `/products/logicpilot/` | `logicpilot` | `products` | `page-products-logicpilot.php` | LogicPilot: MCP Production Assistant for Logic Pro |
| `/products/sap-intelligence-suite/` | `sap-intelligence-suite` | `products` | `page-products-sap-intelligence-suite.php` | SAP Intelligence Suite: Integration Flows, ABAP, RAP |
| `/products/value-lens/` | `value-lens` | `products` | `page-products-value-lens.php` | Value Lens: Margin Leak Finder for SAP O2C |
| `/services/ai/` | `ai` | `services` | `page-services-ai.php` | Governed Agentic & Applied AI on SAP BTP |
| `/services/cloud/` | `cloud` | `services` | `page-services-cloud.php` | Cloud Services for SAP Landscapes |
| `/services/sap/` | `sap` | `services` | `page-services-sap.php` | SAP & ERP Services: S/4HANA, BTP, CPI |
| `/terms/` | `terms` | none | `page-terms.php` | Terms of Use |

The nested pages need their parent pages to exist first: `services` (title "Services") and `products` (title "Products"). Those two parents render with `page.php` as hub pages (hero plus one card per child, from `svls_hub()` in functions.php); their WordPress content is not shown. Any other leftover page renders with its Divi shortcodes stripped.

Front page: create a page (any title, for example "Home"), then Settings -> Reading -> "Your homepage displays: A static page" -> Homepage: that page. `front-page.php` renders it. The 404 page is `404.php` and needs no WordPress page.

## What is where

- `header.php` / `footer.php`: the shared header (nav, dropdowns, Menu sheet) and footer. Every template calls them.
- `page-*.php`, `front-page.php`, `404.php`: one per static page. The top of each file holds that page's `<head>` (title, description, canonical, Open Graph, Twitter, page stylesheet, JSON-LD) in a closure that `header.php` prints.
- `functions.php`: prints the head, keeps `wp_head()` lean (no emoji, block or global-styles CSS, generator, shortlink or duplicate canonical), maps page paths to templates.
- `assets/`: css, js, logo, diagrams, og (unchanged from the static site). `favicon*`, `apple-touch-icon.png`, `site.webmanifest`, `screenshot.png` at the theme root.
- `index.php` / `page.php`: fallback for any page without a template.

## Things WordPress does differently from the static host

- `robots.txt` and the sitemap are served by WordPress (`/robots.txt`, `/wp-sitemap.xml`); the static `sitemap.xml` is not part of the theme. Keep Settings -> Reading -> "Discourage search engines" unticked on the live site.
- Titles, descriptions, canonicals and Open Graph tags come from the templates. If an SEO plugin (Yoast, Rank Math, All in One SEO) is active, turn off its title, meta description, canonical and Open Graph output, or deactivate it, or the head carries each tag twice.
- Caching or minification plugins (Autoptimize, WP Rocket, LiteSpeed) must not combine, defer or inline the theme's CSS and JS; the head order (tokens.css, site.css, page css, theme.css) is deliberate.
- The contact and beta forms post to admin-post.php (action=svls_form) and are emailed to service@svlslabs.com by functions.php; WordPress form plugins are not involved.
