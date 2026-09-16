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

  // Header gains a shadow once the page has scrolled past the top.
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Scroll-reveal: auto-tag common components so templates don't need to opt in
  // manually, then fade/slide them up as they enter the viewport. Stagger delay
  // is scoped per parent container (not a global page index) so each grid/row
  // cascades in visual order instead of picking up an arbitrary offset from
  // unrelated elements earlier on the page.
  var revealSelectors = ".card, .testimonial, .steps li, .ba-item, .faq-item";
  var revealables = Array.prototype.slice.call(document.querySelectorAll(revealSelectors));
  var groupCounters = new Map();
  revealables.forEach(function (el) {
    el.classList.add("reveal");
    var parent = el.parentElement;
    var count = groupCounters.get(parent) || 0;
    el.style.transitionDelay = (count % 4) * 70 + "ms";
    groupCounters.set(parent, count + 1);
  });
  var alreadyReveal = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    alreadyReveal.forEach(function (el) { io.observe(el); });
  } else {
    alreadyReveal.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Animated count-up for the homepage stats band. The HTML already shows the
  // correct final value (so it's right with JS disabled); JS resets to 0 and
  // animates up only once the element is about to enter the viewport.
  var stats = document.querySelectorAll("[data-count-to]");
  if (stats.length && "IntersectionObserver" in window) {
    var countIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
          var suffix = el.getAttribute("data-suffix") || "";
          var duration = 1200;
          var start = null;
          el.textContent = "0" + suffix;
          function step(ts) {
            if (!start) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          countIo.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    stats.forEach(function (el) { countIo.observe(el); });
  }

  // Draggable before/after comparison sliders on the gallery page.
  document.querySelectorAll(".ba-slider").forEach(function (slider) {
    var range = slider.querySelector("input[type='range']");
    var after = slider.querySelector(".ba-after");
    var handle = slider.querySelector(".ba-handle");
    if (!range || !after) return;
    var update = function () {
      after.style.clipPath = "inset(0 0 0 " + range.value + "%)";
      if (handle) handle.style.left = range.value + "%";
    };
    range.addEventListener("input", update);
    update();
  });

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
