<?php
// Usage: php setopt.php <wp-root> key=value ...   (runs values through the plugin's own sanitizer)
define('WP_USE_THEMES', false);
require $argv[1] . '/wp-load.php';
$o = vspop_landing_options();
foreach (array_slice($argv, 2) as $kv) { if (strpos($kv, '=') === false) continue; list($k, $v) = explode('=', $kv, 2); $o[$k] = $v; }
update_option('vspop_landing', vspop_landing_sanitize($o));
if (in_array('--reset-stats', $argv, true)) { global $wpdb; $wpdb->query('DELETE FROM ' . vspop_landing_table()); $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '%transient%vspop_h_%'"); wp_cache_flush(); }
echo json_encode(array('opt' => get_option('vspop_landing'), 'dest' => vspop_landing_destination(), 'rows' => vspop_landing_rows(30)), JSON_UNESCAPED_SLASHES), "\n";
