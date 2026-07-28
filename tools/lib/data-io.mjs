// Shared helpers for the CV STEM Guide data tools.
// data/listings.json is the source of truth; scripts/data.js is generated from it.
// No external dependencies — Node 18+ built-ins only.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const PATHS = {
  listings: path.join(ROOT, "data", "listings.json"),
  archive: path.join(ROOT, "data", "archive.json"),
  pending: path.join(ROOT, "data", "pending-review.json"),
  sources: path.join(ROOT, "data", "sources.json"),
  dataJs: path.join(ROOT, "scripts", "data.js"),
};

export const TYPE_KEYS = { Program: "programs", Scholarship: "scholarships", Competition: "competitions" };
export const KEY_TYPES = { programs: "Program", scholarships: "Scholarship", competitions: "Competition" };

export const readJSON = (p, fallback = null) => {
  if (!fs.existsSync(p)) {
    if (fallback !== null) return fallback;
    throw new Error(`Missing required file: ${p}`);
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
};

export const writeJSON = (p, value) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(value, null, 2) + "\n");
};

/** Every listing across the three type buckets, each tagged with its `type`. */
export const flatten = (d) =>
  Object.entries(KEY_TYPES).flatMap(([key, type]) => (d[key] || []).map((x) => ({ ...x, type })));

/* ------------------------------------------------------------------ *
 * Deadline semantics — must stay in sync with scripts/ui.js
 *
 *   null            rolling / ongoing. Never expires.
 *   "MM-DD"         recurring annually. Rolls to next occurrence, never expires.
 *   "YYYY-MM-DD"    one-time. Expires once the date has passed.
 *   retireOn        "YYYY-MM-DD" — hard stop (program discontinued), always expires.
 * ------------------------------------------------------------------ */

export const RECURRING = /^\d{2}-\d{2}$/;
export const ABSOLUTE = /^\d{4}-\d{2}-\d{2}$/;

export const startOfToday = (now = new Date()) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate());

/** Next occurrence of a deadline, or null if there is no fixed date. */
export function nextDeadline(deadline, now = new Date()) {
  if (!deadline) return null;
  const today = startOfToday(now);
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

export const daysUntil = (date, now = new Date()) =>
  Math.round((date - startOfToday(now)) / 86400000);

/**
 * Expired means "will never come around again" — a one-time date that has passed,
 * or an explicit retireOn. Recurring deadlines roll over and are never expired.
 * `graceDays` keeps a just-closed listing visible briefly (late submissions, TZ skew).
 */
export function isExpired(item, now = new Date(), graceDays = 14) {
  if (item.retireOn && ABSOLUTE.test(item.retireOn)) {
    const dt = nextDeadline(item.retireOn, now);
    if (dt && daysUntil(dt, now) < 0) return true;
  }
  if (item.deadline && ABSOLUTE.test(item.deadline)) {
    const dt = nextDeadline(item.deadline, now);
    if (dt && daysUntil(dt, now) < -graceDays) return true;
  }
  return false;
}

/* ------------------------------------------------------------------ *
 * Identity / dedupe
 * ------------------------------------------------------------------ */

export const normalizeUrl = (u = "") =>
  String(u).trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[/?#]+$/, "");

export const normalizeTitle = (t = "") =>
  String(t).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Dedupe keys for one listing: title and source URL, per the review spec. */
export const identityKeys = (item) => [
  `t:${normalizeTitle(item.title)}`,
  `u:${normalizeUrl(item.link)}`,
];

/** Set of every identity key already known (live + archive + pending). */
export function knownKeys({ listings, archive, pending }) {
  const set = new Set();
  const add = (item) => identityKeys(item).forEach((k) => set.add(k));
  if (listings) flatten(listings).forEach(add);
  if (archive) (archive.items || []).forEach(add);
  if (pending) (pending.candidates || []).forEach(add);
  return set;
}

export const slugify = (s = "") =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);

/* ------------------------------------------------------------------ *
 * Link verification
 *
 * "Unreachable" is not the same as "gone", and conflating them is dangerous:
 * measured against the real listings, plain 403s came back 200 under a browser
 * User-Agent, and Conrad/HOSA fail only on Node's TLS stack while working fine
 * in a browser. Archiving on those would delete healthy programs.
 *
 * verdict:
 *   ok      2xx/3xx — reachable
 *   gone    404/410 — definitively removed; the ONLY verdict allowed to archive
 *   blocked 401/403/429 — bot protection; site is probably alive
 *   error   5xx, DNS, TLS, timeout — inconclusive, likely transient
 * ------------------------------------------------------------------ */

// Some university and .org sites reject non-browser agents outright.
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

export const classify = (status) => {
  if (typeof status !== "number") return "error";
  if (status >= 200 && status < 400) return "ok";
  if (status === 404 || status === 410) return "gone";
  if (status === 401 || status === 403 || status === 429) return "blocked";
  return "error";
};

export async function linkResolves(url, timeoutMs = 15000) {
  if (!/^https?:\/\//i.test(url || "")) return { ok: false, status: "not-a-url", verdict: "error" };

  const attempt = async (method) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: ctrl.signal,
        headers: {
          "User-Agent": BROWSER_UA,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      return res.status;
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    let status = await attempt("HEAD");
    // Many .edu sites reject HEAD but serve GET fine.
    if (status === 405 || status === 403 || status >= 500) {
      try { status = await attempt("GET"); } catch { /* keep the HEAD status */ }
    }
    return { ok: classify(status) === "ok", status, verdict: classify(status) };
  } catch (err) {
    const detail = err.name === "TimeoutError" || err.name === "AbortError"
      ? "timeout"
      : String(err.cause?.code || err.message || err).slice(0, 40);
    return { ok: false, status: detail, verdict: "error" };
  }
}

/* ------------------------------------------------------------------ *
 * scripts/data.js generation
 * ------------------------------------------------------------------ */

const j = (v) => JSON.stringify(v);

// Field order mirrors the original hand-written file so diffs stay readable.
const LINES = [
  ["id", "icon", "title", "org"],
  ["desc"],
  ["fields", "gradeMin", "gradeMax", "grades"],
  ["cost", "free", "deadline", "timing"],
  ["link", "badges", "counties"],
  ["retireOn", "source", "addedOn"],
];

function formatItem(item) {
  const body = LINES
    .map((group) => group.filter((k) => item[k] !== undefined).map((k) => `${k}:${j(item[k])}`).join(", "))
    .filter(Boolean)
    .map((line) => `    ${line}`)
    .join(",\n");
  return `  {\n${body} },`;
}

const formatArray = (name, items) =>
  `CVSTEM.${name} = [\n${items.map(formatItem).join("\n\n")}\n];\n`;

export function generateDataJs(d) {
  return `// GENERATED FILE — DO NOT EDIT BY HAND.
// Source of truth: data/listings.json
// Regenerate with:  node tools/build-data.mjs
//
// Deadline field:
//   null         rolling / ongoing (the \`timing\` string is shown instead)
//   "MM-DD"      recurring annually — rolls forward, never expires
//   "YYYY-MM-DD" one-time — auto-archived once it has passed
// Optional \`retireOn\` ("YYYY-MM-DD") retires a discontinued program.

window.CVSTEM = window.CVSTEM || {};

CVSTEM.COUNTIES = ${j(d.counties)};

CVSTEM.FIELDS = [
${d.fields.map((f) => `  { key: ${j(f.key)}, label: ${j(f.label)} },`).join("\n")}
];

${formatArray("PROGRAMS", d.programs)}
${formatArray("SCHOLARSHIPS", d.scholarships)}
${formatArray("COMPETITIONS", d.competitions)}
CVSTEM.TIPS = [
${d.tips.map((t) => `  { num:${j(t.num)}, title:${j(t.title)}, text:${j(t.text)} },`).join("\n")}
];

CVSTEM.ALL = [
  ...CVSTEM.PROGRAMS.map(x => ({ ...x, type: "Program" })),
  ...CVSTEM.SCHOLARSHIPS.map(x => ({ ...x, type: "Scholarship" })),
  ...CVSTEM.COMPETITIONS.map(x => ({ ...x, type: "Competition" })),
];

CVSTEM.COUNTS = {
  total:         CVSTEM.ALL.length,
  programs:      CVSTEM.PROGRAMS.length,
  scholarships:  CVSTEM.SCHOLARSHIPS.length,
  competitions:  CVSTEM.COMPETITIONS.length,
  fields:        CVSTEM.FIELDS.filter(f => f.key !== "general").length,
  counties:      CVSTEM.COUNTIES.length,
};
`;
}
