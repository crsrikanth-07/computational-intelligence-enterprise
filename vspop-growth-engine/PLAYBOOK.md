# Playbook — read this first

This file holds every decision made so far, so any future session can continue without the original conversation. Update it whenever a decision changes.

## Current campaign: free kick-start (started 12 November 2026)

| Decision | Value |
| --- | --- |
| Company | VS POP RECORDS LLP |
| Promoted track | "Beneath the Last Autumn Moon", instrumental, ambient / neo-classical, released 4 November 2026 |
| Track link | https://open.spotify.com/track/4r30HrrU0EiHIILTZXrQFo |
| Video | https://youtu.be/IwTvmWp88X4 (the artist will share the original file for vertical cuts) |
| Button destination | The second Spotify artist profile: https://open.spotify.com/artist/7omxXdWFGzNjA4FyjVn6oH (shown on Spotify as "Ravi Chandra Srikanth Cherukupalli") |
| Page wording (Option B) | "New instrumental" / BENEATH THE LAST AUTUMN MOON / "by CR Srikanth · Ambient / Neo-classical" |
| Page address | https://crsrikanth.com/spotify/ (**live since 12 November 2026**, pixel off; checked from a phone-sized browser: correct title, button opens the second profile, no third-party requests) |
| Meta pixel | Not used. The artist has no Facebook account and does not want one. |
| Paid ads (decided 12 November 2026) | **Google Ads, YouTube video campaign**, run by the artist from his own Google account, promoting the official video https://youtu.be/IwTvmWp88X4 with the landing page as its link. $10/day, 14 days with an end date. This replaces Meta as the approved paid channel. |
| Ad link | `https://crsrikanth.com/spotify/?utm_source=youtube_ads` (the tag lets the page count these visits and button presses separately) |
| Ad markets | Tier 2 Europe (list below) |
| How results are judged | The landing page's own counts (visits, button presses, press rate for `youtube_ads`) plus Spotify for Artists. Google Ads' own conversion tracking is not set up: no Google tag on the page. Google therefore optimises for views, not button presses. |
| Tier 2 Europe list | Bulgaria, Romania, Poland, Czechia, Hungary, Slovakia, Croatia, Slovenia, Greece, Portugal, Lithuania, Latvia, Estonia, Serbia |
| Goal | Audience growth (followers, listeners) and stream increase (streams, saves, streams per listener) |
| Long-term goal | Run promotion in-house, without agencies or promotion services |

Earlier decisions, now replaced: "Another Day" as the song; the CR Srikanth VS Pop™ profile as destination; Latin American and South African markets; India.

## Free routes in this kick-start

1. **The landing page, pixel off.** Used as the one link everywhere, tagged by source so the site's own counts show which source sends people to Spotify:

   | Where | Link |
   | --- | --- |
   | YouTube descriptions and pinned comments | `https://crsrikanth.com/spotify/?utm_source=youtube` |
   | Instagram bio | `https://crsrikanth.com/spotify/?utm_source=instagram` |
   | Facebook | `https://crsrikanth.com/spotify/?utm_source=facebook` |
   | WhatsApp and messages to friends | `https://crsrikanth.com/spotify/?utm_source=whatsapp` |
   | Email signature, newsletter | `https://crsrikanth.com/spotify/?utm_source=email` |

   Curators and journalists get the **Spotify track link directly**, not the landing page: they expect it.
2. **Curator and tastemaker outreach**: research in `outreach/CURATOR_RESEARCH.md`, ten ready drafts and a tracker in `outreach/OUTREACH_PACK.md`. The artist sends each one. Nothing is sent automatically.
3. **Short vertical videos** cut from the official video, posted free as YouTube Shorts, Instagram Reels and TikTok.
4. **Spotify profile**: set the track as Artist Pick; a personal playlist of calm music including the track.

Spotify's editorial pitching tool accepts only unreleased music, so it applies to the next release, not this track.

## Second music page: "Another Day" (from 13 November 2026)

`https://crsrikanth.com/another-day/` (**live since 13 November 2026**, checked from a phone-sized browser), plugin `vspop-another-day-landing` (built by `landing/variants/make-variant.py` from the tested Spotify page, with its own names, settings, counts table and admin screen **Settings → Another Day Landing**, so it never touches `/spotify/`). Shows the "Another Day" artwork, "VS Pop™ · Very Smooth Pop" and "New single by CR Srikanth"; the button opens the CR Srikanth (VS Pop) Spotify profile `https://open.spotify.com/artist/16N9BJJPufgA3rnpQ06iSa`. Pixel off. Tests: 47 of 47 on the new page and 47 of 47 again on `/spotify/`.

Ad links: `https://crsrikanth.com/another-day/?utm_source=instagram_boost`, `https://crsrikanth.com/another-day/?utm_source=youtube_ads`.

To make a page for a further song: copy `landing/variants/another-day.json`, change the names, slug, artist link and texts, and run `python3 landing/variants/make-variant.py landing/variants/<file>.json`.

## Song pages for search (from 13 November 2026)

Every release has its own page at `crsrikanth.com/music/<slug>/` (**live since 13 November 2026**; checked: one title and description per page, song data present, all in the sitemap, the player loads on "Play here") (ten pages: Beneath the Last Autumn Moon and the nine VS Pop™ singles), with its own Google title and description, Spotify player, verified recognition with sources, matching video and schema.org `MusicRecording` data. The site's person data now lists both Spotify profiles and SoundCloud, with "Ravi Chandra Srikanth Cherukupalli" as the alternate name. Song pages (`/music/another-day/`) are for search; landing pages (`/another-day/`, `/spotify/`) are for ads.

## Books (from 13 November 2026)

See `books/README.md`. Lead book *Tales from Bellavere and Lindenfeld*; landing page `crsrikanth.com/read/`; one SEO page per book on crsrikanth.com. **No Amazon Ads account, ever, unless the author says otherwise.**

## Host script

GoDaddy adds its own script to the site's normal theme pages (requests to `csp.secureserver.net/eventbus/...`), not to the three landing pages. It is the host's, not the site's; mention it in the privacy policy or switch it off in the GoDaddy dashboard if wanted.

## Host cache

GoDaddy serves pages from its cache for up to 31 days. After changing anything in **Settings → VS Pop Spotify Landing**, click **Flush Cache** in the admin bar, or visitors keep seeing the old page. Counting is not affected: it runs from the visitor's browser.

## Rules that never change

- Only new recurring spend allowed: advertising at $10–$20 per day (now Google Ads for YouTube; Meta was the original choice), started and paid by the artist.
- No paid tools, services, hosting or APIs. No artificial streaming, bought placements or bots.
- Launching ads, raising spend, publishing anything and contacting anyone each need the artist's explicit approval. Outreach is drafted here and sent by the artist.
- Button presses are not streams. Spotify for Artists numbers are reported separately and any link to a cause is an estimate.
- Do not ask the artist a string of questions. Choose a sensible default, say what was chosen, and let them correct it.

## Weekly routine (when the artist asks for a review)

Inputs: the plugin's CSV (Settings → VS Pop Spotify Landing → Download CSV) and Spotify for Artists numbers for the second profile and the track (listeners, streams, followers, saves, playlist adds, source of streams, top countries). Output: the scorecard in `campaign/BASELINE_AND_MEASUREMENT.md`, plus up to three recommendations.
