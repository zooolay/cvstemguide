#!/usr/bin/env node
// Moves expired listings out of data/listings.json into data/archive.json,
// then regenerates scripts/data.js. Nothing is ever hard-deleted.
//
// A listing expires only when it can never come around again:
//   - a one-time "YYYY-MM-DD" deadline that passed (plus a grace period), or
//   - an explicit retireOn date that passed.
// Recurring "MM-DD" deadlines roll forward and are never archived.
//
//   node tools/archive-expired.mjs           apply
//   node tools/archive-expired.mjs --dry-run report only, change nothing

import fs from "node:fs";
import {
  PATHS, KEY_TYPES, readJSON, writeJSON, isExpired, generateDataJs,
} from "./lib/data-io.mjs";

const dryRun = process.argv.includes("--dry-run");
const now = new Date();

const listings = readJSON(PATHS.listings);
const archive = readJSON(PATHS.archive, { items: [] });

const expired = [];
for (const key of Object.keys(KEY_TYPES)) {
  const keep = [];
  for (const item of listings[key] || []) {
    if (isExpired(item, now)) {
      expired.push({
        ...item,
        type: KEY_TYPES[key],
        archivedOn: now.toISOString().slice(0, 10),
        archivedReason: item.retireOn ? "retireOn date passed" : "one-time deadline passed",
      });
    } else {
      keep.push(item);
    }
  }
  listings[key] = keep;
}

if (!expired.length) {
  console.log("No expired listings. Nothing to archive.");
  // Still make sure the generated file is in sync.
  if (!dryRun) fs.writeFileSync(PATHS.dataJs, generateDataJs(listings));
  process.exit(0);
}

console.log(`Archiving ${expired.length} expired listing(s):`);
expired.forEach((e) => console.log(`  - [${e.type}] ${e.title} (${e.archivedReason})`));

if (dryRun) {
  console.log("\n--dry-run: no files written.");
  process.exit(0);
}

archive.items = [...(archive.items || []), ...expired];
writeJSON(PATHS.archive, archive);
writeJSON(PATHS.listings, listings);
fs.writeFileSync(PATHS.dataJs, generateDataJs(listings));

const total = listings.programs.length + listings.scholarships.length + listings.competitions.length;
console.log(`\nArchived ${expired.length}. Live listings now: ${total}. Archive holds ${archive.items.length}.`);
