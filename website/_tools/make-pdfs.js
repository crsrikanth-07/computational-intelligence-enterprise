// Renders the two downloadable PDFs (company overview, control checklist) from brand-styled HTML.
const path = require('path'); const fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const OUT = path.resolve(__dirname, '../assets/downloads');
const FONT = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap';
const mark = (s, ink, acc) => `<svg viewBox="0 0 64 64" width="${s}" height="${s}"><path d="M4 24V4h20v4H8v16z" fill="${ink}"/><circle cx="32" cy="32" r="13.5" fill="none" stroke="${ink}" stroke-width="5"/><path d="M60 40v20H40v-4h16V40z" fill="${acc}"/></svg>`;
const CSS = `
@page { size: A4; margin: 0; }
html,body{margin:0;font-family:Inter,'Helvetica Neue',Arial,sans-serif;color:#101418;font-size:11pt;line-height:1.5}
.page{width:210mm;min-height:297mm;box-sizing:border-box;padding:18mm 18mm 16mm;page-break-after:always;position:relative}
.page:last-child{page-break-after:auto}
.top{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #D9DDE3;padding-bottom:6mm;margin-bottom:8mm}
.lock{display:flex;align-items:center;gap:10px;font:800 20pt/1 'Inter Tight',Inter,sans-serif;letter-spacing:-.01em}
.eyebrow{font:500 8.5pt/1 'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:#4B5563}
h1{font:800 26pt/1.1 'Inter Tight',Inter,sans-serif;letter-spacing:-.015em;margin:0 0 3mm}
h2{font:700 13.5pt/1.2 'Inter Tight',Inter,sans-serif;letter-spacing:-.01em;margin:7mm 0 2.5mm;padding-top:3mm;border-top:1px solid #D9DDE3}
h2:first-of-type{border-top:0;padding-top:0;margin-top:0}
p{margin:0 0 2.5mm}
.lead{font-size:12pt;color:#4B5563;max-width:150mm}
.cols{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5mm}
.card{border:1px solid #D9DDE3;border-radius:4px;padding:4mm 4.5mm}
.card h3{font:700 11pt/1.25 'Inter Tight',Inter,sans-serif;margin:0 0 1.5mm}
.card p{font-size:9.5pt;margin:0}
.k{font:500 8pt/1 'JetBrains Mono',monospace;letter-spacing:.1em;text-transform:uppercase;color:#C8351F;display:block;margin-bottom:2mm}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:5mm}
.stat{border-top:2px solid #E4432B;padding-top:2.5mm}
.stat b{display:block;font:800 22pt/1 'Inter Tight',Inter,sans-serif;letter-spacing:-.02em}
.stat span{font-size:9pt;color:#4B5563}
ol.steps{margin:0;padding-left:0;list-style:none;display:grid;grid-template-columns:repeat(4,1fr);gap:5mm}
ol.steps li{border-top:1px solid #D9DDE3;padding-top:2.5mm;font-size:9.5pt}
ol.steps li b{display:block;font:700 10.5pt/1.2 'Inter Tight',Inter,sans-serif;margin-bottom:1mm}
.status{font-size:9pt;color:#4B5563;border-left:3px solid #B7791F;padding-left:3mm}
.foot{position:absolute;left:18mm;right:18mm;bottom:10mm;display:flex;justify-content:space-between;font:500 8pt/1 'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:#4B5563;border-top:1px solid #D9DDE3;padding-top:3mm}
.check{list-style:none;padding:0;margin:0}
.check li{display:grid;grid-template-columns:8mm 1fr;gap:3mm;padding:3mm 0;border-top:1px solid #D9DDE3;font-size:10pt}
.check li:first-child{border-top:0}
.box{width:5.5mm;height:5.5mm;border:1.5px solid #101418;border-radius:2px;margin-top:1mm}
.check b{display:block;font:700 10.5pt/1.25 'Inter Tight',Inter,sans-serif}
.check span{color:#4B5563;font-size:9.5pt}
.two{display:grid;grid-template-columns:1fr 1fr;gap:8mm}
`;
const head = (t) => `<div class="top"><div class="lock">${mark(34,'#101418','#E4432B')}<span>SVLS LABS</span></div><div class="eyebrow">${t}</div></div>`;
const foot = (p) => `<div class="foot"><span>SVLS LABS LLP · Hyderabad, India · service@svlslabs.com · +91 8500811119</span><span>svlslabs.com · ${p}</span></div>`;
const overview = `
<div class="page">${head('Company overview · 2026')}
<h1>Innovative Software for Enterprise and Entertainment.</h1>
<p class="lead">SVLS LABS builds software that does the groundwork and shows its work. Two portfolios, Enterprise Software and Entertainment &amp; Media, and two flagship products: CuTTI and Value Lens. Founded 2020.</p>
<div class="stats"><div class="stat"><b>2020</b><span>founded. SVLS LABS LLP</span></div><div class="stat"><b>2</b><span>portfolios: Enterprise Software and Entertainment &amp; Media</span></div><div class="stat"><b>2</b><span>flagship products: CuTTI and Value Lens</span></div><div class="stat"><b>25+</b><span>years of ERP delivery experience across our key architects</span></div></div>
<h2>Two Flagship Products</h2>
<div class="two">
<div class="card"><span class="k">Flagship · Entertainment &amp; Media</span><h3>CuTTI</h3><p>One request, a full producer session in Logic Pro. Describe the track; CuTTI builds a real, editable session with Logic's own instruments, checks every step, then mixes and masters it to −14 LUFS. Every track, region and note stays yours to edit.</p><p class="status" style="margin-top:2.5mm">Available to purchase from 1 January 2027. Early access is open: svlslabs.com/products/cutti/</p></div>
<div class="card"><span class="k">Flagship · Enterprise Software</span><h3>Value Lens</h3><p>Where did we lose money this week that we should not have lost? Value Lens finds margin leakage in ERP order-to-cash. Read-only tools, margin in exact integer cents under a versioned policy, and evidence-backed cases a finance reviewer accepts or dismisses with a reason.</p><p class="status" style="margin-top:2.5mm">Private beta on synthetic ERP-like data. Production ERP connector in development.</p></div>
</div>
<h2>Enterprise Software</h2>
<div class="cols">
<div class="card"><span class="k">01 · ERP</span><h3>Clean core from the first transport</h3><p>ERP programmes, integration and extensions from a pattern library, with a written contract per interface and a read-back check after every run.</p></div>
<div class="card"><span class="k">02 · Cloud</span><h3>Cloud around the core</h3><p>ERP-to-cloud integration, cloud-native services, migrations and landing zones that keep the ledger intact. Every extract reconciled to source totals.</p></div>
<div class="card"><span class="k">03 · Agentic &amp; Applied AI</span><h3>Governed agents</h3><p>MCP tool catalogs, LangGraph and RAG under a control model where every write is read before, confirmed by a person and verified after. Applied research in Markov and stochastic models, constraint-based generation and optimisation.</p></div>
</div>
${foot('page 1 of 2')}</div>
<div class="page">${head('Entertainment &amp; Media · How we build')}
<h2>Entertainment &amp; Media</h2>
<div class="cols">
<div class="card"><span class="k">Original Music</span><h3>Composed and produced in-house</h3><p>Songs and scores across pop, cinematic and Indian traditions, produced with the same care we put into software.</p></div>
<div class="card"><span class="k">Published Fiction</span><h3>Five titles in 2026</h3><p>Novels and story collections, written in-house: svlslabs.com/media/#books</p></div>
<div class="card"><span class="k">Creative Tools</span><h3>Software we wished we had</h3><p>CuTTI first, and CuTTI Score, now in free beta, for turning printed music into playable, editable scores. Tools that do the groundwork so makers can spend their time on the work.</p></div>
</div>
<h2>How We Build</h2>
<ol class="steps">
<li><b>01 Specify</b>We write down what done looks like before we build: contracts, policies and acceptance checks.</li>
<li><b>02 Build</b>Deterministic code for every number, AI where it helps, and a person reviewing what reaches you.</li>
<li><b>03 Verify</b>Every step is read back and checked. When something cannot be verified, we say so.</li>
<li><b>04 Hand over</b>What we deliver is yours to edit, own and extend, with the evidence attached.</li>
</ol>
<h2>The Control Model</h2>
<div class="cols">
<div class="card"><span class="k">Read before write</span><p>Software reads the current state before it proposes anything.</p></div>
<div class="card"><span class="k">Confirm to act</span><p>A person reviews and confirms every create and update.</p></div>
<div class="card"><span class="k">Verify after</span><p>The result is read back after every action and goes into the audit trail.</p></div>
</div>
<h2>How to Start</h2>
<p>Join CuTTI early access, request Value Lens beta access, or book a 45-minute discovery call with an architect. Replies within one business day.</p>
<p><b>service@svlslabs.com · +91 8500811119 · svlslabs.com/contact/</b></p>
<p>SVLS LABS LLP, 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&amp;104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India.</p>
${foot('page 2 of 2')}</div>`;
const checklist = `
<div class="page">${head('Governed agent control checklist')}
<h1>Ten questions to ask any AI vendor before an agent touches your ERP.</h1>
<p class="lead">Hand this page to the vendor and ask which of these they implement, and how you can inspect it. "Yes" without evidence is a "no".</p>
<div class="two"><div>
<ul class="check">
<li><i class="box"></i><div><b>Read before write</b><span>Does the agent read the current ERP state before it proposes anything, and is the proposal diffed against that state?</span></div></li>
<li><i class="box"></i><div><b>Confirm to act</b><span>Does a person review and confirm every create and update, with no path that skips the reviewer?</span></div></li>
<li><i class="box"></i><div><b>Verify after</b><span>Is the ERP read back after every action and compared with the intent, with the result stored?</span></div></li>
<li><i class="box"></i><div><b>Deterministic numbers</b><span>Do all financial figures come from versioned code rather than from the language model?</span></div></li>
<li><i class="box"></i><div><b>Bounded tools</b><span>Is the tool catalogue read-only by default, named and bounded, with no generic query or raw table access?</span></div></li>
</ul></div><div>
<ul class="check">
<li><i class="box"></i><div><b>Audit trail per case</b><span>Can every case be rebuilt from its sources, calculation snapshot, hypotheses, decisions and timestamps?</span></div></li>
<li><i class="box"></i><div><b>Explicit gaps</b><span>Does missing data stay visibly missing instead of becoming a zero or an empty success?</span></div></li>
<li><i class="box"></i><div><b>Untrusted text</b><span>Are documents and source comments treated as untrusted input, with scope and tool limits enforced outside the prompt?</span></div></li>
<li><i class="box"></i><div><b>Credentials server-side</b><span>Do model credentials stay out of the browser, prompts, errors and audit records?</span></div></li>
<li><i class="box"></i><div><b>Evidence pack</b><span>Can InfoSec and internal audit receive tool policies, sample audit trails and read-back results before go-live?</span></div></li>
</ul></div></div>
<h2>How SVLS LABS answers</h2>
<p>All ten are implemented in our control model and demonstrated in Value Lens (private beta on synthetic ERP-like data; production ERP connector in development). We show the artefacts and the review log in a discovery call.</p>
<p><b>Book a discovery call: svlslabs.com/contact/ · service@svlslabs.com · +91 8500811119</b></p>
${foot('page 1 of 1')}</div>`;
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const [name, html] of [['svls-labs-capability-overview.pdf', overview], ['governed-agent-control-checklist.pdf', checklist]]) {
    const page = await browser.newPage();
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONT}"><style>${CSS}</style></head><body>${html}</body></html>`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
    await page.pdf({ path: path.join(OUT, name), format: 'A4', printBackground: true, preferCSSPageSize: true });
    await page.close(); console.log('wrote', name);
  }
  await browser.close();
})();
