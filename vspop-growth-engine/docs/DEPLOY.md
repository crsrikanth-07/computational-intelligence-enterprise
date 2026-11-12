# Deploying the Spotify landing page on crsrikanth.com

Nothing in this document has been done on the live site. Each step waits for your approval.

## What the live site is (checked 12 November 2026)

- **WordPress**, on GoDaddy Managed WordPress hosting, behind Cloudflare.
- The active theme is the custom `crsrikanth` theme. Yoast SEO and CoBlocks are installed.
- `https://crsrikanth.com/spotify/` returns "not found" today, so the address is free.
- There is no Meta Pixel on the site today.
- Pages are cached hard: the home page is served with a 31-day cache lifetime. This matters once, in step 5.

## Why a plugin and not a theme page

The landing page is a single small plugin, `vspop-spotify-landing`. It answers the one address `/spotify/` and nothing else.

- It does not touch the theme, the menu, or any existing page. In testing, eleven main pages were byte-for-byte identical with the plugin on and off.
- It keeps working when the theme is replaced with a newer zip.
- Deactivating it removes the page completely.
- It needs no new hosting, no page builder and no paid service.

## Install

1. In WordPress admin go to **Plugins → Add New Plugin → Upload Plugin**.
2. Choose `landing/dist/vspop-spotify-landing.zip`, click **Install Now**, then **Activate Plugin**.
3. Open `https://crsrikanth.com/spotify/` on a phone. You should see the artwork, "CR Srikanth" and a **Listen on Spotify** button. Pressing it should open the CR Srikanth artist profile in Spotify.
4. Go to **Settings → VS Pop Spotify Landing**. The top table states the page address, where the button goes, and whether the pixel is active. With no Pixel ID saved, the page sends nothing to Meta.
5. If the page still shows "not found" after activation, clear the host's cache: in the WordPress admin bar choose **Flush Cache** (GoDaddy), then reload. Do the same after changing any setting on the plugin's screen, because a cached copy of the page can be served for a few minutes.

The page is safe to leave installed with no pixel: it is not linked from the menu and is marked "noindex", so search engines leave it out.

## Settings

| Setting | Default | Notes |
| --- | --- | --- |
| Meta Pixel ID | empty | See `META_PIXEL_SETUP.md`. Empty means no Meta tracking. |
| Consent | Ask every visitor | See the consent section of `META_PIXEL_SETUP.md` before changing. |
| First-party counts | on | Totals of page views and button clicks per day and per ad. No cookies, no visitor identifiers. |
| Button destination | Artist profile | The approved artist link is fixed in the plugin. |
| Track or release link | empty | For a future campaign. Used only when "A specific track or release" is selected. Only `open.spotify.com` track or album links are accepted; anything else is refused and the artist profile stays. |
| Line below the name | Latest single: “Another Day” | Should name the song the advertisement plays. |
| Artwork image | bundled "Another Day" artwork | A square image from the Media Library, about 640 px. |

## What the page loads

Two requests, 63 KB in total: the page (11 KB, styles and script included) and the artwork (52 KB). No web fonts, no frameworks, no third-party request unless the visitor allows the pixel.

## Remove

**Plugins → VS Pop Spotify Landing → Deactivate.** The address returns "not found" again. **Delete** also removes the settings and the counts table.

## How it was tested

A local WordPress (current release, SQLite database) with the live `crsrikanth` theme and this plugin. `landing/tests/landing.test.js` drives a phone-sized browser through 44 checks: the page and button, the three consent modes, the Global Privacy Control signal, PageView and ViewContent timing, scripted clicks, double presses, destination rules, bot and repeat filtering, four phone sizes, and the main site being unaffected. Accessibility was checked with axe (WCAG A and AA): no violations, with and without the banner. The settings screen and CSV download were exercised through the real admin forms.

Two things could only be imitated locally and need the live site: Meta's own script receiving the events, and Spotify opening from inside the Instagram app on a real phone.
