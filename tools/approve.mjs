#!/usr/bin/env node
// Review and promote discovery candidates from data/pending-review.json
// into data/listings.json, then regenerate scripts/data.js.
//
//   node tools/approve.mjs --list                 show what is waiting for review
//   node tools/approve.mjs --approve <id> [<id>]  promote listing(s) to live data
//   node tools/approve.mjs --approve-all          promote everything pending
//   node tools/approve.mjs --reject <id> [<id>]   drop candidate(s) from pending
//
// Rejected candidates are remembered in data/archive.json so the weekly job
// does not keep re-suggesting them.

import fs from "node:fs";
import { PATHS, TYPE_KEYS, readJSON, writeJSON, generateDataJs } from "./lib/data-io.mjs";

const args = process.argv.slice(2);
const flag = args.find((a) => a.startsWith("--")) || "--list";
const ids = args.filter((a) => !a.startsWith("--"));

const listings = readJSON(PATHS.listings);
const archive = readJSON(PATHS.archive, { items: [] });
const pending = readJSON(PATHS.pending, { candidates: [], skipped: [] });
const all = pending.candidates || [];

if (!all.length && flag !== "--list") {
  console.log("No candidates pending. (Leads from the free scan are added by hand — see --list.)");
  process.exit(0);
}

const rebuild = () => {
  writeJSON(PATHS.listings, listings);
  writeJSON(PATHS.archive, archive);
  writeJSON(PATHS.pending, pending);
  fs.writeFileSync(PATHS.dataJs, generateDataJs(listings));
};

if (flag === "--list") {
  if (!all.length && !pending.leads?.length) {
    console.log("Nothing pending review.");
  } else if (!all.length) {
    console.log("No schema-complete candidates pending.");
  } else {
    console.log(`${all.length} candidate(s) awaiting review:\n`);
    for (const c of all) {
      console.log(`  ${c.id}`);
      console.log(`    ${c.type} · ${c.title}`);
      console.log(`    ${c.org} — grades ${c.grades} — ${c.cost}`);
      console.log(`    deadline: ${c.deadline ?? "none (rolling)"} · link ${c.link}`);
      console.log(`    found via: ${c.source?.name ?? "unknown"}\n`);
    }
    console.log("Approve with:  node tools/approve.mjs --approve " + all[0].id);
  }
  if (pending.leads?.length) {
    console.log(`\n${pending.leads.length} lead(s) from the free source scan.`);
    console.log("These are pages that look like opportunities — open each, and if it belongs,");
    console.log("add it to data/listings.json yourself and run: node tools/build-data.mjs\n");
    for (const l of pending.leads) {
      console.log(`  ${l.title}`);
      console.log(`    ${l.url}`);
      console.log(`    found on ${l.source?.name ?? "unknown"} (${l.foundAt})\n`);
    }
  }
  if (pending.skipped?.length) {
    console.log(`\n${pending.skipped.length} item(s) were skipped during discovery:`);
    for (const s of pending.skipped) console.log(`  [${s.reason}] ${s.detail}`);
  }
  process.exit(0);
}

const selected = flag === "--approve-all" ? all.slice() : all.filter((c) => ids.includes(c.id));

if (!selected.length) {
  console.error(ids.length ? `No pending candidate matches: ${ids.join(", ")}` : "Pass one or more candidate ids, or --approve-all.");
  process.exit(1);
}

if (flag === "--approve" || flag === "--approve-all") {
  for (const c of selected) {
    const key = TYPE_KEYS[c.type];
    // Strip review-only metadata; keep the fields the site actually renders.
    const { linkVerified, ...listing } = c;
    delete listing.type;
    listings[key].push(listing);
    console.log(`approved  ${c.type.padEnd(12)} ${c.title}`);
  }
  pending.candidates = all.filter((c) => !selected.includes(c));
  rebuild();
  const total = listings.programs.length + listings.scholarships.length + listings.competitions.length;
  console.log(`\nLive listings: ${total}. Still pending: ${pending.candidates.length}.`);
  console.log("scripts/data.js regenerated — commit data/ and scripts/data.js to publish.");
} else if (flag === "--reject") {
  for (const c of selected) {
    archive.items.push({ ...c, archivedOn: new Date().toISOString().slice(0, 10), archivedReason: "rejected in review" });
    console.log(`rejected  ${c.title}`);
  }
  pending.candidates = all.filter((c) => !selected.includes(c));
  rebuild();
  console.log(`\nStill pending: ${pending.candidates.length}. Rejected items are remembered so they are not re-suggested.`);
} else {
  console.error(`Unknown flag: ${flag}`);
  process.exit(1);
}
