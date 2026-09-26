// Renders the two downloadable PDFs (capability overview, control checklist) from brand-styled HTML.
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
<div class="page">${head('Capability overview · 2026')}
<h1>SAP, Cloud and Governed AI. Engineered to Spec.</h1>
<p class="lead">SVLS LABS designs, builds and verifies S/4HANA and BTP landscapes, connects them to your cloud, and adds agentic AI with deterministic numbers and a human decision on every action. Founded 2020. 25+ years of SAP delivery experience across our key architects.</p>
<div class="stats"><div class="stat"><b>25+</b><span>years of SAP delivery experience across our key architects</span></div><div class="stat"><b>2020</b><span>founded. SVLS LABS LLP</span></div><div class="stat"><b>2</b><span>products: Value Lens (private beta) and SAP Intelligence Suite</span></div><div class="stat"><b>3</b><span>practices: SAP &amp; ERP, Cloud, Agentic &amp; Applied AI</span></div></div>
<h2>Three Practices. One Standard.</h2>
<div class="cols">
<div class="card"><span class="k">01 · SAP &amp; ERP</span><h3>Clean Core from day one</h3><p>S/4HANA Public and Private Cloud, RISE, on-premise. BTP and Integration Suite flows from a pattern library with a written contract per interface and a read-back check after every run. PS/EPPM, Tools &amp; Equipment Management, O2C, P2P, finance.</p></div>
<div class="card"><span class="k">02 · Cloud</span><h3>Cloud around the SAP core</h3><p>SAP-to-GCP/BigQuery and Salesforce integration, cloud-native services around the core, migrations and landing zones that keep the ledger intact. Every extract reconciled to SAP totals.</p></div>
<div class="card"><span class="k">03 · Agentic &amp; Applied AI</span><h3>Governed agents on SAP BTP</h3><p>MCP tool catalogs, Joule/A2A, SAP AI Core, LangGraph and RAG, under a control model where every write is read before, confirmed by a person and verified after. Applied research: Markov and stochastic models, constraint-based generation, metaheuristic optimisation, retrieval-augmented generation.</p></div>
</div>
<h2>Specify. Build. Verify. Then Ship.</h2>
<ol class="steps">
<li><b>01 Specify</b>Two weeks, fixed scope, fixed price. Landscape and architecture review, domain contracts, interface specs, policy versions. You leave with an architecture you can act on.</li>
<li><b>02 Build</b>Clean Core extensions on BTP. Integration flows from a pattern library. AI-assisted generation for repeatable objects, every artefact reviewed by a certified architect.</li>
<li><b>03 Verify</b>Automated read-back against SAP after every run. Reconciliation to SAP totals. An evidence pack your auditors and InfoSec can read.</li>
<li><b>04 Ship and run</b>Cutover, hypercare, runbooks, handover, with a named engagement lead who stays through run.</li>
</ol>
${foot('page 1 of 2')}</div>
<div class="page">${head('Products and control model')}
<h2>Value Lens (private beta)</h2>
<p><b>Where did we lose money this week that we should not have lost?</b> Value Lens is our margin leak finder for order-to-cash. It reads SAP-like sales, pricing, cost and agreement facts through read-only tools, computes margin in exact integer cents under a versioned policy, and raises evidence-backed cases a finance reviewer can accept or dismiss with a reason. Agents explain. Humans decide. SAP stays the system of record.</p>
<p class="status">Private beta on synthetic SAP-like data. Production SAP connector in development.</p>
<h2>SAP Intelligence Suite</h2>
<p>Our AI-assisted SAP engineering workbench: integration flows, ABAP and RAP artefacts and SAP functional answers from plain-English requests. Trained on your own reviewed library. Runs with local models on your infrastructure or with a hosted model of your choice; your artefacts and code stay in your landscape. Every output goes through architect review before it reaches a landscape.</p>
<p class="status">In use in SVLS LABS delivery. Available to customers on request; deployed in your landscape, reviewed by your architects.</p>
<h2>The Control Model</h2>
<div class="cols">
<div class="card"><span class="k">Read before write</span><p>The agent reads the current SAP state before it proposes anything.</p></div>
<div class="card"><span class="k">Confirm to act</span><p>A person reviews and confirms every create and update.</p></div>
<div class="card"><span class="k">Verify after</span><p>SAP is read back after every action, and the result goes into the audit trail.</p></div>
</div>
<p style="margin-top:3mm">Numbers come from deterministic code, never from the model. Every case carries its sources, its calculation and its decisions.</p>
<h2>How to Start</h2>
<p>Book a discovery call: a 45-minute call with an architect, not a salesperson. Or start with a two-week, fixed-scope, fixed-price discovery. Replies within one business day.</p>
<p><b>service@svlslabs.com · +91 8500811119 · svlslabs.com/contact/</b></p>
<p>SVLS LABS LLP, 4th Floor, Aparna Astute, Shaikpet, Door No. 8-1-299/103&amp;104/AA/4F-2, Jubilee Hills, Hyderabad 500008, Telangana, India.</p>
${foot('page 2 of 2')}</div>`;
const checklist = `
<div class="page">${head('Governed agent control checklist')}
<h1>Ten questions to ask any AI vendor before an agent touches your ERP.</h1>
<p class="lead">Hand this page to the vendor and ask which of these they implement, and how you can inspect it. "Yes" without evidence is a "no".</p>
<div class="two"><div>
<ul class="check">
<li><i class="box"></i><div><b>Read before write</b><span>Does the agent read the current SAP state before it proposes anything, and is the proposal diffed against that state?</span></div></li>
<li><i class="box"></i><div><b>Confirm to act</b><span>Does a person review and confirm every create and update, with no path that skips the reviewer?</span></div></li>
<li><i class="box"></i><div><b>Verify after</b><span>Is SAP read back after every action and compared with the intent, with the result stored?</span></div></li>
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
<p>All ten are implemented in our control model and demonstrated in Value Lens (private beta on synthetic SAP-like data; production SAP connector in development). We show the artefacts and the review log in a discovery call.</p>
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
