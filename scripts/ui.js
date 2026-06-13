/* ============================================================
   CV STEM Guide — UI rendering & the unified Explorer
   Depends on data.js (window.CVSTEM). No inline handlers.
   ============================================================ */
(function () {
  const C = window.CVSTEM;
  if (!C) return;

  const BADGE = {
    free:        ["badge-free", "Free"],
    online:      ["badge-online", "Online"],
    residential: ["badge-residential", "Residential"],
    paid:        ["badge-paid", "Paid"],
    competition: ["badge-competition", "Competition"],
    scholarship: ["badge-scholarship", "Scholarship"],
  };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function badgesHTML(list) {
    return (list || []).map((b) => {
      const [cls, label] = BADGE[b] || ["", b];
      return `<span class="badge ${cls}">${esc(label)}</span>`;
    }).join("");
  }

  /* Public: renders one resource card. */
  C.cardHTML = function (item) {
    return `<article class="card">
      <div class="card-top">
        <div class="card-ic" aria-hidden="true">${item.icon}</div>
        <div class="card-badges">${badgesHTML(item.badges)}</div>
      </div>
      ${item.type ? `<div class="card-type">${esc(item.type)}</div>` : ""}
      <h3>${esc(item.title)}</h3>
      <div class="card-org">${esc(item.org)}</div>
      <p class="card-desc">${esc(item.desc)}</p>
      <div class="card-meta">
        <span>🎓 Grades ${esc(item.grades)}</span>
        <span>💰 ${esc(item.cost)}</span>
        <span>📅 ${esc(item.timing)}</span>
      </div>
      <a class="card-link" href="${esc(item.link)}" target="_blank" rel="noopener">
        Learn more <span class="arrow" aria-hidden="true">→</span>
      </a>
    </article>`;
  };

  /* ---------- Home: featured opportunities ---------- */
  C.renderFeatured = function (selector, count = 3) {
    const el = document.querySelector(selector);
    if (!el) return;
    const featured = C.ALL.filter((x) => x.tags.includes("free")).slice(0, count);
    el.innerHTML = featured.map(C.cardHTML).join("");
  };

  /* ---------- Explore: the unified browser ---------- */
  C.initExplorer = function () {
    const grid = document.getElementById("explore-grid");
    if (!grid) return;

    const state = { type: "all", tag: "all", county: "all", q: "" };

    const matchType   = (i) => state.type === "all" || i.type.toLowerCase() === state.type;
    const matchTag    = (i) => state.tag === "all" || i.tags.includes(state.tag);
    const matchCounty = (i) => state.county === "all" || i.counties === "all" || i.counties.includes(state.county);
    const matchSearch = (i) => !state.q ||
      (i.title + i.desc + i.org + i.type + i.tags.join(" ")).toLowerCase().includes(state.q);

    const countEl = document.getElementById("result-count");

    function render() {
      const items = C.ALL.filter((i) => matchType(i) && matchTag(i) && matchCounty(i) && matchSearch(i));
      if (countEl) {
        countEl.textContent = `${items.length} ${items.length === 1 ? "result" : "results"}`;
      }
      if (!items.length) {
        grid.innerHTML = `<div class="empty-state">
          <strong>No matches found</strong>
          Try clearing the search or widening your filters.
        </div>`;
        return;
      }
      grid.innerHTML = items.map(C.cardHTML).join("");
    }

    /* Chip groups (type + tag) via event delegation */
    document.querySelectorAll(".chips").forEach((group) => {
      group.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        group.querySelectorAll(".chip").forEach((c) => {
          c.classList.remove("active");
          c.setAttribute("aria-pressed", "false");
        });
        chip.classList.add("active");
        chip.setAttribute("aria-pressed", "true");
        state[group.dataset.filter] = chip.dataset.value;
        render();
      });
    });

    /* County dropdown */
    const county = document.getElementById("county-select");
    if (county) {
      county.innerHTML =
        `<option value="all">All counties</option>` +
        C.COUNTIES.map((c) => `<option value="${c}">${c} County</option>`).join("");
      county.addEventListener("change", () => { state.county = county.value; render(); });
    }

    /* Search */
    const search = document.getElementById("explore-search");
    if (search) {
      search.addEventListener("input", () => { state.q = search.value.trim().toLowerCase(); render(); });
    }

    /* Deep-link support: /explore?type=scholarship&county=Fresno */
    const params = new URLSearchParams(location.search);
    const preType = params.get("type");
    if (preType) {
      const chip = document.querySelector(`.chips--type .chip[data-value="${preType.toLowerCase()}"]`);
      if (chip) chip.click();
    }
    const preCounty = params.get("county");
    if (preCounty && county && C.COUNTIES.includes(preCounty)) {
      county.value = preCounty;
      state.county = preCounty;
    }

    render();
  };

  /* ---------- Tips grid ---------- */
  C.renderTips = function (selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.innerHTML = C.TIPS.map((t) => `<article class="tip" data-animate>
      <div class="tip-num" aria-hidden="true">${t.num}</div>
      <h3>${esc(t.title)}</h3>
      <p>${esc(t.text)}</p>
    </article>`).join("");
  };

  /* ---------- County pills (About) ---------- */
  C.renderCounties = function (selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.innerHTML = C.COUNTIES.map((c) =>
      `<a class="county-pill" href="/explore?county=${encodeURIComponent(c)}">${c}</a>`).join("");
  };

  /* ---------- Scrolling county band (kinetic) ---------- */
  C.renderCountyMarquee = function (selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    const once = C.COUNTIES.map((c) => `<span class="item">${c}</span>`).join("");
    el.innerHTML = once + once; // duplicated set → seamless -50% loop
  };
})();
