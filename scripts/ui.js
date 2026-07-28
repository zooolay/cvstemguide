(function () {
  const C = window.CVSTEM;
  if (!C) return;

  const BADGE = {
    free:        ["badge-free", "Free"],
    paid:        ["badge-paid", "Paid"],
    online:      ["badge-online", "Online"],
    residential: ["badge-residential", "Residential"],
    competition: ["badge-competition", "Competition"],
    scholarship: ["badge-scholarship", "Scholarship"],
    "closing-soon": ["badge-closing", "Closing soon"],
  };

  const FIELD_LABEL = {};
  (C.FIELDS || []).forEach((f) => { FIELD_LABEL[f.key] = f.label; });

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Deadline semantics — must stay in sync with tools/lib/data-io.mjs
  //   null         rolling / ongoing  → never expires, shows `timing` instead
  //   "MM-DD"      recurring annually → rolls to next occurrence, never expires
  //   "YYYY-MM-DD" one-time           → expires once passed (auto-archived by CI)
  const RECURRING = /^\d{2}-\d{2}$/;
  const ABSOLUTE = /^\d{4}-\d{2}-\d{2}$/;
  const GRACE_DAYS = 14;

  function startOfToday() {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }
  function nextDeadline(deadline) {
    if (!deadline) return null;
    const today = startOfToday();
    if (ABSOLUTE.test(deadline)) {
      const [y, m, d] = deadline.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    if (RECURRING.test(deadline)) {
      const [m, d] = deadline.split("-").map(Number);
      let dt = new Date(today.getFullYear(), m - 1, d);
      if (dt < today) dt = new Date(today.getFullYear() + 1, m - 1, d);
      return dt;
    }
    return null;
  }
  function daysUntil(date) {
    return Math.round((date - startOfToday()) / 86400000);
  }
  function withDeadline(item) {
    if (item._dl !== undefined) return item;
    const dt = nextDeadline(item.deadline);
    item._dl = dt;
    item._oneTime = ABSOLUTE.test(item.deadline || "");
    item._dlDays = dt ? daysUntil(dt) : null;
    item._soon = dt ? (item._dlDays >= 0 && item._dlDays <= 30) : false;
    return item;
  }
  C.daysUntilDeadline = (item) => withDeadline(item)._dlDays;
  C.isClosingSoon = (item) => withDeadline(item)._soon;

  // Only one-time dates and explicit retireOn can expire; recurring ones roll over.
  C.isExpired = function (item) {
    if (item.retireOn && ABSOLUTE.test(item.retireOn)) {
      const dt = nextDeadline(item.retireOn);
      if (dt && daysUntil(dt) < 0) return true;
    }
    withDeadline(item);
    return item._oneTime && item._dl && item._dlDays < -GRACE_DAYS;
  };

  // Defensive second layer: CI archives expired listings weekly, but this keeps
  // anything stale off the page in between runs. Counts are recomputed to match.
  (function pruneExpired() {
    const before = C.ALL.length;
    C.ALL = C.ALL.filter((x) => !C.isExpired(x));
    if (C.ALL.length === before) return;
    const by = (t) => C.ALL.filter((x) => x.type === t).length;
    C.COUNTS = Object.assign({}, C.COUNTS, {
      total: C.ALL.length,
      programs: by("Program"),
      scholarships: by("Scholarship"),
      competitions: by("Competition"),
    });
  })();

  function badgesHTML(item) {
    const list = (item.badges || []).slice();
    list.unshift(item.free ? "free" : "paid");
    if (withDeadline(item)._soon) list.push("closing-soon");
    const seen = {};
    return list.filter((b) => (seen[b] ? false : (seen[b] = true)))
      .map((b) => {
        const [cls, label] = BADGE[b] || ["", b];
        return `<span class="badge ${cls}">${esc(label)}</span>`;
      }).join("");
  }

  function fieldTagsHTML(item) {
    return (item.fields || [])
      .filter((k) => k !== "general")
      .slice(0, 4)
      .map((k) => `<span class="field-tag">${esc(FIELD_LABEL[k] || k)}</span>`)
      .join("");
  }

  function deadlineMetaHTML(item) {
    withDeadline(item);
    if (item._dl) {
      const lbl = `${MONTHS[item._dl.getMonth()]} ${item._dl.getDate()}`;
      const rel = item._soon
        ? ` <strong class="soon-text">· ${item._dlDays === 0 ? "today" : "in " + item._dlDays + " day" + (item._dlDays === 1 ? "" : "s")}</strong>`
        : "";
      // One-time dates are exact (show the year); recurring ones are approximate.
      const text = item._oneTime
        ? `Deadline ${lbl}, ${item._dl.getFullYear()}`
        : `Next deadline ~${lbl}`;
      return `<span>📅 ${text}${rel}</span>`;
    }
    // No fixed date — say so explicitly rather than leaving the slot ambiguous.
    return `<span>📅 No fixed deadline${item.timing ? ` · ${esc(item.timing)}` : " — rolling / ongoing"}</span>`;
  }

  C.cardHTML = function (item) {
    withDeadline(item);
    const fields = fieldTagsHTML(item);
    return `<article class="card${item._soon ? " card--soon" : ""}">
      <div class="card-top">
        <div class="card-ic" aria-hidden="true">${item.icon || "📌"}</div>
        <div class="card-badges">${badgesHTML(item)}</div>
      </div>
      ${item.type ? `<div class="card-type">${esc(item.type)}</div>` : ""}
      <h3>${esc(item.title)}</h3>
      <div class="card-org">${esc(item.org)}</div>
      <p class="card-desc">${esc(item.desc)}</p>
      ${fields ? `<div class="card-fields">${fields}</div>` : ""}
      <div class="card-meta">
        <span>🎓 Grades ${esc(item.grades)}</span>
        <span>💰 ${esc(item.cost)}</span>
        ${deadlineMetaHTML(item)}
      </div>
      <a class="card-link" href="${esc(item.link)}" target="_blank" rel="noopener">
        Learn more <span class="arrow" aria-hidden="true">→</span>
      </a>
    </article>`;
  };

  C.renderFeatured = function (selector, count = 3) {
    const el = document.querySelector(selector);
    if (!el) return;
    const free = C.ALL.filter((x) => x.free);
    const soon = free.filter((x) => C.isClosingSoon(x));
    const featured = soon.concat(free.filter((x) => !C.isClosingSoon(x))).slice(0, count);
    el.innerHTML = featured.map(C.cardHTML).join("");
  };

  C.initExplorer = function () {
    const grid = document.getElementById("explore-grid");
    if (!grid) return;

    const state = { type: "all", field: "all", county: "all", grade: "all", free: false, soon: false, q: "", sort: "featured" };

    const matchType   = (i) => state.type === "all" || i.type.toLowerCase() === state.type;
    const matchField  = (i) => state.field === "all" || (i.fields || []).includes(state.field);
    const matchCounty = (i) => state.county === "all" || i.counties === "all" || i.counties.includes(state.county);
    const matchGrade  = (i) => state.grade === "all" || (i.gradeMin <= +state.grade && +state.grade <= i.gradeMax);
    const matchFree   = (i) => !state.free || i.free;
    const matchSoon   = (i) => !state.soon || C.isClosingSoon(i);
    const matchSearch = (i) => !state.q ||
      (i.title + i.desc + i.org + i.type + (i.fields || []).map((k) => FIELD_LABEL[k] || k).join(" ")).toLowerCase().includes(state.q);

    function sortItems(items) {
      if (state.sort === "deadline") {
        return items.slice().sort((a, b) => {
          const da = C.daysUntilDeadline(a), db = C.daysUntilDeadline(b);
          if (da == null && db == null) return 0;
          if (da == null) return 1;
          if (db == null) return -1;
          return da - db;
        });
      }
      return items.slice().sort((a, b) => (C.isClosingSoon(b) ? 1 : 0) - (C.isClosingSoon(a) ? 1 : 0));
    }

    const countEl = document.getElementById("result-count");

    function render() {
      let items = C.ALL.filter((i) =>
        matchType(i) && matchField(i) && matchCounty(i) && matchGrade(i) && matchFree(i) && matchSoon(i) && matchSearch(i));
      items = sortItems(items);
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

    const fieldChips = document.getElementById("field-chips");
    if (fieldChips) {
      fieldChips.innerHTML =
        `<button class="chip active" data-value="all" aria-pressed="true">All fields</button>` +
        C.FIELDS.map((f) =>
          `<button class="chip" data-value="${f.key}" aria-pressed="false">${esc(f.label)}</button>`).join("");
    }

    document.querySelectorAll(".chips").forEach((group) => {
      const key = group.dataset.filter;
      if (!key) return;
      group.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        group.querySelectorAll(".chip").forEach((c) => {
          c.classList.remove("active");
          c.setAttribute("aria-pressed", "false");
        });
        chip.classList.add("active");
        chip.setAttribute("aria-pressed", "true");
        state[key] = chip.dataset.value;
        render();
      });
    });

    const county = document.getElementById("county-select");
    if (county) {
      county.innerHTML =
        `<option value="all">All counties</option>` +
        C.COUNTIES.map((c) => `<option value="${c}">${c} County</option>`).join("");
      county.addEventListener("change", () => { state.county = county.value; render(); });
    }

    const grade = document.getElementById("grade-select");
    if (grade) {
      grade.addEventListener("change", () => { state.grade = grade.value; render(); });
    }

    const sort = document.getElementById("sort-select");
    if (sort) {
      sort.addEventListener("change", () => { state.sort = sort.value; render(); });
    }

    const freeToggle = document.getElementById("free-toggle");
    if (freeToggle) {
      freeToggle.addEventListener("change", () => { state.free = freeToggle.checked; render(); });
    }
    const soonToggle = document.getElementById("soon-toggle");
    if (soonToggle) {
      soonToggle.addEventListener("change", () => { state.soon = soonToggle.checked; render(); });
    }

    const search = document.getElementById("explore-search");
    if (search) {
      search.addEventListener("input", () => { state.q = search.value.trim().toLowerCase(); render(); });
    }

    const params = new URLSearchParams(location.search);
    const preType = params.get("type");
    if (preType) {
      const chip = document.querySelector(`.chips--type .chip[data-value="${preType.toLowerCase()}"]`);
      if (chip) chip.click();
    }
    const preField = params.get("field");
    if (preField) {
      const chip = document.querySelector(`#field-chips .chip[data-value="${preField.toLowerCase()}"]`);
      if (chip) chip.click();
    }
    const preCounty = params.get("county");
    if (preCounty && county && C.COUNTIES.includes(preCounty)) {
      county.value = preCounty; state.county = preCounty;
    }
    if (params.get("free") === "1" && freeToggle) { freeToggle.checked = true; state.free = true; }
    if (params.get("soon") === "1" && soonToggle) { soonToggle.checked = true; state.soon = true; }

    render();
  };

  C.injectCounts = function () {
    document.querySelectorAll("[data-count-key]").forEach((el) => {
      const v = C.COUNTS[el.dataset.countKey];
      if (v == null) return;
      el.dataset.countTo = String(v);
      // Always write the live value. The count-up animation overwrites this when
      // it runs, but if it never fires (reduced motion, no IntersectionObserver)
      // the markup's hard-coded fallback would otherwise be shown and go stale.
      el.textContent = String(v) + (el.dataset.suffix || "");
    });
    document.querySelectorAll("[data-count-text]").forEach((el) => {
      const v = C.COUNTS[el.dataset.countText];
      if (v != null) el.textContent = String(v);
    });
  };

  C.renderTips = function (selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.innerHTML = C.TIPS.map((t) => `<article class="tip" data-animate>
      <div class="tip-num" aria-hidden="true">${t.num}</div>
      <h3>${esc(t.title)}</h3>
      <p>${esc(t.text)}</p>
    </article>`).join("");
  };

  C.renderCounties = function (selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.innerHTML = C.COUNTIES.map((c) =>
      `<a class="county-pill" href="/explore?county=${encodeURIComponent(c)}">${c}</a>`).join("");
  };

  C.renderFieldPills = function (selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.innerHTML = C.FIELDS.filter((f) => f.key !== "general").map((f) =>
      `<a class="county-pill" href="/explore?field=${encodeURIComponent(f.key)}">${f.label}</a>`).join("");
  };

  C.renderCountyMarquee = function (selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    const once = C.COUNTIES.map((c) => `<span class="item">${c}</span>`).join("");
    el.innerHTML = once + once;
  };
})();
