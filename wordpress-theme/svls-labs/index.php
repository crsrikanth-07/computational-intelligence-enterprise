<?php get_header(); ?>
<main id="main">
  <section class="hero hero--plain" aria-labelledby="hero-title">
    <div class="hero-art hero-art--lite" aria-hidden="true"></div>
    <div class="container">
      <div class="hero__copy">
        <h1 id="hero-title"><?php echo esc_html( is_singular() ? get_the_title() : wp_get_document_title() ); ?></h1>
        <?php $svls_hub = is_page() ? svls_hub( get_post_field( 'post_name' ) ) : null; if ( $svls_hub ) : ?>
        <p class="lead"><?php echo esc_html( $svls_hub['lead'] ); ?></p>
        <?php endif; ?>
      </div>
    </div>
  </section>
  <?php if ( $svls_hub ) : ?>
  <section class="section" aria-label="<?php echo esc_attr( $svls_hub['label'] ); ?>">
    <div class="container">
      <div class="hgrid hgrid--<?php echo 2 === count( $svls_hub['items'] ) ? '2' : '3'; ?> hgrid--bottom">
        <?php foreach ( $svls_hub['items'] as $i => $item ) : ?>
        <article class="practice">
          <span class="numeral practice__num"><?php echo esc_html( sprintf( '%02d', $i + 1 ) ); ?></span>
          <h3><?php echo esc_html( $item['title'] ); ?></h3>
          <p class="practice__body"><?php echo esc_html( $item['body'] ); ?></p>
          <a class="arrow-link" href="<?php echo esc_url( home_url( $item['href'] ) ); ?>"><?php echo esc_html( $item['cta'] ); ?><svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M0 6h8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="arrow-link__pt" cx="9.5" cy="6" r="2.5"/></svg></a>
        </article>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
  <?php else : ?>
  <section class="section">
    <div class="container prose">
      <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); echo svls_clean_content( get_the_content() ); endwhile; else : ?>
        <p>Nothing here yet.</p>
      <?php endif; ?>
    </div>
  </section>
  <?php endif; ?>
</main>
<?php get_footer(); ?>
