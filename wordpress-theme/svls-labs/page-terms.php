<?php /* Template Name: Terms of Use */ ?>
<?php get_header(); ?>
<div class="sheet-backdrop" data-menu-backdrop hidden></div>
<div class="sheet" id="mobile-sheet" hidden>
  <nav aria-label="Menu">
    <ul class="sheet__list">
      <li>
        <span class="eyebrow sheet__group-label" id="sheet-services">Services</span>
        <ul class="sheet__sub" aria-labelledby="sheet-services">
          <li><a class="sheet__link" href="/services/sap/">SAP &amp; ERP</a></li>
          <li><a class="sheet__link" href="/services/cloud/">Cloud</a></li>
          <li><a class="sheet__link" href="/services/ai/">Agentic &amp; Applied AI</a></li>
        </ul>
      </li>
      <li>
        <span class="eyebrow sheet__group-label" id="sheet-products">Products</span>
        <ul class="sheet__sub" aria-labelledby="sheet-products">
          <li><a class="sheet__link" href="/products/value-lens/">Value Lens <span class="nav-beta">Private beta</span></a></li>
          <li><a class="sheet__link" href="/products/sap-intelligence-suite/">SAP Intelligence Suite</a></li>
        </ul>
      </li>
      <li><a class="sheet__link" href="/approach/">Approach</a></li>
      <li><a class="sheet__link" href="/about/">About</a></li>
      <li><a class="sheet__link" href="/contact/">Contact</a></li>
    </ul>
    <div class="sheet__actions">
      <a class="btn btn--primary" href="/contact/?intent=discovery">Book a discovery call</a>
      <a class="btn btn--secondary" href="/products/value-lens/#beta">Request Value Lens beta access</a>
    </div>
  </nav>
  <div class="sheet__theme" role="group" aria-label="Appearance">
    <span class="sheet__theme-label" aria-hidden="true">Appearance:</span>
    <button type="button" class="chip" data-theme-choice="system" aria-pressed="true">System</button>
    <button type="button" class="chip" data-theme-choice="light" aria-pressed="false">Light</button>
    <button type="button" class="chip" data-theme-choice="dark" aria-pressed="false">Dark</button>
  </div>
</div>
<main id="main">

  <!-- 01 Hero (white, no grid) -->
  <section class="hero hero--plain hero--legal" aria-labelledby="hero-title">
    <div class="hero-art hero-art--lite" aria-hidden="true">
      <svg class="hero-art__mark" viewBox="0 0 64 64" focusable="false">
        <path d="M4 24V4h20v4H8v16z" fill="currentColor"/>
        <circle cx="32" cy="32" r="13.5" fill="none" stroke="currentColor" stroke-width="5"/>
        <path d="M60 40v20H40v-4h16V40z" fill="var(--svls-accent, #E4432B)"/>
      </svg>
    </div>
    <div class="container">
      <div class="section-mark"><span class="numeral">01</span><p class="eyebrow">Legal</p></div>
      <div class="grid hero__grid">
        <div class="hero__copy col-8">
          <h1 id="hero-title">Terms of Use</h1>
          <p class="lead">Terms of use for svlslabs.com and a note on Value Lens private beta terms.</p>
          <p class="small muted legal__updated">Last updated: <span class="todo">TODO</span> (client)</p>
        </div>
        <ul class="microlabels hero__rows-a">
          <li>Legal entity · <span class="keep-case">SVLS Labs LLP</span></li>
          <li>Site · <span class="keep-case">svlslabs.com</span></li>
          <li>Status · Template for legal review</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- 02 Sections (columns 1-7) and the review notice (9-12) -->
  <section class="section legal-body" id="sections" aria-labelledby="sections-title">
    <div class="container">
      <div class="section-mark mb-6"><span class="numeral">02</span><p class="eyebrow" id="sections-title">Terms of use · 5 sections</p></div>
      <div class="grid legal__grid">
        <div class="col-7 prose legal__sections" data-reveal>
          <section class="legal__section" aria-labelledby="t-use">
            <span class="numeral">01</span>
            <h2 class="h3" id="t-use">Use of the Site</h2>
            <p>svlslabs.com is published by SVLS Labs LLP for information about our services and products.</p>
            <p class="legal__todo"><span class="todo">TODO</span> (client): counsel to complete this section.</p>
          </section>
          <section class="legal__section" aria-labelledby="t-beta">
            <span class="numeral">02</span>
            <h2 class="h3" id="t-beta">Value Lens Beta Terms</h2>
            <p>Value Lens (private beta) beta terms are agreed per organisation and are not granted by this site.</p>
            <p class="status">Private beta on synthetic SAP-like data. Production SAP connector in development.</p>
            <p class="legal__todo"><span class="todo">TODO</span> (client): counsel to confirm the beta terms reference.</p>
          </section>
          <section class="legal__section" aria-labelledby="t-warranty">
            <span class="numeral">03</span>
            <h2 class="h3" id="t-warranty">No Warranty on Informational Content</h2>
            <p>The content of this site is informational and is provided without warranty.</p>
            <p class="legal__todo"><span class="todo">TODO</span> (client): counsel to complete this section.</p>
          </section>
          <section class="legal__section" aria-labelledby="t-law">
            <span class="numeral">04</span>
            <h2 class="h3" id="t-law">Governing Law</h2>
            <p>Governing law and jurisdiction: <span class="todo">TODO</span> (client).</p>
            <p class="legal__todo"><span class="todo">TODO</span> (client): counsel to state the governing law and jurisdiction.</p>
          </section>
          <section class="legal__section" aria-labelledby="t-contact">
            <span class="numeral">05</span>
            <h2 class="h3" id="t-contact">Contact</h2>
            <p>Questions about these terms: <a href="mailto:hello@svlslabs.com">hello@svlslabs.com</a> (placeholder), or the <a href="/contact/">contact form</a>.</p>
            <p class="legal__todo"><span class="todo">TODO</span> (client): confirm the mailbox and add the postal address.</p>
          </section>
        </div>
        <aside class="col-4 col-start-9 legal-aside" aria-label="About this page">
          <div class="notice">
            <p class="eyebrow">Template for legal review</p>
            <p>The five sections above are the headings the client's counsel completes. Each carries a <span class="todo">TODO</span> (client) label until it is done.</p>
            <p>Nothing on this page has been reviewed by counsel yet.</p>
          </div>
          <div class="legal-aside__block">
            <p class="eyebrow">Related</p>
            <ul class="legal-aside__links" role="list">
              <li><a class="arrow-link" href="/privacy/">Privacy policy<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a></li>
              <li><a class="arrow-link" href="/products/value-lens/#beta">Request Value Lens beta access<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a></li>
              <li><a class="arrow-link" href="/contact/">Contact<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </section>

</main>
<?php get_footer(); ?>
