# VS POP RECORDS LLP — Music Growth Engine

Promotion tooling for **CR Srikanth** and **VS Pop™ (Very Smooth Pop)**, owned by VS POP RECORDS LLP.

**Start with `PLAYBOOK.md`**: it holds the current decisions (track, profile, markets, wording) and the rules.

The first version is deliberately small: one landing page on the existing website, one tracked button, one small Meta campaign, and plain reports. The only new recurring spend it needs is the Meta advertising budget of $10–$20 per day. Nothing in this folder launches an advertisement, publishes a page or spends money by itself.

## What is here

| Path | What it is | State |
| --- | --- | --- |
| `landing/vspop-spotify-landing/` | WordPress plugin that serves the landing page at `crsrikanth.com/spotify/` | Built and tested locally; **not installed on the live site** |
| `landing/dist/vspop-spotify-landing.zip` | The same plugin, ready to upload | Ready |
| `landing/tests/landing.test.js` | 47 end-to-end checks (page, consent, events, counting, destinations) | All pass against a local WordPress |
| `docs/DEPLOY.md` | How the live site is built, and the exact steps to install, check and remove the page | Ready |
| `docs/META_PIXEL_SETUP.md` | Creating the pixel, entering its ID, testing events, consent choices | Ready; needs your Meta account |
| `campaign/CAMPAIGN_DRAFT.md` | The Meta campaign, field by field, following Andrew Southworth's 2026 method | Draft for approval |
| `campaign/CREATIVE_BRIEFS.md` | Three video concepts for one song | Draft for approval |
| `campaign/BASELINE_AND_MEASUREMENT.md` | The before-launch baseline and the weekly scorecard | Template; needs Spotify for Artists numbers |

## The funnel

1. A short video using the artist's own music runs on Instagram.
2. A tap on the ad opens `https://crsrikanth.com/spotify/`.
3. If the visitor allows it, the Meta Pixel records a **PageView**.
4. The visitor presses **Listen on Spotify**. Only then does the pixel record **ViewContent**. This is the conversion the campaign optimises for.
5. Spotify opens on the artist profile `https://open.spotify.com/artist/7omxXdWFGzNjA4FyjVn6oH`.
6. Results are compared with Spotify for Artists each week.

Three numbers are kept apart on purpose, because each one is smaller and more meaningful than the one before:

- **Landing-page views**: people who arrived.
- **Spotify-button clicks**: people who pressed the button. Not streams.
- **Streams, listeners, followers, saves**: only Spotify for Artists knows these, and it cannot say which ad caused them. Every report labels this link as an estimate.

## Rules this project follows

- VS POP RECORDS LLP branding throughout. (CuTTI, on the main website, is a separate project and keeps its own credits.)
- No new domain, hosting, smart-link service, attribution tool, automation service, analytics subscription, cloud server or billable API. The page runs on the existing WordPress hosting; the reports run locally.
- No bots, stream farms, paid playlists or any other artificial streaming.
- Launching or changing a campaign, raising a budget, publishing a page and sending any message to another person each need explicit approval first.

## Phases

1. **Landing page, pixel events, tracked button, mobile and consent checks.** Built. Waiting for approval to install.
2. **Campaign draft, three creative briefs, small-budget audience plan, tracking verification.** Drafted. Tracking verification on the live site happens after install.
3. **Local dashboard or spreadsheet, CSV imports from Meta Ads Manager and Spotify for Artists, Claude-assisted weekly analysis.** Not started. The landing page already exports the CSV this phase will read.
4. **Tastemaker research, audience-quality checks, optimisation recommendations.** Not started.

## Acceptance criteria

| Criterion | Status |
| --- | --- |
| VS POP RECORDS LLP branding | Met. Checked by test. |
| Works under the existing crsrikanth.com domain | Built for it: the live site is WordPress and `/spotify/` is unused. Proven on a local WordPress with the live theme; live check follows install. |
| Listen on Spotify opens the correct artist profile | Met. Checked by test. |
| Tracking events fire only with consent | Met. Checked by test with a stand-in for Meta's script. Confirmation in Meta Events Manager needs your pixel. |
| Meta recognises the conversion event | **Open.** Needs the pixel ID and a Test Events check in your account. |
| Mobile-friendly | Met. Checked at 320, 360, 390 and 412 px wide, with and without the consent banner. |
| No new paid platform | Met. |
| No advertising launches without approval | Met. Nothing here can launch one. |
| No artificial streaming | Met. |
| Analytics distinguish conversions from confirmed streams | Met in the page, the admin screen, the CSV and the report template. |
| Runs within $10–$20 per day | The draft is built for $10 per day. |

## Running the tests

The tests need a WordPress with the plugin active. Meta and Spotify are never contacted; both are answered locally.

```
node landing/tests/landing.test.js <baseUrl> <wpRoot> <setopt.php> [screenshotDir]
```

`landing/tests/setopt.php` is the small helper the tests use to change the plugin's settings through its own sanitiser. `docs/DEPLOY.md` describes the local WordPress the recorded run used.
