<?php
/**
 * Plugin Name:       CR Srikanth Book Landing
 * Description:       A fast, minimal book landing page at /read/ for promoting one book, with buttons to the stores where it is sold and first-party counts of visits and store clicks per source. No cookies, no third-party trackers. Independent of the theme; deactivating it removes the page.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            CR Srikanth
 * License:           GPL-2.0-or-later
 * Text Domain:       crs-book-landing
 *
 * @package CRSBookLanding
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CRS_BOOK_DB_VERSION', '1' );

/* ------------------------------------------------------------------ settings ------------------------------------------------------------------ */

/** The store buttons, in display order. "universal" is the main button; empty links are hidden. */
function crs_book_stores() {
	return array(
		'universal'        => 'Books2Read (all ebook stores)',
		'amazon_ebook'     => 'Amazon Kindle',
		'amazon_paperback' => 'Amazon paperback',
		'apple'            => 'Apple Books',
		'kobo'             => 'Kobo (Rakuten)',
		'booktopia_ebook'  => 'Booktopia ebook',
		'booktopia_pb'     => 'Booktopia paperback',
	);
}

function crs_book_defaults() {
	return array(
		'slug'       => 'read',
		'kicker'     => 'New short-story collection',
		'title'      => 'Tales from Bellavere and Lindenfeld',
		'byline'     => 'by CR Srikanth',
		'blurb'      => 'Linked stories from two small European towns that appear on no map. Across generations, families pass down loyalties, recipes, music, houses, debts and secrets.',
		'main_label' => 'Get the ebook',
		'cover_url'  => '',
		'about_url'  => '/books/tales-from-bellavere-and-lindenfeld/',
		'privacy'    => '/privacy-policy/',
		'stats'      => 1,
		'links'      => array(
			'universal'        => 'https://books2read.com/u/3GDgV8',
			'amazon_ebook'     => '',
			'amazon_paperback' => '',
			'apple'            => 'https://books.apple.com/us/book/tales-from-bellavere-and-lindenfeld/id6825566440',
			'kobo'             => 'https://books.rakuten.co.jp/rk/4bda3d3d9e7e3014a44c48d51006649b/',
			'booktopia_ebook'  => 'https://www.booktopia.com.au/tales-from-bellavere-and-lindenfeld-cr-srikanth/ebook/9798237466799.html',
			'booktopia_pb'     => 'https://www.booktopia.com.au/tales-from-bellavere-and-lindenfeld-cr-srikanth/book/9798237110791.html',
		),
	);
}

function crs_book_options() {
	$saved = get_option( 'crs_book_landing', array() );
	$o     = wp_parse_args( is_array( $saved ) ? $saved : array(), crs_book_defaults() );
	$o['links'] = wp_parse_args( is_array( $o['links'] ) ? $o['links'] : array(), crs_book_defaults()['links'] );
	return $o;
}

function crs_book_notice( $code, $message ) {
	static $shown = array();
	if ( function_exists( 'add_settings_error' ) && ! isset( $shown[ $code ] ) ) {
		$shown[ $code ] = true;
		add_settings_error( 'crs_book_landing', $code, $message );
	}
}

/** Only https links, and an Amazon slot only accepts an Amazon link. */
function crs_book_clean_link( $key, $url ) {
	$url = trim( (string) $url );
	if ( '' === $url ) {
		return '';
	}
	$clean = esc_url_raw( $url, array( 'https' ) );
	$host  = strtolower( (string) wp_parse_url( $clean, PHP_URL_HOST ) );
	if ( '' === $clean || '' === $host ) {
		return false;
	}
	if ( 0 === strpos( $key, 'amazon' ) && ! preg_match( '/(^|\.)amazon\.[a-z.]+$/', $host ) ) {
		return false;
	}
	return $clean;
}

function crs_book_sanitize( $in ) {
	$d   = crs_book_defaults();
	$in  = is_array( $in ) ? $in : array();
	$out = array();
	$slug        = sanitize_title( isset( $in['slug'] ) ? $in['slug'] : $d['slug'] );
	$out['slug'] = $slug ? $slug : $d['slug'];
	foreach ( array( 'kicker', 'title', 'byline', 'main_label' ) as $k ) {
		$out[ $k ] = isset( $in[ $k ] ) ? sanitize_text_field( $in[ $k ] ) : $d[ $k ];
	}
	if ( '' === $out['title'] ) {
		$out['title'] = $d['title'];
	}
	if ( '' === $out['main_label'] ) {
		$out['main_label'] = $d['main_label'];
	}
	$out['blurb']     = isset( $in['blurb'] ) ? sanitize_textarea_field( $in['blurb'] ) : $d['blurb'];
	$out['cover_url'] = isset( $in['cover_url'] ) ? esc_url_raw( trim( $in['cover_url'] ), array( 'https', 'http' ) ) : '';
	$out['about_url'] = isset( $in['about_url'] ) ? esc_url_raw( trim( $in['about_url'] ) ) : $d['about_url'];
	$out['privacy']   = isset( $in['privacy'] ) ? esc_url_raw( trim( $in['privacy'] ) ) : $d['privacy'];
	$out['stats']     = empty( $in['stats'] ) ? 0 : 1;
	$out['links']     = array();
	$prev             = crs_book_options();
	foreach ( crs_book_stores() as $key => $label ) {
		$raw   = isset( $in['links'][ $key ] ) ? $in['links'][ $key ] : '';
		$clean = crs_book_clean_link( $key, $raw );
		if ( false === $clean ) {
			crs_book_notice( 'link-' . $key, sprintf( 'The %s link was not saved: it must be a full https link%s.', $label, 0 === strpos( $key, 'amazon' ) ? ' to an amazon store' : '' ) );
			$clean = isset( $prev['links'][ $key ] ) ? $prev['links'][ $key ] : '';
		}
		$out['links'][ $key ] = $clean;
	}
	return $out;
}

/* ------------------------------------------------------------------ first-party counts ------------------------------------------------------------------ */

function crs_book_table() {
	global $wpdb;
	return $wpdb->prefix . 'crs_book_landing_stats';
}

/** One row per day, source and event ("view" or the store key). Counts only: no visitor identifier is stored. */
function crs_book_install() {
	global $wpdb;
	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	$table   = crs_book_table();
	$charset = $wpdb->get_charset_collate();
	dbDelta( "CREATE TABLE {$table} (
		day date NOT NULL,
		tag varchar(64) NOT NULL DEFAULT '',
		event varchar(32) NOT NULL DEFAULT '',
		n int(10) unsigned NOT NULL DEFAULT 0,
		PRIMARY KEY  (day,tag,event)
	) {$charset};" );
	update_option( 'crs_book_landing_db', CRS_BOOK_DB_VERSION, false );
	if ( false === get_option( 'crs_book_landing', false ) ) {
		add_option( 'crs_book_landing', crs_book_defaults(), '', false );
	}
}
register_activation_hook( __FILE__, 'crs_book_install' );

add_action(
	'admin_init',
	function () {
		if ( get_option( 'crs_book_landing_db' ) !== CRS_BOOK_DB_VERSION ) {
			crs_book_install();
		}
	}
);

function crs_book_uninstall() {
	global $wpdb;
	$wpdb->query( 'DROP TABLE IF EXISTS ' . crs_book_table() ); // phpcs:ignore WordPress.DB
	delete_option( 'crs_book_landing' );
	delete_option( 'crs_book_landing_db' );
}
register_uninstall_hook( __FILE__, 'crs_book_uninstall' );

function crs_book_hit() {
	nocache_headers();
	$o     = crs_book_options();
	$event = isset( $_POST['e'] ) ? sanitize_key( wp_unslash( $_POST['e'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
	$valid = ( 'view' === $event ) || ( isset( $o['links'][ $event ] ) && '' !== $o['links'][ $event ] );
	if ( $o['stats'] && $valid && get_option( 'crs_book_landing_db' ) === CRS_BOOK_DB_VERSION ) {
		$ua  = isset( $_SERVER['HTTP_USER_AGENT'] ) ? (string) $_SERVER['HTTP_USER_AGENT'] : ''; // phpcs:ignore
		$bot = ( '' === $ua ) || preg_match( '/bot|crawl|spider|slurp|facebookexternalhit|meta-externalagent|preview|monitor|headless|python|curl|wget|lighthouse|pingdom|gtmetrix/i', $ua );
		if ( ! $bot ) {
			$tag = isset( $_POST['t'] ) ? strtolower( (string) wp_unslash( $_POST['t'] ) ) : ''; // phpcs:ignore WordPress.Security
			$tag = trim( substr( preg_replace( '/[^a-z0-9_.-]+/', '-', $tag ), 0, 48 ), '-' );
			if ( is_user_logged_in() && current_user_can( 'manage_options' ) ) {
				$tag = '_admin-test';
			}
			$ip  = isset( $_SERVER['REMOTE_ADDR'] ) ? (string) $_SERVER['REMOTE_ADDR'] : ''; // phpcs:ignore
			$key = 'crs_bh_' . md5( wp_salt( 'nonce' ) . '|' . $ip . '|' . $ua . '|' . $event . '|' . $tag );
			if ( false === get_transient( $key ) ) {
				set_transient( $key, 1, 30 );
				global $wpdb;
				$table = crs_book_table();
				$day   = gmdate( 'Y-m-d' );
				$done  = $wpdb->query( $wpdb->prepare( "UPDATE {$table} SET n = n + 1 WHERE day = %s AND tag = %s AND event = %s", $day, $tag, $event ) ); // phpcs:ignore WordPress.DB
				if ( ! $done ) {
					$wpdb->query( $wpdb->prepare( "INSERT INTO {$table} (day, tag, event, n) VALUES (%s, %s, %s, 1)", $day, $tag, $event ) ); // phpcs:ignore WordPress.DB
				}
			}
		}
	}
	status_header( 204 );
	exit;
}
add_action( 'wp_ajax_nopriv_crs_book_hit', 'crs_book_hit' );
add_action( 'wp_ajax_crs_book_hit', 'crs_book_hit' );

/** Raw rows for the last $days days: day, tag, event, n. */
function crs_book_rows( $days = 30 ) {
	global $wpdb;
	if ( get_option( 'crs_book_landing_db' ) !== CRS_BOOK_DB_VERSION ) {
		return array();
	}
	$table = crs_book_table();
	$since = gmdate( 'Y-m-d', time() - ( max( 1, (int) $days ) - 1 ) * DAY_IN_SECONDS );
	return (array) $wpdb->get_results( $wpdb->prepare( "SELECT day, tag, event, n FROM {$table} WHERE day >= %s ORDER BY day DESC, tag ASC, event ASC", $since ), ARRAY_A ); // phpcs:ignore WordPress.DB
}

/* ------------------------------------------------------------------ the landing page ------------------------------------------------------------------ */

add_action(
	'init',
	function () {
		if ( is_admin() || ( defined( 'DOING_AJAX' ) && DOING_AJAX ) || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return;
		}
		$method = isset( $_SERVER['REQUEST_METHOD'] ) ? $_SERVER['REQUEST_METHOD'] : 'GET'; // phpcs:ignore
		if ( 'GET' !== $method && 'HEAD' !== $method ) {
			return;
		}
		$path = trim( (string) wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '', PHP_URL_PATH ), '/' ); // phpcs:ignore
		$home = trim( (string) wp_parse_url( home_url(), PHP_URL_PATH ), '/' );
		if ( '' !== $home && 0 === strpos( $path, $home ) ) {
			$path = trim( substr( $path, strlen( $home ) ), '/' );
		}
		$o = crs_book_options();
		if ( strtolower( $path ) !== $o['slug'] ) {
			return;
		}
		status_header( 200 );
		header( 'Content-Type: text/html; charset=utf-8' );
		header( 'Cache-Control: public, max-age=300' );
		header( 'X-Robots-Tag: noindex, follow' );
		if ( 'HEAD' !== $method ) {
			echo crs_book_html( $o ); // phpcs:ignore WordPress.Security.EscapeOutput -- escaped inside.
		}
		exit;
	},
	1
);

function crs_book_abs( $url ) {
	return ( $url && 0 === strpos( $url, '/' ) ) ? home_url( $url ) : $url;
}

function crs_book_html( $o ) {
	$assets    = plugin_dir_url( __FILE__ ) . 'assets/';
	$cover     = $o['cover_url'] ? $o['cover_url'] : $assets . 'cover-tales.webp';
	$og_image  = $o['cover_url'] ? $o['cover_url'] : $assets . 'cover-tales.jpg';
	$canonical = home_url( '/' . $o['slug'] . '/' );
	$about     = crs_book_abs( $o['about_url'] );
	$privacy   = crs_book_abs( $o['privacy'] );
	$stores    = crs_book_stores();
	$main      = '' !== $o['links']['universal'] ? 'universal' : '';
	if ( ! $main ) {
		foreach ( $stores as $key => $label ) {
			if ( '' !== $o['links'][ $key ] ) {
				$main = $key;
				break;
			}
		}
	}
	$title = $o['title'] . ' ' . $o['byline'];
	$desc  = $o['blurb'];
	$cfg   = array(
		'stats' => $o['stats'] ? 1 : 0,
		'ajax'  => admin_url( 'admin-ajax.php', 'relative' ),
	);
	ob_start();
	?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title><?php echo esc_html( $title ); ?></title>
<meta name="description" content="<?php echo esc_attr( $desc ); ?>">
<meta name="robots" content="noindex, follow">
<meta name="theme-color" content="#F4EFE4">
<link rel="canonical" href="<?php echo esc_url( $canonical ); ?>">
<meta property="og:type" content="book">
<meta property="og:title" content="<?php echo esc_attr( $title ); ?>">
<meta property="og:description" content="<?php echo esc_attr( $desc ); ?>">
<meta property="og:url" content="<?php echo esc_url( $canonical ); ?>">
<meta property="og:image" content="<?php echo esc_url( $og_image ); ?>">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="<?php echo esc_url( home_url( '/favicon.ico' ) ); ?>">
<link rel="preload" as="image" href="<?php echo esc_url( $cover ); ?>">
<style>
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;background:#F4EFE4;color:#111;font:400 16px/1.5 Archivo,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
.bar{height:8px;background:linear-gradient(90deg,#FF7A1A 0 38%,#FF6F5E 38% 64%,#C9EE55 64% 100%)}
.label{margin:0;padding:14px 20px 0;text-align:center;font-size:11px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:#3D3A33}
.label a{color:inherit;text-decoration:none}
main{flex:1;display:flex;flex-direction:column;align-items:center;width:100%;max-width:460px;margin:0 auto;padding:18px 20px 24px;text-align:center}
.cover{width:min(52vw,220px);margin:0 auto}
.cover img{display:block;width:100%;height:auto;border:2px solid #111;box-shadow:10px 10px 0 #FF7A1A}
.kicker{margin:26px 0 0;font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#A63F00}
h1{margin:8px 0 0;font-size:clamp(30px,8.6vw,42px);line-height:1;font-weight:900;letter-spacing:-.04em;text-transform:uppercase;overflow-wrap:break-word}
.by{margin:10px 0 0;font-size:17px;color:#2E2B25}
.blurb{margin:14px 0 0;font-size:15px;line-height:1.55;color:#3D3A33}
.btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:60px;margin:22px 0 0;padding:0 20px;background:#FF7A1A;color:#111;border:2px solid #111;font-family:inherit;font-weight:800;font-size:17px;line-height:1;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;-webkit-tap-highlight-color:transparent}
.btn:hover,.btn:focus-visible{background:#C9EE55}
.btn svg{width:18px;height:18px;flex:none}
.stores{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:14px 0 0;padding:0;list-style:none}
.stores a{display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border:2px solid #111;color:#111;font-size:13px;font-weight:700;text-decoration:none}
.stores a:hover,.stores a:focus-visible{background:#C9EE55}
.hint{margin:12px 0 0;font-size:13px;color:#5F584C}
.about{margin:18px 0 0;font-size:14px}
a:focus-visible{outline:3px solid #111;outline-offset:3px}
.about a,footer a{color:#111;text-decoration:underline;text-underline-offset:3px;text-decoration-color:#FF7A1A;text-decoration-thickness:2px}
footer{padding:14px 20px calc(16px + env(safe-area-inset-bottom));text-align:center;font-size:12px;color:#5F584C}
footer p{margin:0}
@media (max-height:760px){.cover{width:min(34vw,150px)}.cover img{box-shadow:6px 6px 0 #FF7A1A}.kicker{margin-top:16px}.blurb{font-size:14px;margin-top:10px}.btn{margin-top:16px;min-height:54px}}
@media (max-height:600px){.blurb{display:none}}
</style>
</head>
<body>
<div class="bar" aria-hidden="true"></div>
<p class="label"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">CR Srikanth</a></p>
<main>
	<div class="cover"><img src="<?php echo esc_url( $cover ); ?>" width="480" height="767" alt="Cover of <?php echo esc_attr( $o['title'] ); ?>" fetchpriority="high" decoding="async"></div>
	<?php if ( $o['kicker'] ) : ?><p class="kicker"><?php echo esc_html( $o['kicker'] ); ?></p><?php endif; ?>
	<h1><?php echo esc_html( $o['title'] ); ?></h1>
	<?php if ( $o['byline'] ) : ?><p class="by"><?php echo esc_html( $o['byline'] ); ?></p><?php endif; ?>
	<?php if ( $o['blurb'] ) : ?><p class="blurb"><?php echo esc_html( $o['blurb'] ); ?></p><?php endif; ?>
	<?php if ( $main ) : ?>
	<a class="btn" href="<?php echo esc_url( $o['links'][ $main ] ); ?>" rel="noopener" data-store="<?php echo esc_attr( $main ); ?>"><?php echo esc_html( $o['main_label'] ); ?><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
	<?php if ( 'universal' === $main ) : ?><p class="hint">Opens a page where you choose your ebook store.</p><?php endif; ?>
	<?php endif; ?>
	<ul class="stores" aria-label="Other stores">
	<?php foreach ( $stores as $key => $label ) : if ( $key === $main || '' === $o['links'][ $key ] ) { continue; } ?>
		<li><a href="<?php echo esc_url( $o['links'][ $key ] ); ?>" rel="noopener" data-store="<?php echo esc_attr( $key ); ?>"><?php echo esc_html( 'universal' === $key ? 'All ebook stores' : $label ); ?></a></li>
	<?php endforeach; ?>
	</ul>
	<?php if ( $about ) : ?><p class="about"><a href="<?php echo esc_url( $about ); ?>">About the book</a></p><?php endif; ?>
</main>
<footer>
	<p>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> CR Srikanth<?php if ( $privacy ) : ?> · <a href="<?php echo esc_url( $privacy ); ?>">Privacy</a><?php endif; ?></p>
</footer>
<script>
window.CRSBOOK = <?php echo wp_json_encode( $cfg ); ?>;
(function () {
  'use strict';
  var C = window.CRSBOOK || {};
  if (!C.stats || navigator.webdriver === true) return;
  var tag = '';
  try { var q = new URLSearchParams(window.location.search); tag = (q.get('utm_content') || q.get('utm_source') || '').slice(0, 48); } catch (e) {}
  var sent = {};
  function count(ev) {
    if (sent[ev]) return;
    sent[ev] = 1;
    try {
      var d = new FormData(); d.append('action', 'crs_book_hit'); d.append('e', ev); d.append('t', tag);
      if (navigator.sendBeacon) navigator.sendBeacon(C.ajax, d);
      else fetch(C.ajax, { method: 'POST', body: d, keepalive: true, credentials: 'same-origin' });
    } catch (e) {}
  }
  function view() { if (document.visibilityState !== 'hidden') count('view'); }
  if (document.visibilityState === 'hidden') document.addEventListener('visibilitychange', view, { once: true }); else view();
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[data-store]') : null;
    if (a && ev.isTrusted !== false) count(a.getAttribute('data-store'));
  });
})();
</script>
</body>
</html>
	<?php
	return ob_get_clean();
}

/* ------------------------------------------------------------------ admin ------------------------------------------------------------------ */

add_action(
	'admin_init',
	function () {
		register_setting( 'crs_book_landing', 'crs_book_landing', array( 'type' => 'array', 'sanitize_callback' => 'crs_book_sanitize' ) );
	}
);

add_action(
	'admin_menu',
	function () {
		add_options_page( 'Book Landing', 'Book Landing', 'manage_options', 'crs-book-landing', 'crs_book_admin_page' );
	}
);

add_filter(
	'plugin_action_links_' . plugin_basename( __FILE__ ),
	function ( $links ) {
		array_unshift( $links, '<a href="' . esc_url( admin_url( 'options-general.php?page=crs-book-landing' ) ) . '">Settings</a>' );
		return $links;
	}
);

add_action(
	'admin_post_crs_book_csv',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Not allowed.' );
		}
		check_admin_referer( 'crs_book_csv' );
		nocache_headers();
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="book-landing-' . gmdate( 'Y-m-d' ) . '.csv"' );
		$out = fopen( 'php://output', 'w' );
		fputcsv( $out, array( 'day_utc', 'source', 'event', 'count' ) );
		foreach ( crs_book_rows( 400 ) as $r ) {
			fputcsv( $out, array( $r['day'], $r['tag'], 'view' === $r['event'] ? 'page_view' : 'store_click:' . $r['event'], $r['n'] ) );
		}
		fclose( $out ); // phpcs:ignore
		exit;
	}
);

function crs_book_admin_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$o      = crs_book_options();
	$stores = crs_book_stores();
	$url    = home_url( '/' . $o['slug'] . '/' );
	$rows   = crs_book_rows( 30 );
	$by_src = array();
	$by_st  = array();
	foreach ( $rows as $r ) {
		if ( '_admin-test' === $r['tag'] ) {
			continue;
		}
		$src = '' === $r['tag'] ? '(direct, no tag)' : $r['tag'];
		if ( ! isset( $by_src[ $src ] ) ) {
			$by_src[ $src ] = array( 0, 0 );
		}
		if ( 'view' === $r['event'] ) {
			$by_src[ $src ][0] += (int) $r['n'];
		} else {
			$by_src[ $src ][1] += (int) $r['n'];
			$name = isset( $stores[ $r['event'] ] ) ? $stores[ $r['event'] ] : $r['event'];
			$by_st[ $name ] = ( isset( $by_st[ $name ] ) ? $by_st[ $name ] : 0 ) + (int) $r['n'];
		}
	}
	arsort( $by_st );
	$rate = function ( $v, $c ) {
		return $v ? round( 100 * $c / $v ) . '%' : '–';
	};
	?>
	<div class="wrap">
		<h1>Book Landing</h1>
		<p>Landing page for one book: <a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener"><?php echo esc_html( $url ); ?></a>. No cookies and no third-party trackers. Nothing here launches an advertisement or spends money.</p>
		<form method="post" action="options.php" style="max-width:860px">
			<?php settings_fields( 'crs_book_landing' ); ?>
			<h2>Store links</h2>
			<p>Empty links are hidden. The first filled link (Books2Read when present) is the big button. Amazon slots accept only amazon links.</p>
			<table class="form-table" role="presentation">
			<?php foreach ( $stores as $key => $label ) : ?>
				<tr><th scope="row"><label for="crs-link-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label></th><td><input type="url" id="crs-link-<?php echo esc_attr( $key ); ?>" name="crs_book_landing[links][<?php echo esc_attr( $key ); ?>]" value="<?php echo esc_attr( $o['links'][ $key ] ); ?>" class="large-text" placeholder="https://"></td></tr>
			<?php endforeach; ?>
			</table>
			<h2>Page</h2>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="crs-slug">Address</label></th><td><code><?php echo esc_html( home_url( '/' ) ); ?></code><input type="text" id="crs-slug" name="crs_book_landing[slug]" value="<?php echo esc_attr( $o['slug'] ); ?>" style="width:160px"><code>/</code></td></tr>
				<tr><th scope="row"><label for="crs-kicker">Line above the title</label></th><td><input type="text" id="crs-kicker" name="crs_book_landing[kicker]" value="<?php echo esc_attr( $o['kicker'] ); ?>" class="regular-text"></td></tr>
				<tr><th scope="row"><label for="crs-title">Book title</label></th><td><input type="text" id="crs-title" name="crs_book_landing[title]" value="<?php echo esc_attr( $o['title'] ); ?>" class="regular-text"></td></tr>
				<tr><th scope="row"><label for="crs-byline">Line below the title</label></th><td><input type="text" id="crs-byline" name="crs_book_landing[byline]" value="<?php echo esc_attr( $o['byline'] ); ?>" class="regular-text"></td></tr>
				<tr><th scope="row"><label for="crs-blurb">Short description</label></th><td><textarea id="crs-blurb" name="crs_book_landing[blurb]" rows="3" class="large-text"><?php echo esc_textarea( $o['blurb'] ); ?></textarea></td></tr>
				<tr><th scope="row"><label for="crs-main">Big button text</label></th><td><input type="text" id="crs-main" name="crs_book_landing[main_label]" value="<?php echo esc_attr( $o['main_label'] ); ?>" class="regular-text"></td></tr>
				<tr><th scope="row"><label for="crs-cover">Cover image</label></th><td><input type="url" id="crs-cover" name="crs_book_landing[cover_url]" value="<?php echo esc_attr( $o['cover_url'] ); ?>" class="large-text" placeholder="Empty = the bundled Tales from Bellavere and Lindenfeld cover"></td></tr>
				<tr><th scope="row"><label for="crs-about">"About the book" link</label></th><td><input type="text" id="crs-about" name="crs_book_landing[about_url]" value="<?php echo esc_attr( $o['about_url'] ); ?>" class="regular-text"></td></tr>
				<tr><th scope="row"><label for="crs-privacy">Privacy link</label></th><td><input type="text" id="crs-privacy" name="crs_book_landing[privacy]" value="<?php echo esc_attr( $o['privacy'] ); ?>" class="regular-text"></td></tr>
				<tr><th scope="row">Counts</th><td><label><input type="checkbox" name="crs_book_landing[stats]" value="1" <?php checked( $o['stats'], 1 ); ?>> Count page views and store clicks (totals per day and per source)</label></td></tr>
			</table>
			<?php submit_button(); ?>
		</form>
		<h2>Last 30 days</h2>
		<p>A store click means someone opened a store, not that they bought the book: only the stores' own reports show sales. Your own visits while logged in are left out.</p>
		<p><a class="button" href="<?php echo esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=crs_book_csv' ), 'crs_book_csv' ) ); ?>">Download CSV</a></p>
		<div style="display:flex;gap:24px;flex-wrap:wrap;max-width:860px">
			<table class="widefat striped" style="flex:1;min-width:300px"><thead><tr><th>Source</th><th>Page views</th><th>Store clicks</th><th>Click rate</th></tr></thead><tbody>
			<?php if ( ! $by_src ) : ?><tr><td colspan="4">No visits counted yet.</td></tr><?php endif; ?>
			<?php foreach ( $by_src as $s => $v ) : ?><tr><td><?php echo esc_html( $s ); ?></td><td><?php echo (int) $v[0]; ?></td><td><?php echo (int) $v[1]; ?></td><td><?php echo esc_html( $rate( $v[0], $v[1] ) ); ?></td></tr><?php endforeach; ?>
			</tbody></table>
			<table class="widefat striped" style="flex:1;min-width:300px"><thead><tr><th>Store</th><th>Clicks</th></tr></thead><tbody>
			<?php if ( ! $by_st ) : ?><tr><td colspan="2">No store clicks yet.</td></tr><?php endif; ?>
			<?php foreach ( $by_st as $s => $n ) : ?><tr><td><?php echo esc_html( $s ); ?></td><td><?php echo (int) $n; ?></td></tr><?php endforeach; ?>
			</tbody></table>
		</div>
	</div>
	<?php
}
