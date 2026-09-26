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
<main id="main" class="band-dark">

  <!-- 404: dark full page, grid texture, mark at 96px reversed -->
  <section class="section has-grid nf" aria-labelledby="nf-title">
    <div class="hero-art hero-art--lite" aria-hidden="true">
      <svg class="hero-art__mark" viewBox="0 0 64 64" focusable="false">
        <path d="M4 24V4h20v4H8v16z" fill="currentColor"/>
        <circle cx="32" cy="32" r="13.5" fill="none" stroke="currentColor" stroke-width="5"/>
        <path d="M60 40v20H40v-4h16V40z" fill="var(--svls-accent, #E4432B)"/>
      </svg>
    </div>
    <div class="container">
      <div class="section-mark"><span class="numeral">404</span><p class="eyebrow">Page not found</p></div>
      <svg class="nf__mark" viewBox="0 0 64 64" role="img" aria-labelledby="nf-mark-title" focusable="false">
        <title id="nf-mark-title">SVLS LABS</title>
        <path d="M4 24V4h20v4H8v16z" fill="currentColor"/>
        <circle cx="32" cy="32" r="13.5" fill="none" stroke="currentColor" stroke-width="5"/>
        <path d="M60 40v20H40v-4h16V40z" fill="var(--svls-accent, #E4432B)"/>
      </svg>
      <h1 id="nf-title">Nothing Here Has Been Measured.</h1>
      <p class="lead">The page you asked for does not exist, or has moved. These do:</p>
      <nav aria-label="Pages that exist">
        <ul class="hgrid hgrid--3 hgrid--bottom nf__links" role="list">
          <li>
            <a class="nf__link" href="/services/sap/">SAP &amp; ERP<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a>
            <span class="nf__desc">S/4HANA, RISE, BTP, Integration Suite, Clean Core</span>
          </li>
          <li>
            <a class="nf__link" href="/services/cloud/">Cloud<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a>
            <span class="nf__desc">SAP-to-cloud integration, migrations, cloud-native engineering</span>
          </li>
          <li>
            <a class="nf__link" href="/services/ai/">Agentic &amp; Applied AI<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a>
            <span class="nf__desc">Governed agents on SAP BTP, applied AI methods, AI-assisted engineering</span>
          </li>
          <li>
            <a class="nf__link" href="/products/value-lens/">Value Lens (private beta)<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a>
            <span class="nf__desc">Private beta on synthetic SAP-like data. Production SAP connector in development.</span>
          </li>
          <li>
            <a class="nf__link" href="/approach/">Approach<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a>
            <span class="nf__desc">Governed Delivery: four gates, artefacts per gate, Clean Core by default</span>
          </li>
          <li>
            <a class="nf__link" href="/contact/">Contact<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a>
            <span class="nf__desc">Talk to an architect. Replies within one business day.</span>
          </li>
        </ul>
      </nav>
      <div class="btn-row">
        <a class="btn btn--primary" href="/">Back to the homepage</a>
      </div>
    </div>
  </section>

</main>
<?php get_footer(); ?>
