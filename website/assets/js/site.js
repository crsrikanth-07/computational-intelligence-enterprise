/* =============================================================================
   SVLS LABS — site.js
   One IIFE, no globals except window.SVLS (theme helpers for page scripts).
   Modules: theme, dropdowns (Services, Products), Menu sheet, current nav, reveal, forms, year.
   Everything degrades: without this file the nav links work, the Menu button
   is a link to #site-nav, forms post normally, content is visible.
   ============================================================================= */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var darkScheme = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function qs(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function prefersReduced() { return !!(reducedMotion && reducedMotion.matches); }
  function onMedia(mq, fn) {
    if (!mq) return;
    if (mq.addEventListener) mq.addEventListener('change', fn);
    else if (mq.addListener) mq.addListener(fn);
  }

  root.classList.remove('no-js');

  /* ---------------------------------------------------------------------------
     Theme: System / Light / Dark. Stored in localStorage (try/catch), applied as
     data-theme on <html>. The pre-paint snippet in <head> applies the stored
     value before first paint; this module only keeps the controls in sync.
     --------------------------------------------------------------------------- */
  var THEME_KEY = 'svls-theme';

  function storedTheme() {
    try {
      var t = localStorage.getItem(THEME_KEY);
      return (t === 'light' || t === 'dark') ? t : 'system';
    } catch (e) { return 'system'; }
  }
  function storeTheme(t) {
    try {
      if (t === 'system') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, t);
    } catch (e) { /* storage unavailable: theme still applies for this page */ }
  }
  function effectiveTheme() {
    var t = root.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return (darkScheme && darkScheme.matches) ? 'dark' : 'light';
  }
  function applyTheme(t) {
    if (t === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', t);
    storeTheme(t);
    syncThemeControls();
  }
  function syncThemeControls() {
    var choice = storedTheme();
    var eff = effectiveTheme();
    qsa('[data-theme-choice]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-theme-choice') === choice ? 'true' : 'false');
    });
    qsa('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', eff === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      b.setAttribute('data-effective', eff);
    });
  }
  doc.addEventListener('click', function (e) {
    var choice = e.target.closest('[data-theme-choice]');
    if (choice) { applyTheme(choice.getAttribute('data-theme-choice')); return; }
    var toggle = e.target.closest('[data-theme-toggle]');
    if (toggle) { applyTheme(effectiveTheme() === 'dark' ? 'light' : 'dark'); }
  });
  onMedia(darkScheme, syncThemeControls);
  syncThemeControls();

  window.SVLS = { theme: { get: storedTheme, set: applyTheme, effective: effectiveTheme } };

  /* ---------------------------------------------------------------------------
     Dropdowns (Services, Products): each .has-dropdown is wired on its own; hover,
     focus and click open it; Escape closes and returns focus; ArrowDown/ArrowUp/
     Home/End move through the rows of the open panel. Opening one panel closes
     every other, so at most one is open at a time.
     --------------------------------------------------------------------------- */
  var dropdowns = [];
  qsa('.has-dropdown').forEach(function (item) {
    var trigger = qs('.site-nav__trigger', item);
    var panel = qs('.dropdown', item);
    if (!trigger || !panel) return;
    var leaveTimer = null;
    var openedByHover = false;

    function isOpen() { return item.classList.contains('is-open'); }
    function open() {
      dropdowns.forEach(function (other) { if (other.item !== item) other.close(); });
      item.classList.add('is-open'); trigger.setAttribute('aria-expanded', 'true');
    }
    function close() { clearTimeout(leaveTimer); item.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false'); openedByHover = false; }
    function links() { return qsa('a', panel); }
    dropdowns.push({ item: item, close: close });

    // A click on a panel that hover already opened keeps it open (and pins it until mouseleave).
    trigger.addEventListener('click', function () {
      if (isOpen() && !openedByHover) close();
      else { open(); openedByHover = false; }
    });
    item.addEventListener('mouseenter', function () { clearTimeout(leaveTimer); if (!isOpen()) { open(); openedByHover = true; } });
    item.addEventListener('mouseleave', function () { leaveTimer = setTimeout(close, 120); });
    item.addEventListener('focusout', function (e) {
      if (!e.relatedTarget || !item.contains(e.relatedTarget)) close();
    });
    item.addEventListener('keydown', function (e) {
      var rows = links();
      var i = rows.indexOf(doc.activeElement);
      switch (e.key) {
        case 'Escape':
          if (isOpen()) { e.preventDefault(); close(); trigger.focus(); }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen()) open();
          (i < 0 ? rows[0] : rows[Math.min(i + 1, rows.length - 1)]).focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (i <= 0) { trigger.focus(); } else { rows[i - 1].focus(); }
          break;
        case 'Home':
          if (isOpen()) { e.preventDefault(); rows[0].focus(); }
          break;
        case 'End':
          if (isOpen()) { e.preventDefault(); rows[rows.length - 1].focus(); }
          break;
        case ' ':
        case 'Enter':
          if (doc.activeElement === trigger && !isOpen()) { e.preventDefault(); open(); rows[0].focus(); }
          break;
      }
    });
    doc.addEventListener('click', function (e) { if (isOpen() && !item.contains(e.target)) close(); });
  });

  /* ---------------------------------------------------------------------------
     Menu sheet (below 900px): the no-JS Menu link becomes a button; the sheet
     opens with a focus trap and body scroll lock; Escape or Close closes it.
     --------------------------------------------------------------------------- */
  (function () {
    var sheet = qs('#mobile-sheet');
    var link = qs('[data-menu-toggle]');
    var backdrop = qs('[data-menu-backdrop]');
    if (!sheet || !link) return;

    var btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = link.className;
    btn.innerHTML = link.innerHTML;
    btn.setAttribute('data-menu-toggle', '');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'mobile-sheet');
    link.parentNode.replaceChild(btn, link);
    var label = qs('.menu-btn__label', btn);
    var keyBound = false;

    function focusables() {
      return qsa('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', sheet)
        .filter(function (el) { return el.offsetParent !== null; });
    }
    function trapList() { return [btn].concat(focusables()); }
    function isOpen() { return !sheet.hidden; }

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var list = trapList();
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (list.indexOf(doc.activeElement) === -1) { e.preventDefault(); first.focus(); }
    }
    function open() {
      sheet.hidden = false;
      if (backdrop) backdrop.hidden = false;
      // next frame so the transition runs from the hidden state
      requestAnimationFrame(function () {
        sheet.classList.add('is-open');
        if (backdrop) backdrop.classList.add('is-open');
      });
      btn.setAttribute('aria-expanded', 'true');
      btn.classList.add('is-open');
      if (label) label.textContent = 'Close';
      doc.body.classList.add('sheet-open');
      if (!keyBound) { doc.addEventListener('keydown', onKey); keyBound = true; }
      var first = focusables()[0];
      if (first) first.focus();
    }
    function close() {
      sheet.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('is-open');
      if (label) label.textContent = 'Menu';
      doc.body.classList.remove('sheet-open');
      if (keyBound) { doc.removeEventListener('keydown', onKey); keyBound = false; }
      var finish = function () { sheet.hidden = true; if (backdrop) backdrop.hidden = true; };
      if (prefersReduced()) finish(); else setTimeout(finish, 220);
      btn.focus();
    }
    btn.addEventListener('click', function () { if (isOpen()) close(); else open(); });
    if (backdrop) backdrop.addEventListener('click', close);
    sheet.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (a) close();
    });
    onMedia(window.matchMedia ? window.matchMedia('(min-width: 900px)') : null, function (m) { if (m.matches && isOpen()) close(); });
  })();

  /* ---------------------------------------------------------------------------
     Current page in the nav (from pathname). Builders may also set
     aria-current="page" statically; this keeps the partial identical per page.
     --------------------------------------------------------------------------- */
  (function () {
    var path = location.pathname.replace(/index\.html$/, '');
    if (path === '') path = '/';
    qsa('.site-nav a[href], .sheet a[href]').forEach(function (a) {
      if (a.classList.contains('btn')) return;
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) !== '/') return;
      var hp = href.split('?')[0].split('#')[0];
      if (hp === '/') return;
      if (path === hp || path.indexOf(hp) === 0) a.setAttribute('aria-current', 'page');
    });
    qsa('.has-dropdown').forEach(function (item) {
      if (qs('.dropdown a[aria-current="page"]', item)) qs('.site-nav__trigger', item).classList.add('is-current');
    });
  })();

  /* ---------------------------------------------------------------------------
     Reveal on scroll: opacity/transform only, once, at 15% visibility. The
     class is added here, so without JS (or IntersectionObserver) everything
     is visible. Reduced motion: nothing is hidden.
     --------------------------------------------------------------------------- */
  (function () {
    var items = qsa('[data-reveal]');
    if (!items.length || prefersReduced() || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting || en.intersectionRatio > 0) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      // Never hide something already on screen at load, and never hide tall blocks
      // that could not reach 15% visibility in a short viewport.
      if (r.top < window.innerHeight && r.bottom > 0) return;
      if (r.height > window.innerHeight * 0.8) return;
      el.classList.add('reveal');
      io.observe(el);
    });
    // Safety net: nothing stays hidden if the observer never fires (some in-app
    // browsers, print, scripted captures). Scroll position also reveals, and a
    // hard cap reveals everything after 4 seconds.
    function revealNear() {
      items.forEach(function (el) {
        if (el.classList.contains('is-visible')) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.15) el.classList.add('is-visible');
      });
    }
    window.addEventListener('scroll', revealNear, { passive: true });
    window.addEventListener('resize', revealNear, { passive: true });
    setTimeout(revealNear, 800);
    setTimeout(function () { items.forEach(function (el) { el.classList.add('is-visible'); }); }, 4000);
  })();

  /* ---------------------------------------------------------------------------
     Forms: query-string prefill, inline validation naming the field, fetch POST
     with Accept: application/json, success message swap, mailto fallback.
     --------------------------------------------------------------------------- */
  var FALLBACK_EMAIL = 'service@svlslabs.com';

  function fieldName(ctrl, form) {
    var wrap = ctrl.closest('.field, .fieldset');
    var lab = null;
    if (ctrl.id) lab = qs('label[for="' + ctrl.id + '"]', form);
    if (!lab && wrap) lab = qs('legend, .field__label', wrap);
    var text = lab ? lab.textContent : (ctrl.getAttribute('aria-label') || ctrl.name || 'This field');
    return text.replace(/\s*\((optional|required)\)\s*/i, '').replace(/\s+/g, ' ').trim();
  }
  function setError(wrap, msg) {
    if (!wrap) return;
    var err = qs('.field__error', wrap);
    if (!err) { err = doc.createElement('p'); err.className = 'field__error'; wrap.appendChild(err); }
    err.textContent = msg;
    wrap.classList.add('is-invalid');
    var ctrl = qs('input, select, textarea', wrap);
    if (ctrl) {
      ctrl.setAttribute('aria-invalid', 'true');
      if (!err.id) err.id = (ctrl.id || ctrl.name || 'field') + '-error';
      ctrl.setAttribute('aria-describedby', err.id);
    }
  }
  function clearError(wrap) {
    if (!wrap) return;
    wrap.classList.remove('is-invalid');
    qsa('input, select, textarea', wrap).forEach(function (c) { c.removeAttribute('aria-invalid'); });
  }
  function validateForm(form) {
    var firstBad = null;
    var seenRadio = {};
    qsa('input, select, textarea', form).forEach(function (ctrl) {
      if (ctrl.type === 'hidden' || ctrl.hidden || ctrl.disabled) return;
      var wrap = ctrl.closest('.field, .fieldset');
      if (ctrl.type === 'radio') {
        if (seenRadio[ctrl.name]) return;
        seenRadio[ctrl.name] = true;
        var group = qsa('input[name="' + ctrl.name + '"]', form);
        var required = group.some(function (r) { return r.required; });
        var checked = group.some(function (r) { return r.checked; });
        if (required && !checked) { setError(wrap, fieldName(ctrl, form) + ' is required.'); if (!firstBad) firstBad = ctrl; }
        else clearError(wrap);
        return;
      }
      var name = fieldName(ctrl, form);
      if (ctrl.required && !ctrl.value.trim()) { setError(wrap, name + ' is required.'); if (!firstBad) firstBad = ctrl; return; }
      if (ctrl.type === 'email' && ctrl.value && !ctrl.checkValidity()) { setError(wrap, 'Enter a valid ' + name.toLowerCase() + '.'); if (!firstBad) firstBad = ctrl; return; }
      if (!ctrl.checkValidity()) { setError(wrap, name + ' is not valid.'); if (!firstBad) firstBad = ctrl; return; }
      clearError(wrap);
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }
  function checkIcon() {
    return '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M3 10.5l4.5 4.5L17 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function showSuccess(form) {
    var msg = form.getAttribute('data-success') || 'Thank you. We reply within one business day.';
    var box = doc.createElement('div');
    box.className = 'form__success';
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    // A trailing "(TODO client)" in data-success renders with the visible mono TODO label (SITE_SPEC 16.3)
    box.innerHTML = checkIcon() + '<p>' + escapeHtml(msg).replace(/\(TODO client\)/g, '(<span class="todo">TODO</span> client)') + '</p>';
    form.parentNode.replaceChild(box, form);
    box.focus();
  }
  function mailtoFor(form, data) {
    var lines = [];
    data.forEach(function (v, k) {
      if (k === '_gotcha' || k === 'form-name' || k === '_subject') return;
      if (typeof v === 'string' && v.trim()) lines.push(k + ': ' + v.trim());
    });
    var subject = form.getAttribute('data-subject') || 'Website enquiry';
    return 'mailto:' + FALLBACK_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
  }
  function showFailed(form, data) {
    var box = qs('.form__failed', form);
    if (!box) { box = doc.createElement('div'); box.className = 'form__failed'; box.setAttribute('role', 'alert'); form.appendChild(box); }
    box.innerHTML = 'Sending failed. Email us instead: <a href="' + mailtoFor(form, data) + '">' + FALLBACK_EMAIL + '</a> (<span class="todo">TODO</span> client)';
    box.hidden = false;
    var submit = qs('[type="submit"]', form);
    if (submit) submit.disabled = false;
  }
  function submitForm(form) {
    var submit = qs('[type="submit"]', form);
    var data = new FormData(form);
    if (submit) submit.disabled = true;
    if (!window.fetch) { form.submit(); return; }
    fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); showSuccess(form); })
      .then(null, function () { showFailed(form, data); });
  }
  function prefill(form) {
    var params;
    try { params = new URLSearchParams(location.search); } catch (e) { return; }
    ['intent', 'offer', 'role'].forEach(function (key) {
      var v = params.get(key);
      if (!v) return;
      qsa('[name="' + key + '"]', form).forEach(function (el) {
        if (el.type === 'radio' || el.type === 'checkbox') { if (el.value === v) el.checked = true; }
        else if (el.tagName === 'SELECT') { if (qs('option[value="' + v + '"]', el)) el.value = v; }
      });
    });
  }
  function conditionalGroups(form) {
    var groups = qsa('[data-show-when]', form);
    if (!groups.length) return;
    function update() {
      groups.forEach(function (g) {
        var spec = (g.getAttribute('data-show-when') || '').split('=');
        var ctrl = qs('[name="' + spec[0] + '"]', form);
        var values = (spec[1] || '').split(' ');
        var show = ctrl && values.indexOf(ctrl.value) !== -1;
        g.hidden = !show;
        qsa('input, select, textarea', g).forEach(function (c) { c.required = show && c.hasAttribute('data-required'); });
      });
    }
    form.addEventListener('change', update);
    update();
  }
  qsa('form[data-enhance]').forEach(function (form) {
    form.setAttribute('novalidate', '');
    prefill(form);
    conditionalGroups(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      submitForm(form);
    });
    form.addEventListener('input', function (e) {
      var wrap = e.target.closest('.field, .fieldset');
      if (wrap && wrap.classList.contains('is-invalid') && e.target.checkValidity && e.target.checkValidity() && e.target.value) clearError(wrap);
    });
  });

  /* ---------------------------------------------------------------------------
     Copyright year
     --------------------------------------------------------------------------- */
  qsa('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
