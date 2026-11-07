/* CR SRIKANTH site script: header state, menu, reveal, click-to-load videos, contact form, and the hero artwork
   ("Five Lines"): staff lines that become lines of text and then a sound wave. Everything degrades without JS. */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  root.classList.add('js');
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header: solid once the page scrolls
  var header = d.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-solid', w.scrollY > 24); }
  w.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Menu sheet
  var btn = d.querySelector('[data-menu]'), sheet = d.getElementById('menu-sheet');
  if (btn && sheet) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open)); sheet.hidden = open;
      d.body.style.overflow = open ? '' : 'hidden';
      if (header) header.classList.toggle('is-solid', !open || w.scrollY > 24);
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) { btn.click(); btn.focus(); } });
  }

  // Reveal on scroll
  var items = d.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in w && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('is-in'); }); }

  // Videos: replace the thumbnail with the player only when asked
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-yt]'); if (!b) return;
    var id = b.getAttribute('data-yt'), title = b.getAttribute('data-title') || 'Video';
    var f = d.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
    f.title = title; f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'; f.allowFullscreen = true;
    b.parentNode.replaceChild(f, b); f.focus();
  });

  // Spotify: the player loads only on request
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-sp]'); if (!b) return;
    var ref = b.getAttribute('data-sp'), isList = ref.indexOf('playlist/') === 0;
    var f = d.createElement('iframe');
    f.src = 'https://open.spotify.com/embed/' + ref + '?utm_source=generator&theme=0';
    f.title = 'Spotify player: ' + (b.getAttribute('data-title') || 'music'); f.className = 'sp-embed' + (isList ? ' sp-embed--list' : '');
    f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'; f.loading = 'lazy';
    var slot = b.closest('.sp-slot'); slot.innerHTML = ''; slot.appendChild(f);
  });

  // Year
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Contact form (WordPress handler; on the static preview there is no endpoint, so say so plainly)
  d.querySelectorAll('form[data-form]').forEach(function (form) {
    var msg = form.querySelector('.form__msg');
    form.addEventListener('submit', function (e) {
      if (!w.fetch) return; e.preventDefault();
      var fd = new FormData(form); msg.className = 'form__msg'; msg.textContent = 'Sending…';
      fetch(form.action, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (j) {
          if (j && j.ok) { form.reset(); msg.className = 'form__msg ok'; msg.textContent = 'Thank you. Your message is on its way, and you will hear back personally.'; }
          else { msg.className = 'form__msg err'; msg.textContent = 'The message could not be sent. Please email crs.07@crsrikanth.com instead.'; }
        })
        .catch(function () { msg.className = 'form__msg err'; msg.textContent = 'The message could not be sent. Please email crs.07@crsrikanth.com instead.'; });
    });
  });

  // ---------- "Five Lines": the hero artwork ----------
  function FiveLines(canvas) {
    var ctx = canvas.getContext('2d'); if (!ctx) return;
    var variant = canvas.getAttribute('data-lines') || 'all';
    var W = 0, H = 0, dpr = 1, t0 = performance.now(), raf = 0, visible = true;
    var stars = [], X0 = 0;
    function U(x) { return Math.max(0, Math.min(1, (x - X0) / Math.max(1, W - X0))); }
    var GOLD = [210, 178, 111], IVORY = [242, 235, 221], VIOLET = [156, 140, 255];
    function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
    function rgba(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')'; }
    function ss(a, b, x) { var k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); }
    function colorAt(u) {
      if (variant === 'music') return mix(GOLD, IVORY, u * .4);
      if (variant === 'words') return mix(IVORY, GOLD, u * .5);
      if (variant === 'tech') return mix(VIOLET, [111, 168, 255], u);
      return u < .5 ? mix(GOLD, IVORY, u * 2) : mix(IVORY, VIOLET, (u - .5) * 2);
    }
    // zone weights along x: 0 music (staff + notes), 1 words (dashed lines), 2 sound (waveform)
    function zones(u) {
      if (variant === 'music') return [1, 0, 0];
      if (variant === 'words') return [0, 1, 0];
      if (variant === 'tech') return [0, 0, 1];
      var a = 1 - ss(.3, .46, u), c = ss(.64, .8, u); return [a, Math.max(0, 1 - a - c), c];
    }
    function resize() {
      var r = canvas.getBoundingClientRect(); dpr = Math.min(w.devicePixelRatio || 1, 2);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = []; var n = Math.round(W * H / 9000);
      for (var i = 0; i < n; i++) stars.push([Math.random() * W, Math.random() * H, Math.random() * 1.2 + .2, Math.random() * 6.28]);
      if (reduce) draw(4.2);
    }
    function lineY(i, x, t, cy, gap) {
      var u = U(x), z = zones(u);
      var base = cy + (i - 2) * gap;
      var drift = Math.sin(x * .0042 + t * .35 + i * .7) * gap * .55 + Math.sin(x * .011 - t * .22 + i) * gap * .18;
      // the sound zone draws the five lines together into one waveform
      var conv = base + (cy - base) * z[2] * .78;
      var wave = Math.sin(x * .045 + t * 2.1 + i * .9) * gap * 1.1 * Math.sin(x * .006 + t * .4) * z[2];
      return conv + drift * (1 - z[2] * .6) + wave;
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      for (var s = 0; s < stars.length; s++) { var st = stars[s]; var a = .25 + .25 * Math.sin(t * .6 + st[3]); ctx.fillStyle = 'rgba(242,235,221,' + a.toFixed(3) + ')'; ctx.fillRect(st[0], st[1], st[2], st[2]); }
      var mobile = W < 760;
      var cy = mobile ? H * .3 : H * .44, gap = Math.max(10, Math.min(22, H / 34));
      var x0 = mobile ? 0 : W * (variant === 'all' ? .34 : 0), step = 5; X0 = x0;
      for (var i = 0; i < 5; i++) {
        // solid staff and waveform parts
        ctx.lineWidth = 1.15; ctx.setLineDash([]);
        var prev = null;
        for (var x = x0; x <= W + step; x += step) {
          var u = U(x), z = zones(u), y = lineY(i, x, t, cy, gap);
          var alpha = (z[0] + z[2]) * .75 * ss(x0, x0 + 160, x);
          if (prev && alpha > .01) { ctx.strokeStyle = rgba(colorAt(u), alpha.toFixed(3)); ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(x, y); ctx.stroke(); }
          prev = [x, y];
        }
        // the words: the same line set in dashes of word length, drifting slowly like a paragraph being read
        var seed = i * 97.3, px = x0 - ((t * 14) % 600);
        while (px < W) {
          var len = 14 + Math.abs(Math.sin(seed += 1.7)) * 64, gp = 7 + Math.abs(Math.sin(seed * 1.3)) * 9;
          var mid = px + len / 2, um = U(mid), zm = zones(um);
          if (zm[1] > .02 && px > x0) {
            ctx.strokeStyle = rgba(colorAt(um), (zm[1] * .7 * ss(x0, x0 + 160, mid)).toFixed(3)); ctx.lineWidth = 2.2; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(px, lineY(i, px, t, cy, gap)); ctx.lineTo(px + len, lineY(i, px + len, t, cy, gap)); ctx.stroke();
          }
          px += len + gp;
        }
        ctx.lineCap = 'butt';
      }
      // note heads travelling along the staff
      for (var n = 0; n < 14; n++) {
        var nx = x0 + ((n * 97 + t * 18) % ((W - x0) * .45 + 120)) - 60;
        var un = U(nx), zn = zones(un); if (zn[0] < .05 || nx < x0) continue;
        var li = n % 5, half = (n % 3 === 0) ? .5 : 0;
        var ny = lineY(li, nx, t, cy, gap) - half * gap;
        var a2 = zn[0] * .9 * ss(x0, x0 + 160, nx);
        ctx.save(); ctx.translate(nx, ny); ctx.rotate(-.35);
        ctx.fillStyle = rgba(GOLD, a2.toFixed(3)); ctx.beginPath(); ctx.ellipse(0, 0, gap * .42, gap * .3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.strokeStyle = rgba(GOLD, (a2 * .8).toFixed(3)); ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(nx + gap * .38, ny - 2); ctx.lineTo(nx + gap * .38, ny - gap * 2.6); ctx.stroke();
      }
      // a soft glow where the wave resolves
      if (variant === 'all' || variant === 'tech') {
        var gx = variant === 'all' ? W * .9 : W * .7, g = ctx.createRadialGradient(gx, cy, 0, gx, cy, gap * 9);
        g.addColorStop(0, 'rgba(156,140,255,.18)'); g.addColorStop(1, 'rgba(156,140,255,0)'); ctx.fillStyle = g; ctx.fillRect(gx - gap * 9, cy - gap * 9, gap * 18, gap * 18);
      }
    }
    function frame(now) { raf = 0; if (!visible || d.hidden) return; draw((now - t0) / 1000); raf = w.requestAnimationFrame(frame); }
    function start() { if (!raf && !reduce) raf = w.requestAnimationFrame(frame); }
    resize(); w.addEventListener('resize', function () { resize(); if (reduce) draw(4.2); });
    if (reduce) { draw(4.2); return; }
    if ('IntersectionObserver' in w) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }).observe(canvas);
    d.addEventListener('visibilitychange', function () { if (!d.hidden) start(); });
    start();
  }
  d.querySelectorAll('canvas[data-lines]').forEach(FiveLines);
})();
