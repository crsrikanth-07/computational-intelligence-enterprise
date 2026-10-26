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
ol.steps.steps5{grid-template-columns:repeat(5,1fr);gap:4mm}
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
<h1>Architecture for Complex Enterprise Systems.</h1>
<p class="lead">SVLS LABS is a vendor-neutral enterprise architecture and software engineering company. We help organisations modernise ERP, integration, cloud and AI landscapes through future-state architecture, governed engineering and purpose-built enterprise software. Founded 2020.</p>
<div class="stats"><div class="stat"><b>2020</b><span>founded. SVLS LABS LLP</span></div><div class="stat"><b>25+</b><span>years of ERP delivery experience across our key architects</span></div><div class="stat"><b>1</b><span>written contract per interface, before code</span></div><div class="stat"><b>2 wks</b><span>focused architecture assessment, fixed scope and price</span></div></div>
<h2>Six Practices. One Architecture Standard.</h2>
<div class="cols">
<div class="card"><span class="k">01 · Enterprise Architecture</span><h3>Future state you can execute</h3><p>Future-state architecture, technology roadmaps, application portfolio rationalisation, platform architecture, governance and technical due diligence.</p></div>
<div class="card"><span class="k">02 · ERP Modernisation</span><h3>Modernise the core, keep control</h3><p>Modernisation strategy, legacy and custom-code modernisation, extension rationalisation, upgrade-risk assessment and cloud transition. Clean core by default.</p></div>
<div class="card"><span class="k">03 · Integration and Cloud</span><h3>Integration you can trust</h3><p>API and event-driven architecture, hybrid and legacy integration, cross-system orchestration, integration governance and cloud architecture.</p></div>
<div class="card"><span class="k">04 · AI and Agentic Architecture</span><h3>Agents through governed interfaces</h3><p>Enterprise agent architecture, tool and API governance, human-in-the-loop design, deterministic validation, execution governance and audit.</p></div>
<div class="card"><span class="k">05 · Software Engineering</span><h3>Where standard platforms stop</h3><p>Purpose-built applications, workflow and integration products, decision-support software, internal platforms, modern APIs and cloud-native services.</p></div>
<div class="card"><span class="k">06 · Architecture Assessment</span><h3>The fixed-scope way to start</h3><p>Current-state architecture, risk register, future-state architecture, modernisation roadmap, priority initiatives and an implementation plan.</p></div>
</div>
<p style="margin-top:5mm">We work above individual platforms: ERP, CRM, cloud and data platforms, legacy applications, middleware, custom software, AI agents, APIs and event platforms.</p>
${foot('page 1 of 2')}</div>
<div class="page">${head('Approach, governance and products')}
<h2>Discover. Architect. Engineer. Govern. Evolve.</h2>
<ol class="steps steps5">
<li><b>01 Discover</b>Map systems, workflows, interfaces, dependencies and constraints.</li>
<li><b>02 Architect</b>Define the future-state architecture and the transition path.</li>
<li><b>03 Engineer</b>Build integrations, services, applications and controls.</li>
<li><b>04 Govern</b>Put security, validation, evidence and operational controls in place.</li>
<li><b>05 Evolve</b>Keep the landscape coherent as business and technology change.</li>
</ol>
<h2>Enterprise AI Should Not Bypass Architecture</h2>
<div class="cols">
<div class="card"><span class="k">Governed interfaces</span><p>Agents reach systems through defined tools and APIs with scopes and limits.</p></div>
<div class="card"><span class="k">Deterministic numbers</span><p>Business calculations in versioned, tested code. The model explains; it does not compute.</p></div>
<div class="card"><span class="k">Validate, approve, verify</span><p>Checks before execution, approval by risk, independent read-back afterwards, evidence per action.</p></div>
</div>
<h2>Products from Recurring Problems</h2>
<p><b>Value Lens (private beta).</b> Decision support and financial controls over ERP data. Read-only tools, deterministic computation under versioned policies, and evidence-backed cases a reviewer accepts or dismisses. First use case: margin leakage in order-to-cash.</p>
<p class="status">Private beta on synthetic ERP-like data. Production ERP connector in development.</p>
<h2>How to Start</h2>
<p>Start with an Architecture Assessment, or book a discovery call with an architect. NDA before discovery. Replies within one business day.</p>
<p><b>service@svlslabs.com · +91 8500811119 · svlslabs.com/services/assessment/</b></p>
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
