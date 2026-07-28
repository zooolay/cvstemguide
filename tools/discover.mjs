#!/usr/bin/env node
// ============================================================================
// OPTIONAL — THIS SCRIPT COSTS MONEY. It is NOT wired into any workflow.
//
// The free equivalent is tools/scan-sources.mjs, which runs weekly and needs no
// API key. Use this one only if you later decide you want listings auto-filled
// (description, grades, deadline) instead of just links. Roughly $1.50-$3.50
// per run. It refuses to run without ANTHROPIC_API_KEY, so it can never bill
// you by accident.
// ============================================================================
//
// Asks Claude (with the web search tool) to find new STEM opportunities on the
// curated sources, verifies every link resolves, dedupes against live +
// archived + pending data, and writes candidates to data/pending-review.json.
//
// Nothing here ever publishes to the live site. Approval is a separate step
// (tools/approve.mjs).
//
//   ANTHROPIC_API_KEY=sk-... node tools/discover.mjs
//   node tools/discover.mjs --dry-run   run without writing pending-review.json
//
// Env knobs: CLAUDE_MODEL, MAX_SOURCES, MAX_SEARCHES_PER_SOURCE, MAX_CANDIDATES

import {
  PATHS, readJSON, writeJSON, knownKeys, identityKeys, slugify,
  linkResolves, RECURRING, ABSOLUTE,
} from "./lib/data-io.mjs";

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5";
const SEARCH_TOOL = process.env.WEB_SEARCH_TOOL_VERSION || "web_search_20250305";
const MAX_SOURCES = Number(process.env.MAX_SOURCES || 0) || Infinity;
const MAX_SEARCHES = Number(process.env.MAX_SEARCHES_PER_SOURCE || 4);
const MAX_CANDIDATES = Number(process.env.MAX_CANDIDATES || 25);
const DRY_RUN = process.argv.includes("--dry-run");

if (!API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set. See README-automation.md for setup.");
  process.exit(1);
}

const listings = readJSON(PATHS.listings);
const archive = readJSON(PATHS.archive, { items: [] });
const pending = readJSON(PATHS.pending, { candidates: [], skipped: [] });
const { sources } = readJSON(PATHS.sources);

const FIELD_KEYS = listings.fields.map((f) => f.key);
const COUNTIES = listings.counties;
const seen = knownKeys({ listings, archive, pending });

const candidates = [];
const skipped = [];
const skip = (reason, detail) => {
  skipped.push({ reason, detail });
  console.log(`    skip — ${reason}: ${detail}`);
};

/* ------------------------------------------------------------------ *
 * Claude call
 * ------------------------------------------------------------------ */
const SYSTEM = `You find real, verifiable pre-college STEM opportunities for high school students in California's Central Valley.

Absolute rules:
- Only report opportunities you actually found on the searched website. Never invent a program, deadline, cost, or URL.
- Never guess a deadline. If you cannot find an explicit deadline, use null.
- Every "link" must be a URL you actually saw in search results, pointing to the official page for that opportunity.
- Only include things a HIGH SCHOOL student (grades 6-12) can apply to. Skip anything for undergraduates, graduate students, teachers, or transfer students.
- If a page describes a program that has clearly been discontinued or whose last cycle was more than two years ago, skip it.
- Reporting nothing is a perfectly good outcome. An empty list is far better than a fabricated entry.`;

const userPrompt = (source) => `Search ${source.domain} for pre-college STEM opportunities open to high school students.

Focus: ${source.focus}

Return ONLY a JSON object in a \`\`\`json fenced block, shaped like:

{
  "found": [
    {
      "title": "Official program name",
      "type": "Program" | "Scholarship" | "Competition",
      "org": "Hosting organization",
      "desc": "2-3 factual sentences. What it is, who it is for, why a Central Valley student would care.",
      "fields": ["one or more of: ${FIELD_KEYS.join(", ")}"],
      "gradeMin": 9,
      "gradeMax": 12,
      "grades": "9 to 12",
      "counties": "all" | ["subset of: ${COUNTIES.join(", ")}"],
      "cost": "Free" | "~$250" | "Varies — see site",
      "free": true | false,
      "deadline": null | "MM-DD" | "YYYY-MM-DD",
      "timing": "When it runs, e.g. Summer (June-July)",
      "link": "https://official-page-you-actually-saw"
    }
  ]
}

deadline rules:
- "MM-DD"      the program recurs annually and this is its usual closing date
- "YYYY-MM-DD" a specific one-time deadline for a single cycle
- null         rolling, ongoing, or you could not find an explicit date

counties: use "all" unless the program is genuinely restricted to specific counties.
If you find nothing suitable, return {"found": []}.`;

async function askClaude(source) {
  const body = {
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM,
    tools: [{
      type: SEARCH_TOOL,
      name: "web_search",
      max_uses: MAX_SEARCHES,
      allowed_domains: [source.domain],
    }],
    messages: [{ role: "user", content: userPrompt(source) }],
  };

  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) return res.json();

    const text = await res.text();
    // 429 / 5xx are worth retrying with backoff; everything else is fatal for this source.
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      const wait = attempt * 5000;
      console.log(`    retrying in ${wait / 1000}s (HTTP ${res.status})`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    throw new Error(`API ${res.status}: ${text.slice(0, 300)}`);
  }
}

const extractJSON = (msg) => {
  const text = (msg.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : (text.match(/\{[\s\S]*\}/) || [])[0];
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

/* ------------------------------------------------------------------ *
 * Validation — shape must match the site schema before anything is kept.
 * ------------------------------------------------------------------ */
function validate(item) {
  if (!item || typeof item !== "object") return "not an object";
  for (const k of ["title", "type", "org", "desc", "link"]) {
    if (!item[k] || typeof item[k] !== "string") return `missing ${k}`;
  }
  if (!["Program", "Scholarship", "Competition"].includes(item.type)) return `bad type "${item.type}"`;
  if (!/^https?:\/\//.test(item.link)) return "link is not an http(s) URL";
  if (!Array.isArray(item.fields) || !item.fields.length) return "missing fields[]";
  const bad = item.fields.filter((f) => !FIELD_KEYS.includes(f));
  if (bad.length) return `unknown field key(s): ${bad.join(", ")}`;
  if (!Number.isInteger(item.gradeMin) || !Number.isInteger(item.gradeMax)) return "gradeMin/gradeMax must be integers";
  if (item.gradeMin < 6 || item.gradeMax > 12 || item.gradeMin > item.gradeMax) return "grade range outside 6-12";
  if (item.deadline != null && !RECURRING.test(item.deadline) && !ABSOLUTE.test(item.deadline)) {
    return `bad deadline format "${item.deadline}"`;
  }
  if (item.counties !== "all") {
    if (!Array.isArray(item.counties) || !item.counties.length) return "counties must be \"all\" or a non-empty array";
    const badC = item.counties.filter((c) => !COUNTIES.includes(c));
    if (badC.length) return `unknown county/counties: ${badC.join(", ")}`;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */
const list = sources.slice(0, MAX_SOURCES === Infinity ? undefined : MAX_SOURCES);
console.log(`Discovery run — ${list.length} source(s), model ${MODEL}\n`);

for (const source of list) {
  if (candidates.length >= MAX_CANDIDATES) {
    console.log(`Reached MAX_CANDIDATES (${MAX_CANDIDATES}); stopping early.`);
    break;
  }
  console.log(`> ${source.name} (${source.domain})`);

  let msg;
  try {
    msg = await askClaude(source);
  } catch (err) {
    skip("api-error", `${source.name}: ${err.message}`);
    continue;
  }

  const parsed = extractJSON(msg);
  if (!parsed || !Array.isArray(parsed.found)) {
    skip("unparseable-response", source.name);
    continue;
  }
  if (!parsed.found.length) {
    console.log("    nothing new found");
    continue;
  }

  for (const item of parsed.found) {
    const problem = validate(item);
    if (problem) { skip("invalid-shape", `${item?.title || "untitled"} — ${problem}`); continue; }

    if (identityKeys(item).some((k) => seen.has(k))) {
      skip("duplicate", `${item.title} — already in live data, archive, or pending`);
      continue;
    }

    const { ok, status } = await linkResolves(item.link);
    if (!ok) { skip("link-unverified", `${item.title} — ${item.link} returned ${status}`); continue; }

    identityKeys(item).forEach((k) => seen.add(k));
    candidates.push({
      ...item,
      id: slugify(item.title),
      icon: "📌",
      badges: item.type === "Competition" ? ["competition"]
            : item.type === "Scholarship" ? ["scholarship"] : [],
      source: { name: source.name, domain: source.domain },
      addedOn: new Date().toISOString().slice(0, 10),
      linkVerified: { status, checkedAt: new Date().toISOString() },
    });
    console.log(`    + ${item.title} (link ${status})`);
  }
}

console.log(`\n${candidates.length} new candidate(s), ${skipped.length} skipped.`);

if (DRY_RUN) {
  console.log("--dry-run: pending-review.json not written.");
} else {
  writeJSON(PATHS.pending, {
    generatedAt: new Date().toISOString(),
    model: MODEL,
    candidates: [...(pending.candidates || []), ...candidates],
    skipped,
  });
  console.log(`Wrote ${PATHS.pending}`);
}

// Surface a machine-readable count for the workflow step.
if (process.env.GITHUB_OUTPUT) {
  const { appendFileSync } = await import("node:fs");
  appendFileSync(process.env.GITHUB_OUTPUT, `new_count=${candidates.length}\n`);
}
