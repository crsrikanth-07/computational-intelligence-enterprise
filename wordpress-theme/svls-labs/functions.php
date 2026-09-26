<?php
/**
 * SVLS Labs theme bootstrap. Assets are linked directly in header.php/footer.php so the
 * WordPress output is identical to the static site build.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
	register_nav_menus( array( 'primary' => 'Primary (informational only; the header markup is static)' ) );
} );
// Hide the admin bar bump for a clean sticky header when logged in.
add_action( 'get_header', function () { remove_action( 'wp_head', '_admin_bar_bump_cb' ); } );
