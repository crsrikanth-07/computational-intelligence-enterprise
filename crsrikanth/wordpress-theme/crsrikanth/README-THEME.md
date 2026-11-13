# CR Srikanth WordPress theme

Generated from the static site in `crsrikanth/site` by `crsrikanth/tools/make-wp-theme.js`. Content lives in `crsrikanth/content/*.json`: edit it, run `node crsrikanth/src/build.js`, regenerate the theme and re-upload.

## Install

Appearance -> Themes -> Add New -> Upload Theme -> `crsrikanth.zip` -> Install (or "Replace installed with uploaded") -> Activate. On the first visit after activation the theme creates any missing pages below. The existing home page, blog posts and Settings -> Reading are left as they are; the front page must be set to a static page (it already is).

## Pages and templates

| URL | Template file |
| --- | --- |
| `/about/` | `page-about.php` |
| `/books/august-18th/` | `page-books-august-18th.php` |
| `/books/gottesgabe/` | `page-books-gottesgabe.php` |
| `/books/` | `page-books.php` |
| `/books/kamil-and-hassan-drama-company/` | `page-books-kamil-and-hassan-drama-company.php` |
| `/books/tales-from-bellavere-and-lindenfeld/` | `page-books-tales-from-bellavere-and-lindenfeld.php` |
| `/books/ten-tales-from-bellavere-and-lindelfeld/` | `page-books-ten-tales-from-bellavere-and-lindelfeld.php` |
| `/books/the-debt-of-the-fifth-month/` | `page-books-the-debt-of-the-fifth-month.php` |
| `/books/the-house-on-the-hill-above-the-river/` | `page-books-the-house-on-the-hill-above-the-river.php` |
| `/contact/` | `page-contact.php` |
| `/innovations/cutti-score/` | `page-innovations-cutti-score.php` |
| `/innovations/cutti-studio/` | `page-innovations-cutti-studio.php` |
| `/innovations/` | `page-innovations.php` |
| `/music/compositions/` | `page-music-compositions.php` |
| `/music/` | `page-music.php` |
| `/privacy-policy/` | `page-privacy-policy.php` |
| `/recognition/` | `page-recognition.php` |
| `/recognition/press/` | `page-recognition-press.php` |
| `/recognition/radio-charts/` | `page-recognition-radio-charts.php` |
| `/shop/` | `page-shop.php` |

Blog posts and any other page render with `index.php` / `page.php` in the same design (Divi shortcodes stripped). `/vs-pop-composer/` and `/podcast/` redirect (301) to `/innovations/` and `/recognition/press/`.

## Notes

- If an SEO plugin is active, turn off its title, description, canonical and Open Graph output, or the head carries each tag twice.
- Caching or minification plugins must not combine or defer the theme's CSS and JS.
- The contact form posts to admin-post.php (action=crs_form) and is emailed to crs.07@crsrikanth.com by functions.php.
- Deactivate the Divi theme builder plugin if it is installed separately; the theme does not use it.
