# Baseline and weekly scorecard

Fill in the baseline **before** the first advertisement runs. Without it there is nothing to compare against.

## Where each number comes from

| Number | Source | What it really measures |
| --- | --- | --- |
| Ad spend, impressions, link clicks | Meta Ads Manager | What Meta delivered and charged |
| Landing-page views | Plugin screen or its CSV | People who reached the page (site count) |
| Spotify-button clicks | Plugin screen or its CSV | People who pressed the button (site count). **Not streams.** |
| ViewContent results | Meta Ads Manager | Button presses Meta could see: consenting visitors only, so lower than the site count |
| Streams, listeners, followers, saves, playlist adds, source of streams | Spotify for Artists | Real listening. **Cannot be tied to an ad.** |

**Cost per Spotify-button click = ad spend ÷ Spotify-button clicks (site count).** Report Meta's own "cost per result" beside it; the two will differ, and the difference is explained in `docs/META_PIXEL_SETUP.md`.

## Baseline (the 28 days before launch)

Date range: ______ to ______

| Spotify for Artists | Artist, 28 days | "Another Day", 28 days |
| --- | --- | --- |
| Listeners | | |
| Streams | | |
| Streams per listener | | |
| Followers (total at end of period) | | n/a |
| New followers in period | | n/a |
| Saves | | |
| Playlist adds | | |
| Share of streams from "Your profile and catalog" | | |
| Share from Spotify's own programming (Radio, Autoplay, Release Radar, Discover Weekly) | | |

Top five countries by listeners: ______, ______, ______, ______, ______

Top five "Listeners also like" artists: ______, ______, ______, ______, ______

Anything else running in the period (a release, radio play, a playlist placement, press): ______

Plugin counts before launch should be zero apart from your own tests.

## Weekly scorecard

| | Week 1 | Week 2 | Week 3 | Week 4 |
| --- | --- | --- | --- | --- |
| **Meta** | | | | |
| Ad spend | | | | |
| Impressions | | | | |
| Link clicks | | | | |
| ViewContent results (Meta) | | | | |
| Cost per result (Meta) | | | | |
| **Website** | | | | |
| Landing-page views | | | | |
| Spotify-button clicks | | | | |
| Button click rate (clicks ÷ views) | | | | |
| **Cost per Spotify-button click** | | | | |
| Landing-page views ÷ link clicks | | | | |
| **Spotify for Artists** | | | | |
| Listeners (7 days) | | | | |
| Streams (7 days) | | | | |
| New followers | | | | |
| Saves | | | | |
| Streams per listener | | | | |
| Share from Spotify's own programming | | | | |
| **Per ad: views / clicks / click rate** | | | | |
| a1-hook | | | | |
| a2-cinematic | | | | |
| a3-production | | | | |

## How to read it

- **A good week** shows button clicks at an acceptable cost *and* Spotify numbers rising above the baseline in the countries advertised to, with saves and streams per listener holding steady or rising. Saves and repeat listening are what lead Spotify to recommend the music by itself.
- **Estimated effect, not proof:** "streams above baseline" is the difference between this week and the baseline week. Other things move streams too: releases, radio, playlists. Each weekly note must name anything else that happened.
- **Warning signs of poor traffic:**
  - Landing-page views under half of Meta's link clicks: accidental taps or bots that never loaded the page.
  - Button click rate under 15%: the ad attracts the wrong people, or the page does not match the ad.
  - Button click rate above 80% on real volume: check for automated traffic.
  - Button clicks rising while listeners, saves and streams per listener stay flat for seven days: clicks that do not listen.
  - Streams per listener or save rate falling while listeners rise: wider but shallower audience.
- **Never report** button clicks as streams, or streams as "caused by" an ad. Say "followed", "coincided with" or "estimated".
