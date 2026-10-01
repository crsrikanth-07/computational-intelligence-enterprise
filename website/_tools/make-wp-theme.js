// Converts the static site into an installable WordPress theme (output identical to the static build apart
// from what wp_head()/wp_footer() add).
// Usage: node make-wp-theme.js <siteRoot> <themeOutDir> [themeSlug]
//
// How the theme is put together
//   header.php  doctype, <html>, <head> (filled per page, see below), <body>, skip link, the site header
//   footer.php  the site footer, the closing scripts, wp_footer()
//   <page>.php  one template per static page. Each template stores its own <head> content (title, description,
//               canonical, Open Graph, Twitter, page stylesheet, robots, JSON-LD) in a closure
//               ($GLOBALS['svls_page_head']) that header.php prints through svls_page_head() in functions.php,
//               so the head order of the static site is kept exactly (page css before theme.css).
//   functions.php  svls_page_head(), a default head for generic pages, a lean wp_head(), and a template_include
//               filter that maps a page's path to its template (services/sap -> page-services-sap.php) so the
//               client does not have to pick templates by hand (the editor's choice still wins).
// URL rewrites: root-relative /assets/..., /favicon*, /apple-touch-icon.png, /site.webmanifest and the absolute
// https://svlslabs.com/assets/... (OG images, JSON-LD logo) go to the theme directory URI; canonical and og:url
// go through home_url() so a staging install does not point at production.
const fs = require('fs'); const path = require('path');
const [root, out, slugArg] = process.argv.slice(2);
const slug = slugArg || 'svls-labs';
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
const ogHome = path.join(root, 'assets', 'og', 'og-home.png');
if (fs.existsSync(ogHome)) cp(ogHome, path.join(out, 'screenshot.png')); // theme thumbnail in Appearance -> Themes

// 2. URL rewriting
const URI = "<?php echo esc_url( get_template_directory_uri() ); ?>";
const rewrite = html => html
  .replace(/https:\/\/svlslabs\.com\/(assets\/[^"'\s)<]+)/g, (m, p) => `${URI}/${p}`)
  .replace(/(href|src|content|srcset|poster|data)=("|')\/(assets\/[^"']+|site\.webmanifest|favicon[^"']*|apple-touch-icon\.png)("|')/g, (m, a, q, p) => `${a}=${q}${URI}/${p}${q}`)
  .replace(/url\((["']?)\/(assets\/[^)"']+)(["']?)\)/g, (m, q1, p, q2) => `url(${q1}${URI}/${p}${q2})`)
  .replace(/(<link rel="canonical" href="|<meta property="og:url" content=")https:\/\/svlslabs\.com(\/[^"]*)"/g, (m, a, p) => `${a}<?php echo esc_url( home_url( '${p}' ) ); ?>"`);
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
    // header.php sets it server-side through svls_current() on exactly those anchors, so the no-JS output is identical.
    let hdrInner = (hdr.inner + (sheetPart ? '\n' + sheetPart : '')).replace(/ aria-current="page"/g, '');
    for (const [tag, p] of currentMarkers) hdrInner = hdrInner.split(tag).join(tag.replace(/>$/, `<?php svls_current( '${p}' ); ?>>`));
    headerPhp = `${docOpen.trim()}\n<head>\n<?php svls_page_head(); ?>\n<?php wp_head(); ?>\n</head>\n<body <?php body_class(); ?>>\n<?php wp_body_open(); ?>\n${preHeader}\n${hdrInner}\n`;
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
  const php = `${docblock}$GLOBALS['svls_page_head'] = function () { ?>\n${headContent}\n<?php };\nget_header();\n?>\n${mainPart}\n<?php get_footer(); ?>\n`;
  fs.writeFileSync(path.join(out, `${name}.php`), php);
  templates.push({ file: `${name}.php`, page: rel, path: pagePath, slug: wpSlug, template: tplName });
}
if (!headerPhp) { console.error('no page produced a header'); process.exit(1); }

fs.writeFileSync(path.join(out, 'header.php'), headerPhp);
fs.writeFileSync(path.join(out, 'footer.php'), footerPhp);

const fallback = `<?php get_header(); ?>
<main id="main">
  <section class="hero hero--plain" aria-labelledby="hero-title">
    <div class="hero-art hero-art--lite" aria-hidden="true"></div>
    <div class="container">
      <div class="hero__copy">
        <h1 id="hero-title"><?php echo esc_html( is_singular() ? get_the_title() : wp_get_document_title() ); ?></h1>
        <?php $svls_hub = is_page() ? svls_hub( get_post_field( 'post_name' ) ) : null; if ( $svls_hub ) : ?>
        <p class="lead"><?php echo esc_html( $svls_hub['lead'] ); ?></p>
        <?php endif; ?>
      </div>
    </div>
  </section>
  <?php if ( $svls_hub ) : ?>
  <section class="section" aria-label="<?php echo esc_attr( $svls_hub['label'] ); ?>">
    <div class="container">
      <div class="hgrid hgrid--<?php echo 2 === count( $svls_hub['items'] ) ? '2' : '3'; ?> hgrid--bottom">
        <?php foreach ( $svls_hub['items'] as $i => $item ) : ?>
        <article class="practice">
          <span class="numeral practice__num"><?php echo esc_html( sprintf( '%02d', $i + 1 ) ); ?></span>
          <h3><?php echo esc_html( $item['title'] ); ?></h3>
          <p class="practice__body"><?php echo esc_html( $item['body'] ); ?></p>
          <a class="arrow-link" href="<?php echo esc_url( home_url( $item['href'] ) ); ?>"><?php echo esc_html( $item['cta'] ); ?><svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a>
        </article>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
  <?php else : ?>
  <section class="section">
    <div class="container prose">
      <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); echo svls_clean_content( get_the_content() ); endwhile; else : ?>
        <p>Nothing here yet.</p>
      <?php endif; ?>
    </div>
  </section>
  <?php endif; ?>
</main>
<?php get_footer(); ?>
`;
fs.writeFileSync(path.join(out, 'index.php'), fallback);
fs.writeFileSync(path.join(out, 'page.php'), fallback);

fs.writeFileSync(path.join(out, 'style.css'), `/*
Theme Name: SVLS LABS
Theme URI: https://svlslabs.com
Description: The svlslabs.com website as a WordPress theme (SAP & ERP, Cloud, Agentic & Applied AI, Value Lens, SAP Intelligence Suite). Page layouts and copy live in the PHP templates; styles in assets/css (tokens.css, site.css, pages/*.css, theme.css); behaviour in assets/js.
Version: 1.0.0
Author: SVLS LABS
License: Proprietary
Text Domain: ${slug}
*/
/* This file only identifies the theme. The stylesheets are linked directly from each template's head. */
`);

fs.writeFileSync(path.join(out, 'functions.php'), `<?php
/**
 * SVLS LABS theme bootstrap.
 *
 * Every page template stores its own <head> content (title, description, canonical, Open Graph, Twitter,
 * page stylesheet, robots, JSON-LD) in $GLOBALS['svls_page_head']; header.php prints it through
 * svls_page_head(). Stylesheets and scripts are linked directly, so the output matches the static site build.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Contact and beta forms post to /wp-admin/admin-post.php with action=svls_form.
 * Every submission is emailed to service@svlslabs.com (Reply-To: the sender).
 * The site script sends Accept: application/json and expects a JSON reply; without JS the browser is redirected back.
 */
function svls_handle_form() {
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
		if ( svls_wants_json() ) { wp_send_json( array( 'ok' => false, 'error' => 'name and email are required' ), 400 ); }
		wp_safe_redirect( add_query_arg( 'sent', '0', wp_get_referer() ? wp_get_referer() : home_url( '/contact/' ) ) ); exit;
	}
	$subjects = array( 'beta' => 'Value Lens beta request', 'logicpilot' => 'LogicPilot launch updates' );
	$subject  = 'svlslabs.com: ' . ( isset( $subjects[ $form ] ) ? $subjects[ $form ] : 'Contact enquiry' ) . ' from ' . $fields['name'];
	$body    = '';
	foreach ( $fields as $key => $value ) { $body .= ucfirst( str_replace( array( '-', '_' ), ' ', $key ) ) . ': ' . $value . "\n"; }
	$body   .= "\nSent " . gmdate( 'Y-m-d H:i' ) . " UTC from " . home_url( '/' ) . "\n";
	$headers = array( 'Content-Type: text/plain; charset=UTF-8', 'Reply-To: ' . $fields['name'] . ' <' . $email . '>' );
	$sent    = wp_mail( 'service@svlslabs.com', $subject, $body, $headers );
	if ( svls_wants_json() ) { wp_send_json( array( 'ok' => (bool) $sent ), $sent ? 200 : 500 ); }
	wp_safe_redirect( add_query_arg( 'sent', $sent ? '1' : '0', wp_get_referer() ? wp_get_referer() : home_url( '/contact/' ) ) ); exit;
}
function svls_wants_json() { return isset( $_SERVER['HTTP_ACCEPT'] ) && false !== strpos( $_SERVER['HTTP_ACCEPT'], 'application/json' ); }
add_action( 'admin_post_nopriv_svls_form', 'svls_handle_form' );
add_action( 'admin_post_svls_form', 'svls_handle_form' );

/**
 * Pages added by a theme release are created on the first request after the upload, once per release
 * (option svls_pages_version). A page is created only when its parent exists and the path is still free.
 */
add_action( 'init', function () {
	$release = '2026-10-logicpilot';
	if ( get_option( 'svls_pages_version' ) === $release || get_transient( 'svls_pages_lock' ) ) { return; }
	set_transient( 'svls_pages_lock', 1, 60 );
	$pages = array(
		array( 'path' => 'products/logicpilot', 'parent' => 'products', 'slug' => 'logicpilot', 'title' => 'LogicPilot' ),
	);
	foreach ( $pages as $p ) {
		if ( get_page_by_path( $p['path'] ) ) { continue; }
		$parent = get_page_by_path( $p['parent'] );
		if ( ! $parent ) { continue; }
		wp_insert_post( array(
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => $p['title'],
			'post_name'    => $p['slug'],
			'post_parent'  => $parent->ID,
			'post_content' => '<!-- Rendered by the ' . $p['path'] . ' template of the SVLS LABS theme -->',
		) );
	}
	update_option( 'svls_pages_version', $release, false );
	delete_transient( 'svls_pages_lock' );
}, 20 );

function svls_page_head() {
	if ( ! empty( $GLOBALS['svls_page_head'] ) && is_callable( $GLOBALS['svls_page_head'] ) ) {
		call_user_func( $GLOBALS['svls_page_head'] );
		return;
	}
	svls_default_head();
}

/** Prints aria-current="page" when the request path is the given site path (the static site bakes this in). */
function svls_current( $path ) {
	$uri = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ) : '';
	$uri = '/' . trim( $uri, '/' ) . '/';
	if ( $uri === $path ) { echo ' aria-current="page"'; }
}

/** Head for generic WordPress pages that have no dedicated template (index.php / page.php). */
function svls_default_head() { ?>
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

/** Hub content for the two parent pages (services, products); page.php renders it as practice cards. */
function svls_hub( $slug ) {
	$hubs = array(
		'services' => array(
			'label' => 'Practices',
			'lead'  => 'Three practices, one standard: SAP at the core, cloud around it, governed AI on top of it.',
			'items' => array(
				array( 'title' => 'SAP & ERP', 'href' => '/services/sap/', 'cta' => 'See the SAP & ERP practice', 'body' => 'S/4HANA (Public and Private Cloud, RISE, on-premise), BTP and Integration Suite delivered Clean Core from day one. A written contract per interface and a read-back check after every run.' ),
				array( 'title' => 'Cloud', 'href' => '/services/cloud/', 'cta' => 'See the Cloud practice', 'body' => 'SAP-to-GCP/BigQuery and Salesforce integration, cloud-native services around the core, migrations and landing zones that keep the ledger intact.' ),
				array( 'title' => 'Agentic & Applied AI', 'href' => '/services/ai/', 'cta' => 'See the Agentic & Applied AI practice', 'body' => 'Governed agents on SAP BTP under a control model where every write is read before, confirmed by a person and verified after. Applied AI methods our team has built and published underneath.' ),
			),
		),
		'products' => array(
			'label' => 'Products',
			'lead'  => 'Three products, one discipline: agents act through defined tools, and people make the decisions.',
			'items' => array(
				array( 'title' => 'Value Lens (private beta)', 'href' => '/products/value-lens/', 'cta' => 'See Value Lens', 'body' => 'Margin leak finder for order-to-cash on SAP. Every case carries its sources, its calculation and its decisions. Private beta on synthetic data; production SAP connector in development.' ),
				array( 'title' => 'SAP Intelligence Suite', 'href' => '/products/sap-intelligence-suite/', 'cta' => 'See SAP Intelligence Suite', 'body' => 'The workbench behind our AI-assisted SAP engineering: integration flows, ABAP and RAP generated from plain-English requests, reviewed by an architect before they reach a landscape. Available to customers on request.' ),
				array( 'title' => 'LogicPilot (launching 12 Nov 2026)', 'href' => '/products/logicpilot/', 'cta' => 'See LogicPilot', 'body' => 'MCP production assistant for Logic Pro. Describe the musical direction and get an editable session: tracks, MIDI, song sections and arrangement structure. Development demo published.' ),
			),
		),
	);
	return isset( $hubs[ $slug ] ) ? $hubs[ $slug ] : null;
}

/** Content of a leftover page from the previous site: Divi shortcodes removed, then the normal content filters. */
function svls_clean_content( $content ) {
	$content = preg_replace( '/\\[\\/?et_pb_[^\\]]*\\]/', '', (string) $content );
	return apply_filters( 'the_content', trim( $content ) );
}

// No 32px admin-bar bump on the sticky header when an editor is logged in.
add_action( 'get_header', function () { remove_action( 'wp_head', '_admin_bar_bump_cb' ); } );

/** 301 redirects from the URLs of the previous (Divi) site to their replacements, whatever the old pages' status. */
add_action( 'template_redirect', function () {
	$map = array(
		'604-2'                     => '/',
		'about-us-2'                => '/about/',
		'contact-us'                => '/contact/',
		'privacy-policy-2'          => '/privacy/',
		'terms-and-conditions'      => '/terms/',
		'our-products-and-services' => '/services/',
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
fs.writeFileSync(path.join(out, 'README-THEME.md'), `# SVLS LABS WordPress theme

Generated from the static site in \`website/\` by \`make-wp-theme.js\`. Copy and markup come from the static HTML; edit the static site first, regenerate, and re-upload.

## Install

1. Zip this folder as \`${slug}.zip\` (the zip must contain the \`${slug}/\` folder at its top level).
2. WordPress admin -> Appearance -> Themes -> Add New -> Upload Theme -> choose the zip -> Install -> Activate.

## Pages to create (Pages -> Add New)

The theme picks the template from the page's path automatically (\`functions.php\`, \`template_include\`), so the slugs and parents below are what matter. The Template dropdown in the editor (Page Attributes) can still override the choice.

| URL | WordPress slug | Parent page | Template file | Template dropdown name |
| --- | --- | --- | --- | --- |
${pageRows.map(t => { const parts = t.slug.split('/'); return `| \`${t.path}\` | \`${parts[parts.length - 1]}\` | ${parts.length > 1 ? '`' + parts.slice(0, -1).join('/') + '`' : 'none'} | \`${t.file}\` | ${t.template} |`; }).join('\n')}

The nested pages need their parent pages to exist first: \`services\` (title "Services") and \`products\` (title "Products"). Those two parents render with \`page.php\` as hub pages (hero plus one card per child, from \`svls_hub()\` in functions.php); their WordPress content is not shown. Any other leftover page renders with its Divi shortcodes stripped.

Front page: create a page (any title, for example "Home"), then Settings -> Reading -> "Your homepage displays: A static page" -> Homepage: that page. \`front-page.php\` renders it. The 404 page is \`404.php\` and needs no WordPress page.

## What is where

- \`header.php\` / \`footer.php\`: the shared header (nav, dropdowns, Menu sheet) and footer. Every template calls them.
- \`page-*.php\`, \`front-page.php\`, \`404.php\`: one per static page. The top of each file holds that page's \`<head>\` (title, description, canonical, Open Graph, Twitter, page stylesheet, JSON-LD) in a closure that \`header.php\` prints.
- \`functions.php\`: prints the head, keeps \`wp_head()\` lean (no emoji, block or global-styles CSS, generator, shortlink or duplicate canonical), maps page paths to templates.
- \`assets/\`: css, js, logo, diagrams, og (unchanged from the static site). \`favicon*\`, \`apple-touch-icon.png\`, \`site.webmanifest\`, \`screenshot.png\` at the theme root.
- \`index.php\` / \`page.php\`: fallback for any page without a template.

## Things WordPress does differently from the static host

- \`robots.txt\` and the sitemap are served by WordPress (\`/robots.txt\`, \`/wp-sitemap.xml\`); the static \`sitemap.xml\` is not part of the theme. Keep Settings -> Reading -> "Discourage search engines" unticked on the live site.
- Titles, descriptions, canonicals and Open Graph tags come from the templates. If an SEO plugin (Yoast, Rank Math, All in One SEO) is active, turn off its title, meta description, canonical and Open Graph output, or deactivate it, or the head carries each tag twice.
- Caching or minification plugins (Autoptimize, WP Rocket, LiteSpeed) must not combine, defer or inline the theme's CSS and JS; the head order (tokens.css, site.css, page css, theme.css) is deliberate.
- The contact and beta forms post to admin-post.php (action=svls_form) and are emailed to service@svlslabs.com by functions.php; WordPress form plugins are not involved.
`);

// 3. Self-check
const leftovers = [];
for (const f of walk(out).filter(f => f.endsWith('.php'))) {
  const t = fs.readFileSync(f, 'utf8');
  for (const re of [/(href|src|content)=["']\/(assets|favicon|apple-touch|site\.webmanifest)/g, /https:\/\/svlslabs\.com\/assets\//g]) { const m = t.match(re); if (m) leftovers.push(`${path.basename(f)}: ${m.length} x ${re}`); }
}
if (leftovers.length) problems.push(...leftovers);
const hp = fs.readFileSync(path.join(out, 'header.php'), 'utf8'), fp = fs.readFileSync(path.join(out, 'footer.php'), 'utf8');
if (!hp.includes('wp_head()')) problems.push('header.php lacks wp_head()');
if (!fp.includes('wp_footer()')) problems.push('footer.php lacks wp_footer()');
console.log(JSON.stringify({ theme: out, templates, problems }, null, 2));
if (problems.length) process.exitCode = 2;
