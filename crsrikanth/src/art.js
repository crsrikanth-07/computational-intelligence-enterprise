// Decorative SVG artwork for the three worlds and the two innovation pages. Illustrations, not product screenshots.
const music = `<svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <defs><radialGradient id="mg" cx="50%" cy="20%" r="80%"><stop offset="0" stop-color="#D2B26F" stop-opacity=".28"/><stop offset="1" stop-color="#D2B26F" stop-opacity="0"/></radialGradient></defs>
  <rect width="400" height="600" fill="url(#mg)"/>
  <g fill="none" stroke="#D2B26F" stroke-opacity=".16">${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M-40 ${430 - i * 34} Q 200 ${300 - i * 46} 440 ${430 - i * 34}"/>`).join('')}</g>
  <g fill="none" stroke="#F2EBDD" stroke-opacity=".5" stroke-width="1">${[0, 1, 2, 3, 4].map(i => `<path d="M-10 ${150 + i * 12} C 120 ${110 + i * 12}, 260 ${200 + i * 12}, 410 ${140 + i * 12}"/>`).join('')}</g>
  <g fill="#D2B26F">${[[60, 157], [112, 150], [168, 166], [222, 178], [276, 175], [330, 160]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="5" transform="rotate(-22 ${x} ${y})"/><rect x="${x + 6}" y="${y - 34}" width="1.4" height="34"/>`).join('')}</g>
</svg>`;
const words = `<svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <g stroke="#1C1A16" stroke-opacity=".07">${Array.from({ length: 22 }, (_, i) => `<path d="M0 ${60 + i * 26}H400"/>`).join('')}</g>
  <text x="220" y="330" font-family="Cormorant Garamond, Garamond, serif" font-style="italic" font-size="360" fill="#7E5F22" fill-opacity=".09">&amp;</text>
  <g stroke="#1C1A16" stroke-opacity=".22" stroke-width="3" stroke-linecap="round">${[[40, 120, 180], [230, 120, 120], [40, 146, 90], [140, 146, 210], [40, 172, 160], [210, 172, 70], [290, 172, 60]].map(([x, y, w]) => `<path d="M${x} ${y}h${w}"/>`).join('')}</g>
</svg>`;
const tech = `<svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <g stroke="#8FE0D3" stroke-opacity=".1">${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 28} 0V600"/>`).join('')}${Array.from({ length: 22 }, (_, i) => `<path d="M0 ${i * 28}H400"/>`).join('')}</g>
  <path d="M0 210 ${Array.from({ length: 81 }, (_, i) => `L${i * 5} ${210 + Math.round(Math.sin(i * .5) * 40 * Math.sin(i * .07))}`).join(' ')}" fill="none" stroke="#8FE0D3" stroke-width="1.6" stroke-opacity=".75"/>
  <path d="M0 210 ${Array.from({ length: 81 }, (_, i) => `L${i * 5} ${210 + Math.round(Math.sin(i * .5 + 1.2) * 26 * Math.sin(i * .07))}`).join(' ')}" fill="none" stroke="#6FA8FF" stroke-width="1" stroke-opacity=".5"/>
  <g fill="#06262E" stroke="#8FE0D3" stroke-opacity=".6">${[[60, 130], [170, 100], [290, 140], [110, 300], [250, 290]].map(([x, y]) => `<rect x="${x}" y="${y}" width="44" height="20" rx="4"/>`).join('')}</g>
</svg>`;

// CuTTI Score: a photographed page becomes a clean, editable score, with the uncertain spots marked
const scoreViz = `<svg viewBox="0 0 640 400" role="img" aria-labelledby="sv-t">
  <title id="sv-t">Illustration: a photographed page of music, straightened and read into an editable score, with two uncertain notes marked for review</title>
  <rect width="640" height="400" fill="#06262E"/>
  <g transform="translate(40 70) rotate(-5)">
    <rect width="230" height="290" rx="4" fill="#E9E1D0"/>
    <g stroke="#3A3428" stroke-opacity=".7">${[0, 1, 2].map(s => [0, 1, 2, 3, 4].map(l => `<path d="M18 ${50 + s * 80 + l * 7}H212"/>`).join('')).join('')}</g>
    <g fill="#2A251C">${[0, 1, 2].map(s => [30, 58, 86, 118, 146, 174, 200].map((x, k) => `<ellipse cx="${x}" cy="${50 + s * 80 + ((k * 3 + s) % 5) * 3.5}" rx="4.5" ry="3.2" transform="rotate(-20 ${x} ${50 + s * 80 + ((k * 3 + s) % 5) * 3.5})"/>`).join('')).join('')}</g>
    <rect width="230" height="290" rx="4" fill="url(#shade)"/>
  </g>
  <defs><linearGradient id="shade" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
  <linearGradient id="beam" x1="0" x2="1"><stop offset="0" stop-color="#8FE0D3" stop-opacity="0"/><stop offset="1" stop-color="#8FE0D3" stop-opacity=".8"/></linearGradient></defs>
  <path d="M290 200H340" stroke="url(#beam)" stroke-width="2"/><path d="M334 194l8 6-8 6" fill="none" stroke="#8FE0D3" stroke-width="2"/>
  <g transform="translate(360 60)">
    <rect width="250" height="290" rx="10" fill="#0B3440" stroke="#8FE0D3" stroke-opacity=".35"/>
    <g stroke="#F2EBDD" stroke-opacity=".55">${[0, 1, 2].map(s => [0, 1, 2, 3, 4].map(l => `<path d="M20 ${60 + s * 80 + l * 7}H230"/>`).join('')).join('')}</g>
    <g fill="#F2EBDD">${[0, 1, 2].map(s => [34, 62, 90, 122, 150, 178, 206].map((x, k) => `<ellipse cx="${x}" cy="${60 + s * 80 + ((k * 3 + s) % 5) * 3.5}" rx="4.5" ry="3.2" transform="rotate(-20 ${x} ${60 + s * 80 + ((k * 3 + s) % 5) * 3.5})"/><path d="M${x + 4} ${60 + s * 80 + ((k * 3 + s) % 5) * 3.5}v-20" stroke="#F2EBDD" stroke-width="1.1"/>`).join('')).join('')}</g>
    <g fill="none" stroke="#E7A93A" stroke-width="1.5" stroke-dasharray="3 2"><rect x="111" y="44" width="22" height="34" rx="4"/><rect x="167" y="200" width="22" height="34" rx="4"/></g>
    <text x="20" y="30" font-family="Inter, sans-serif" font-size="11" letter-spacing="2" fill="#8FE0D3">EDITABLE SCORE</text>
    <text x="20" y="276" font-family="Inter, sans-serif" font-size="10" fill="#E7A93A">2 spots to review</text>
  </g>
  <text x="40" y="40" font-family="Inter, sans-serif" font-size="11" letter-spacing="2" fill="#A49D90">PHONE PHOTO OF A PRINTED PAGE</text>
</svg>`;

// CuTTI Studio: a plain-words brief becomes an arrangement plan
const studioViz = `<svg viewBox="0 0 640 400" role="img" aria-labelledby="st-t">
  <title id="st-t">Illustration: a one-line brief becomes an arrangement plan with sections, instruments and a starting mix</title>
  <rect width="640" height="400" fill="#06262E"/>
  <rect x="30" y="28" width="580" height="46" rx="23" fill="#0B3440" stroke="#8FE0D3" stroke-opacity=".45"/>
  <text x="56" y="57" font-family="JetBrains Mono, monospace" font-size="13" fill="#D6F2EC">a dreamy pop song in A minor, 100 BPM</text>
  <circle cx="586" cy="51" r="12" fill="#8FE0D3"/><path d="M581 51h9M586 46l5 5-5 5" stroke="#06262E" stroke-width="2" fill="none"/>
  ${['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Outro'].map((t, i) => `<text x="${150 + [0, 60, 140, 220, 300, 380][i]}" y="112" font-family="Inter, sans-serif" font-size="10" letter-spacing="1.5" fill="#A49D90">${t.toUpperCase()}</text>`).join('')}
  ${['Piano', 'Strings', 'Synth pad', 'Bass', 'Drums', 'Lead'].map((t, r) => `<text x="30" y="${146 + r * 40}" font-family="Inter, sans-serif" font-size="12" fill="#CFC7B8">${t}</text><path d="M140 ${141 + r * 40}H610" stroke="#F2EBDD" stroke-opacity=".08"/>`).join('')}
  ${[[0, 0, 60], [0, 60, 140], [0, 300, 80], [0, 380, 80], [1, 60, 80], [1, 140, 80], [1, 220, 160], [2, 140, 80], [2, 300, 160], [3, 60, 400], [4, 140, 80], [4, 220, 80], [4, 300, 80], [5, 140, 80], [5, 300, 80]].map(([r, x, w], k) => `<rect x="${150 + x}" y="${130 + r * 40}" width="${w - 6}" height="22" rx="5" fill="${['#D2B26F', '#8FE0D3', '#6FA8FF', '#8DBF9A', '#E0614F', '#F2EBDD'][r]}" fill-opacity="${.55 + (k % 3) * .12}"/>`).join('')}
  ${[150, 210, 290, 370, 450, 530].map(x => `<path d="M${x - 2} 100V380" stroke="#8FE0D3" stroke-opacity=".25" stroke-dasharray="2 4"/>`).join('')}
</svg>`;

module.exports = { music, words, tech, scoreViz, studioViz };
