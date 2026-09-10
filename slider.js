(function () {
  const slider = document.getElementById('slider');
  const slidesContainer = document.getElementById('slides');
  const slides = Array.from(slidesContainer.querySelectorAll('.slide'));
  const dotsContainer = document.getElementById('dots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressBar = document.getElementById('progressBar');


  let current = 0;
  const total = slides.length;
  const AUTOPLAY_DELAY = 5000;
  let autoplayTimer = null;
  let progressStart = null;
  let progressRAF = null;
  let isPaused = false;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });
  const dots = Array.from(dotsContainer.querySelectorAll('.dot'));

  function mod(n, m) { return ((n % m) + m) % m; }

  function updateUI() {
    slides.forEach((s, i) => {
      s.classList.remove('active', 'prev-slide', 'next-slide');
      if (i === current) {
        s.classList.add('active');
      } else if (i === mod(current - 1, total)) {
        s.classList.add('prev-slide');
      } else if (i === mod(current + 1, total)) {
        s.classList.add('next-slide');
      }
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(index) {
    current = mod(index, total);
    updateUI();
    restartAutoplay();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    pauseAutoplay();
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    resumeAutoplay();
  }, { passive: true });

  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    const threshold = 40;
    if (diff > threshold) next();
    else if (diff < -threshold) prev();
  }

  slider.addEventListener('mouseenter', pauseAutoplay);
  slider.addEventListener('mouseleave', resumeAutoplay);

  function pauseAutoplay() {
    isPaused = true;
    clearTimeout(autoplayTimer);
    cancelAnimationFrame(progressRAF);
  }

  function resumeAutoplay() {
    isPaused = false;
    restartAutoplay();
  }

  function restartAutoplay() {
    clearTimeout(autoplayTimer);
    cancelAnimationFrame(progressRAF);
    progressBar.style.width = '0%';
    if (isPaused) return;

    progressStart = performance.now();
    function animateProgress(ts) {
      const elapsed = ts - progressStart;
      const pct = Math.min((elapsed / AUTOPLAY_DELAY) * 100, 100);
      progressBar.style.width = pct + '%';
      if (elapsed < AUTOPLAY_DELAY && !isPaused) {
        progressRAF = requestAnimationFrame(animateProgress);
      }
    }
    progressRAF = requestAnimationFrame(animateProgress);

    autoplayTimer = setTimeout(() => {
      if (!isPaused) next();
    }, AUTOPLAY_DELAY);
  }

  updateUI();
  restartAutoplay();



})();