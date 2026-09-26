<?php get_header(); ?>
<main id="main">
  <section class="hero hero--plain" aria-labelledby="hero-title">
    <div class="hero-art hero-art--lite" aria-hidden="true"></div>
    <div class="container">
      <div class="hero__copy">
        <h1 id="hero-title"><?php echo esc_html( is_singular() ? get_the_title() : wp_get_document_title() ); ?></h1>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="container prose">
      <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); the_content(); endwhile; else : ?>
        <p>Nothing here yet.</p>
      <?php endif; ?>
    </div>
  </section>
</main>
<?php get_footer(); ?>
