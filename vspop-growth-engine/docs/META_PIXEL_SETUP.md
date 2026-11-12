# Meta Pixel: installation, events and testing

The pixel is installed through the plugin's settings screen. No code is pasted into the theme, and the pixel runs only on `/spotify/`, never on the rest of the site.

## The two events

| Event | When it is sent | Used for |
| --- | --- | --- |
| `PageView` | When the landing page loads, if the visitor has allowed the pixel | Reporting only. Never the optimisation event. |
| `ViewContent` | Once, when a person presses **Listen on Spotify**, if the visitor has allowed the pixel | The conversion event the campaign optimises for |

`ViewContent` is never sent on page load, on a scripted click, or twice for one visit. It carries three labels: `content_name` "Listen on Spotify", `content_category` "Spotify", and `content_type` "artist" or "track".

A `ViewContent` means "pressed the button". It does not mean a stream. Spotify offers no way to put a pixel on Spotify itself.

## Set-up steps (free; needs your Meta Business account)

1. **Create or find the pixel.** In Meta Events Manager choose **Connect data → Web**, name the dataset "VS POP RECORDS – crsrikanth.com", and skip the partner and code steps. If a pixel already exists for this business, use that one.
2. **Copy the ID.** It is the 15 or 16 digit number under the dataset's name.
3. **Enter it.** In WordPress go to **Settings → VS Pop Spotify Landing**, paste the number into **Meta Pixel ID**, choose the consent option (next section), and save. Then use **Flush Cache** in the admin bar.
4. **Switch off automatic extras** in Events Manager → the dataset → **Settings**: turn off **Track events automatically without code** and **Automatic advanced matching**. The first invents button-click events that would blur the count; the second is for forms, and this page has none.
5. **Test.** Events Manager → **Test events** → enter `https://crsrikanth.com/spotify/` → **Open website**. Use Chrome with no ad blocker.
   - Choose **Allow** on the banner. `PageView` should appear in Test Events within a few seconds.
   - Press **Listen on Spotify**. `ViewContent` should appear, once.
   - Reload, choose **No thanks**. Nothing should appear.
6. **Check the first-party count.** The plugin's settings screen should show your test visit. Visits made while logged in to WordPress are kept out of the totals.
7. **Optional: verify the domain.** Business settings → Brand safety → Domains → add `crsrikanth.com` and choose the **DNS TXT record** method (added in Cloudflare; free; no change to the website). Do this if Ads Manager asks for a verified domain.

The Meta Pixel Helper extension for Chrome (free) shows the same two events if you prefer it to Test Events.

## Consent: three options, and what each costs

| Option | What happens | Trade-off |
| --- | --- | --- |
| **Ask every visitor** (default) | The pixel loads only after "Allow". | Safest everywhere. Many visitors ignore banners, so Meta sees fewer conversions and learns more slowly on a small budget. |
| **Ask in Europe and the UK; load elsewhere** | Visitors whose browser time zone is in Europe see the banner first. Others get the pixel straight away, with a "Privacy choices" link to turn it off. | More events from the United States, Canada and Australia. The time-zone test is a practical approximation, not a legal guarantee. |
| **Pixel off** | Nothing is sent to Meta. | The campaign cannot optimise for the button. |

In every mode a browser that sends the Global Privacy Control signal is treated as "No thanks", a "No thanks" is remembered, and the button works whatever the visitor chooses.

Which option to use depends on the countries you advertise in and is your decision; this is not legal advice. If the first campaign targets Europe or the UK, keep the default.

## Privacy policy text

The landing page links to the existing privacy policy. Before the pixel goes live, the policy should say that this one page uses it. Suggested paragraph, for your approval (adding it changes a page of the main site, so it has not been added):

> **Advertising measurement.** The page crsrikanth.com/spotify uses the Meta Pixel, a tool from Meta Platforms, to measure whether our advertisements on Instagram and Facebook lead people to Spotify. With your permission it sets cookies and tells Meta that you visited the page and whether you pressed the "Listen on Spotify" button. You can refuse, or change your choice at any time with the "Privacy choices" link on that page. Separately, this website counts how many times that page is opened and how many times the button is pressed. These are totals only: no cookie is set and nothing that identifies you is stored.

## Why the first-party count exists

Meta only sees visitors who allow the pixel and whose browser does not block it. The site's own count sees every press of the button. Reports use both:

- **Spotify-button clicks (site count)**: the fuller number, used for cost per click.
- **ViewContent (Meta)**: the number Meta can optimise on. Expect it to be lower.

A large gap between the two is normal and is a sign of declined consent or blocked scripts, not of a fault.

## If something does not show

- **No events in Test Events:** an ad blocker or a privacy browser (Safari private mode, Brave, DuckDuckGo) is the usual cause. Test in plain Chrome.
- **`PageView` but no `ViewContent`:** the press must be a real one on the button; reloading the page resets the once-per-visit guard.
- **Old settings still showing:** flush the host cache and wait five minutes.
- **Conversions API:** not used in this version. It would need a secret token stored on the site and server-side sending; Southworth treats it as optional. It can be added later if event volume proves too low.
