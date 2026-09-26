<?php
/**
 * SVLS Labs theme bootstrap.
 *
 * Every page template stores its own <head> content (title, description, canonical, Open Graph, Twitter,
 * page stylesheet, robots, JSON-LD) in $GLOBALS['svls_page_head']; header.php prints it through
 * svls_page_head(). Stylesheets and scripts are linked directly, so the output matches the static site build.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

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
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?php echo esc_html( wp_get_document_title() ); ?></title>
<meta name="theme-color" content="#0E1116" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0E1116" media="(prefers-color-scheme: dark)">
<link rel="icon" href="<?php echo esc_url( get_template_directory_uri() ); ?>/favicon.svg" type="image/svg+xml">
<link rel="icon" href="<?php echo esc_url( get_template_directory_uri() ); ?>/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="<?php echo esc_url( get_template_directory_uri() ); ?>/favicon-16.png" sizes="16x16" type="image/png">
<link rel="apple-touch-icon" href="<?php echo esc_url( get_template_directory_uri() ); ?>/apple-touch-icon.png">
<link rel="manifest" href="<?php echo esc_url( get_template_directory_uri() ); ?>/site.webmanifest">
<script>(function(){var d=document.documentElement;d.classList.remove('no-js');try{var t=localStorage.getItem('svls-theme');if(t==='light'||t==='dark'){d.setAttribute('data-theme',t);}}catch(e){}})();</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="font" type="font/woff2" crossorigin href="https://fonts.gstatic.com/s/intertight/v9/NGSwv5HMAFg6IuGlBNMjxLsH8ag.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin href="https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@800&display=swap">
<link rel="stylesheet" href="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/css/tokens.css">
<link rel="stylesheet" href="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/css/site.css">
<link rel="stylesheet" href="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/css/theme.css">
<script src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/js/site.js" defer></script>
<script src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/js/theme.js" defer></script>

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
// No 32px admin-bar bump on the sticky header when an editor is logged in.
add_action( 'get_header', function () { remove_action( 'wp_head', '_admin_bar_bump_cb' ); } );

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
