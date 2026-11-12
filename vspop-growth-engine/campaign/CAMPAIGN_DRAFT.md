# Meta campaign draft — VS POP RECORDS LLP

**Status: draft. Not created in Ads Manager, not launched, no money spent.** Creating it, publishing it and changing its budget each need your approval.

It follows the method in Andrew Southworth's "How to Promote Your Music on Spotify with Facebook Ads (2026)" (published 16 January 2026) and his written 2025 tutorial. Where this draft departs from him, the difference is stated.

**One limit to know first:** no Meta ad account is connected to this workspace, so the field names below are the ones his 2026 walkthrough shows. Meta renames things often. When you build the draft, anything that reads differently in your account should be noted and checked before going further.

## Promoted song

**"Another Day" (VS Pop™ single, 24 September 2026)**, the latest VS Pop™ release. All three videos use this one song. The button still opens the artist profile, as instructed; a track destination can be switched on later in the plugin without changing the ads.

If you would rather lead with a different song, say which, and the landing page line, artwork and briefs change to match.

## Campaign level

| Field | Value | Note |
| --- | --- | --- |
| Buying type | Auction | |
| Objective | **Engagement** | Southworth: Sales is for selling, Leads is for collecting contacts; Engagement allows a website-conversion campaign. |
| Campaign name | `VSPOP_AnotherDay_Spotify_Conv_T1` | Short names; they appear in reports. |
| Special ad categories | None | |
| A/B test | Off | |
| Campaign budget | **On, $10.00 per day** | One budget shared by the ads. |
| Campaign spending limit | Leave empty | Meta's minimum is $100 and it does not stop a campaign reliably. The end date below does that job. |

## Ad set level (one ad set)

| Field | Value | Note |
| --- | --- | --- |
| Ad set name | `T1_18-50_Spotify+Pop_IG` | |
| Conversion location | **Website** | |
| Performance goal | **Maximize number of conversions** | |
| Dataset (pixel) | VS POP RECORDS – crsrikanth.com | The pixel from `META_PIXEL_SETUP.md`. |
| Conversion event | **View content** | Fired only by the Listen on Spotify button. Not "Page view", not "Landing page views", not "Link clicks". |
| Attribution setting | Click-through only (7-day click; switch view-through off if offered) | Not covered by Southworth. Chosen so a person who merely scrolled past the ad is never counted as a conversion. Confirm what your account offers. |
| Schedule | Start on approval; **end date 14 days later** | The end date is the automatic stop. Total at $10 per day: $140. |
| Locations | United States, Canada, United Kingdom, Ireland, Australia, New Zealand, Germany, Netherlands, Sweden | "People living in this location". See the audience section. |
| Age | 18–50 | His default. |
| Gender | All | |
| Advantage+ audience | **Off** ("further limit the reach") | And untick "use as a suggestion" wherever it appears. |
| Detailed targeting | **Spotify**, then *Define further*: Pop music, Dance-pop, Synth-pop, Electropop | A person must match Spotify and at least one genre. |
| Languages | Leave empty | |
| Placements | **Manual: Instagram Feed, Instagram Explore, Instagram Stories, Instagram Reels** | Everything else off, Audience Network above all. |

## Ads (three, one per concept)

| Ad name | Concept | Video |
| --- | --- | --- |
| `a1-hook` | Music hook | Brief 1 |
| `a2-cinematic` | Emotional and cinematic | Brief 2 |
| `a3-production` | How the song is made | Brief 3 |

The ad name is passed to the landing page, so each ad's views and button clicks can be read separately on the plugin's screen. Keep the names exactly as written (lower case, no spaces).

Common settings for all three:

| Field | Value |
| --- | --- |
| Identity | The CR Srikanth Instagram account and its Facebook Page |
| Format | Single video, 9:16, 1080 × 1920, 15–25 seconds, the song audible from the first frame |
| Advantage+ creative enhancements | **All off** (music, text variations, visual touch-ups, site links, the rest) |
| Website URL | `https://crsrikanth.com/spotify/` |
| URL parameters | `utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}` |
| Call to action | **Listen now** |
| Primary text | Per brief |
| Headline | `Another Day · CR Srikanth` |
| Tracking | Website events: the VS POP RECORDS pixel, ticked |

**Difference from Southworth on the number of videos:** he asks for at least four, and says a single video is the worst mistake. The brief for this project is three concepts, which satisfies his reasoning (several different ideas competing) while keeping $10 per day from being spread too thin. If one concept clearly wins, the next round makes two or three variations of it.

**Difference on the landing page:** he prefers a page with several services (Spotify, Apple Music, YouTube Music). This project asks for one deliberate Spotify action, so the page has one button. The cost is that an Apple Music listener has nothing to press.

## Audience plan at $10 per day

What is actually known about the audience today, from public records gathered for the website:

- Radio play in the United States (Mediabase report for WCPY-FM Chicago; college-radio adds across the US).
- Placements on the Euro Indie Music Chart.
- About 5,200 monthly Spotify listeners (public figure, 7 November 2026).

That supports English-speaking and north-European markets as a first guess, and no more than a guess. **Before launch, replace the country list with the top countries from Spotify for Artists → Audience → Location**, keeping to the wealthier markets Southworth calls tier 1.

- **Round 1 (this draft):** one ad set, the tier-1 list above. One ad set because $10 split across several would starve each of them.
- **Round 2, only if round 1 works:** a second campaign testing tier-2 countries (he names Brazil, Mexico and Italy), kept apart so cheap clicks there cannot swallow the tier-1 budget.
- **Left out:** worldwide targeting; ages 65 and over; Audience Network. He also advises against India, Indonesia and the Philippines on cost-quality grounds. Since VS Pop™ draws on Carnatic and Hindustani music, India may deserve its own deliberate test later; that is your call, and it should never share a budget with tier 1.
- **Interests:** the four genres are placeholders. Spotify for Artists → Audience → "Listeners also like" gives real neighbouring artists; the three or four best-known of them should replace the genres in round 2.

## Before launch (all must be true)

1. The landing page is installed and opens the right Spotify profile from a phone, from inside Instagram.
2. `PageView` and `ViewContent` both appear in Test Events, and `ViewContent` appears only on the button.
3. The privacy policy paragraph is approved and published, and the consent mode is chosen.
4. The baseline in `BASELINE_AND_MEASUREMENT.md` is filled in from Spotify for Artists.
5. The three videos are approved by you. Each uses only music and pictures that VS POP RECORDS LLP owns.
6. Your distributor does not claim your own music on Instagram. If "Facebook/Instagram monetisation" or Content ID is switched on for this release, ask the distributor to allow-list the Instagram account first; otherwise the ads can be muted or rejected.
7. A payment method and, for safety, an **account spending limit** of $150 are set in Billing.
8. You say "launch".

## Running it

- **Days 1–4:** change nothing. He is firm on this; early numbers swing wildly.
- **Day 4, 7 and 14:** fill in the scorecard.
- **Reading cost per conversion** (his rough guide, taken from a summary of the video, so treat as approximate): under about $0.30 great, $0.30–$0.40 good, $0.40–$0.50 middling, above $0.50 poor, with tier-1 countries at the dearer end.
- **Switch an ad off** when it has spent at least $10 and its cost per button click is more than double the best ad's.
- **Change one thing at a time**, and no more often than every four days. Order of changes: new videos first, then audience, then budget.
- **Raising the budget to $20** needs your approval and at least seven days at a cost per button click you are content with, plus visible movement in Spotify for Artists.
- **Stop and review** if any of these appear: button clicks with no movement at all in Spotify for Artists after seven days; landing-page views below half of Meta's link clicks; a click rate on the button under 15% or above 80%; most spend going to one country.

## What this campaign cannot tell you

Meta reports presses of the button. Spotify reports streams, listeners, followers and saves, with no link back to an ad. The two are compared side by side each week, and the connection between them is always an estimate. A cheap conversion that produces no listening is a bad result, however good it looks in Ads Manager.
