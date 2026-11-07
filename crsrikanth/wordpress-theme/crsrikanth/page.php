<?php get_header(); ?>
<main id="main">
  <section class="phero">
    <div class="wrap">
      <p class="kicker"><?php echo is_singular( 'post' ) ? esc_html( get_the_date() ) : ( is_home() || is_archive() ? 'Journal' : 'CR Srikanth' ); ?></p>
      <h1><?php echo esc_html( is_singular() ? get_the_title() : ( is_home() ? 'Journal' : wp_strip_all_tags( get_the_archive_title() ) ) ); ?></h1>
    </div>
  </section>
  <section class="section section--tight">
    <div class="wrap">
      <?php if ( is_singular() ) : ?>
      <div class="prose wp-content">
        <?php while ( have_posts() ) : the_post(); echo crs_clean_content( get_the_content() ); endwhile; ?>
      </div>
      <?php elseif ( have_posts() ) : ?>
      <div class="press">
        <?php while ( have_posts() ) : the_post(); ?>
        <article class="press__item"><p class="press__outlet"><?php echo esc_html( get_the_date() ); ?></p><div><h2 class="press__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2><p class="press__meta"><?php echo esc_html( wp_trim_words( wp_strip_all_tags( crs_clean_content( get_the_content() ) ), 30 ) ); ?></p></div></article>
        <?php endwhile; ?>
      </div>
      <?php the_posts_pagination(); ?>
      <?php else : ?>
      <p>Nothing here yet.</p>
      <?php endif; ?>
    </div>
  </section>
</main>
<?php get_footer(); ?>
