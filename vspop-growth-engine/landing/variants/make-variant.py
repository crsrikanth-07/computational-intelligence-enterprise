#!/usr/bin/env python3
"""Builds a second, independent copy of the tested landing plugin for another song.

Every function, option, database table, AJAX action, admin page and script global gets its own prefix, so the
copy can run next to the original without touching it. Usage: python3 make-variant.py variants/<name>.json
"""
import json, os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.join(HERE, '..', 'vspop-spotify-landing')
cfg = json.load(open(sys.argv[1]))
out_dir = os.path.join(HERE, '..', cfg['dir'])
src = open(os.path.join(BASE, 'vspop-spotify-landing.php'), encoding='utf-8').read()

def must(old, new, text, count=None):
    n = text.count(old)
    if n == 0 or (count is not None and n != count):
        sys.exit(f'expected {count or "some"} of {old!r}, found {n}')
    return text.replace(old, new)

s = src
# Values first (they contain strings the renames below would otherwise touch).
s = must("define( 'VSPOP_LANDING_ARTIST_URL', 'https://open.spotify.com/artist/7omxXdWFGzNjA4FyjVn6oH' );", f"define( 'VSPOP_LANDING_ARTIST_URL', '{cfg['artist_url']}' );", s, 1)
s = must("define( 'VSPOP_LANDING_SPOTIFY_NAME', 'Ravi Chandra Srikanth Cherukupalli' );", f"define( 'VSPOP_LANDING_SPOTIFY_NAME', '{cfg['spotify_name']}' );", s, 1)
s = must("'slug'         => 'spotify',", f"'slug'         => '{cfg['slug']}',", s, 1)
s = must("'headline'     => 'Beneath the Last Autumn Moon',", f"'headline'     => '{cfg['headline']}',", s, 1)
s = must("'tagline'      => 'New instrumental',", f"'tagline'      => '{cfg['tagline']}',", s, 1)
s = must("'track_line'   => 'by CR Srikanth · Ambient / Neo-classical',", f"'track_line'   => '{cfg['track_line']}',", s, 1)
s = must("cover-beneath-the-last-autumn-moon.", cfg['cover_name'] + ".", s, 2)
s = must("“Beneath the Last Autumn Moon” artwork", f"“{cfg['cover_title']}” artwork", s, 1)
s = must(" * Plugin Name:       VS Pop Spotify Landing\n", f" * Plugin Name:       {cfg['plugin_name']}\n", s, 1)
s = must("landing page for Meta ad traffic at /spotify/,", f"landing page for ad traffic at /{cfg['slug']}/,", s, 1)
s = must(" * Text Domain:       vspop-spotify-landing", f" * Text Domain:       {cfg['text_domain']}", s, 1)
s = must(" * @package VSPopSpotifyLanding", f" * @package {cfg['package']}", s, 1)
s = must("'VS Pop Spotify Landing', 'VS Pop Spotify Landing'", f"'{cfg['menu_title']}', '{cfg['menu_title']}'", s, 1)
s = must("<h1>VS Pop Spotify Landing</h1>", f"<h1>{cfg['menu_title']}</h1>", s, 1)
s = must("vspop-landing-", cfg['csv_name'], s, 1)
s = must("'vspop-landing'", f"'{cfg['admin_slug']}'", s)
s = must("page=vspop-landing", f"page={cfg['admin_slug']}", s)
# Code names.
s = must("vspop_hit", cfg['ajax_action'], s)
s = must("'vspop_h_'", f"'{cfg['transient_prefix']}'", s, 1)
s = s.replace("VSPOP_LANDING", cfg['const_prefix'])
s = s.replace("vspop_landing", cfg['prefix'])
s = re.sub(r"window\.VSPOP\b", "window." + cfg['js_global'], s)

for bad in ("7omxXd", "Beneath the Last Autumn Moon", "Ravi Chandra", "vspop_landing", "VSPOP_LANDING", "'vspop_hit'"):
    if bad in s:
        sys.exit(f'leftover {bad!r} in the variant')

if os.path.exists(out_dir):
    shutil.rmtree(out_dir)
os.makedirs(os.path.join(out_dir, 'assets'))
open(os.path.join(out_dir, cfg['dir'] + '.php'), 'w', encoding='utf-8').write(s)

from PIL import Image
im = Image.open(cfg['cover_source']).convert('RGB').resize((640, 640), Image.LANCZOS)
im.save(os.path.join(out_dir, 'assets', cfg['cover_name'] + '.webp'), 'WEBP', quality=72, method=6)
im.save(os.path.join(out_dir, 'assets', cfg['cover_name'] + '.jpg'), 'JPEG', quality=80, optimize=True, progressive=True)

# Matching settings helper for the tests.
helper = open(os.path.join(HERE, '..', 'tests', 'setopt.php'), encoding='utf-8').read()
open(os.path.join(HERE, '..', 'tests', 'setopt-' + cfg['slug'] + '.php'), 'w', encoding='utf-8').write(helper.replace('vspop_landing', cfg['prefix']))
print('built', out_dir)
