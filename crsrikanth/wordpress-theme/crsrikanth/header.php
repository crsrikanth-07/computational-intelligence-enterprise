<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<?php crs_page_head(); ?>
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap site-header__in">
    <a class="brand" href="/" aria-label="CR Srikanth, home"><svg class="" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M50.4 16.6A24 24 0 1 0 50.4 47.4" fill="none" stroke="currentColor" stroke-width="3"/><g stroke="currentColor" stroke-width="1.4" opacity=".75"><path d="M15 24h31M13 28h33M12 32h34M13 36h33M15 40h31"/></g><ellipse cx="53" cy="32" rx="4.4" ry="3.2" transform="rotate(-24 53 32)" fill="#D2B26F"/></svg><span class="brand__name">CR SRIKANTH</span></a>
    <nav class="nav" aria-label="Primary">
      <ul>
        <li><a href="/"<?php crs_current( '/' ); ?>>Home</a></li>
        <li><a href="/music/"<?php crs_current( '/music/' ); ?>>Music</a></li>
        <li><a href="/books/"<?php crs_current( '/books/' ); ?>>Books &amp; Stories</a></li>
        <li><a href="/innovations/"<?php crs_current( '/innovations/' ); ?>>Innovations</a></li>
        <li><a href="/recognition/"<?php crs_current( '/recognition/' ); ?>>Recognition</a></li>
        <li><a href="/about/"<?php crs_current( '/about/' ); ?>>About</a></li>
        <li><a href="/contact/"<?php crs_current( '/contact/' ); ?>>Contact</a></li>
      </ul>
    </nav>
    <button class="menu-btn" type="button" data-menu aria-expanded="false" aria-controls="menu-sheet"><span class="bars" aria-hidden="true"></span>Menu</button>
  </div>
</header>
<div class="sheet" id="menu-sheet" hidden>
  <nav aria-label="Menu">
    <ul>
      <li><a href="/"<?php crs_current( '/' ); ?>>Home<small>01</small></a></li>
      <li><a href="/music/"<?php crs_current( '/music/' ); ?>>Music<small>02</small></a></li>
      <li><a href="/books/"<?php crs_current( '/books/' ); ?>>Books &amp; Stories<small>03</small></a></li>
      <li><a href="/innovations/"<?php crs_current( '/innovations/' ); ?>>Innovations<small>04</small></a></li>
      <li><a href="/recognition/"<?php crs_current( '/recognition/' ); ?>>Recognition<small>05</small></a></li>
      <li><a href="/about/"<?php crs_current( '/about/' ); ?>>About<small>06</small></a></li>
      <li><a href="/contact/"<?php crs_current( '/contact/' ); ?>>Contact<small>07</small></a></li>
    </ul>
  </nav>
</div>
