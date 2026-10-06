// Builds the hero key visual: an illustrative arrangement view of a CuTTI-built session (matches the product demo). Used by products/cutti/index.html.
// Colours come from CSS custom properties in tokens.css (--lp-intro ... --lp-outro) via classes.
module.exports = function keyVisual() {
  const W = 720, LANE_X = 150, LANE_W = W - LANE_X - 12, TOP = 92, ROW = 50;
  const sections = [ ['Intro', 4, 'intro'], ['Verse', 8, 'verse'], ['Chorus', 8, 'hook'], ['Bridge', 4, 'bridge'], ['Final Chorus', 8, 'final'] ];
  const bars = sections.reduce((n, s) => n + s[1], 0);
  const bw = LANE_W / bars;
  const tracks = [
    ['Kick', [0, 1, 1, 0, 1], 'drums'], ['Verse Snare', [0, 1, 1, 0, 1], 'bass'], ['Lead Synth', [0, 1, 1, 1, 1], 'piano'], ['Synth Hook', [0, 0, 1, 0, 1], 'bell'], ['Warm Pad', [1, 1, 1, 1, 1], 'pad'],
  ];
  let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const f = (n) => Math.round(n * 10) / 10;
  let out = '';
  // window chrome
  out += `<rect class="kv-chrome" x="0" y="0" width="${W}" height="34"/>`;
  out += [18, 34, 50].map(x => `<circle class="kv-dot" cx="${x}" cy="17" r="5"/>`).join('');
  out += `<text class="kv-title" x="${W / 2 - 40}" y="21" text-anchor="middle">CuTTI session · Tracks</text>`;
  out += `<rect class="kv-lcd" x="${W - 222}" y="7" width="210" height="20" rx="4"/>`;
  out += `<text class="kv-lcd-text" x="${W - 117}" y="21" text-anchor="middle">45 TRACKS · 147/147 ✓</text>`;
  // ruler
  out += `<rect class="kv-ruler" x="${LANE_X}" y="40" width="${LANE_W}" height="18"/>`;
  for (let b = 0; b < bars; b += 4) out += `<text class="kv-bar" x="${f(LANE_X + b * bw + 3)}" y="53">${b + 1}</text>`;
  // section markers
  let x = LANE_X;
  for (const [name, len, cls] of sections) {
    const w = len * bw;
    out += `<rect class="kv-sec kv-sec--${cls}" x="${f(x + 1)}" y="62" width="${f(w - 2)}" height="20" rx="3"/>`;
    out += `<text class="kv-sec-label" x="${f(x + 7)}" y="76">${name}</text>`;
    x += w;
  }
  // tracks
  tracks.forEach(([name, plays, tcls], i) => {
    const y = TOP + i * ROW;
    out += `<rect class="kv-head" x="0" y="${y}" width="${LANE_X - 6}" height="${ROW - 6}"/>`;
    out += `<text class="kv-num" x="12" y="${y + 27}">${i + 1}</text>`;
    out += `<text class="kv-name" x="30" y="${y + 21}">${name}</text>`;
    out += `<text class="kv-msr" x="30" y="${y + 36}">M  S  R</text>`;
    out += `<rect class="kv-lane" x="${LANE_X}" y="${y}" width="${LANE_W}" height="${ROW - 6}"/>`;
    let sx = LANE_X;
    sections.forEach(([, len, cls], k) => {
      const w = len * bw;
      if (plays[k]) {
        out += `<rect class="kv-reg kv-reg--${tcls}" x="${f(sx + 1.5)}" y="${y + 2}" width="${f(w - 3)}" height="${ROW - 10}" rx="3"/>`;
        const notes = Math.max(3, Math.round(len * (name === 'Kick' || name === 'Verse Snare' ? 3 : 1.4) * (cls === 'verse' && name !== 'Pad' ? 0.6 : 1)));
        for (let n = 0; n < notes; n++) {
          const nx = sx + 5 + (w - 14) * (n / notes) + rnd() * 3;
          const ny = y + 9 + Math.floor(rnd() * 5) * 5;
          const nw = name === 'Kick' || name === 'Verse Snare' ? 2.5 : 4 + rnd() * (w / notes - 4);
          out += `<rect class="kv-note" x="${f(nx)}" y="${f(ny)}" width="${f(Math.max(2.5, nw))}" height="2.6"/>`;
        }
      }
      sx += w;
    });
  });
  // playhead at bar 15
  const px = f(LANE_X + 27.5 * bw);
  out += `<path class="kv-playhead-cap" d="M${px - 5} 40h10l-5 7z"/>`;
  out += `<line class="kv-playhead" x1="${px}" y1="40" x2="${px}" y2="${TOP + 5 * ROW - 6}"/>`;
  // prompt bar
  const py = TOP + 5 * ROW + 10;
  out += `<rect class="kv-prompt" x="0" y="${py}" width="${W}" height="44" rx="8"/>`;
  out += `<text class="kv-prompt-caret" x="16" y="${py + 27}">›</text>`;
  out += `<text class="kv-prompt-text" x="32" y="${py + 27}">Create a track Dark Pop with 32 instruments, clean song structure, breaks and chorus.</text>`;
  const H = py + 44;
  return `<svg class="lp-kv" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="kv-title kv-desc" font-family="'JetBrains Mono', SFMono-Regular, Menlo, Consolas, monospace">
  <title id="kv-title">Illustrative CuTTI session in Logic Pro</title>
  <desc id="kv-desc">Five of the session’s 45 named tracks (Kick, Verse Snare, Lead Synth, Synth Hook and Warm Pad) laid out across Intro, Verse, Chorus, Bridge and Final Chorus, with 147 of 147 steps verified, built from the request: a Dark Pop track with 32 instruments and a clean song structure.</desc>
  ${out}
</svg>`;
};
