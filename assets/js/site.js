/* masonmoose.com: shared behaviour (theme toggle, headline entrance, scroll reveals, card spotlight, header). */
(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'mm-theme';
  var COLORS = { dark: '#07050f', light: '#fbfaff' };
  var deviceLight = window.matchMedia('(prefers-color-scheme: light)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Older Safari (13 and below) only has the deprecated addListener.
  function onMediaChange(mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn);
    else if (mq.addListener) mq.addListener(fn);
  }

  function savedTheme() {
    try {
      var v = localStorage.getItem(KEY);
      return v === 'light' || v === 'dark' ? v : null;
    } catch (e) {
      return null; // storage blocked (private window)
    }
  }

  function applyTheme(theme, save) {
    root.dataset.theme = theme;
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) {
      m.setAttribute('content', COLORS[theme]);
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
    if (save) {
      try { localStorage.setItem(KEY, theme); } catch (e) { /* storage blocked: the choice lasts for this visit */ }
    }
  }

  function initTheme() {
    applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark', false);
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
      });
    });
    // Follow the device live, unless the visitor picked a theme.
    onMediaChange(deviceLight, function (e) {
      if (!savedTheme()) applyTheme(e.matches ? 'light' : 'dark', false);
    });
    // Back/forward restores this page from memory: show the theme chosen on the other page meanwhile.
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) applyTheme(savedTheme() || (deviceLight.matches ? 'light' : 'dark'), false);
    });
  }

  // "Reduce motion" switched on mid-visit: stop the effects and show every block.
  function initMotionPreference() {
    onMediaChange(reduceMotion, function (e) {
      if (!e.matches) return;
      root.classList.remove('motion');
      document.querySelectorAll('.reveal, .steps').forEach(function (el) { el.classList.add('in'); });
    });
  }

  // Wrap each word of a [data-split] heading so it can rise in. Child elements count as one word.
  function splitWords(el) {
    var i = 0;
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var w = document.createElement('span');
          w.className = 'w';
          w.style.setProperty('--i', i++);
          w.textContent = part;
          frag.appendChild(w);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') {
        node.classList.add('w');
        node.style.setProperty('--i', i++);
      }
    });
    el.classList.add('split');
  }

  function initReveal() {
    var targets = document.querySelectorAll('.reveal, .steps');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
    // Only now may blocks start hidden: the observer that reveals them is running.
    root.classList.add('reveal-ready');
  }

  function initSpotlight() {
    document.querySelectorAll('.spot').forEach(function (el) {
      el.addEventListener('pointermove', function (ev) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
        el.style.setProperty('--my', (ev.clientY - r.top) + 'px');
      });
    });
  }

  function initNav() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initSplit() {
    document.querySelectorAll('[data-split]').forEach(splitWords);
  }

  // Each part starts on its own, so one failure cannot stop the others (the error still reaches the console).
  [initReveal, initTheme, initMotionPreference, initSplit, initSpotlight, initNav].forEach(function (init) {
    try { init(); } catch (err) { setTimeout(function () { throw err; }); }
  });
})();
