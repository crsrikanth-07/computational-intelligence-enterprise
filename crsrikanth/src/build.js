// Builds the static site from content/*.json into site/. Usage: node src/build.js
const fs = require('fs'), path = require('path');
const out = path.join(__dirname, '..', 'site');
const pages = require('./pages.js');
for (const [rel, html] of Object.entries(pages)) {
  const f = path.join(out, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n'));
}
// Icons from the monogram
const L = require('./lib.js');
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#111111"/><g color="#F2EBDD" transform="translate(4 4) scale(.875)">${L.MONOGRAM().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/currentColor/g, '#F4EFE4').replace('#D2B26F', '#E2261C')}</g></svg>`;
fs.writeFileSync(path.join(out, 'favicon.svg'), icon);
const urls = Object.keys(pages).filter(r => r !== '404.html').map(r => 'https://crsrikanth.com/' + r.replace(/index\.html$/, ''));
fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log('built', Object.keys(pages).length, 'pages');
