<!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js">
<head>
<?php svls_page_head(); ?>
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container site-header__inner">
    <a href="/" class="brand" aria-label="SVLS LABS home">
      <svg class="brand__lockup" viewBox="0 0 316 64" aria-hidden="true" focusable="false">
        <path d="M4 24V4h20v4H8v16z" fill="currentColor"/>
        <circle cx="32" cy="32" r="13.5" fill="none" stroke="currentColor" stroke-width="5"/>
        <path d="M60 40v20H40v-4h16V40z" fill="var(--svls-accent, #E4432B)"/>
        <text x="80" y="60" fill="currentColor" font-family="'Inter Tight', Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="44" font-weight="700" letter-spacing="-0.44">SVLS LABS</text>
      </svg>
      <svg class="brand__mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <path d="M4 24V4h20v4H8v16z" fill="currentColor"/>
        <circle cx="32" cy="32" r="13.5" fill="none" stroke="currentColor" stroke-width="5"/>
        <path d="M60 40v20H40v-4h16V40z" fill="var(--svls-accent, #E4432B)"/>
      </svg>
    </a>
    <nav class="site-nav" aria-label="Primary">
      <ul class="site-nav__list">
        <li class="site-nav__item has-dropdown">
          <button class="site-nav__link site-nav__trigger" type="button" aria-expanded="false" aria-controls="services-menu">Services<svg class="site-nav__chevron" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M1 3.5l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button>
          <ul class="dropdown" id="services-menu">
            <li><a href="/services/sap/"<?php svls_current( '/services/sap/' ); ?>><span class="dropdown__title">SAP &amp; ERP</span><span class="dropdown__desc">S/4HANA, RISE, BTP, Integration Suite, Clean Core</span></a></li>
            <li><a href="/services/cloud/"<?php svls_current( '/services/cloud/' ); ?>><span class="dropdown__title">Cloud</span><span class="dropdown__desc">SAP-to-cloud integration, migrations, cloud-native engineering</span></a></li>
            <li><a href="/services/ai/"<?php svls_current( '/services/ai/' ); ?>><span class="dropdown__title">Agentic &amp; Applied AI</span><span class="dropdown__desc">Governed agents on SAP BTP, applied AI methods, AI-assisted engineering</span></a></li>
          </ul>
        </li>
        <li class="site-nav__item has-dropdown">
          <button class="site-nav__link site-nav__trigger" type="button" aria-expanded="false" aria-controls="products-menu">Products<svg class="site-nav__chevron" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M1 3.5l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button>
          <ul class="dropdown" id="products-menu">
            <li><a href="/products/value-lens/"<?php svls_current( '/products/value-lens/' ); ?>><span class="dropdown__title">Value Lens <span class="nav-beta">Private beta</span></span><span class="dropdown__desc">Margin leak finder for order-to-cash. Private beta.</span></a></li>
            <li><a href="/products/sap-intelligence-suite/"<?php svls_current( '/products/sap-intelligence-suite/' ); ?>><span class="dropdown__title">SAP Intelligence Suite</span><span class="dropdown__desc">AI-assisted SAP engineering workbench.</span></a></li>
          </ul>
        </li>
        <li class="site-nav__item"><a class="site-nav__link" href="/approach/"<?php svls_current( '/approach/' ); ?>>Approach</a></li>
        <li class="site-nav__item"><a class="site-nav__link" href="/about/"<?php svls_current( '/about/' ); ?>>About</a></li>
        <li class="site-nav__item"><a class="site-nav__link" href="/contact/"<?php svls_current( '/contact/' ); ?>>Contact</a></li>
      </ul>
    </nav>
    <div class="site-header__actions">
      <a class="btn btn--primary btn--nav" href="/contact/?intent=discovery">Book a discovery call</a>
      <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch to dark theme">
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 3.5a6.5 6.5 0 0 1 0 13z" fill="currentColor"/></svg>
      </button>
      <a class="menu-btn" href="#site-nav" data-menu-toggle><span class="menu-btn__label">Menu</span><svg class="menu-btn__lines" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M0 2.5h16M0 8h16M0 13.5h16" fill="none" stroke="currentColor" stroke-width="1.5"/></svg><svg class="menu-btn__close" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 2l12 12M14 2L2 14" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></a>
    </div>
  </div>
</header>
