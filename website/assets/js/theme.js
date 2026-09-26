/* SVLS LABS — theme.js ("Signal Premium"). Non-essential polish only: adds
   .is-scrolled to the sticky header once the page has moved, so the bar gains
   its drop shadow over content. Nothing on the page depends on this file. */
(function () {
  'use strict';
  var header = document.querySelector('.site-header');
  if (!header) return;
  var ticking = false;
  function update() {
    header.classList.toggle('is-scrolled', (window.scrollY || window.pageYOffset || 0) > 8);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();
