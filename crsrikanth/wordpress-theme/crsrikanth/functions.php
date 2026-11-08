<?php
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
	$subjects = array( 'music' => 'Music enquiry', 'literary' => 'Literary correspondence', 'technology' => 'Technology enquiry', 'media' => 'Media request' );
	$key      = isset( $fields['topic'] ) ? $fields['topic'] : '';
	$subject  = 'crsrikanth.com: ' . ( isset( $subjects[ $key ] ) ? $subjects[ $key ] : 'Message' ) . ' from ' . $fields['name'];
	$body    = '';
	foreach ( $fields as $key => $value ) { $body .= ucfirst( str_replace( array( '-', '_' ), ' ', $key ) ) . ': ' . $value . "
"; }
	$body   .= "
Sent " . gmdate( 'Y-m-d H:i' ) . " UTC from " . home_url( '/' ) . "
";
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
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?php echo esc_html( wp_get_document_title() ); ?></title>
<meta name="theme-color" content="#F4EFE4">
<link rel="icon" href="<?php echo esc_url( get_template_directory_uri() ); ?>/favicon.svg" type="image/svg+xml">
<link rel="icon" href="<?php echo esc_url( get_template_directory_uri() ); ?>/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="<?php echo esc_url( get_template_directory_uri() ); ?>/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,300&family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@400;500;700&family=Spectral:ital,wght@0,300;0,400;1,300&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;1,6..96,400&family=Cinzel:wght@400;600&family=Archivo:wght@400;500;800;900&family=Manrope:wght@300;400;600&display=swap">
<link rel="stylesheet" href="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/css/site.css?v=36277132">
<link rel="stylesheet" href="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/css/themes.css?v=e78b3084">
<script src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/js/site.js?v=61a35e3d" defer></script>

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
add_filter( 'robots_txt', function ( $output ) { return rtrim( (string) $output ) . "
Sitemap: " . home_url( '/wp-sitemap.xml' ) . "
"; } );

/** Content of a leftover page from the previous site: Divi shortcodes removed, then the normal content filters. */
function crs_clean_content( $content ) {
	$content = preg_replace( '/\[\/?et_pb_[^\]]*\]/', '', (string) $content );
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
