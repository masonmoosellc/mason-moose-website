/* masonmoose.com: shared behaviour (theme toggle, headline entrance, scroll reveals, card spotlight, header). */
(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'mm-theme';
  var COLORS = { dark: '#07050f', light: '#fbfaff' };
  var deviceLight = window.matchMedia('(prefers-color-scheme: light)');

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
    deviceLight.addEventListener('change', function (e) {
      if (!savedTheme()) applyTheme(e.matches ? 'light' : 'dark', false);
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

  initTheme();
  document.querySelectorAll('[data-split]').forEach(splitWords);
  initReveal();
  initSpotlight();
  initNav();
})();
