(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Progressive-enhancement AJAX submit for the quote/contact form, posting JSON
  // to the Vercel serverless function at /api/contact. Falls back to a plain
  // form POST (still handled by the same endpoint) if JS fails to load.
  var form = document.querySelector("#quote-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var status = form.querySelector(".form-status");
      var data = Object.fromEntries(new FormData(form).entries());
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch(form.getAttribute("action") || "/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          return res.json().then(function (json) {
            if (!res.ok) throw new Error(json.error || "Request failed");
            form.reset();
            if (status) {
              status.textContent = "Thanks! Your request has been sent — we'll get back to you shortly.";
              status.setAttribute("data-state", "success");
            }
          });
        })
        .catch(function (err) {
          if (status) {
            status.textContent =
              err.message && err.message !== "Request failed"
                ? err.message
                : "Something went wrong sending your request. Please call or email us directly — details are above.";
            status.setAttribute("data-state", "error");
          }
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
})();
