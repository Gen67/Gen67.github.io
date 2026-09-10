(function () {
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const target = bar.getAttribute('data-fill') || '0';
        // Next frame so the 0% -> target% change is actually transitioned
        requestAnimationFrame(() => {
          bar.style.width = target + '%';
        });
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.4 });

  bars.forEach((bar) => observer.observe(bar));
})();