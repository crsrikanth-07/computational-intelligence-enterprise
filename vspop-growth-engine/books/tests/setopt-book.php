<?php
// Usage: php setopt-book.php <wp-root> [--activate] [--reset-stats] key=value ... links.KEY=value ...
// Runs values through the plugin's own sanitiser and prints the stored options and the counts.
define('WP_USE_THEMES', false);
require $argv[1] . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';
if (in_array('--activate', $argv, true)) { activate_plugin('crs-book-landing/crs-book-landing.php'); }
$o = crs_book_options();
foreach (array_slice($argv, 2) as $kv) {
	if (strpos($kv, '=') === false) continue;
	list($k, $v) = explode('=', $kv, 2);
	if (strpos($k, 'links.') === 0) { $o['links'][substr($k, 6)] = $v; } else { $o[$k] = $v; }
}
update_option('crs_book_landing', crs_book_sanitize($o));
if (in_array('--reset-stats', $argv, true)) { global $wpdb; $wpdb->query('DELETE FROM ' . crs_book_table()); $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '%transient%crs_bh_%'"); wp_cache_flush(); }
echo json_encode(array('opt' => get_option('crs_book_landing'), 'rows' => crs_book_rows(30)), JSON_UNESCAPED_SLASHES), "\n";
