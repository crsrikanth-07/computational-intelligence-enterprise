<?php
/**
 * Plugin Name:       VS Pop Spotify Landing — Another Day
 * Description:       A fast, minimal Spotify landing page for ad traffic at /another-day/, with consent-gated Meta Pixel events (PageView on load, ViewContent only on an intentional "Listen on Spotify" click) and first-party view and click counts. Independent of the theme; deactivating it removes the page.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            VS POP RECORDS LLP
 * License:           GPL-2.0-or-later
 * Text Domain:       vspop-another-day-landing
 *
 * @package VSPopAnotherDayLanding
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'VSPOP_AD_LANDING_VERSION', '1.0.0' );
define( 'VSPOP_AD_LANDING_DB_VERSION', '1' );

/**
 * The approved Spotify artist destination. It is a constant on purpose: the settings screen can switch a
 * campaign to a specific track, but nothing can silently change where the artist button goes.
 */
define( 'VSPOP_AD_LANDING_ARTIST_URL', 'https://open.spotify.com/artist/16N9BJJPufgA3rnpQ06iSa' );

/** The artist's name as Spotify shows it on that profile, so the page can say where the button goes. */
define( 'VSPOP_AD_LANDING_SPOTIFY_NAME', 'CR Srikanth' );

/* ------------------------------------------------------------------ settings ------------------------------------------------------------------ */

function vspop_ad_landing_defaults() {
	return array(
		'slug'         => 'another-day',
		'pixel_id'     => '',
		'consent_mode' => 'ask_everyone',  // ask_everyone | ask_where_required | pixel_off.
		'destination'  => 'artist',        // artist | track.
		'track_url'    => '',
		'artist_name'  => 'CR Srikanth',
		'headline'     => 'Another Day',
		'tagline'      => 'VS Pop™ · Very Smooth Pop',
		'track_line'   => 'New single by CR Srikanth',
		'cover_url'    => '',
		'privacy_url'  => '/privacy-policy/',
		'stats'        => 1,
	);
}

function vspop_ad_landing_options() {
	$saved = get_option( 'vspop_ad_landing', array() );
	return wp_parse_args( is_array( $saved ) ? $saved : array(), vspop_ad_landing_defaults() );
}

/** Returns a clean open.spotify.com track or album URL, or '' when the input is not one. */
function vspop_ad_landing_clean_track_url( $url ) {
	$url = trim( (string) $url );
	if ( preg_match( '#^https://open\.spotify\.com/(?:intl-[a-z]{2}/)?(track|album)/([A-Za-z0-9]{22})(?:[/?\#].*)?$#', $url, $m ) ) {
		return 'https://open.spotify.com/' . $m[1] . '/' . $m[2];
	}
	return '';
}

/** The URL the button opens right now, and which kind it is. Always a genuine open.spotify.com URL. */
function vspop_ad_landing_destination( $o = null ) {
	$o = $o ? $o : vspop_ad_landing_options();
	if ( 'track' === $o['destination'] ) {
		$track = vspop_ad_landing_clean_track_url( $o['track_url'] );
		if ( $track ) {
			return array( 'url' => $track, 'type' => 'track' );
		}
	}
	return array( 'url' => VSPOP_AD_LANDING_ARTIST_URL, 'type' => 'artist' );
}

/** Shows a settings notice on the admin screen; does nothing when settings are saved from elsewhere. */
function vspop_ad_landing_notice( $code, $message ) {
	static $shown = array();
	if ( function_exists( 'add_settings_error' ) && ! isset( $shown[ $code ] ) ) {
		$shown[ $code ] = true;
		add_settings_error( 'vspop_ad_landing', $code, $message );
	}
}

function vspop_ad_landing_sanitize( $in ) {
	$d   = vspop_ad_landing_defaults();
	$in  = is_array( $in ) ? $in : array();
	$out = array();

	$slug        = sanitize_title( isset( $in['slug'] ) ? $in['slug'] : $d['slug'] );
	$out['slug'] = $slug ? $slug : $d['slug'];

	$pixel           = preg_replace( '/\D+/', '', isset( $in['pixel_id'] ) ? (string) $in['pixel_id'] : '' );
	$out['pixel_id'] = ( strlen( $pixel ) >= 8 && strlen( $pixel ) <= 20 ) ? $pixel : '';
	if ( '' !== trim( isset( $in['pixel_id'] ) ? (string) $in['pixel_id'] : '' ) && '' === $out['pixel_id'] ) {
		vspop_ad_landing_notice( 'pixel', 'The Meta Pixel ID must be the number shown in Events Manager (digits only). It was not saved.' );
	}

	$mode                = isset( $in['consent_mode'] ) ? $in['consent_mode'] : $d['consent_mode'];
	$out['consent_mode'] = in_array( $mode, array( 'ask_everyone', 'ask_where_required', 'pixel_off' ), true ) ? $mode : $d['consent_mode'];

	$raw_track        = isset( $in['track_url'] ) ? trim( (string) $in['track_url'] ) : '';
	$out['track_url'] = vspop_ad_landing_clean_track_url( $raw_track );
	if ( '' !== $raw_track && '' === $out['track_url'] ) {
		vspop_ad_landing_notice( 'track', 'The track destination must be an open.spotify.com track or album link. It was not saved.' );
	}
	$dest               = ( isset( $in['destination'] ) && 'track' === $in['destination'] ) ? 'track' : 'artist';
	$out['destination'] = ( 'track' === $dest && '' === $out['track_url'] ) ? 'artist' : $dest;
	if ( 'track' === $dest && 'artist' === $out['destination'] ) {
		vspop_ad_landing_notice( 'dest', 'No valid track link was given, so the button still opens the artist profile.' );
	}

	foreach ( array( 'artist_name', 'headline', 'tagline', 'track_line' ) as $k ) {
		$out[ $k ] = isset( $in[ $k ] ) ? sanitize_text_field( $in[ $k ] ) : $d[ $k ];
	}
	if ( '' === $out['artist_name'] ) {
		$out['artist_name'] = $d['artist_name'];
	}
	$out['cover_url']   = isset( $in['cover_url'] ) ? esc_url_raw( trim( $in['cover_url'] ), array( 'https', 'http' ) ) : '';
	$out['privacy_url'] = isset( $in['privacy_url'] ) ? esc_url_raw( trim( $in['privacy_url'] ) ) : $d['privacy_url'];
	$out['stats']       = empty( $in['stats'] ) ? 0 : 1;
	return $out;
}

/* ------------------------------------------------------------------ first-party counts ------------------------------------------------------------------ */

function vspop_ad_landing_table() {
	global $wpdb;
	return $wpdb->prefix . 'vspop_ad_landing_stats';
}

/** One row per day, tag and event. Counts only: no visitor identifier is ever stored. */
function vspop_ad_landing_install() {
	global $wpdb;
	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	$table   = vspop_ad_landing_table();
	$charset = $wpdb->get_charset_collate();
	dbDelta( "CREATE TABLE {$table} (
		day date NOT NULL,
		tag varchar(64) NOT NULL DEFAULT '',
		event varchar(16) NOT NULL DEFAULT '',
		n int(10) unsigned NOT NULL DEFAULT 0,
		PRIMARY KEY  (day,tag,event)
	) {$charset};" );
	update_option( 'vspop_ad_landing_db', VSPOP_AD_LANDING_DB_VERSION, false );
	if ( false === get_option( 'vspop_ad_landing', false ) ) {
		add_option( 'vspop_ad_landing', vspop_ad_landing_defaults(), '', false );
	}
}
register_activation_hook( __FILE__, 'vspop_ad_landing_install' );

add_action(
	'admin_init',
	function () {
		if ( get_option( 'vspop_ad_landing_db' ) !== VSPOP_AD_LANDING_DB_VERSION ) {
			vspop_ad_landing_install();
		}
	}
);

function vspop_ad_landing_uninstall() {
	global $wpdb;
	$wpdb->query( 'DROP TABLE IF EXISTS ' . vspop_ad_landing_table() ); // phpcs:ignore WordPress.DB
	delete_option( 'vspop_ad_landing' );
	delete_option( 'vspop_ad_landing_db' );
}
register_uninstall_hook( __FILE__, 'vspop_ad_landing_uninstall' );

/**
 * Receives "view" and "click" beacons from the landing page and adds one to the matching counter.
 * Skips obvious bots and repeats; replies 204 whatever happens, so the page never waits on it.
 */
function vspop_ad_landing_hit() {
	nocache_headers();
	$o     = vspop_ad_landing_options();
	$event = isset( $_POST['e'] ) ? sanitize_key( wp_unslash( $_POST['e'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
	if ( $o['stats'] && in_array( $event, array( 'view', 'click' ), true ) && get_option( 'vspop_ad_landing_db' ) === VSPOP_AD_LANDING_DB_VERSION ) {
		$ua  = isset( $_SERVER['HTTP_USER_AGENT'] ) ? (string) $_SERVER['HTTP_USER_AGENT'] : ''; // phpcs:ignore
		$bot = ( '' === $ua ) || preg_match( '/bot|crawl|spider|slurp|facebookexternalhit|meta-externalagent|preview|monitor|headless|python|curl|wget|lighthouse|pingdom|gtmetrix/i', $ua );
		if ( ! $bot ) {
			$tag = isset( $_POST['t'] ) ? strtolower( (string) wp_unslash( $_POST['t'] ) ) : ''; // phpcs:ignore WordPress.Security
			$tag = substr( preg_replace( '/[^a-z0-9_.-]+/', '-', $tag ), 0, 48 );
			$tag = trim( $tag, '-' );
			if ( is_user_logged_in() && current_user_can( 'manage_options' ) ) {
				$tag = '_admin-test';
			}
			// Repeat guard: the same browser cannot add the same event twice within 30 seconds. The key is a
			// salted hash that lives for 30 seconds and is never written to the stats table.
			$ip  = isset( $_SERVER['REMOTE_ADDR'] ) ? (string) $_SERVER['REMOTE_ADDR'] : ''; // phpcs:ignore
			$key = 'vspop_adh_' . md5( wp_salt( 'nonce' ) . '|' . $ip . '|' . $ua . '|' . $event . '|' . $tag );
			if ( false === get_transient( $key ) ) {
				set_transient( $key, 1, 30 );
				global $wpdb;
				$table = vspop_ad_landing_table();
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
add_action( 'wp_ajax_nopriv_vspop_ad_hit', 'vspop_ad_landing_hit' );
add_action( 'wp_ajax_vspop_ad_hit', 'vspop_ad_landing_hit' );

/** Rows for the last $days days: array of [ day, tag, views, clicks ]. */
function vspop_ad_landing_rows( $days = 30 ) {
	global $wpdb;
	if ( get_option( 'vspop_ad_landing_db' ) !== VSPOP_AD_LANDING_DB_VERSION ) {
		return array();
	}
	$table = vspop_ad_landing_table();
	$since = gmdate( 'Y-m-d', time() - ( max( 1, (int) $days ) - 1 ) * DAY_IN_SECONDS );
	$raw   = $wpdb->get_results( $wpdb->prepare( "SELECT day, tag, event, n FROM {$table} WHERE day >= %s ORDER BY day DESC, tag ASC", $since ), ARRAY_A ); // phpcs:ignore WordPress.DB
	$rows  = array();
	foreach ( (array) $raw as $r ) {
		$k = $r['day'] . '|' . $r['tag'];
		if ( ! isset( $rows[ $k ] ) ) {
			$rows[ $k ] = array( 'day' => $r['day'], 'tag' => $r['tag'], 'views' => 0, 'clicks' => 0 );
		}
		$rows[ $k ][ 'view' === $r['event'] ? 'views' : 'clicks' ] += (int) $r['n'];
	}
	return array_values( $rows );
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
		$o = vspop_ad_landing_options();
		if ( strtolower( $path ) !== $o['slug'] ) {
			return;
		}
		status_header( 200 );
		header( 'Content-Type: text/html; charset=utf-8' );
		header( 'Cache-Control: public, max-age=300' );
		header( 'X-Robots-Tag: noindex, follow' );
		if ( 'HEAD' !== $method ) {
			echo vspop_ad_landing_html( $o ); // phpcs:ignore WordPress.Security.EscapeOutput -- escaped inside.
		}
		exit;
	},
	1
);

function vspop_ad_landing_html( $o ) {
	$dest      = vspop_ad_landing_destination( $o );
	$assets    = plugin_dir_url( __FILE__ ) . 'assets/';
	$cover     = $o['cover_url'] ? $o['cover_url'] : $assets . 'cover-another-day.webp';
	$og_image  = $o['cover_url'] ? $o['cover_url'] : $assets . 'cover-another-day.jpg';
	$big       = '' !== $o['headline'] ? $o['headline'] : $o['artist_name'];
	$canonical = home_url( '/' . $o['slug'] . '/' );
	$privacy   = $o['privacy_url'] ? ( 0 === strpos( $o['privacy_url'], '/' ) ? home_url( $o['privacy_url'] ) : $o['privacy_url'] ) : '';
	$title     = ( $big !== $o['artist_name'] ? $big . ' — ' . $o['artist_name'] : $o['artist_name'] ) . ' | Listen on Spotify';
	$desc      = trim( $big . '. ' . $o['track_line'] . '. Listen on Spotify.' );
	$hint      = 'track' === $dest['type'] ? 'Opens the song in Spotify.' : 'Opens the Spotify artist page of ' . VSPOP_AD_LANDING_SPOTIFY_NAME . '.';
	$config    = array(
		'pixel' => 'pixel_off' === $o['consent_mode'] ? '' : $o['pixel_id'],
		'mode'  => $o['consent_mode'],
		'stats' => $o['stats'] ? 1 : 0,
		'ajax'  => admin_url( 'admin-ajax.php', 'relative' ),
		'dest'  => $dest['type'],
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
<meta name="theme-color" content="#111111">
<link rel="canonical" href="<?php echo esc_url( $canonical ); ?>">
<meta property="og:type" content="music.musician">
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
body{margin:0;min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;background:#111;color:#F4EFE4;font:400 16px/1.5 Archivo,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
.bar{height:8px;background:linear-gradient(90deg,#FF7A1A 0 38%,#FF6F5E 38% 64%,#C9EE55 64% 100%)}
.label{margin:0;padding:14px 20px 0;text-align:center;font-size:11px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:#CFC8B8}
main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;max-width:440px;margin:0 auto;padding:18px 20px 22px;text-align:center}
.cover{position:relative;width:min(72vw,300px);aspect-ratio:1;margin:0 auto}
.cover::before{content:"";position:absolute;inset:8% -6% -10%;background:radial-gradient(closest-side,rgba(255,122,26,.55),rgba(255,122,26,0));filter:blur(18px)}
.cover img{position:relative;display:block;width:100%;height:100%;object-fit:cover;border:2px solid #F4EFE4}
.tag{margin:22px 0 0;font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#C9EE55}
h1{margin:8px 0 0;font-size:clamp(38px,11vw,52px);line-height:.95;font-weight:900;letter-spacing:-.04em;text-transform:uppercase;overflow-wrap:break-word}
h1.long{font-size:clamp(30px,8.6vw,42px);line-height:1}
.track{margin:10px 0 0;font-size:17px;color:#E3DDCF}
.btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:62px;margin:24px 0 0;padding:0 22px;background:#C9EE55;color:#111;border:2px solid #C9EE55;font-family:inherit;font-weight:800;font-size:18px;line-height:1;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;-webkit-tap-highlight-color:transparent;transition:background .15s,color .15s}
.btn:hover,.btn:focus-visible{background:#FF7A1A;border-color:#FF7A1A}
.btn:focus-visible,.link:focus-visible,.choice:focus-visible{outline:3px solid #F4EFE4;outline-offset:3px}
.btn svg{width:18px;height:18px;flex:none}
.hint{margin:12px 0 0;font-size:13px;color:#A39C8E}
footer{padding:14px 20px calc(16px + env(safe-area-inset-bottom));text-align:center;font-size:12px;color:#A39C8E}
footer p{margin:0}
.link{color:#CFC8B8;text-decoration:underline;text-underline-offset:3px;background:none;border:0;padding:0;font:inherit;cursor:pointer}
.consent{position:fixed;left:0;right:0;bottom:0;z-index:5;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:#F4EFE4;color:#111;border-top:4px solid #FF7A1A;box-shadow:0 -10px 30px rgba(0,0,0,.45)}
.consent[hidden]{display:none}
.consent__in{max-width:440px;margin:0 auto}
.consent p{margin:0;font-size:13.5px;line-height:1.4}
.consent a{color:#111}
.consent__row{display:flex;gap:10px;margin-top:10px}
.choice{flex:1;min-height:46px;border:2px solid #111;background:#111;color:#F4EFE4;font-family:inherit;font-weight:800;font-size:14px;line-height:1;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
.choice--no{background:transparent;color:#111}
@media (max-height:620px){.cover{width:min(48vw,200px)}.tag{margin-top:14px}.btn{margin-top:16px;min-height:56px}}
body.asking{padding-bottom:var(--consent-h,190px)}
body.asking footer{display:none}
@media (max-height:780px){body.asking main{justify-content:flex-start;padding-top:10px}body.asking .cover{width:min(38vw,150px)}body.asking .tag{margin-top:14px}body.asking .btn{margin-top:14px;min-height:56px}body.asking .hint{margin-top:8px}}
@media (max-height:640px){body.asking .label{padding-top:8px}body.asking .cover{width:min(30vw,112px)}body.asking .track{margin-top:6px;font-size:15px}body.asking .hint{display:none}}
@media (prefers-reduced-motion:reduce){.btn{transition:none}}
</style>
</head>
<body>
<div class="bar" aria-hidden="true"></div>
<p class="label">VS POP RECORDS LLP</p>
<main>
	<div class="cover"><img src="<?php echo esc_url( $cover ); ?>" width="640" height="640" alt="Artwork for <?php echo esc_attr( $big ); ?> by <?php echo esc_attr( $o['artist_name'] ); ?>" fetchpriority="high" decoding="async"></div>
	<?php if ( $o['tagline'] ) : ?><p class="tag"><?php echo esc_html( $o['tagline'] ); ?></p><?php endif; ?>
	<h1<?php echo strlen( $big ) > 16 ? ' class="long"' : ''; ?>><?php echo esc_html( $big ); ?></h1>
	<?php if ( $o['track_line'] ) : ?><p class="track"><?php echo esc_html( $o['track_line'] ); ?></p><?php endif; ?>
	<a class="btn" id="vspop-listen" href="<?php echo esc_url( $dest['url'] ); ?>" rel="noopener" data-dest="<?php echo esc_attr( $dest['type'] ); ?>">Listen on Spotify<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
	<p class="hint"><?php echo esc_html( $hint ); ?></p>
</main>
<footer>
	<p>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> VS POP RECORDS LLP<?php if ( $privacy ) : ?> · <a class="link" href="<?php echo esc_url( $privacy ); ?>">Privacy</a><?php endif; ?><?php if ( $config['pixel'] ) : ?> · <button type="button" class="link" id="vspop-choices">Privacy choices</button><?php endif; ?></p>
</footer>
<?php if ( $config['pixel'] ) : ?>
<div class="consent" id="vspop-consent" role="region" aria-label="Privacy choices" hidden>
	<div class="consent__in">
		<p>Allow the Meta Pixel? It uses cookies and tells Meta about this visit and your tap on the Spotify button, so we can measure our ads. The button works either way.<?php if ( $privacy ) : ?> <a href="<?php echo esc_url( $privacy ); ?>">Privacy</a><?php endif; ?></p>
		<div class="consent__row"><button type="button" class="choice choice--no" id="vspop-no">No thanks</button><button type="button" class="choice" id="vspop-yes">Allow</button></div>
	</div>
</div>
<?php endif; ?>
<script>
window.VSPOPAD = <?php echo wp_json_encode( $config ); ?>;
<?php echo vspop_ad_landing_js(); // phpcs:ignore WordPress.Security.EscapeOutput ?>
</script>
</body>
</html>
	<?php
	return ob_get_clean();
}

function vspop_ad_landing_js() {
	return <<<'JS'
(function () {
  'use strict';
  var C = window.VSPOPAD || {}, KEY = 'vspop_consent', btn = document.getElementById('vspop-listen');
  var automated = navigator.webdriver === true;
  function read() { try { return window.localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { window.localStorage.setItem(KEY, v); } catch (e) {} }

  /* utm_content (an ad's name) or else utm_source (e.g. youtube, curator) labels the first-party counts, so sources can be compared. */
  var tag = '';
  try { var q = new URLSearchParams(window.location.search); tag = (q.get('utm_content') || q.get('utm_source') || '').slice(0, 48); } catch (e) {}

  /* First-party counts: one "view" and at most one "click" per page load. No cookie, no identifier. */
  var sent = {};
  function count(ev) {
    if (!C.stats || automated || sent[ev]) return;
    sent[ev] = 1;
    try {
      var d = new FormData(); d.append('action', 'vspop_ad_hit'); d.append('e', ev); d.append('t', tag);
      if (navigator.sendBeacon) navigator.sendBeacon(C.ajax, d);
      else fetch(C.ajax, { method: 'POST', body: d, keepalive: true, credentials: 'same-origin' });
    } catch (e) {}
  }
  function view() { if (document.visibilityState !== 'hidden') count('view'); }
  if (document.visibilityState === 'hidden') document.addEventListener('visibilitychange', view, { once: true }); else view();

  /* Meta Pixel: loaded only when allowed. PageView on load; ViewContent only on the button. */
  var pixelOn = false;
  function loadPixel() {
    if (pixelOn || !C.pixel) return;
    pixelOn = true;
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', C.pixel);
    window.fbq('track', 'PageView');
  }

  /* Regions where consent is asked first when the mode is "ask where required": browser time zones in
     Europe (EU, EEA, UK, Switzerland) and the EU's Atlantic islands. Unknown time zone: ask. */
  function mustAsk() {
    if (C.mode !== 'ask_where_required') return true;
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    if (!tz) return true;
    return /^Europe\//.test(tz) || /^(Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe)|Africa\/Ceuta|Arctic\/Longyearbyen)$/.test(tz);
  }

  var box = document.getElementById('vspop-consent'), choices = document.getElementById('vspop-choices');
  function show(on) {
    if (!box) return;
    box.hidden = !on;
    document.body.classList.toggle('asking', on);
    if (on) document.body.style.setProperty('--consent-h', box.offsetHeight + 'px');
  }
  if (C.pixel) {
    var stored = read(), gpc = navigator.globalPrivacyControl === true;
    if (stored === 'granted' && !gpc) loadPixel();
    else if (stored === 'denied' || gpc) { /* no pixel */ }
    else if (mustAsk()) show(true);
    else loadPixel();
    var yes = document.getElementById('vspop-yes'), no = document.getElementById('vspop-no');
    if (yes) yes.addEventListener('click', function () { write('granted'); show(false); loadPixel(); });
    if (no) no.addEventListener('click', function () {
      write('denied'); show(false);
      if (pixelOn && window.fbq) { window.fbq('consent', 'revoke'); pixelOn = false; C.pixel = ''; }
    });
    if (choices) choices.addEventListener('click', function () { show(true); var f = document.getElementById('vspop-no'); if (f) f.focus(); });
  }

  /* The conversion: a real person pressing the button. It is a normal link, so Spotify opens exactly as
     the phone expects (app if installed); the events are sent as the browser leaves. */
  var clicked = false;
  if (btn) btn.addEventListener('click', function (ev) {
    if (clicked || ev.isTrusted === false) return;
    clicked = true;
    count('click');
    if (pixelOn && window.fbq) {
      window.fbq('track', 'ViewContent', { content_name: 'Listen on Spotify', content_category: 'Spotify', content_type: C.dest || 'artist' });
    }
  });
})();
JS;
}

/* ------------------------------------------------------------------ admin ------------------------------------------------------------------ */

add_action(
	'admin_init',
	function () {
		register_setting( 'vspop_ad_landing', 'vspop_ad_landing', array( 'type' => 'array', 'sanitize_callback' => 'vspop_ad_landing_sanitize' ) );
	}
);

add_action(
	'admin_menu',
	function () {
		add_options_page( 'Another Day Landing', 'Another Day Landing', 'manage_options', 'vspop-another-day', 'vspop_ad_landing_admin_page' );
	}
);

add_filter(
	'plugin_action_links_' . plugin_basename( __FILE__ ),
	function ( $links ) {
		array_unshift( $links, '<a href="' . esc_url( admin_url( 'options-general.php?page=vspop-another-day' ) ) . '">Settings</a>' );
		return $links;
	}
);

add_action(
	'admin_post_vspop_ad_landing_csv',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Not allowed.' );
		}
		check_admin_referer( 'vspop_ad_landing_csv' );
		nocache_headers();
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="another-day-landing-' . gmdate( 'Y-m-d' ) . '.csv"' );
		$out = fopen( 'php://output', 'w' );
		fputcsv( $out, array( 'day_utc', 'source', 'landing_page_views', 'spotify_button_clicks' ) );
		foreach ( vspop_ad_landing_rows( 400 ) as $r ) {
			fputcsv( $out, array( $r['day'], $r['tag'], $r['views'], $r['clicks'] ) );
		}
		fclose( $out ); // phpcs:ignore
		exit;
	}
);

function vspop_ad_landing_admin_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$o    = vspop_ad_landing_options();
	$dest = vspop_ad_landing_destination( $o );
	$url  = home_url( '/' . $o['slug'] . '/' );
	$page = get_page_by_path( $o['slug'] );
	$rows = vspop_ad_landing_rows( 30 );
	$days = array();
	$tags = array();
	foreach ( $rows as $r ) {
		if ( '_admin-test' === $r['tag'] ) {
			continue;
		}
		foreach ( array( array( &$days, $r['day'] ), array( &$tags, '' === $r['tag'] ? '(direct, no tag)' : $r['tag'] ) ) as $pair ) {
			if ( ! isset( $pair[0][ $pair[1] ] ) ) {
				$pair[0][ $pair[1] ] = array( 0, 0 );
			}
			$pair[0][ $pair[1] ][0] += $r['views'];
			$pair[0][ $pair[1] ][1] += $r['clicks'];
		}
	}
	$rate = function ( $v, $c ) {
		return $v ? round( 100 * $c / $v ) . '%' : '–';
	};
	?>
	<div class="wrap">
		<h1>Another Day Landing</h1>
		<p>VS POP RECORDS LLP · landing page for Meta ad traffic. Nothing here launches an advertisement or spends money.</p>
		<table class="widefat striped" style="max-width:860px">
			<tbody>
				<tr><th style="width:220px">Landing page</th><td><a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener"><?php echo esc_html( $url ); ?></a></td></tr>
				<tr><th>The button opens</th><td><code><?php echo esc_html( $dest['url'] ); ?></code> (<?php echo 'track' === $dest['type'] ? 'a specific track or release, chosen below' : 'the approved artist profile'; ?>)</td></tr>
				<tr><th>Meta Pixel</th><td><?php echo $o['pixel_id'] && 'pixel_off' !== $o['consent_mode'] ? 'ID ' . esc_html( $o['pixel_id'] ) . ' · PageView on load, ViewContent on the button, both only when allowed' : 'Not active: ' . ( $o['pixel_id'] ? 'switched off below.' : 'no Pixel ID saved yet.' ); ?></td></tr>
				<?php if ( $page ) : ?><tr><th>Note</th><td>A WordPress page with the slug <code><?php echo esc_html( $o['slug'] ); ?></code> also exists. This landing page is shown instead of it while the plugin is active.</td></tr><?php endif; ?>
			</tbody>
		</table>

		<form method="post" action="options.php" style="max-width:860px">
			<?php settings_fields( 'vspop_ad_landing' ); ?>
			<h2>Tracking</h2>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="vspop-pixel">Meta Pixel ID</label></th><td><input type="text" inputmode="numeric" id="vspop-pixel" name="vspop_ad_landing[pixel_id]" value="<?php echo esc_attr( $o['pixel_id'] ); ?>" class="regular-text" placeholder="e.g. 123456789012345"><p class="description">Events Manager → Data sources → your dataset → the ID under its name. Leave empty to run the page with no Meta tracking.</p></td></tr>
				<tr><th scope="row">Consent</th><td>
					<fieldset>
						<label><input type="radio" name="vspop_ad_landing[consent_mode]" value="ask_everyone" <?php checked( $o['consent_mode'], 'ask_everyone' ); ?>> Ask every visitor before loading the pixel (safest; fewest events)</label><br>
						<label><input type="radio" name="vspop_ad_landing[consent_mode]" value="ask_where_required" <?php checked( $o['consent_mode'], 'ask_where_required' ); ?>> Ask visitors in Europe and the UK first; elsewhere load the pixel and offer “Privacy choices”</label><br>
						<label><input type="radio" name="vspop_ad_landing[consent_mode]" value="pixel_off" <?php checked( $o['consent_mode'], 'pixel_off' ); ?>> Pixel off</label>
					</fieldset>
					<p class="description">A browser sending the Global Privacy Control signal is always treated as “No thanks”. Which option is right depends on the countries you advertise in; this is your decision, not legal advice.</p></td></tr>
				<tr><th scope="row">First-party counts</th><td><label><input type="checkbox" name="vspop_ad_landing[stats]" value="1" <?php checked( $o['stats'], 1 ); ?>> Count page views and button clicks on this site (totals per day and per ad; no cookies, no visitor identifiers)</label></td></tr>
			</table>
			<h2>Destination</h2>
			<table class="form-table" role="presentation">
				<tr><th scope="row">Button destination</th><td>
					<fieldset>
						<label><input type="radio" name="vspop_ad_landing[destination]" value="artist" <?php checked( $o['destination'], 'artist' ); ?>> Artist profile: <code><?php echo esc_html( VSPOP_AD_LANDING_ARTIST_URL ); ?></code></label><br>
						<label><input type="radio" name="vspop_ad_landing[destination]" value="track" <?php checked( $o['destination'], 'track' ); ?>> A specific track or release (link below)</label>
					</fieldset></td></tr>
				<tr><th scope="row"><label for="vspop-track">Track or release link</label></th><td><input type="url" id="vspop-track" name="vspop_ad_landing[track_url]" value="<?php echo esc_attr( $o['track_url'] ); ?>" class="large-text" placeholder="https://open.spotify.com/track/…"><p class="description">Only open.spotify.com track or album links are accepted. It is used only while “A specific track or release” is selected above.</p></td></tr>
			</table>
			<h2>Page</h2>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="vspop-slug">Address</label></th><td><code><?php echo esc_html( home_url( '/' ) ); ?></code><input type="text" id="vspop-slug" name="vspop_ad_landing[slug]" value="<?php echo esc_attr( $o['slug'] ); ?>" class="regular-text" style="width:160px"><code>/</code></td></tr>
				<tr><th scope="row"><label for="vspop-artist">Artist name</label></th><td><input type="text" id="vspop-artist" name="vspop_ad_landing[artist_name]" value="<?php echo esc_attr( $o['artist_name'] ); ?>" class="regular-text"></td></tr>
				<tr><th scope="row"><label for="vspop-headline">Big title</label></th><td><input type="text" id="vspop-headline" name="vspop_ad_landing[headline]" value="<?php echo esc_attr( $o['headline'] ); ?>" class="regular-text"><p class="description">Usually the song title. Leave empty to show the artist name instead.</p></td></tr>
				<tr><th scope="row"><label for="vspop-tagline">Line above the title</label></th><td><input type="text" id="vspop-tagline" name="vspop_ad_landing[tagline]" value="<?php echo esc_attr( $o['tagline'] ); ?>" class="regular-text"></td></tr>
				<tr><th scope="row"><label for="vspop-trackline">Line below the title</label></th><td><input type="text" id="vspop-trackline" name="vspop_ad_landing[track_line]" value="<?php echo esc_attr( $o['track_line'] ); ?>" class="regular-text"><p class="description">Name the song the advertisement plays, so the page matches the ad.</p></td></tr>
				<tr><th scope="row"><label for="vspop-cover">Artwork image</label></th><td><input type="url" id="vspop-cover" name="vspop_ad_landing[cover_url]" value="<?php echo esc_attr( $o['cover_url'] ); ?>" class="large-text" placeholder="Empty = the bundled “Another Day” artwork"><p class="description">A square image from the Media Library (copy its File URL), about 640 × 640 px and under 100 KB.</p></td></tr>
				<tr><th scope="row"><label for="vspop-privacy">Privacy link</label></th><td><input type="text" id="vspop-privacy" name="vspop_ad_landing[privacy_url]" value="<?php echo esc_attr( $o['privacy_url'] ); ?>" class="regular-text"></td></tr>
			</table>
			<?php submit_button(); ?>
		</form>

		<h2>Last 30 days (first-party counts, UTC days)</h2>
		<p>Page views and Spotify-button clicks counted by this site. A click is a press of the button, not a stream: only Spotify for Artists can confirm listening. Your own visits while logged in are left out.</p>
		<p><a class="button" href="<?php echo esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=vspop_ad_landing_csv' ), 'vspop_ad_landing_csv' ) ); ?>">Download CSV</a></p>
		<div style="display:flex;gap:24px;flex-wrap:wrap;max-width:860px">
			<table class="widefat striped" style="flex:1;min-width:300px"><thead><tr><th>Day</th><th>Landing-page views</th><th>Spotify-button clicks</th><th>Click rate</th></tr></thead><tbody>
			<?php if ( ! $days ) : ?><tr><td colspan="4">No visits counted yet.</td></tr><?php endif; ?>
			<?php foreach ( $days as $d => $v ) : ?><tr><td><?php echo esc_html( $d ); ?></td><td><?php echo (int) $v[0]; ?></td><td><?php echo (int) $v[1]; ?></td><td><?php echo esc_html( $rate( $v[0], $v[1] ) ); ?></td></tr><?php endforeach; ?>
			</tbody></table>
			<table class="widefat striped" style="flex:1;min-width:300px"><thead><tr><th>Source (utm_content or utm_source)</th><th>Views</th><th>Clicks</th><th>Click rate</th></tr></thead><tbody>
			<?php if ( ! $tags ) : ?><tr><td colspan="4">No visits counted yet.</td></tr><?php endif; ?>
			<?php foreach ( $tags as $t => $v ) : ?><tr><td><?php echo esc_html( $t ); ?></td><td><?php echo (int) $v[0]; ?></td><td><?php echo (int) $v[1]; ?></td><td><?php echo esc_html( $rate( $v[0], $v[1] ) ); ?></td></tr><?php endforeach; ?>
			</tbody></table>
		</div>
	</div>
	<?php
}
