<?php /* Template Name: Contact SVLS LABS */ ?>
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
      <li><a class="sheet__link" href="/contact/" aria-current="page">Contact</a></li>
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

  <!-- 01 Hero -->
  <section class="hero has-grid hero--plain" aria-labelledby="hero-title">
    <div class="hero-art hero-art--lite" aria-hidden="true">
      <svg class="hero-art__mark" viewBox="0 0 64 64" focusable="false">
        <path d="M4 24V4h20v4H8v16z" fill="currentColor"/>
        <circle cx="32" cy="32" r="13.5" fill="none" stroke="currentColor" stroke-width="5"/>
        <path d="M60 40v20H40v-4h16V40z" fill="var(--svls-accent, #E4432B)"/>
      </svg>
    </div>
    <div class="container">
      <div class="section-mark"><span class="numeral">01</span><p class="eyebrow">Contact</p></div>
      <div class="grid hero__grid">
        <div class="hero__copy col-8">
          <h1 id="hero-title">Talk to an Architect.</h1>
          <p class="lead">Tell us what you are working on. An architect, not a salesperson, replies within one business day with two or three slots or a written answer.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Form (columns 1-7) and the right column (8-12) -->
  <section class="section contact" id="form" aria-labelledby="form-title">
    <div class="container">
      <div class="section-mark"><span class="numeral">02</span><h2 class="eyebrow" id="form-title">Write to Us</h2></div>
      <div class="grid contact__grid">
        <div class="col-7 contact__form" data-reveal>
          <form class="form" method="POST" action="https://formspree.io/f/TODO_FORM_ID" data-netlify="true" name="contact" aria-labelledby="hero-title" data-enhance data-success="Thank you. We reply within one business day. If it is urgent, email hello@svlslabs.com (TODO client)." data-subject="Contact enquiry">
            <input type="hidden" name="form-name" value="contact">
            <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" hidden>
            <div class="form__row">
              <div class="field">
                <label class="field__label" for="c-name">Name</label>
                <input class="input" id="c-name" name="name" type="text" autocomplete="name" required>
              </div>
              <div class="field">
                <label class="field__label" for="c-email">Work email</label>
                <input class="input" id="c-email" name="email" type="email" autocomplete="email" required>
              </div>
            </div>
            <div class="field">
              <label class="field__label" for="c-company">Company</label>
              <input class="input" id="c-company" name="company" type="text" autocomplete="organization" required>
            </div>
            <div class="field">
              <label class="field__label" for="c-intent">I am contacting you about</label>
              <div class="select">
                <select class="input" id="c-intent" name="intent" required>
                  <option value="discovery">Discovery call</option>
                  <option value="sap">Discovery call: SAP &amp; ERP</option>
                  <option value="cloud">Discovery call: Cloud</option>
                  <option value="ai">AI readiness call: Agentic &amp; Applied AI</option>
                  <option value="beta">Value Lens beta access</option>
                  <option value="demo">Value Lens demo</option>
                  <option value="suite-demo">SAP Intelligence Suite demo</option>
                  <option value="partnership">Partnership: SAP partner capacity</option>
                  <option value="overview">Capability overview PDF</option>
                  <option value="checklist">Governed Agent Control Checklist</option>
                  <option value="checklist-cleancore">Clean Core integration checklist</option>
                  <option value="other">Something else</option>
                </select>
                <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M1 4l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
              </div>
            </div>
            <fieldset class="fieldset" data-show-when="intent=beta demo">
              <legend>Your role</legend>
              <div class="choices">
                <label class="choice"><input type="radio" name="role" value="finance" data-required><span>Finance</span></label>
                <label class="choice"><input type="radio" name="role" value="sap" data-required><span>SAP</span></label>
                <label class="choice"><input type="radio" name="role" value="it" data-required><span>IT</span></label>
                <label class="choice"><input type="radio" name="role" value="other" data-required><span>Other</span></label>
              </div>
            </fieldset>
            <div class="field">
              <label class="field__label" for="c-message">Message <span class="opt">(optional)</span></label>
              <textarea class="input" id="c-message" name="message" rows="5" placeholder="Landscape, timeline, what good looks like"></textarea>
            </div>
            <div class="form__choices">
              <label class="choice"><input type="checkbox" name="offer" value="two-week"><span>Start with the two-week discovery (fixed scope, fixed price).</span></label>
              <label class="choice"><input type="checkbox" name="notify" value="yes"><span>Notify me when Value Lens leaves beta.</span></label>
            </div>
            <button class="btn btn--primary" type="submit">Send</button>
            <p class="form__privacy">We use your details only to reply to you. See <a href="/privacy/">Privacy</a>.</p>
          </form>
        </div>

        <aside class="col-5 contact__aside aside-rule" aria-label="What happens next, offices and products">
          <div class="contact__block">
            <h3>What happens next</h3>
            <ol class="list-numbered" role="list">
              <li><span class="numeral">01</span><span>We read it the same day.</span></li>
              <li><span class="numeral">02</span><span>An architect replies within one business day.</span></li>
              <li><span class="numeral">03</span><span>A 45-minute call, no deck required.</span></li>
              <li><span class="numeral">04</span><span>If it fits, a two-week discovery proposal with a fixed price.</span></li>
            </ol>
            <p class="contact__link"><a class="arrow-link" href="/approach/">How we run engagements<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a></p>
          </div>

          <div class="contact__block">
            <h3>Offices</h3>
            <dl class="offices">
              <div class="offices__row">
                <dt class="mono-title">SVLS Labs LLP</dt>
                <dd>4th Floor, Aparna Astute<br>Shaikpet, Door No. 8-1-299/103&amp;104/AA/4F-2<br>Jubilee Hills, Hyderabad 500008<br>Telangana, India<br><span class="todo">TODO</span>: phone.</dd>
              </div>
              <div class="offices__row">
                <dt class="mono-title">Email</dt>
                <dd><a class="link" href="mailto:hello@svlslabs.com">hello@svlslabs.com</a>. <span class="todo">TODO</span> (client): confirm mailbox.</dd>
              </div>
              <div class="offices__row">
                <dt class="mono-title">LinkedIn</dt>
                <dd><a class="link" href="https://www.linkedin.com/company/14559452/" target="_blank" rel="noopener">SVLS LABS company page<span class="visually-hidden"> (opens in a new tab)</span></a></dd>
              </div>
            </dl>
          </div>

          <div class="contact__block">
            <h3>For SAP partners</h3>
            <p class="contact__body">Select Partnership above. NDA-friendly, fixed-scope options.</p>
            <p class="mono-note">NDA-friendly · Fixed-scope options</p>
          </div>

          <div class="contact__block">
            <p class="eyebrow">Products</p>
            <ul class="contact__products" role="list">
              <li><a class="arrow-link" href="/products/value-lens/">Value Lens (private beta)<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a></li>
              <li><a class="arrow-link" href="/products/value-lens/#beta">Request beta access<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a></li>
              <li><a class="arrow-link" href="/products/sap-intelligence-suite/">SAP Intelligence Suite<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a></li>
              <li><a class="arrow-link" href="/contact/?intent=suite-demo">Request a Suite demo<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a></li>
            </ul>
            <p class="status">Value Lens: private beta on synthetic SAP-like data. Production SAP connector in development.</p>
            <p class="status">SAP Intelligence Suite: in use in SVLS LABS delivery. Available to customers on request; deployed in your landscape, reviewed by your architects.</p>
          </div>
        </aside>
      </div>
    </div>
  </section>

</main>
<?php get_footer(); ?>
