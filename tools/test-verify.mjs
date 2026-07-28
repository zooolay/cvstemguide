#!/usr/bin/env node
// Exercises the two guards that stop a fabricated listing reaching the site:
// real link verification, and dedupe against live + archived + pending data.
// Makes real network requests.
//
//   node tools/test-verify.mjs

import { linkResolves, knownKeys, identityKeys, readJSON, PATHS } from "./lib/data-io.mjs";

let fail = 0;
const t = (name, cond) => {
  console.log((cond ? "  pass  " : "  FAIL  ") + name);
  if (!cond) fail++;
};

console.log("1) Link verification (live network):");
const cases = [
  ["https://cosmos-ucop.ucdavis.edu/", true, "known-good site"],
  ["https://www.thegatesscholarship.org/scholarship", true, "known-good deep link"],
  ["https://cvstemguide.com/this-page-does-not-exist-xyz", false, "404 path"],
  ["https://this-domain-really-does-not-exist-98765.com/", false, "unresolvable domain"],
  ["not-a-url", false, "malformed URL"],
];
for (const [url, want, label] of cases) {
  const { ok, status } = await linkResolves(url, 20000);
  t(`${label}: ${ok ? "reachable" : "rejected"} (${status})`, ok === want);
}

console.log("\n2) Dedupe against live + archive + pending:");
const listings = readJSON(PATHS.listings);
const archive = readJSON(PATHS.archive, { items: [] });
const pending = readJSON(PATHS.pending, { candidates: [] });
const seen = knownKeys({ listings, archive, pending });

const cosmos = listings.programs.find((p) => p.id === "cosmos");
const hit = (item) => identityKeys(item).some((k) => seen.has(k));

t("exact existing listing is caught", hit(cosmos) === true);
t("same title, different URL is caught", hit({ title: cosmos.title, link: "https://elsewhere.example" }) === true);
t("same URL, different title is caught", hit({ title: "Totally Different Name", link: cosmos.link }) === true);
t("URL caught despite www/https/trailing-slash noise",
  hit({ title: "X", link: "HTTPS://WWW." + cosmos.link.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "") + "/" }) === true);
t("genuinely new listing passes", hit({ title: "Brand New Thing 2099", link: "https://example.org/new" }) === false);

console.log(fail ? `\n${fail} FAILURE(S)` : "\nAll verification tests passed.");
process.exit(fail ? 1 : 0);
