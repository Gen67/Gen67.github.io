/* ============================================
   SKILLS — fills each skill bar when its card
   scrolls into view.
   ============================================ */
(function () {
  const bars = Array.from(document.querySelectorAll('.skill-bar-fill'));
  if (!bars.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reads data-fill (0–100) and keeps it in a safe range
  function getTarget(bar) {
    const value = parseFloat(bar.getAttribute('data-fill'));
    return Math.min(100, Math.max(0, isNaN(value) ? 0 : value));
  }

  function fill(bar, delay) {
    // Reading offsetWidth makes the browser settle the 0% starting width first,
    // so the change to the target width is always animated.
    void bar.offsetWidth;

    bar.style.transitionDelay = reduceMotion ? '0ms' : delay + 'ms';
    bar.style.width = getTarget(bar) + '%';
  }

  // Start every bar empty, even if the CSS is missing or late
  bars.forEach(function (bar) {
    bar.style.width = '0%';
  });

  // No IntersectionObserver (very old browsers): just show the bars
  if (!('IntersectionObserver' in window)) {
    bars.forEach(function (bar) { fill(bar, 0); });
    return;
  }

  // Watch the whole card (it always has a size), not the bar (it starts at 0 width)
  const barByCard = new Map();
  bars.forEach(function (bar) {
    const card = bar.closest('.skill-card') || bar.parentElement;
    barByCard.set(card, bar);
  });

  const observer = new IntersectionObserver(function (entries) {
    // Bars that appear together fill one after another
    let order = 0;

    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      const bar = barByCard.get(entry.target);
      if (bar) fill(bar, order * 80);

      order += 1;
      observer.unobserve(entry.target);   // animate once only
    });
  }, { threshold: 0.35 });

  barByCard.forEach(function (bar, card) {
    observer.observe(card);
  });
})();