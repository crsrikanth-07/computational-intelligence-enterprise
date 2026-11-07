// Every page of crsrikanth.com, built from content/*.json.
const fs = require('fs'), path = require('path');
const L = require('./lib.js'), ART = require('./art.js');
const { concert, spotlight, playlist, esc, tm, page, arrow, chip, kicker, phero, release, video, book, milestone, verify, EXT } = L;
const C = n => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', n + '.json'), 'utf8'));
const lit = C('literature'), music = C('music'), rec = C('recognition'), cat = C('catalogue'), vids = C('videos'), inn = C('innovations');

const section = (cls, id, inner, label) => `<section class="section ${cls}"${id ? ` id="${id}"` : ''}${label ? ` aria-labelledby="${label}"` : ''}>\n<div class="wrap">\n${inner}\n</div>\n</section>`;
const head = (k, h, id, lead = '', cls = '') => cls.includes('split')
  ? `<div class="head ${cls}" data-reveal><div>${kicker(k)}<h2 id="${id}" data-mt="18">${h}</h2></div>${lead ? `<p class="lead">${lead}</p>` : ''}</div>`
  : `<div class="head ${cls}" data-reveal>${kicker(k)}<h2 id="${id}">${h}</h2>${lead ? `<p class="lead">${lead}</p>` : ''}</div>`;
const finale = (h, p, btns) => section('finale section--ink', '', `<div data-reveal><h2 id="finale-title">${h}</h2><p class="lead">${p}</p><div class="btn-row">${btns}</div></div>`, 'finale-title');
const featuredBooks = lit.books.filter(b => !b.earlier);

// ---------------- HOME ----------------
const home = page({ path: '/', title: 'CR Srikanth | Composer, Author, Innovator', desc: 'The creative world of CR Srikanth: orchestral and classical composition, VS Pop™ recordings, literary fiction, and CuTTI music technology.' }, `
<section class="hero" aria-labelledby="hero-title">
  <canvas data-lines="all" aria-hidden="true"></canvas>
  <div class="hero__veil"></div>
  <div class="wrap hero__in">
    <h1 class="hero__name" id="hero-title"><span>CR</span><span class="thin">Srikanth</span></h1>
    <ul class="hero__roles"><li>Composer</li><li>Author</li><li>Innovator</li></ul>
    <p class="hero__line">Where music, stories and technology <em>converge</em>.</p>
    <p class="hero__sub">A creative world spanning orchestral composition, contemporary sound, literary fiction and intelligent music-making tools.</p>
    <div class="btn-row">
      <a class="btn btn--gold" href="#worlds">Explore the creative world</a>
      <a class="btn btn--ghost" href="/innovations/">Discover the innovations</a>
    </div>
  </div>
  <a class="hero__scroll" href="#intro">Scroll<i></i></a>
</section>

${section('section--slate', 'intro', `<div class="intro">
  <div data-reveal>${kicker('A world of music, words and ideas')}<p class="statement" data-mt="26">One creative mind. <em>Many forms</em> of expression.</p></div>
  <div class="intro__body" data-reveal>
    <p>CR Srikanth, also known as Ravi Chandra Srikanth Cherukupalli, is a composer, recording artist, fiction writer and creative-technology innovator.</p>
    <p>His work moves between classical composition and contemporary pop, between literary storytelling and the building of new tools for musical creation. From orchestral scores to published fiction, and from VS Pop™ to the CuTTI tools, it explores the different ways imagination can take form.</p>
    <p>${arrow('/about/', 'Read the biography')}</p>
  </div>
</div>`)}

${section('', 'worlds', `${head('Three creative worlds', 'Sound. Story. <em>Invention.</em>', 'worlds-title', '', 'head--center')}
<div class="worlds">
  <a class="world world--music" href="/music/" data-reveal><div class="world__art">${ART.music}</div><span class="world__label">Music</span><span class="world__title">Sound Without Boundaries</span><span class="world__text">Classical composition, orchestral expression, cinematic music and VS Pop™.</span><span class="arrow">Explore music${L.ARROW}</span></a>
  <a class="world world--words" href="/books/" data-reveal><div class="world__art">${ART.words}</div><span class="world__label">Literature</span><span class="world__title">Stories Beyond the Page</span><span class="world__text">Novels, a story collection and short fiction about memory, identity, family and time.</span><span class="arrow">Explore books &amp; stories${L.ARROW}</span></a>
  <a class="world world--tech" href="/innovations/" data-reveal><div class="world__art">${ART.tech}</div><span class="world__label">Innovation</span><span class="world__title">Technology for Musical Imagination</span><span class="world__text">CuTTI Studio and CuTTI Score: a studio assistant that turns ideas and scores into sessions, and a reader that turns printed music into editable scores.</span><span class="arrow">Explore innovations${L.ARROW}</span></a>
</div>`, 'worlds-title')}

${section('section--ink', 'listen', `${head('Selected works · Music', 'A Composer’s Imagination. A <em>Producer’s</em> Sound.', 'listen-title', 'Contemporary VS Pop™ recordings and orchestral works, selected from a catalogue of original music.', 'head--split')}
<div class="spotlights">${music.latest.map(spotlight).join('')}</div>
<div class="releases" data-mt="60">${music.releases.filter(r => r.featured).slice(0, 4).map(release).join('')}</div>
<div class="videos" data-mt="60">${vids.filter(v => v.home).map(video).join('')}</div>
<div data-mt="60">${vids.filter(v => v.kind === 'concert').map(concert).join('')}</div>
<p data-mt="44">${arrow('/music/', 'All music')}</p>`, 'listen-title')}

${section('section--paper', 'read', `${head('Selected works · Literature', 'Stories of Memory, Place and the <em>Human Condition</em>.', 'read-title', 'Short fiction published by independent literary magazines, and books from imagined towns, theatres and inherited histories.', 'head--split')}
<div class="pubs">${lit.publications.map(p => `<article class="pub" data-reveal><p class="pub__outlet">${p.outlet}</p><h3 class="pub__title">${p.title}</h3><p class="pub__meta">${p.issue}</p><p class="pub__text">${p.text}</p><div class="btn-row"><a class="btn btn--ink" href="${p.url}" target="_blank" rel="noopener">Read the story${EXT}</a></div></article>`).join('')}</div>
<div class="books" data-mt="70">${featuredBooks.slice(0, 3).map(book).join('')}</div>
<p data-mt="44">${arrow('/books/', 'All books &amp; stories')}</p>`, 'read-title')}

${section('section--slate', 'milestones', `${head('Selected milestones', 'Achievements You Can <em>Verify</em>.', 'ms-title', 'A few dated records, each with its original source.', 'head--split')}
<div class="timeline">${rec.milestones.filter(m => m.home).map(milestone).join('')}</div>
<p>${arrow('/recognition/', 'All recognition')}</p>`, 'ms-title')}

${finale('Music People Can Listen To. Stories People Can Read.', 'Scores to explore, innovations to discover, and a direct line for collaborations, commissions, literary correspondence and media.', `<a class="btn btn--gold" href="/contact/">Get in touch</a><a class="btn btn--ghost" href="https://open.spotify.com/artist/16N9BJJPufgA3rnpQ06iSa" target="_blank" rel="noopener">Listen on Spotify${EXT}</a>`)}
`);

// ---------------- MUSIC ----------------
const platforms = music.platforms.map(p => chip(p.url, p.label)).join('');
const musicPage = page({ path: '/music/', title: 'Music | CR Srikanth: VS Pop™ and Classical Compositions', desc: 'VS Pop™ recordings and classical, orchestral and chamber compositions by CR Srikanth, with streaming links, videos and published scores.', og: 'og-music.jpg' }, `
${phero({ kicker: 'Music', title: 'A Composer’s Imagination. A <em>Producer’s</em> Sound.', lead: 'Two complementary identities: the contemporary songs of VS Pop™, and a classical catalogue of symphonies, quartets, fugues, piano and chamber works credited to Ravi Chandra Srikanth Cherukupalli.', variant: 'music', buttons: `<a class="btn btn--gold" href="#vs-pop">VS Pop™</a><a class="btn btn--ghost" href="#classical">Classical works</a>` })}

${section('section--ink', 'latest', `${head('New releases', 'Just Released.', 'latest-title', 'The newest classical and VS Pop™ recordings. Press play to listen here, or open them on your platform.')}
<div class="spotlights">${music.latest.map(spotlight).join('')}</div>`, 'latest-title')}

${section('', 'identities', `<div class="duo">
  <article class="duo__panel duo__panel--pop" data-reveal>${kicker('Contemporary')}<h3 data-mt="18">VS Pop<span class="tm">™</span>: Very Smooth Pop</h3><p>${music.vspop}</p><div class="btn-row"><a class="btn btn--gold" href="#vs-pop">Listen to VS Pop™</a></div></article>
  <article class="duo__panel duo__panel--classic" data-reveal>${kicker('Classical')}<h3 data-mt="18">Classical and Orchestral</h3><p>${music.classical}</p><div class="btn-row"><a class="btn btn--ghost" href="/music/compositions/">The full catalogue</a></div></article>
</div>`)}

${section('section--ink', 'vs-pop', `${head('VS Pop™ releases', 'Pop Songwriting with a <em>Cinematic</em> Heart.', 'vs-title', 'Selected releases with their original artwork. Each links to the official platforms.')}
<div class="releases">${music.releases.filter(r => r.kind === 'vspop').map(release).join('')}</div>
<p class="small muted" data-mt="34">Also on: </p><div class="btn-row" data-mt="12">${platforms}</div>`, 'vs-title')}

${section('', 'classical', `${head('Classical &amp; orchestral', 'Symphonies, Quartets, <em>Fugues</em> and Piano Works.', 'cl-title', 'Selected works, with recordings and published scores. Scores are freely available on IMSLP, the International Music Score Library Project.')}
${vids.filter(v => v.kind === 'concert').map(concert).join('')}
<div class="releases" data-mt="60">${music.classicalReleases.map(release).join('')}</div>
<div class="videos" data-mt="60">${vids.filter(v => v.kind === 'classical').map(video).join('')}</div>
<div class="note" data-mt="50"><strong>Published scores.</strong> ${music.imslpNote} <a class="link" href="https://imslp.org/wiki/Category:CR,_Srikanth" target="_blank" rel="noopener">Open the IMSLP catalogue${EXT}</a></div>
<p data-mt="34">${arrow('/music/compositions/', 'Browse the full classical catalogue')}</p>`, 'cl-title')}

${section('section--slate', 'streaming', `${head('Streaming &amp; playlists', 'A Global Digital <em>Music</em> Presence.', 'st-title', 'The catalogue is distributed worldwide. Start with a playlist, or follow the artist on the platform you use.')}
<div class="playlists">${music.playlists.map(playlist).join('')}</div>
<div class="btn-row" data-mt="40">${platforms}</div>
<p class="small muted" data-mt="28">${music.playlistNote}</p>`, 'st-title')}

${finale('Commission, License or Collaborate.', 'For film, games, concert works, sync licensing and recordings.', `<a class="btn btn--gold" href="/contact/?topic=music">Music enquiries</a>`)}
`);

const compositions = page({ path: '/music/compositions/', title: 'Classical Compositions | CR Srikanth', desc: 'The classical catalogue of CR Srikanth (Ravi Chandra Srikanth Cherukupalli): symphonies, waltzes, string quartets, nocturnes, sonatas, serenades, études, fugues and more, with IMSLP scores.', og: 'og-music.jpg' }, `
${phero({ kicker: 'Classical catalogue', title: 'Works by Opus.', lead: 'The composer’s own catalogue of classical, orchestral, chamber and piano works, followed by the scores published on IMSLP. The composer reports more than 250 original works in all; this page lists the catalogued opus works.', variant: 'music', crumbs: [['/music/', 'Music']], buttons: `<a class="btn btn--gold" href="https://imslp.org/wiki/Category:CR,_Srikanth" target="_blank" rel="noopener">Scores on IMSLP${EXT}</a>` })}
${section('', 'imslp', `${head('Published scores', 'On IMSLP', 'imslp-title', music.imslpNote)}
<div class="works">${music.imslp.map(w => `<div class="work"><span class="work__title">${esc(w.title)}</span><span class="work__meta">${esc(w.category || '')}</span><span class="work__links">${chip(w.url, 'Score on IMSLP')}</span></div>`).join('')}</div>`, 'imslp-title')}
${section('section--slate', 'catalogue', `${head('Composer’s catalogue', 'The Opus List', 'cat-title', 'As published by the composer. Recordings and scores are linked where they are publicly available.')}
${cat.groups.map(g => `<div class="opus" data-reveal><h3>${esc(g.group)} <small>${g.works.length} works</small></h3><ol>${g.works.map(w => `<li><span>${esc(w.title)}</span><span>${esc(w.opus)}</span></li>`).join('')}</ol></div>`).join('')}`, 'cat-title')}
`);

// ---------------- BOOKS ----------------
const books = page({ path: '/books/', title: 'Books & Stories | CR Srikanth, Author', desc: 'Literary fiction by CR Srikanth: stories in The Hamilton Stone Review and Half and One, the collection Tales from Bellavere and Lindenfeld, and novels.', og: 'og-books.jpg', ld: lit.books.map(b => ({ '@type': 'Book', name: b.title.replace(/&amp;/g, '&'), author: { '@id': L.SITE + '/#person' }, datePublished: String(b.year), ...(b.isbns ? { isbn: b.isbns[0].split(' ')[0] } : {}) })) }, `
${phero({ kicker: 'Literature &amp; fiction', title: 'Stories of Memory, Place and the <em>Human Condition</em>.', lead: 'Fiction about the emotional architecture of people’s lives: memory, family, identity, moral choices, history and the passage of time, moving through imagined towns, theatrical worlds and inherited histories.', variant: 'words', cls: 'phero--paper', buttons: `<a class="btn btn--gold" href="#published">Published stories</a><a class="btn btn--ghost" href="#books">Books</a>` })}

${section('section--paper', 'published', `${head('In literary magazines', 'Independently Published Fiction', 'pub-title', 'Stories selected and published by independent literary magazines, read in full at the original publication.')}
<div class="pubs">${lit.publications.map(p => `<article class="pub" data-reveal><p class="pub__outlet">${p.outlet}</p><h3 class="pub__title">${p.title}</h3><p class="pub__meta">${p.issue}${p.credit ? ' · ' + p.credit : ''}</p><p class="pub__text">${p.text}</p><div class="btn-row"><a class="btn btn--ink" href="${p.url}" target="_blank" rel="noopener">Read the published story${EXT}</a>${p.issueUrl ? `<a class="btn btn--ghost btn--ghost-paper" href="${p.issueUrl}" target="_blank" rel="noopener">The issue${EXT}</a>` : ''}</div></article>`).join('')}</div>`, 'pub-title')}

${section('section--paper', 'books', `${head('Books &amp; collections', 'From Bellavere to <em>Belogradets</em>.', 'books-title', 'Novels, a novella and a story collection, published in 2026. Several share their towns and families, so the books can be read as one connected world.')}
<div class="books">${featuredBooks.map(book).join('')}</div>`, 'books-title')}

${section('section--paper', 'earlier', `<div class="grid grid--2"><div>${kicker('Earlier edition')}<h2 id="earlier-title" data-mt="18">The First Ten Tales</h2><p class="lead" data-mt="16">The collection first appeared in May 2026 as a ten-story paperback, before the expanded October 2026 edition.</p></div><div class="books books--one">${lit.books.filter(b => b.earlier).map(book).join('')}</div></div>`, 'earlier-title')}

${section('section--paper', 'where', `<div class="note note--paper"><strong>Where to buy.</strong> Availability differs from book to book and from country to country, so each book lists only the stores where it has been confirmed. Ebook editions are distributed to retailers through Draft2Digital.</div>`)}

${finale('Literary Correspondence.', 'For editors, publishers, translators, readers and literary events.', `<a class="btn btn--gold" href="/contact/?topic=literary">Write to the author</a>`)}
`);

// ---------------- INNOVATIONS ----------------
const featureList = items => `<div class="feature-list">${items.map(f => `<article class="feature${f.dev ? ' feature--dev' : ''}" data-reveal><h3>${f.title}</h3><p>${f.text}</p>${f.dev ? '<span class="feature__tag">In development</span>' : ''}</article>`).join('')}</div>`;
const statusLine = `<p class="status">${inn.status}</p>`;
const tmNote = `<p class="small muted" data-mt="40">${inn.trademarks}</p>`;
const innovations = page({ path: '/innovations/', title: 'Innovations | CuTTI Studio and CuTTI Score by CR Srikanth', desc: 'CuTTI is a pair of studio tools built by CR Srikanth for his own composing: CuTTI Studio, an assistant arranger for the DAW, and CuTTI Score, which turns printed music into editable, playable scores.', og: 'og-innovations.jpg' }, `
${phero({ kicker: 'Innovation in music creation', title: 'Where Technology Meets <em>Musical Imagination</em>.', lead: inn.intro, variant: 'tech', cls: 'phero--violet', buttons: `<a class="btn btn--violet" href="/innovations/cutti-studio/">CuTTI Studio</a><a class="btn btn--ghost" href="/innovations/cutti-score/">CuTTI Score</a>` })}
${section('tech', 'quote', `<blockquote class="quote" data-reveal>“${inn.quote}”<cite>CR Srikanth</cite></blockquote>`)}
${section('tech section--ink', 'studio', `<div class="product"><div data-reveal>${kicker('CuTTI Studio')}<h2 data-mt="18">From a Prompt to a Musical Arrangement.</h2><p>${inn.studio.lead}</p><div class="btn-row"><a class="btn btn--violet" href="/innovations/cutti-studio/">Discover CuTTI Studio</a></div></div><figure class="product__visual" data-reveal>${ART.studioViz}<figcaption>Illustration of the idea, not a screenshot.</figcaption></figure></div>`)}
${section('tech', 'score', `<div class="product product--flip"><div data-reveal>${kicker('CuTTI Score')}<h2 data-mt="18">From Paper to an Editable, Playable Score.</h2><p>${inn.score.lead}</p><div class="btn-row"><a class="btn btn--violet" href="/innovations/cutti-score/">Explore CuTTI Score</a></div></div><figure class="product__visual" data-reveal>${ART.scoreViz}<figcaption>Illustration of the workflow, not a screenshot.</figcaption></figure></div>`)}
${section('tech section--slate', 'principles', `${head('Principles', 'The Composer Stays in Charge.', 'pr-title')}<ol class="principles">${inn.principles.map(p => `<li>${p}</li>`).join('')}</ol><div data-mt="40">${statusLine}</div>${tmNote}`, 'pr-title')}
${finale('Technology Enquiries.', 'Both tools are private and in active development. For conversations about the ideas behind them, research or collaboration, get in touch.', `<a class="btn btn--violet" href="/contact/?topic=technology">Technology enquiries</a>`)}
`);

const studio = page({ path: '/innovations/cutti-studio/', title: 'CuTTI Studio | Idea Generator and Assistant Arranger', desc: 'CuTTI Studio turns a plain-words brief or a score into a ready-to-work session in Logic Pro, Cubase, Nuendo or Digital Performer. A private tool by CR Srikanth, in active development.', og: 'og-innovations.jpg' }, `
${phero({ kicker: 'CuTTI Studio', title: 'From a Prompt to a <em>Musical Arrangement</em>.', lead: inn.studio.lead, variant: 'tech', cls: 'phero--violet', crumbs: [['/innovations/', 'Innovations']], buttons: `<a class="btn btn--violet" href="#what">What it does</a><a class="btn btn--ghost" href="#demo">See a session being built</a>` })}
${section('tech', 'prompt', `<div class="product"><div data-reveal>${kicker('The brief')}<h2 data-mt="18">Describe the Song. Or Hand Over a Score.</h2><p>${inn.studio.brief}</p><div class="prompt"><b>Example brief</b><br>${inn.studio.example}</div><p class="small muted" data-mt="14">Works in: ${inn.studio.daws}</p></div><figure class="product__visual" data-reveal>${ART.studioViz}<figcaption>Illustration of the idea, not a screenshot.</figcaption></figure></div>`)}
${section('tech section--ink', 'what', `${head('What it does', 'Takes On the Drudgery. Leaves the Music to <em>You</em>.', 'what-title')}${featureList(inn.studio.features)}`, 'what-title')}
${section('tech', 'demo', `<div class="product"><div data-reveal>${kicker('Demonstration')}<h2 data-mt="18">A Session, Built Step by Step.</h2><p>${inn.studio.demo}</p>${statusLine}</div><figure class="product__visual" data-reveal><video controls playsinline preload="none" poster="/assets/img/cutti-studio-poster.webp" width="720" height="1280"><source src="/assets/video/cutti-studio-demo.mp4" type="video/mp4"><a href="/assets/video/cutti-studio-demo.mp4">Download the demonstration video</a></video><figcaption>Demonstration recording in Logic Pro, with sound. 50 seconds.</figcaption></figure></div>`)}
${section('tech section--slate', 'principles', `${head('Principles', 'Built Around the Composer.', 'pr-title')}<ol class="principles">${inn.principles.map(p => `<li>${p}</li>`).join('')}</ol>${tmNote}`, 'pr-title')}
${finale('Next: CuTTI Score.', 'A score corrected in CuTTI Score becomes a song in the DAW with one line.', `<a class="btn btn--violet" href="/innovations/cutti-score/">Explore CuTTI Score</a>`)}
`);

const score = page({ path: '/innovations/cutti-score/', title: 'CuTTI Score | From Paper to an Editable, Playable Score', desc: 'CuTTI Score is a desktop app that reads printed music from PDFs, scans and phone photos and turns it into scores to edit, play and export. A private tool by CR Srikanth, in active development.', og: 'og-innovations.jpg' }, `
${phero({ kicker: 'CuTTI Score', title: 'From Paper to an Editable, <em>Playable</em> Score.', lead: inn.score.lead, variant: 'tech', cls: 'phero--violet', crumbs: [['/innovations/', 'Innovations']], buttons: `<a class="btn btn--violet" href="#what">What it does</a><a class="btn btn--ghost" href="#workflows">Scan, photo, audio</a>` })}
${section('tech', 'workflows', `<div class="product"><div data-reveal>${kicker('Three ways in')}<h2 data-mt="18">Scan Score. Photo Score. <em>Audio Score</em>.</h2><p>${inn.score.workflows}</p></div><figure class="product__visual" data-reveal>${ART.scoreViz}<figcaption>Illustration of the workflow, not a screenshot.</figcaption></figure></div>`)}
${section('tech section--ink', 'what', `${head('What it does', 'Read, Review, Edit, Play, Export.', 'what-title')}${featureList(inn.score.features)}`, 'what-title')}
${section('tech section--slate', 'status', `<div class="grid grid--2"><div data-reveal>${kicker('Status')}<h2 data-mt="18">Private, and in Active Development.</h2><p class="lead" data-mt="18">${inn.score.statusText}</p></div><div data-reveal>${statusLine}${tmNote}</div></div>`)}
${finale('Next: CuTTI Studio.', 'From a corrected score to a full arrangement in the DAW.', `<a class="btn btn--violet" href="/innovations/cutti-studio/">Discover CuTTI Studio</a>`)}
`);

// ---------------- RECOGNITION ----------------
const recognition = page({ path: '/recognition/', title: 'Recognition | CR Srikanth', desc: 'Selected milestones for CR Srikanth: a guest-composer concert at the University of Rhode Island, chart placements, published fiction and published scores, each with its source.', og: 'og-home.jpg' }, `
${phero({ kicker: 'Recognition', title: 'Selected <em>Milestones</em>.', lead: 'A small number of meaningful records, each with a date, context and a link to the original source.', variant: 'music', buttons: `<a class="btn btn--gold" href="/recognition/radio-charts/">Radio &amp; charts archive</a><a class="btn btn--ghost" href="/recognition/press/">Press &amp; media</a>` })}
${section('', 'timeline', `<h2 class="visually-hidden" id="timeline-title">Timeline</h2><div class="timeline">${rec.milestones.map(milestone).join('')}</div>`, 'timeline-title')}
${section('section--slate', 'archives', `<div class="grid grid--2">
  <a class="card card--link" href="/recognition/radio-charts/" data-reveal>${kicker('Archive')}<h3 data-mt="16">Radio &amp; Charts</h3><p>Station records, chart entries and radio-monitoring figures, each with its publisher, scope and date.</p><p data-mt="18"><span class="arrow">Open the archive${L.ARROW}</span></p></a>
  <a class="card card--link" href="/recognition/press/" data-reveal>${kicker('Archive')}<h3 data-mt="16">Press &amp; Media</h3><p>Music journalism, interviews, podcasts and literary publications, with original links.</p><p data-mt="18"><span class="arrow">Open the archive${L.ARROW}</span></p></a>
</div>`)}
`);

const tableRows = (rows, cols) => rows.map(r => `<tr>${cols.map(c => `<td>${c(r)}</td>`).join('')}</tr>`).join('');
const src = r => r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.source || 'Source')}${EXT}</a>` : esc(r.source || '—');
const radio = page({ path: '/recognition/radio-charts/', title: 'Radio & Charts Archive | CR Srikanth', desc: 'An evidence-based archive of chart entries, radio-station plays and radio-monitoring figures for CR Srikanth’s music, with publisher, scope and date for each record.', og: 'og-music.jpg' }, `
${phero({ kicker: 'Archive', title: 'Radio &amp; <em>Charts</em>.', lead: 'An archive of the records behind the music’s radio and chart presence. Each entry names its publisher and scope. Station-specific and independent charts are not national commercial charts, and figures from different tracking services overlap, so they are never added together.', variant: 'music', crumbs: [['/recognition/', 'Recognition']] })}
${section('', 'charts', `${head('Charts', 'Chart Entries', 'charts-title')}
<section class="table-wrap" tabindex="0" aria-label="Chart entries (scrollable table)"><table class="archive"><thead><tr><th scope="col">Chart (publisher, scope)</th><th scope="col">Track</th><th scope="col">Position</th><th scope="col">Date</th><th scope="col">Record</th></tr></thead><tbody>
${tableRows(rec.charts, [r => esc(r.chart), r => tm(esc(r.track)), r => esc(r.position), r => esc(r.date), r => `${src(r)}<br>${verify(r.verified)}`])}
</tbody></table></section>`, 'charts-title')}
${section('section--slate', 'stations', `${head('Radio', 'Station Records', 'st-title', 'Stations with a public playlist, post or log showing a play. Further stations are added only when a record is available.')}
<section class="table-wrap" tabindex="0" aria-label="Station records (scrollable table)"><table class="archive"><thead><tr><th scope="col">Station</th><th scope="col">Country</th><th scope="col">Track</th><th scope="col">Record</th></tr></thead><tbody>
${tableRows(rec.stations, [r => esc(r.station), r => esc(r.country), r => tm(esc(r.track || '—')), r => `${src(r)}<br>${verify(r.verified)}`])}
</tbody></table></section>`, 'st-title')}
${section('', 'metrics', `${head('Reported figures', 'Radio Monitoring and Playlists', 'm-title', 'Figures reported by the artist from monitoring services. They are shown separately because the services overlap.')}
<div class="metric-row">${rec.metrics.map(m => `<div class="metric" data-reveal><b>${m.value}</b><span>${m.label}</span><small>${m.source}</small></div>`).join('')}</div>
<p class="note" data-mt="30"><strong>How to read these numbers.</strong> Each figure comes from one service and covers its own period. They are artist-reported until the original report is published here, and they should not be compared with national commercial chart positions.</p>`, 'm-title')}
`);

const press = page({ path: '/recognition/press/', title: 'Press & Media | CR Srikanth', desc: 'Music journalism, interviews, podcasts and literary publications about and by CR Srikanth, with outlet, date and original links.', og: 'og-home.jpg' }, `
${phero({ kicker: 'Archive', title: 'Press &amp; <em>Media</em>.', lead: 'Music journalism, interviews, podcasts and literary publications. Each entry shows its outlet, type and date, with a link to the original.', variant: 'all', crumbs: [['/recognition/', 'Recognition']] })}
${rec.pressGroups.map((g, i) => section(i % 2 ? 'section--slate' : '', g.id, `${head(g.kicker, g.title, g.id + '-title', g.lead || '')}<div class="press">${g.items.map(p => `<article class="press__item" data-reveal><p class="press__outlet">${esc(p.outlet)}</p><div><h3 class="press__title">${tm(esc(p.title))}</h3><p class="press__meta">${esc([p.type, p.date].filter(Boolean).join(' · '))}</p></div>${p.url ? arrow(p.url, 'Read', true) : '<span class="press__meta">Link to come</span>'}</article>`).join('')}</div>`, g.id + '-title')).join('\n')}
`);

// ---------------- ABOUT ----------------
const about = page({ path: '/about/', title: 'About CR Srikanth | Composer, Author, Innovator', desc: 'Biography of CR Srikanth (Ravi Chandra Srikanth Cherukupalli): composer, recording artist, author of literary fiction and builder of music technology.', og: 'og-home.jpg' }, `
${phero({ kicker: 'About', title: 'One Creative Mind. <em>Many Forms</em> of Expression.', lead: 'Composer, recording artist, published author and music-technology innovator.', variant: 'all' })}
${section('', 'bio', `<div class="intro"><div data-reveal>${kicker('Biography')}<p class="statement" data-mt="26">Music, stories and technology as <em>one practice</em>, not three careers.</p></div><div class="prose" data-reveal>${rec.bio.map(p => `<p>${p}</p>`).join('')}</div></div>`)}
${section('section--slate', 'dimensions', `${head('Four dimensions', 'The Work, in Four Parts.', 'dim-title')}<div class="dimensions">${rec.dimensions.map((d, i) => `<article class="dimension" data-reveal><span class="dimension__n">0${i + 1}</span><h3>${d.title}</h3><p>${d.text}</p><p data-mt="18">${arrow(d.href, d.cta)}</p></article>`).join('')}</div>`, 'dim-title')}
${finale('Collaborate, Commission, Correspond.', 'Music collaborations, literary correspondence, technology conversations and media requests.', `<a class="btn btn--gold" href="/contact/">Get in touch</a>`)}
`);

// ---------------- CONTACT ----------------
const contact = page({ path: '/contact/', title: 'Contact | CR Srikanth', desc: 'Contact CR Srikanth for music collaborations and commissions, literary correspondence, technology conversations and media requests.', og: 'og-home.jpg' }, `
${phero({ kicker: 'Contact', title: 'Let’s <em>Talk</em>.', lead: 'For professional enquiries, music collaborations, literary correspondence, technology conversations and media requests. Every message is read personally.', variant: 'all' })}
${section('', 'write', `<div class="contact">
  <div data-reveal>${kicker('Reasons to write')}<ul class="reasons" data-mt="22">
    <li><b>Music</b><span>Commissions, collaborations, licensing and performances.</span></li>
    <li><b>Literature</b><span>Editors, publishers, translators and readers.</span></li>
    <li><b>Technology</b><span>Conversations about CuTTI and creative music technology.</span></li>
    <li><b>Media</b><span>Interviews, features and press requests.</span></li>
  </ul><p data-mt="28" class="muted">Or email <a class="link" href="mailto:crs.07@crsrikanth.com">crs.07@crsrikanth.com</a></p></div>
  <form class="form" data-form method="POST" action="/wp-admin/admin-post.php" data-reveal>
    <input type="hidden" name="action" value="crs_form">
    <div class="hp" aria-hidden="true"><label for="f-website">Leave empty</label><input type="text" id="f-website" name="_gotcha" tabindex="-1" autocomplete="off"></div>
    <div class="form__row">
      <div class="field"><label for="f-name">Name</label><input type="text" class="input" id="f-name" name="name" autocomplete="name" required></div>
      <div class="field"><label for="f-email">Email</label><input class="input" id="f-email" name="email" type="email" autocomplete="email" required></div>
    </div>
    <div class="field"><label for="f-topic">Topic</label><select class="input" id="f-topic" name="topic"><option value="music">Music collaboration or commission</option><option value="literary">Literary correspondence</option><option value="technology">Technology enquiry</option><option value="media">Media or interview request</option><option value="other">Something else</option></select></div>
    <div class="field"><label for="f-msg">Message</label><textarea class="input" id="f-msg" name="message" required></textarea></div>
    <button class="btn btn--gold" type="submit">Send message</button>
    <p class="form__msg" role="status" aria-live="polite"></p>
    <p class="form__fine">Your details are used only to reply to you. See the <a class="link" href="/privacy-policy/">privacy policy</a>.</p>
  </form>
</div>`)}
`);

const privacy = page({ path: '/privacy-policy/', title: 'Privacy Policy | CR Srikanth', desc: 'How crsrikanth.com handles personal information.', og: 'og-home.jpg' }, `
${phero({ kicker: 'Privacy', title: 'Privacy Policy', lead: 'Short, plain and complete.', variant: 'words' })}
${section('', 'policy', `<div class="prose">${rec.privacy.map(p => `<p>${p}</p>`).join('')}</div>`)}
`);

const notFound = page({ path: '/404.html', title: 'Page Not Found | CR Srikanth', desc: 'The page you asked for does not exist.', og: 'og-home.jpg' }, `
${phero({ kicker: '404', title: 'A Rest, Not the <em>End</em>.', lead: 'This page does not exist, or it has moved. The music, the books and the innovations are all still here.', variant: 'all', buttons: `<a class="btn btn--gold" href="/">Home</a><a class="btn btn--ghost" href="/music/">Music</a><a class="btn btn--ghost" href="/books/">Books &amp; Stories</a>` })}
`);

module.exports = { 'index.html': home, 'music/index.html': musicPage, 'music/compositions/index.html': compositions, 'books/index.html': books, 'innovations/index.html': innovations, 'innovations/cutti-studio/index.html': studio, 'innovations/cutti-score/index.html': score, 'recognition/index.html': recognition, 'recognition/radio-charts/index.html': radio, 'recognition/press/index.html': press, 'about/index.html': about, 'contact/index.html': contact, 'privacy-policy/index.html': privacy, '404.html': notFound };
