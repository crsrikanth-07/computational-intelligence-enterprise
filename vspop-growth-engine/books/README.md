# Book promotion — CR Srikanth

Started 13 November 2026. Nothing here spends money or contacts anyone.

## Decisions

| Decision | Value |
| --- | --- |
| Lead book | *Tales from Bellavere and Lindenfeld* (newest; ebook and paperback) |
| Amazon Ads | **Not used.** The author does not want an Amazon Ads account. |
| Paid traffic, if any | The author's own YouTube promotion or Instagram boost, pointed at the landing page below |
| Amazon links supplied | `B0HNTSH7FL`, `B0HNV2KC3F`, `B0HPZ1JYK3` (amazon.com/dp/…). Not yet matched to titles: Amazon blocks automated checks. Paste each into the right Amazon slot on the landing page once matched. |

## What was built

1. **One search-friendly page per book** on crsrikanth.com (`/books/<title>/`): its own Google title and description, cover, synopsis, formats, ISBNs, publication date, store buttons, related books, and Google book data (schema.org `Book`, with each ISBN edition and the store pages it is sold on, plus breadcrumbs). The Books page links each book to its page. These pages are in the sitemap.
2. **SEO repairs on the whole site** (theme): the Yoast plugin was printing a second, outdated description and second set of share tags on every page (on the home page: "over 200 original works… EDM"). Yoast's copies are now switched off and the theme's correct ones stay. Pages that redirect (`/podcast/`, `/vs-pop-composer/`) are removed from the sitemap.
3. **A book landing page** at `crsrikanth.com/read/` (plugin `crs-book-landing`): cover, title, one big "Get the ebook" button (Books2Read universal link), other stores below, and a link to the full book page. It counts page views and store clicks per source, with no cookies and no third-party trackers. It is set to "noindex": the book page is the one meant for Google; the landing page is meant for ads and links.

Live since 13 November 2026 (theme and `crs-book-landing` installed; checked: one title, description and canonical per page, seven book pages in the sitemap, /read/ opens Books2Read).

Tests: 25 end-to-end checks on the landing page (`tests/book-landing.test.js`) and the theme checked with the real Yoast plugin active (one title, description and canonical per page; book pages in the sitemap; redirected pages out). No accessibility violations; all pages pass HTML validation.

## Links to use

| Where | Link |
| --- | --- |
| YouTube promotion | `https://crsrikanth.com/read/?utm_source=youtube_ads` |
| Instagram boost | `https://crsrikanth.com/read/?utm_source=instagram_boost` |
| Instagram bio, posts | `https://crsrikanth.com/read/?utm_source=instagram` |
| WhatsApp, email | `https://crsrikanth.com/read/?utm_source=whatsapp` / `?utm_source=email` |
| Anything meant for Google or for readers who want detail | `https://crsrikanth.com/books/tales-from-bellavere-and-lindenfeld/` |

Results: WordPress → **Settings → Book Landing** shows views and store clicks per source and per store. A store click is not a sale; only the stores' own reports show sales.

## Install (the author's steps)

1. **Theme** (book pages and SEO repairs): Appearance → Themes → Add New → Upload Theme → `crsrikanth.zip` → Replace installed with uploaded. The seven book pages are created on the first visit after the upload.
2. **Landing page**: Plugins → Add New Plugin → Upload Plugin → `crs-book-landing.zip` → Install Now → Activate.
3. Click **Flush Cache** in the admin bar.

## Free SEO steps

1. **Google Search Console: done 13 November 2026.** Domain property `crsrikanth.com` verified (DNS record at GoDaddy, already present); `https://crsrikanth.com/sitemap_index.xml` resubmitted; indexing requested for the Tales book page. A stray entry for the bare home URL shows "1 error" in Sitemaps; it is harmless. Check **Performance** in about two weeks.
2. **Bing Webmaster Tools**: import the site from Search Console (one click).
3. **Author profiles**, all free and all linking back to crsrikanth.com: Amazon Author Central, Goodreads Author Program, BookBub author profile.
4. **Reviews from real readers.** Never paid or swapped (Amazon removes them).

Expect SEO to work slowly: weeks to be indexed, months to bring steady visitors. It mainly helps people who already search for the author's name or a book title, plus a trickle from topic searches.
