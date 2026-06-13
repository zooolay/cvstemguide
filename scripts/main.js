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

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero parallax (subtle, scroll-driven) ---------- */
  function initParallax() {
    if (reduce) return;
    const layers = document.querySelectorAll("[data-parallax]");
    if (!layers.length) return;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      layers.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.25;
        el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- Count-up stats ---------- */
  function initCounters() {
    const nums = document.querySelectorAll("[data-count-to]");
    if (!nums.length) return;
    const animate = (el) => {
      const target = parseFloat(el.dataset.countTo);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      if (reduce) { el.textContent = prefix + target + suffix; return; }
      const dur = 1400, start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!("IntersectionObserver" in window)) { nums.forEach(animate); return; }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.4 });
    nums.forEach((el) => io.observe(el));
  }

  /* ---------- Scroll-reveal animations ---------- */
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
      C.renderCountyMarquee && C.renderCountyMarquee("#county-marquee-track");
      C.initExplorer && C.initExplorer();
    }
    initParallax();
    initCounters();
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
