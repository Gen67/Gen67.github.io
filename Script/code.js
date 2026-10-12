/* ============================================
   PROJECTS SLIDER
   ============================================ */
(function () {
  const slider = document.getElementById('slider');
  const slidesContainer = document.getElementById('slides');
  const slides = Array.from(slidesContainer.querySelectorAll('.slide'));
  const dotsContainer = document.getElementById('dots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const progressBar = document.getElementById('progressBar');

  let current = 0;
  const total = slides.length;
  const AUTOPLAY_DELAY = 5000;
  let autoplayTimer = null;
  let progressStart = null;
  let progressRAF = null;

  // isPaused: hover, touch, keyboard focus, or slider off-screen
  // userPaused: the Pause button (starts paused if the visitor prefers reduced motion)
  let isPaused = false;
  let userPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
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
      // Screen readers only read the slide that is showing
      s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
    });
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      if (i === current) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
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
  slider.addEventListener('focusin', pauseAutoplay);
  slider.addEventListener('focusout', resumeAutoplay);

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
    progressBar.style.transform = 'scaleX(0)';
    if (isPaused || userPaused) return;

    progressStart = performance.now();
    function animateProgress(ts) {
      const elapsed = ts - progressStart;
      const pct = Math.min((elapsed / AUTOPLAY_DELAY) * 100, 100);
      // transform is cheap for the browser; width would redo layout every frame
      progressBar.style.transform = 'scaleX(' + pct / 100 + ')';
      if (elapsed < AUTOPLAY_DELAY && !isPaused) {
        progressRAF = requestAnimationFrame(animateProgress);
      }
    }
    progressRAF = requestAnimationFrame(animateProgress);

    autoplayTimer = setTimeout(() => {
      if (!isPaused && !userPaused) next();
    }, AUTOPLAY_DELAY);
  }

  // Pause / Play button
  function updatePauseButton() {
    pauseBtn.textContent = userPaused ? 'Play slideshow' : 'Pause slideshow';
  }

  pauseBtn.addEventListener('click', () => {
    userPaused = !userPaused;
    updatePauseButton();
    restartAutoplay();
  });

  // Stop working while the slider is off-screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) resumeAutoplay();
      else pauseAutoplay();
    }, { threshold: 0.25 }).observe(slider);
  }

  updateUI();
  updatePauseButton();
  restartAutoplay();
})();


/* ============================================
   THEME TOGGLE
   ============================================ */
(function () {
    const root = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    const label = document.getElementById('themeLabel');

    // Guard: if the toggle button isn't on the page (wrong/missing IDs),
    // bail out quietly instead of throwing and breaking scripts below it.
    if (!toggle || !icon || !label) {
        console.warn('Theme toggle: expected elements (#themeToggle, #themeIcon, #themeLabel) not found on the page.');
        return;
    }

    const sunPath = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>';
    const moonPath = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';

    function applyTheme(theme) {
        if (theme === 'light') {
            root.setAttribute('data-theme', 'light');
            icon.innerHTML = sunPath;
            label.textContent = 'Light';
        } else {
            root.removeAttribute('data-theme');
            icon.innerHTML = moonPath;
            label.textContent = 'Dark';
        }
        toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }

    let current = 'dark';
    applyTheme(current);

    toggle.addEventListener('click', function () {
        current = current === 'dark' ? 'light' : 'dark';
        applyTheme(current);
    });
})();


/* ============================================
   CONTACT FORM — sends the message via EmailJS
   (a client-side service; no backend server
   needed). The EmailJS library is only loaded
   when someone starts using the form. Falls back
   to a plain mailto: link if EmailJS isn't
   configured or fails.
   ============================================ */

const EMAILJS_CONFIG = {
  PUBLIC_KEY:  "IRYqrQLjv8_ytI_TA",
  SERVICE_ID:  "service_8akgqpg",
  TEMPLATE_ID: "template_8yhfrrn"
};

const YOUR_EMAIL_ADDRESS = "youremail@example.com"; // used only for the mailto: fallback

(function () {
  const form = document.getElementById("contactForm");
  const sendBtn = document.getElementById("sendBtn");
  const status = document.getElementById("formStatus");
  const yearSpan = document.getElementById("footerYear");

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  if (!form) return;

  const isConfigured =
    EMAILJS_CONFIG.PUBLIC_KEY !== "YOUR_PUBLIC_KEY" &&
    EMAILJS_CONFIG.SERVICE_ID !== "YOUR_SERVICE_ID" &&
    EMAILJS_CONFIG.TEMPLATE_ID !== "YOUR_TEMPLATE_ID" &&
    EMAILJS_CONFIG.PUBLIC_KEY &&
    EMAILJS_CONFIG.SERVICE_ID &&
    EMAILJS_CONFIG.TEMPLATE_ID;

  // Load the EmailJS library only when someone starts using the form
  let emailjsReady = null;

  function loadEmailJS() {
    if (emailjsReady) return emailjsReady;
    emailjsReady = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4.4.1/dist/email.min.js";
      script.onload = function () {
        emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return emailjsReady;
  }

  if (isConfigured) {
    form.addEventListener("focusin", loadEmailJS, { once: true });
  }

  function setStatus(text, type) {
    status.textContent = text;
    status.className = "form-status" + (type ? " " + type : "");
  }

  function mailtoFallback() {
    const name = document.getElementById("user_name").value;
    const email = document.getElementById("user_email").value;
    const message = document.getElementById("message").value;

    const subject = encodeURIComponent("Project inquiry from " + name);
    const body = encodeURIComponent(
      "Name: " + name + "\nEmail: " + email + "\n\n" + message
    );

    window.location.href =
      "mailto:" + YOUR_EMAIL_ADDRESS + "?subject=" + subject + "&body=" + body;

    setStatus("Opening your email app...", "success");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    sendBtn.disabled = true;

    if (!isConfigured) {
      setStatus("Email service not set up yet — opening your email app instead.", "");
      mailtoFallback();
      sendBtn.disabled = false;
      return;
    }

    setStatus("Sending...", "");

    loadEmailJS()
      .then(function () {
        return emailjs.sendForm(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, form);
      })
      .then(function () {
        setStatus("Message sent — thanks for reaching out!", "success");
        form.reset();
      })
      .catch(function (error) {
        console.error("EmailJS error:", error);
        setStatus("Something went wrong. Opening your email app instead.", "error");
        mailtoFallback();
      })
      .finally(function () {
        sendBtn.disabled = false;
      });
  });
})();


/* ============================================
   EXPLORE BUTTON — scrolls to the projects slider
   ============================================ */
(function () {
  const exploreBtn = document.getElementById('exploreBtn');
  if (!exploreBtn) return;

  const TARGET_SELECTOR = '.slider-wrap'; // change to '.skills-section' or another id if you'd rather land there

  exploreBtn.addEventListener('click', function () {
    const target = document.querySelector(TARGET_SELECTOR);
    if (!target) {
      console.warn('Explore Portfolio: no element found matching', TARGET_SELECTOR);
      return;
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
})();


/* ============================================
   SKELETON LOADERS — shimmer placeholder on
   image/iframe wrappers until the media loads.
   ============================================ */
(function () {
  const HOST_SELECTOR = '.slide, .credential-thumb, .design-card, .my-image-frame, .video-embed';
  const hosts = document.querySelectorAll(HOST_SELECTOR);
  if (!hosts.length) return;

  hosts.forEach(function (host) {
    const media = host.querySelector('img, iframe');
    if (!media) return;

    // Already cached/loaded — no skeleton needed
    if (media.tagName === 'IMG' && media.complete && media.naturalWidth > 0) return;

    host.classList.add('skeleton-host', 'is-loading');

    function done() {
      host.classList.remove('is-loading');
    }

    media.addEventListener('load', done, { once: true });
    media.addEventListener('error', done, { once: true });
  });
})();