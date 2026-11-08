# crsrikanth.com

This is the personal website of CR Srikanth: music, books and stories, CuTTI innovations and recognition. It is built as a static site and installed on WordPress as a theme.

## How it fits together

- `content/*.json` holds every release, book, publication, video, milestone, chart, station, press item and the CuTTI text. This is the only place you need to edit to add new work.
- `src/` holds the page shell, components and pages (`lib.js`, `pages.js`, `art.js`) and the builder (`build.js`).
- `site/` is the generated website. `site/assets` (CSS, JS, artwork, covers, video) is maintained by hand and is not generated.
- `tools/make-wp-theme.js` turns `site/` into the WordPress theme in `wordpress-theme/crsrikanth/`.
- `VERIFICATION.md` lists what is verified, what is artist-reported, and what is still needed.

## Adding new work

1. Add an entry to the right file:
   - **A new release:** `content/music.json` → `releases`, and put the artwork, 800×800, in `site/assets/art/`. To feature it, also add it to `latest`.
   - **A new book:** `content/literature.json` → `books`, and put the cover in `site/assets/covers/`.
   - **A new published story:** `content/literature.json` → `publications`.
   - **A concert, chart or award:** `content/recognition.json` → `milestones`, plus `charts` or `stations` if it belongs in the archive. Set `"verified": true` only when `url` points to the original source.
   - **Press:** `content/recognition.json` → `pressGroups`.
   - **A video:** `content/videos.json`, and add the thumbnail `https://i.ytimg.com/vi/<id>/hqdefault.jpg` to `site/assets/img/yt/<id>.jpg`.
2. Build and package:

   ```
   node src/build.js
   node tools/make-wp-theme.js site wordpress-theme/crsrikanth crsrikanth
   cd wordpress-theme && rm -f crsrikanth.zip && zip -qr crsrikanth.zip crsrikanth
   ```
3. In WordPress, go to Appearance → Themes → Add New → Upload Theme, choose `crsrikanth.zip`, then click "Replace installed with uploaded".

## Design

- **Colours:** the Modernist theme by default: cream paper, black, one signal red, Archivo headlines, flat colour blocks and square corners. Ocean, Twilight, Ivory & Ink, Atelier, Aurora, Nocturne, Gallery, Manuscript and the original Midnight are also in `site/assets/css/themes.css`; switch by changing `data-theme` in `src/lib.js`.
- **Type:** Archivo throughout in the Modernist theme (other themes bring their own faces: Cormorant Garamond, Fraunces, Spectral, Bodoni Moda, Space Grotesk, Cinzel).
- **Hero artwork ("Five Lines"):** five staff lines carry notes, turn into lines of text, then into a sound wave. It is drawn in `site/assets/js/site.js` and stops under reduced motion.
- **Videos and Spotify players** load only when someone presses play. Nothing autoplays.
