/* ============================================================
   CV STEM Guide — Site behavior (runs on every page)
   Nav scroll state · mobile menu · scroll-reveal · smooth scroll
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Nav: elevate on scroll ---------- */
  const nav = document.querySelector(".nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    const close = () => {
      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 720) close(); });
  }

  /* ---------- Smooth scroll for same-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", id);
    });
  });

  /* ---------- Scroll-reveal animations ---------- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveal = () => {
    const items = document.querySelectorAll("[data-animate]");
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  };

  /* ---------- Page wiring ---------- */
  function init() {
    const C = window.CVSTEM;
    if (C) {
      C.renderFeatured && C.renderFeatured("#featured-grid");
      C.renderTips && C.renderTips("#tips-grid");
      C.renderCounties && C.renderCounties("#county-grid");
      C.initExplorer && C.initExplorer();
    }
    reveal(); // observe after dynamic content is injected
    const yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
