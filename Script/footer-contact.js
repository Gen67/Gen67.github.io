/* ============================================
   CONTACT FORM — sends the message via EmailJS
   (a client-side service; no backend server
   needed). Falls back to a plain mailto: link
   if EmailJS isn't configured or fails.
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

  // Compares your actual keys above against the untouched placeholder
  // text — this is what was broken before (it was comparing your keys
  // against themselves, so it was always true even with bad config).
  const isConfigured =
    EMAILJS_CONFIG.PUBLIC_KEY !== "YOUR_PUBLIC_KEY" &&
    EMAILJS_CONFIG.SERVICE_ID !== "YOUR_SERVICE_ID" &&
    EMAILJS_CONFIG.TEMPLATE_ID !== "YOUR_TEMPLATE_ID" &&
    EMAILJS_CONFIG.PUBLIC_KEY &&
    EMAILJS_CONFIG.SERVICE_ID &&
    EMAILJS_CONFIG.TEMPLATE_ID;

  if (isConfigured && window.emailjs) {
    emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
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

    if (!isConfigured || !window.emailjs) {
      setStatus("Email service not set up yet — opening your email app instead.", "");
      mailtoFallback();
      sendBtn.disabled = false;
      return;
    }

    setStatus("Sending...", "");

    emailjs
      .sendForm(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, form)
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