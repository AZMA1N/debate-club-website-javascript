// Minimal animations stub to avoid 404 and runtime errors.
// Real animations can be added later.
(function () {
  function animateCounters(root = document) {
    const counters = root.querySelectorAll('[data-counter]');
    for (const el of counters) {
      if (el.dataset.animated) continue;
      const target = parseInt(el.dataset.counter || '0', 10);
      const suffix = el.dataset.suffix || '';
      el.textContent = '0' + suffix;

      let started = false;
      const run = () => {
        if (started) return;
        started = true;
        const duration = 1200;
        const start = performance.now();
        const from = 0;
        const to = target;

        function step(ts) {
          const p = Math.min(1, (ts - start) / duration);
          const val = Math.floor(from + (to - from) * easeOutCubic(p));
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.dataset.animated = '1';
        }
        requestAnimationFrame(step);
      };

      // If element already in view run immediately
      if (isInViewport(el)) run();
      else {
        const io = new IntersectionObserver((entries, obs) => {
          for (const entry of entries) if (entry.isIntersecting) {
            run();
            obs.disconnect();
          }
        }, { threshold: 0.3 });
        io.observe(el);
      }
    }
  }

  function revealOnScroll(root = document) {
    const items = root.querySelectorAll('.reveal');
    if (!items.length) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('animate-fade-in-up');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.15 });

    items.forEach(i => io.observe(i));
  }

  function isInViewport(el) {
    const r = el.getBoundingClientRect();
    return r.top < (window.innerHeight || document.documentElement.clientHeight) && r.bottom > 0;
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function initAnimations() {
    revealOnScroll(document);
    animateCounters(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    initAnimations();
  }
})();
