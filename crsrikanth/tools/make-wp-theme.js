// Converts the static site into an installable WordPress theme (output identical to the static build apart
// from what wp_head()/wp_footer() add).
// Usage: node make-wp-theme.js <siteRoot> <themeOutDir> [themeSlug]
//
// How the theme is put together
//   header.php  doctype, <html>, <head> (filled per page, see below), <body>, skip link, the site header
//   footer.php  the site footer, the closing scripts, wp_footer()
//   <page>.php  one template per static page. Each template stores its own <head> content (title, description,
//               canonical, Open Graph, Twitter, page stylesheet, robots, JSON-LD) in a closure
//               ($GLOBALS['crs_page_head']) that header.php prints through crs_page_head() in functions.php,
//               so the head order of the static site is kept exactly (page css before theme.css).
//   functions.php  crs_page_head(), a default head for generic pages, a lean wp_head(), and a template_include
//               filter that maps a page's path to its template (services/sap -> page-services-sap.php) so the
//               client does not have to pick templates by hand (the editor's choice still wins).
// URL rewrites: root-relative /assets/..., /favicon*, /apple-touch-icon.png, /site.webmanifest and the absolute
// https://crsrikanth.com/assets/... (OG images, JSON-LD logo) go to the theme directory URI; canonical and og:url
// go through home_url() so a staging install does not point at production.
const fs = require('fs'); const path = require('path');
const [root, out, slugArg] = process.argv.slice(2);
const slug = slugArg || 'crsrikanth';
if (!root || !out) { console.error('usage: node make-wp-theme.js <siteRoot> <themeOutDir> [slug]'); process.exit(1); }

const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const pages = walk(root).filter(f => f.endsWith('.html') && !f.includes(`${path.sep}_partials${path.sep}`) && !f.includes(`${path.sep}_tools${path.sep}`)).sort();
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const cp = (src, dst) => { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); };

// 1. Static files. robots.txt and sitemap.xml are NOT copied: WordPress serves its own virtual robots.txt and
//    /wp-sitemap.xml; a copy inside a theme folder would never be served at the site root anyway.
for (const f of walk(path.join(root, 'assets'))) cp(f, path.join(out, 'assets', path.relative(path.join(root, 'assets'), f)));
for (const extra of ['favicon.svg', 'favicon-32.png', 'favicon-16.png', 'favicon.ico', 'apple-touch-icon.png']) if (fs.existsSync(path.join(root, extra))) cp(path.join(root, extra), path.join(out, extra));
if (fs.existsSync(path.join(root, 'site.webmanifest'))) {
  // Icon paths become relative to the manifest (which lives at the theme root); start_url stays the site root.
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'site.webmanifest'), 'utf8'));
  for (const icon of manifest.icons || []) icon.src = icon.src.replace(/^\//, '');
  fs.writeFileSync(path.join(out, 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');
}
const ogHome = path.join(root, 'assets', 'img', 'og-home.jpg');
if (fs.existsSync(ogHome)) cp(ogHome, path.join(out, 'screenshot.jpg')); // theme thumbnail in Appearance -> Themes

// 2. URL rewriting
const URI = "<?php echo esc_url( get_template_directory_uri() ); ?>";
// Cache busting: the host serves theme files with a 31-day cache, so every stylesheet and script URL carries
// ?v=<content hash>. A changed file gets a new URL and returning visitors never mix old CSS with new markup.
const crypto = require('crypto');
const verOf = p => { const fp = path.join(root, p); return fs.existsSync(fp) ? crypto.createHash('md5').update(fs.readFileSync(fp)).digest('hex').slice(0, 8) : ''; };
const withVer = p => (/\.(css|js)$/.test(p) && verOf(p)) ? `${p}?v=${verOf(p)}` : p;
const rewrite = html => html
  .replace(/https:\/\/crsrikanth\.com\/(assets\/[^"'\s)<]+)/g, (m, p) => `${URI}/${p}`)
  .replace(/(href|src|content|srcset|poster|data)=("|')\/(assets\/[^"']+|site\.webmanifest|favicon[^"']*|apple-touch-icon\.png)("|')/g, (m, a, q, p) => `${a}=${q}${URI}/${withVer(p)}${q}`)
  .replace(/url\((["']?)\/(assets\/[^)"']+)(["']?)\)/g, (m, q1, p, q2) => `url(${q1}${URI}/${p}${q2})`)
  .replace(/(<link rel="canonical" href="|<meta property="og:url" content=")https:\/\/crsrikanth\.com(\/[^"]*)"/g, (m, a, p) => `${a}<?php echo esc_url( home_url( '${p}' ) ); ?>"`);
const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const slice = (html, openRe, closeTag) => {
  const m = html.match(openRe); if (!m) return null;
  const start = m.index; const end = html.indexOf(closeTag, start); if (end < 0) return null;
  return { start, end: end + closeTag.length, inner: html.slice(start, end + closeTag.length) };
};

let headerPhp = null, footerPhp = null, defaultHead = null; const templates = []; const problems = [];
// Anchor tags (without the attribute) that carry aria-current="page" in some page's header or Menu sheet, keyed to their path.
const currentMarkers = new Map();
for (const f of pages) {
  const src = fs.readFileSync(f, 'utf8');
  const h = slice(src, /<header class="site-header"[\s>]/, '</header>'); if (!h) continue;
  const chrome = h.inner + src.slice(h.end, Math.max(h.end, src.indexOf('<main', h.end)));
  for (const m of chrome.matchAll(/<a\b[^>]*? aria-current="page"[^>]*>/g)) {
    const href = (m[0].match(/href="([^"]+)"/) || [])[1]; if (!href) continue;
    currentMarkers.set(m[0].replace(/ aria-current="page"/, ''), href);
  }
}
for (const f of pages) {
  const rel = '/' + path.relative(root, f).split(path.sep).join('/');
  const raw = fs.readFileSync(f, 'utf8');
  if (/<\?/.test(raw)) problems.push(`${rel}: contains "<?" which PHP would interpret`);
  const html = rewrite(raw);
  const head = slice(html, /<head[\s>]/, '</head>');
  const hdr = slice(html, /<header class="site-header"[\s>]/, '</header>');
  const ftr = slice(html, /<footer class="site-footer[\s"]/, '</footer>');
  if (!head || !hdr || !ftr) { problems.push(`${rel}: no head/site-header/site-footer, skipped`); continue; }
  const bodyOpen = html.match(/<body[^>]*>/); const bodyOpenIdx = bodyOpen.index + bodyOpen[0].length;
  const preHeader = html.slice(bodyOpenIdx, hdr.start).trim();          // skip link
  const mainIdx = html.indexOf('<main', hdr.end);
  if (mainIdx < 0 || mainIdx > ftr.start) { problems.push(`${rel}: no <main> between header and footer, skipped`); continue; }
  const sheetPart = html.slice(hdr.end, mainIdx).trim();                 // Menu sheet + backdrop (shared chrome)
  const mainPart = html.slice(mainIdx, ftr.start).trim();                // <main>...</main>
  const scripts = html.slice(ftr.end).replace(/<\/body>[\s\S]*$/, '').trim(); // anything after the footer
  const headContent = head.inner.replace(/^<head[^>]*>/, '').replace(/<\/head>$/, '').trim();

  if (!headerPhp) {
    const docOpen = html.slice(0, head.start).replace(/<html[^>]*>/, m => '<html <?php language_attributes(); ?>' + m.replace(/^<html/, '').replace(/\s+lang="[^"]*"/, '').replace(/>$/, '') + '>');
    // The static pages carry aria-current="page" on the current nav link (site.js also sets it at runtime);
    // header.php sets it server-side through crs_current() on exactly those anchors, so the no-JS output is identical.
    let hdrInner = (hdr.inner + (sheetPart ? '\n' + sheetPart : '')).replace(/ aria-current="page"/g, '');
    for (const [tag, p] of currentMarkers) hdrInner = hdrInner.split(tag).join(tag.replace(/>$/, `<?php crs_current( '${p}' ); ?>>`));
    headerPhp = `${docOpen.trim()}\n<head>\n<?php crs_page_head(); ?>\n<?php wp_head(); ?>\n</head>\n<body <?php body_class(); ?>>\n<?php wp_body_open(); ?>\n${preHeader}\n${hdrInner}\n`;
    footerPhp = `${ftr.inner}\n${scripts ? scripts + '\n' : ''}<?php wp_footer(); ?>\n</body>\n</html>\n`;
    // Default head for generic WordPress pages: the shared part of the head with a WordPress title.
    defaultHead = headContent
      .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '')
      .split('\n')
      .filter(l => !/<title>|name="description"|rel="canonical"|property="og:|name="twitter:|name="robots"|\/assets\/css\/pages\//.test(l))
      .join('\n')
      .replace(/(<meta name="viewport"[^>]*>)/, '$1\n<title><?php echo esc_html( wp_get_document_title() ); ?></title>');
  }

  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [, rel])[1].replace(/\s+/g, ' ').trim());
  const isHome = rel === '/index.html', is404 = rel === '/404.html';
  const name = isHome ? 'front-page' : is404 ? '404' : 'page-' + rel.replace(/^\//, '').replace(/\/index\.html$/, '').replace(/\.html$/, '').replace(/\//g, '-');
  const tplName = isHome ? 'Home' : is404 ? 'Not Found' : title.split('|')[0].trim().replace(/\*\//g, '');
  const pagePath = isHome ? '/' : is404 ? '/404.html' : rel.replace(/index\.html$/, '');
  const wpSlug = isHome ? '(front page)' : is404 ? '(404)' : pagePath.replace(/^\/|\/$/g, '');
  const docblock = `<?php\n/**\n${(isHome || is404) ? '' : ` * Template Name: ${tplName}\n`} * Static source: ${rel}. Generated by make-wp-theme.js; copy changes belong in the static site first.\n */\n`;
  const php = `${docblock}$GLOBALS['crs_page_head'] = function () { ?>\n${headContent}\n<?php };\nget_header();\n?>\n${mainPart}\n<?php get_footer(); ?>\n`;
  fs.writeFileSync(path.join(out, `${name}.php`), php);
  templates.push({ file: `${name}.php`, page: rel, path: pagePath, slug: wpSlug, template: tplName });
}
if (!headerPhp) { console.error('no page produced a header'); process.exit(1); }

fs.writeFileSync(path.join(out, 'header.php'), headerPhp);
fs.writeFileSync(path.join(out, 'footer.php'), footerPhp);

const fallback = `<?php get_header(); ?>
<main id="main">
  <section class="phero">
    <div class="wrap">
      <p class="kicker"><?php echo is_singular( 'post' ) ? esc_html( get_the_date() ) : ( is_home() || is_archive() ? 'Journal' : 'CR Srikanth' ); ?></p>
      <h1><?php echo esc_html( is_singular() ? get_the_title() : ( is_home() ? 'Journal' : wp_strip_all_tags( get_the_archive_title() ) ) ); ?></h1>
    </div>
  </section>
  <section class="section section--tight">
    <div class="wrap">
      <?php if ( is_singular() ) : ?>
      <div class="prose wp-content">
        <?php while ( have_posts() ) : the_post(); echo crs_clean_content( get_the_content() ); endwhile; ?>
      </div>
      <?php elseif ( have_posts() ) : ?>
      <div class="press">
        <?php while ( have_posts() ) : the_post(); ?>
        <article class="press__item"><p class="press__outlet"><?php echo esc_html( get_the_date() ); ?></p><div><h2 class="press__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2><p class="press__meta"><?php echo esc_html( wp_trim_words( wp_strip_all_tags( crs_clean_content( get_the_content() ) ), 30 ) ); ?></p></div></article>
        <?php endwhile; ?>
      </div>
      <?php the_posts_pagination(); ?>
      <?php else : ?>
      <p>Nothing here yet.</p>
      <?php endif; ?>
    </div>
  </section>
</main>
<?php get_footer(); ?>
`;
fs.writeFileSync(path.join(out, 'index.php'), fallback);
fs.writeFileSync(path.join(out, 'page.php'), fallback);

fs.writeFileSync(path.join(out, 'style.css'), `/*
Theme Name: CR Srikanth
Theme URI: https://crsrikanth.com
Description: The crsrikanth.com website as a WordPress theme: music, books and stories, CuTTI innovations and recognition. Built from the static site in crsrikanth/site by make-wp-theme.js.
Version: 2.0.0
Author: CR Srikanth
License: Proprietary
Text Domain: ${slug}
*/
/* This file only identifies the theme. The stylesheets are linked directly from each template's head. */
`);

fs.writeFileSync(path.join(out, 'functions.php'), `<?php
/**
 * CR Srikanth theme bootstrap.
 *
 * Every page template stores its own <head> content (title, description, canonical, Open Graph, Twitter,
 * page stylesheet, robots, JSON-LD) in $GLOBALS['crs_page_head']; header.php prints it through
 * crs_page_head(). Stylesheets and scripts are linked directly, so the output matches the static site build.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Contact and beta forms post to /wp-admin/admin-post.php with action=crs_form.
 * Every submission is emailed to crs.07@crsrikanth.com (Reply-To: the sender).
 * The site script sends Accept: application/json and expects a JSON reply; without JS the browser is redirected back.
 */
function crs_handle_form() {
	if ( ! empty( $_POST['_gotcha'] ) ) { status_header( 400 ); exit; } // honeypot
	$skip   = array( 'action', '_gotcha', '_wp_http_referer' );
	$fields = array();
	foreach ( $_POST as $key => $value ) {
		if ( in_array( $key, $skip, true ) ) { continue; }
		$key = sanitize_key( $key );
		$fields[ $key ] = is_array( $value ) ? implode( ', ', array_map( 'sanitize_text_field', wp_unslash( $value ) ) ) : sanitize_textarea_field( wp_unslash( $value ) );
	}
	$email = ( isset( $fields['email'] ) && is_email( $fields['email'] ) ) ? $fields['email'] : '';
	$form  = isset( $fields['form-name'] ) ? $fields['form-name'] : 'contact';
	if ( '' === $email || empty( $fields['name'] ) ) {
		if ( crs_wants_json() ) { wp_send_json( array( 'ok' => false, 'error' => 'name and email are required' ), 400 ); }
		wp_safe_redirect( add_query_arg( 'sent', '0', wp_get_referer() ? wp_get_referer() : home_url( '/contact/' ) ) ); exit;
	}
	$subjects = array( 'music' => 'Music enquiry', 'literary' => 'Literary correspondence', 'technology' => 'Technology enquiry', 'cutti-beta' => 'CuTTI beta access request', 'media' => 'Media request' );
	$key      = isset( $fields['topic'] ) ? $fields['topic'] : '';
	$subject  = 'crsrikanth.com: ' . ( isset( $subjects[ $key ] ) ? $subjects[ $key ] : 'Message' ) . ' from ' . $fields['name'];
	$body    = '';
	foreach ( $fields as $key => $value ) { $body .= ucfirst( str_replace( array( '-', '_' ), ' ', $key ) ) . ': ' . $value . "\n"; }
	$body   .= "\nSent " . gmdate( 'Y-m-d H:i' ) . " UTC from " . home_url( '/' ) . "\n";
	$headers = array( 'Content-Type: text/plain; charset=UTF-8', 'Reply-To: ' . $fields['name'] . ' <' . $email . '>' );
	$sent    = wp_mail( 'crs.07@crsrikanth.com', $subject, $body, $headers );
	if ( crs_wants_json() ) { wp_send_json( array( 'ok' => (bool) $sent ), $sent ? 200 : 500 ); }
	wp_safe_redirect( add_query_arg( 'sent', $sent ? '1' : '0', wp_get_referer() ? wp_get_referer() : home_url( '/contact/' ) ) ); exit;
}
function crs_wants_json() { return isset( $_SERVER['HTTP_ACCEPT'] ) && false !== strpos( $_SERVER['HTTP_ACCEPT'], 'application/json' ); }
add_action( 'admin_post_nopriv_crs_form', 'crs_handle_form' );
add_action( 'admin_post_crs_form', 'crs_handle_form' );

/**
 * Page housekeeping per theme release, run once on the first request after the upload (option crs_pages_version).
 * November 2026 revamp: creates the pages the new templates render (music, books, innovations, recognition and
 * their children, about, contact) if they do not exist. Existing pages, posts and the front-page setting are untouched.
 */
add_action( 'init', function () {
	$release = '2026-11-revamp';
	if ( get_option( 'crs_pages_version' ) === $release || get_transient( 'crs_pages_lock' ) ) { return; }
	set_transient( 'crs_pages_lock', 1, 60 );
	$create = array(
		array( '', 'music', 'Music' ),
		array( 'music', 'compositions', 'Classical Compositions' ),
		array( '', 'books', 'Books & Stories' ),
		array( '', 'innovations', 'Innovations' ),
		array( 'innovations', 'cutti-studio', 'CuTTI Studio' ),
		array( 'innovations', 'cutti-score', 'CuTTI Score' ),
		array( '', 'recognition', 'Recognition' ),
		array( 'recognition', 'radio-charts', 'Radio & Charts' ),
		array( 'recognition', 'press', 'Press & Media' ),
		array( '', 'about', 'About' ),
		array( '', 'contact', 'Contact' ),
		array( '', 'privacy-policy', 'Privacy Policy' ),
	);
	foreach ( $create as $c ) {
		list( $parent_path, $slug, $title ) = $c;
		$path = $parent_path ? $parent_path . '/' . $slug : $slug;
		$existing = get_page_by_path( $path );
		if ( $existing ) {
			if ( 'publish' !== $existing->post_status ) { wp_update_post( array( 'ID' => $existing->ID, 'post_status' => 'publish' ) ); }
			continue;
		}
		$parent = $parent_path ? get_page_by_path( $parent_path ) : null;
		if ( $parent_path && ! $parent ) { continue; }
		wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => $title, 'post_name' => $slug, 'post_parent' => $parent ? $parent->ID : 0,
			'post_content' => '<!-- Rendered by the ' . $path . ' template of the CR Srikanth theme -->' ) );
	}
	update_option( 'crs_pages_version', $release, false );
	delete_transient( 'crs_pages_lock' );
}, 20 );

function crs_page_head() {
	if ( ! empty( $GLOBALS['crs_page_head'] ) && is_callable( $GLOBALS['crs_page_head'] ) ) {
		call_user_func( $GLOBALS['crs_page_head'] );
		return;
	}
	crs_default_head();
}

/** Prints aria-current="page" when the request path is the given site path (the static site bakes this in). */
function crs_current( $path ) {
	$uri = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ) : '';
	$uri = trim( $uri, '/' );
	$uri = '' === $uri ? '/' : '/' . $uri . '/';
	if ( $uri === $path ) { echo ' aria-current="page"'; }
}

/** Head for generic WordPress pages that have no dedicated template (index.php / page.php). */
function crs_default_head() { ?>
${defaultHead}
<?php }

add_action( 'after_setup_theme', function () {
	// No 'title-tag' support on purpose: every template prints its exact <title>.
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
} );

// Keep wp_head() lean so the markup stays as close to the static build as possible.
remove_action( 'wp_head', 'rel_canonical' );                 // the templates carry their own canonical
remove_action( 'wp_head', 'wp_shortlink_wp_head' );
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
remove_action( 'wp_head', 'wp_resource_hints', 2 );
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'wp_enqueue_scripts', 'wp_enqueue_emoji_styles' );
add_filter( 'emoji_svg_url', '__return_false' );
add_action( 'wp_enqueue_scripts', function () {
	// The theme has no blocks; the block library, classic-theme and global-styles CSS would restyle body text.
	foreach ( array( 'wp-block-library', 'wp-block-library-theme', 'classic-theme-styles', 'global-styles' ) as $handle ) {
		wp_dequeue_style( $handle );
	}
}, 100 );
// The Customizer "Site Icon" of the previous site must not print after the theme's own icons.
remove_action( 'wp_head', 'wp_site_icon', 99 );
// Point crawlers at the core sitemap (the previous site's sitemap plugin output is empty).
add_filter( 'robots_txt', function ( $output ) { return rtrim( (string) $output ) . "\nSitemap: " . home_url( '/wp-sitemap.xml' ) . "\n"; } );

/** Content of a leftover page from the previous site: Divi shortcodes removed, then the normal content filters. */
function crs_clean_content( $content ) {
	$content = preg_replace( '/\\[\\/?et_pb_[^\\]]*\\]/', '', (string) $content );
	return apply_filters( 'the_content', trim( $content ) );
}

// No 32px admin-bar bump on the sticky header when an editor is logged in.
add_action( 'get_header', function () { remove_action( 'wp_head', '_admin_bar_bump_cb' ); } );

/** 301 redirects from pages of the previous (Divi) site that the new structure replaces. Blog posts keep their URLs. */
add_action( 'template_redirect', function () {
	$map = array(
		'vs-pop-composer' => '/innovations/', // the earlier VS Pop Composer page; CuTTI is its successor
		'podcast'         => '/recognition/press/',
	);
	$path = isset( $_SERVER['REQUEST_URI'] ) ? trim( (string) wp_parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ), '/' ) : '';
	if ( '' !== $path && isset( $map[ $path ] ) ) {
		wp_safe_redirect( home_url( $map[ $path ] ), 301 );
		exit;
	}
}, 1 );

/**
 * Choose the template from the page's path (services/sap -> page-services-sap.php) unless the editor picked one.
 * Top-level pages (about, approach, contact, privacy, terms) already match page-{slug}.php through the core hierarchy.
 */
add_filter( 'template_include', function ( $template ) {
	if ( is_front_page() || ! is_page() ) { return $template; }
	$page = get_queried_object();
	if ( ! $page || get_page_template_slug( $page ) ) { return $template; }
	$uri = trim( (string) get_page_uri( $page ), '/' );
	if ( '' === $uri ) { return $template; }
	$candidate = locate_template( 'page-' . str_replace( '/', '-', $uri ) . '.php' );
	return $candidate ? $candidate : $template;
} );
`);

const pageRows = templates.filter(t => t.file.startsWith('page-'));
fs.writeFileSync(path.join(out, 'README-THEME.md'), `# CR Srikanth WordPress theme

Generated from the static site in \`crsrikanth/site\` by \`crsrikanth/tools/make-wp-theme.js\`. Content lives in \`crsrikanth/content/*.json\`: edit it, run \`node crsrikanth/src/build.js\`, regenerate the theme and re-upload.

## Install

Appearance -> Themes -> Add New -> Upload Theme -> \`crsrikanth.zip\` -> Install (or "Replace installed with uploaded") -> Activate. On the first visit after activation the theme creates any missing pages below. The existing home page, blog posts and Settings -> Reading are left as they are; the front page must be set to a static page (it already is).

## Pages and templates

| URL | Template file |
| --- | --- |
${pageRows.map(t => { const q = String.fromCharCode(96); return '| ' + q + t.path + q + ' | ' + q + t.file + q + ' |'; }).join('\n')}

Blog posts and any other page render with \`index.php\` / \`page.php\` in the same design (Divi shortcodes stripped). \`/vs-pop-composer/\` and \`/podcast/\` redirect (301) to \`/innovations/\` and \`/recognition/press/\`.

## Notes

- If an SEO plugin is active, turn off its title, description, canonical and Open Graph output, or the head carries each tag twice.
- Caching or minification plugins must not combine or defer the theme's CSS and JS.
- The contact form posts to admin-post.php (action=crs_form) and is emailed to crs.07@crsrikanth.com by functions.php.
- Deactivate the Divi theme builder plugin if it is installed separately; the theme does not use it.
`);

// 3. Self-check
const leftovers = [];
for (const f of walk(out).filter(f => f.endsWith('.php'))) {
  const t = fs.readFileSync(f, 'utf8');
  for (const re of [/(href|src|content)=["']\/(assets|favicon|apple-touch|site\.webmanifest)/g, /https:\/\/crsrikanth\.com\/assets\//g]) { const m = t.match(re); if (m) leftovers.push(`${path.basename(f)}: ${m.length} x ${re}`); }
}
if (leftovers.length) problems.push(...leftovers);
const hp = fs.readFileSync(path.join(out, 'header.php'), 'utf8'), fp = fs.readFileSync(path.join(out, 'footer.php'), 'utf8');
if (!hp.includes('wp_head()')) problems.push('header.php lacks wp_head()');
if (!fp.includes('wp_footer()')) problems.push('footer.php lacks wp_footer()');
console.log(JSON.stringify({ theme: out, templates, problems }, null, 2));
if (problems.length) process.exitCode = 2;
