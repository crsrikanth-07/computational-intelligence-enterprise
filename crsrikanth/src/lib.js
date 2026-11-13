// Shared page shell and components for crsrikanth.com. Pages are built from content/*.json by build.js.
const SITE = 'https://crsrikanth.com';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Text already written as HTML (with &amp;, <em>, ™ etc.) is passed through `raw`.
const raw = s => String(s == null ? '' : s);
const tm = s => raw(s).replace(/™/g, '<span class="tm">™</span>');

const MONOGRAM = (cls = '') => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M50.4 16.6A24 24 0 1 0 50.4 47.4" fill="none" stroke="currentColor" stroke-width="3"/><g stroke="currentColor" stroke-width="1.4" opacity=".75"><path d="M15 24h31M13 28h33M12 32h34M13 36h33M15 40h31"/></g><ellipse cx="53" cy="32" rx="4.4" ry="3.2" transform="rotate(-24 53 32)" fill="#D2B26F"/></svg>`;
const ARROW = '<svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M2 9h13M10 4l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const EXT = '<span class="visually-hidden"> (opens in a new tab)</span>';

const NAV = [['/', 'Home'], ['/music/', 'Music'], ['/books/', 'Books &amp; Stories'], ['/innovations/', 'Innovations'], ['/recognition/', 'Recognition'], ['/shop/', 'Shop'], ['/about/', 'About'], ['/contact/', 'Contact']];

const PERSON = {
  '@type': 'Person', '@id': SITE + '/#person', name: 'CR Srikanth', alternateName: 'Ravi Chandra Srikanth Cherukupalli', url: SITE + '/',
  jobTitle: ['Composer', 'Recording artist', 'Author', 'Music technology developer'],
  sameAs: ['https://open.spotify.com/artist/16N9BJJPufgA3rnpQ06iSa', 'https://open.spotify.com/artist/7omxXdWFGzNjA4FyjVn6oH', 'https://soundcloud.com/srikanth-rc-cherukupalli', 'https://music.apple.com/us/artist/cr-srikanth/1763874820', 'https://imslp.org/wiki/Category:CR,_Srikanth', 'https://www.youtube.com/@CRSrikanthSymphonicResonance', 'https://crsrikanthsymphoicresonance.bandcamp.com/', 'https://www.instagram.com/crsrikanth_creator_vspop/'],
};

function head({ title, desc, path, og = 'og-home.jpg', ogImage = '', ogType = 'website', ld = [] }) {
  const url = SITE + path;
  const graph = { '@context': 'https://schema.org', '@graph': [{ '@type': 'WebPage', '@id': url + '#page', url, name: title, description: desc, inLanguage: 'en', about: { '@id': SITE + '/#person' } }, PERSON, ...ld] };
  return `<!DOCTYPE html>
<html lang="en" data-theme="modernist">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="CR Srikanth">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
${ogImage ? `<meta property="og:image" content="${ogImage}">` : `<meta property="og:image" content="${SITE}/assets/img/${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">`}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F4EFE4">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,300&family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@400;500;700&family=Spectral:ital,wght@0,300;0,400;1,300&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;1,6..96,400&family=Cinzel:wght@400;600&family=Archivo:wght@400;500;800;900&family=Manrope:wght@300;400;600&display=swap">
<link rel="stylesheet" href="/assets/css/site.css">
<link rel="stylesheet" href="/assets/css/themes.css">
<script src="/assets/js/site.js" defer></script>
<script type="application/ld+json">
${JSON.stringify(graph, null, 1)}
</script>
</head>
<body>`;
}

function header(path) {
  const cur = h => (h === path ? ' aria-current="page"' : '');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap site-header__in">
    <a class="brand" href="/" aria-label="CR Srikanth, home">${MONOGRAM()}<span class="brand__name">CR SRIKANTH</span></a>
    <nav class="nav" aria-label="Primary">
      <ul>
${NAV.map(([h, t]) => `        <li><a href="${h}"${cur(h)}>${t}</a></li>`).join('\n')}
      </ul>
    </nav>
    <button class="menu-btn" type="button" data-menu aria-expanded="false" aria-controls="menu-sheet"><span class="bars" aria-hidden="true"></span>Menu</button>
  </div>
</header>
<div class="sheet" id="menu-sheet" hidden>
  <nav aria-label="Menu">
    <ul>
${NAV.map(([h, t], i) => `      <li><a href="${h}"${cur(h)}>${t}<small>${String(i + 1).padStart(2, '0')}</small></a></li>`).join('\n')}
    </ul>
  </nav>
</div>`;
}

const footer = `<footer class="site-footer">
  <div class="wrap">
    <div class="foot">
      <div>
        <p class="foot__mark">CR <i>Srikanth</i></p>
        <p class="foot__line">One creative mind. Many forms of expression: music, stories and the tools that help them take shape.</p>
      </div>
      <div>
        <h2>Explore</h2>
        <ul>
          <li><a href="/music/">Music</a></li>
          <li><a href="/music/compositions/">Classical compositions</a></li>
          <li><a href="/books/">Books &amp; Stories</a></li>
          <li><a href="/innovations/">Innovations</a></li>
          <li><a href="/shop/">Shop</a></li>
        </ul>
      </div>
      <div>
        <h2>Recognition</h2>
        <ul>
          <li><a href="/recognition/">Selected milestones</a></li>
          <li><a href="/recognition/radio-charts/">Radio &amp; charts</a></li>
          <li><a href="/recognition/press/">Press &amp; media</a></li>
          <li><a href="/about/">About</a></li>
        </ul>
      </div>
      <div>
        <h2>Listen &amp; read</h2>
        <ul>
          <li><a href="https://open.spotify.com/artist/16N9BJJPufgA3rnpQ06iSa" target="_blank" rel="noopener">Spotify${EXT}</a></li>
          <li><a href="https://music.apple.com/us/artist/cr-srikanth/1763874820" target="_blank" rel="noopener">Apple Music${EXT}</a></li>
          <li><a href="https://imslp.org/wiki/Category:CR,_Srikanth" target="_blank" rel="noopener">IMSLP scores${EXT}</a></li>
          <li><a href="https://www.youtube.com/@CRSrikanthSymphonicResonance" target="_blank" rel="noopener">YouTube${EXT}</a></li>
          <li><a href="/contact/">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="foot__base">
      <p>&copy; <span data-year>2026</span> CR Srikanth. All music, writing and artwork are the author’s own unless credited.</p>
      <p><a href="/privacy-policy/">Privacy</a> · <a href="mailto:crs.07@crsrikanth.com">crs.07@crsrikanth.com</a></p>
    </div>
  </div>
</footer>
</body>
</html>`;

const page = (meta, main) => `${head(meta)}\n${header(meta.path)}\n<main id="main">\n${main}\n</main>\n${footer}\n`;

// Components
const arrow = (href, text, ext = false) => `<a class="arrow" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${text}${ext ? EXT : ''}${ARROW}</a>`;
const chip = (href, text) => `<a class="chip" href="${esc(href)}" target="_blank" rel="noopener">${text}${EXT}</a>`;
const kicker = t => `<p class="kicker">${t}</p>`;
const phero = ({ kicker: k, title, lead, variant = 'all', cls = '', crumbs = [], buttons = '' }) => `<section class="phero ${cls}">
  <canvas data-lines="${variant}" aria-hidden="true"></canvas>
  <div class="wrap">
    ${crumbs.length ? `<p class="crumbs">${crumbs.map(([h, t]) => `<a href="${h}">${t}</a><span aria-hidden="true">/</span>`).join('')}</p>` : ''}
    ${kicker(k)}
    <h1>${title}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
    ${buttons ? `<div class="btn-row">${buttons}</div>` : ''}
  </div>
</section>`;

const release = r => `<article class="release" data-reveal>
  <figure>${r.art ? `<img src="/assets/art/${r.art}" alt="Cover artwork for ${esc(r.storeTitle || r.title)}" loading="lazy" width="600" height="600">` : ''}</figure>
  <h3>${r.slug ? `<a class="release__link" href="/music/${r.slug}/">${tm(r.title)}</a>` : tm(r.title)}</h3>
  <p>${[r.type, r.year].filter(Boolean).join(' · ')}</p>
  <div class="links">${(r.links || []).map(l => chip(l.url, l.label)).join('')}</div>
</article>`;

const PLAY = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 3l12 7-12 7z" fill="currentColor"/></svg>';
const spotlight = r => `<article class="spotlight" data-reveal>
  <figure class="spotlight__art"><img src="/assets/art/${r.art}" alt="Cover artwork for ${esc(r.title)}" loading="lazy" width="640" height="640"></figure>
  <div class="spotlight__body">
    <p class="kicker">${r.label}</p>
    <h3>${tm(r.title)}</h3>
    <p class="spotlight__credit">${esc(r.credit)}</p>
    <p class="spotlight__meta">${tm(r.meta)}</p>
    <div class="sp-slot"><button class="btn btn--gold" type="button" data-sp="${r.embed}" data-title="${esc(r.title)}">${PLAY}Play here</button><span class="small muted">Loads the Spotify player</span></div>
    <div class="links">${(r.links || []).map(l => chip(l.url, l.label)).join('')}</div>
    ${r.slug && !r.noPageLink ? `<p data-mt="16">${arrow(`/music/${r.slug}/`, 'About this song')}</p>` : ''}
  </div>
</article>`;
const playlist = r => `<article class="playlist" data-reveal>
  <figure><img src="/assets/art/${r.art}" alt="Playlist cover for ${esc(r.title)}" loading="lazy" width="300" height="300"></figure>
  <div><h3>${esc(r.title)}</h3><p>${r.text}</p>
  <div class="sp-slot"><button class="btn btn--ghost" type="button" data-sp="${r.embed}" data-title="${esc(r.title)}">${PLAY}Play here</button>${chip(r.url, 'Open in Spotify')}</div></div>
</article>`;
const concert = v => `<article class="concert" data-reveal>
  <div class="video__frame">
    <img src="/assets/img/yt/${v.cover}" alt="" loading="lazy" width="1200" height="630">
    <button class="video__play" type="button" data-yt="${v.id}" data-start="${v.start || 0}" data-end="${v.end}" data-title="${esc(v.title)}" aria-label="Play ${esc(v.title)}, first 13 minutes (loads YouTube)"><span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3l12 7-12 7z" fill="currentColor"/></svg></span></button>
  </div>
  <div class="concert__body">
    <p class="kicker">Live in concert</p>
    <h3>${v.title}</h3>
    <p>Guest composer at the University of Rhode Island Composers’ Concert on 25 April 2026, in the URI Fine Arts Center Concert Hall. The player opens on the first 13 minutes of the concert recording published by URI Music.</p>
    <p data-mt="18"><a class="arrow" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">Watch on YouTube${EXT}${ARROW}</a></p>
  </div>
</article>`;
const video = v => `<article class="video" data-reveal>
  <div class="video__frame">
    <img src="/assets/img/yt/${v.cover || v.id + '.jpg'}" alt="" loading="lazy" width="480" height="360">
    <button class="video__play" type="button" data-yt="${v.id}"${v.end ? ` data-start="${v.start || 0}" data-end="${v.end}"` : ''} data-title="${esc(v.title)}" aria-label="Play ${esc(v.title)} (loads YouTube)"><span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3l12 7-12 7z" fill="currentColor"/></svg></span></button>
  </div>
  <h3>${tm(v.title)}</h3>
  ${v.note ? `<p>${v.note}</p>` : ''}
</article>`;

function bookCover(b) {
  if (b.cover) return `<div class="book__cover"><img src="/assets/covers/${b.cover}" alt="Cover of ${esc(b.title)}" loading="lazy" width="400" height="600"></div>`;
  // No verified cover image yet: a plain typographic stand-in (title and author only), listed in VERIFICATION.md.
  return `<div class="book__cover book__cover--type tone-${b.tone || 1}"><i>CR Srikanth</i><b>${tm(b.title)}</b><i>${esc(b.form || 'Fiction')}</i></div>`;
}
const book = b => `<article class="book" data-reveal>
  ${bookCover(b)}
  <div>
    <h3>${b.slug ? `<a class="book__link" href="/books/${b.slug}/">${tm(b.title)}</a>` : tm(b.title)}</h3>
    <p class="book__meta">${[b.form, b.year].filter(Boolean).join(' · ')}</p>
    <p>${b.synopsis}</p>
    <dl>${b.formats ? `<dt>Formats</dt><dd>${b.formats}</dd>` : ''}${(b.isbns || []).map(i => `<dt>ISBN</dt><dd>${i}</dd>`).join('')}${b.edition ? `<dt>Edition</dt><dd>${b.edition}</dd>` : ''}</dl>
    <div class="links">${(b.links || []).map(l => chip(l.url, l.label)).join('')}</div>
    ${b.slug ? `<p data-mt="14">${arrow(`/books/${b.slug}/`, 'About this book')}</p>` : ''}
  </div>
</article>`;

const milestone = m => `<article class="milestone" data-reveal>
  <p class="milestone__date">${m.date}</p>
  <div>
    <span class="milestone__type">${m.type}</span>
    <h3>${tm(m.title)}</h3>
    <p>${m.text}</p>
    ${m.url ? arrow(m.url, m.cta || 'See the source', /^https?:/.test(m.url)) : ''}
    ${m.img ? `<figure class="milestone__img"><img src="/assets/img/${m.img}" alt="${esc(m.imgAlt || '')}" loading="lazy" width="600" height="776"></figure>` : ''}
  </div>
</article>`;

const verify = (ok, hasUrl = true) => ok ? (hasUrl ? '<span class="verify verify--ok">Source linked</span>' : '<span class="verify verify--ok">Report on file</span>') : '<span class="verify verify--rep">Artist-reported</span>';

module.exports = { concert, spotlight, playlist, SITE, esc, raw, tm, MONOGRAM, ARROW, EXT, NAV, PERSON, head, header, footer, page, arrow, chip, kicker, phero, release, video, book, bookCover, milestone, verify };
