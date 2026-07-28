#!/usr/bin/env node
// Free link-health monitoring. Fetches every listing's official page and tracks
// health in data/link-health.json. A listing whose link returns 404/410 on
// FAIL_THRESHOLD consecutive checks is archived automatically.
//
// This is the main "auto-remove" signal: programs rarely announce that they have
// shut down, but their page goes 404. No API key, no cost.
//
// Only a definitive 404/410 can archive. Measured against the real listings,
// 403s were bot protection (the same URLs return 200 under a browser UA) and
// some TLS failures are Node-only quirks — treating those as "dead" would
// delete healthy programs.
//
//   node tools/check-links.mjs            check, update health, archive dead links
//   node tools/check-links.mjs --dry-run  report only, write nothing
//   node tools/check-links.mjs --report   show current health, check nothing

import fs from "node:fs";
import {
  PATHS, KEY_TYPES, readJSON, writeJSON, flatten, linkResolves, generateDataJs,
} from "./lib/data-io.mjs";

const HEALTH = PATHS.listings.replace(/listings\.json$/, "link-health.json");
const FAIL_THRESHOLD = Number(process.env.FAIL_THRESHOLD || 3);
const CONCURRENCY = Number(process.env.LINK_CONCURRENCY || 6);

const dryRun = process.argv.includes("--dry-run");
const reportOnly = process.argv.includes("--report");
const today = new Date().toISOString().slice(0, 10);

const listings = readJSON(PATHS.listings);
const archive = readJSON(PATHS.archive, { items: [] });
const health = readJSON(HEALTH, { checkedAt: null, links: {} });

if (reportOnly) {
  const entries = Object.entries(health.links || {});
  if (!entries.length) {
    console.log("No health data yet. Run: node tools/check-links.mjs");
    process.exit(0);
  }
  const failing = entries.filter(([, h]) => h.lastVerdict && h.lastVerdict !== "ok");
  console.log(`Last checked: ${health.checkedAt}`);
  console.log(`${entries.length} link(s) tracked, ${failing.length} currently failing.\n`);
  for (const [url, h] of failing.sort((a, b) => b[1].consecutiveGone - a[1].consecutiveGone)) {
    console.log(`  [${h.lastVerdict}] ${h.consecutiveGone}x gone  ${h.lastStatus}  ${h.title}`);
    console.log(`        ${url}`);
  }
  process.exit(0);
}

/** Small concurrency pool — be polite to .edu servers. */
async function mapPool(items, limit, fn) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }));
  return out;
}

const all = flatten(listings);
console.log(`Checking ${all.length} link(s), ${CONCURRENCY} at a time...\n`);

const results = await mapPool(all, CONCURRENCY, async (item) => {
  const { ok, status, verdict } = await linkResolves(item.link, 20000);
  return { item, ok, status, verdict };
});

const links = health.links || {};
const nowDead = [];
const needsEyes = [];

for (const { item, status, verdict } of results) {
  const prev = links[item.link] || { consecutiveGone: 0 };
  // ONLY a definitive 404/410 counts toward archiving. Bot-blocks and transient
  // errors are recorded for review but never remove a listing.
  const consecutiveGone = verdict === "gone" ? prev.consecutiveGone + 1 : 0;
  links[item.link] = {
    title: item.title,
    lastStatus: status,
    lastVerdict: verdict,
    lastCheckedAt: today,
    consecutiveGone,
    lastOkAt: verdict === "ok" ? today : (prev.lastOkAt || null),
  };

  if (verdict === "gone") {
    const marker = consecutiveGone >= FAIL_THRESHOLD ? "GONE " : "404  ";
    console.log(`  ${marker} [${consecutiveGone}x] ${status}  ${item.title}`);
    if (consecutiveGone >= FAIL_THRESHOLD) nowDead.push(item);
  } else if (verdict !== "ok") {
    console.log(`  ${verdict === "blocked" ? "block" : "err  "}       ${status}  ${item.title}`);
    needsEyes.push({ title: item.title, link: item.link, status, verdict });
  }
}

const okCount = results.filter((r) => r.verdict === "ok").length;
const goneCount = results.filter((r) => r.verdict === "gone").length;
console.log(`\n${okCount}/${results.length} reachable · ${goneCount} returning 404/410 · ${needsEyes.length} inconclusive (bot-blocked or transient).`);
console.log("Inconclusive results never archive anything — they are reported only.");

if (!nowDead.length) {
  console.log(`\nNothing has returned 404/410 for ${FAIL_THRESHOLD}+ consecutive checks. No archiving.`);
} else {
  console.log(`\n${nowDead.length} listing(s) gone for ${FAIL_THRESHOLD}+ consecutive checks:`);
  nowDead.forEach((d) => console.log(`  - ${d.title}`));
}

if (dryRun) {
  console.log("\n--dry-run: nothing written.");
  process.exit(0);
}

// Archive anything that has been dead long enough. Archiving is reversible —
// the full record is kept in archive.json and can be restored.
if (nowDead.length) {
  const deadLinks = new Set(nowDead.map((d) => d.link));
  for (const key of Object.keys(KEY_TYPES)) {
    listings[key] = (listings[key] || []).filter((item) => {
      if (!deadLinks.has(item.link)) return true;
      archive.items.push({
        ...item,
        type: KEY_TYPES[key],
        archivedOn: today,
        archivedReason: `link returned 404/410 on ${links[item.link].consecutiveGone} consecutive checks`,
      });
      return false;
    });
  }
  writeJSON(PATHS.listings, listings);
  writeJSON(PATHS.archive, archive);
  fs.writeFileSync(PATHS.dataJs, generateDataJs(listings));
  const total = flatten(listings).length;
  console.log(`\nArchived ${nowDead.length}. Live listings now: ${total}.`);
}

writeJSON(HEALTH, { checkedAt: new Date().toISOString(), links });
console.log(`Wrote ${HEALTH}`);

if (process.env.GITHUB_OUTPUT) {
  const failing = Object.values(links).filter((h) => h.consecutiveGone > 0).length;
  fs.appendFileSync(process.env.GITHUB_OUTPUT,
    `archived_count=${nowDead.length}\nfailing_count=${failing}\n`);
}
