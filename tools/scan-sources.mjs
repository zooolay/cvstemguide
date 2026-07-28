#!/usr/bin/env node
// Free discovery. Crawls the hub pages of trusted sources, finds NEW same-domain
// pages whose text looks like a student STEM opportunity, verifies they resolve,
// and records them as leads in data/pending-review.json.
//
// No API key, no cost. The trade-off vs. the paid LLM version: this produces
// LEADS (url + title + why it matched), not filled-in listings. You still write
// the description, grades, and deadline yourself — but you no longer have to
// check 17 sites by hand to notice something new exists.
//
// Hub pages come from data/sources.json `watch` entries plus the links of
// listings you already have on that domain, so no URL here is invented.
//
//   node tools/scan-sources.mjs            scan and record new leads
//   node tools/scan-sources.mjs --dry-run  report only, write nothing

import fs from "node:fs";
import {
  PATHS, readJSON, writeJSON, flatten, linkResolves, normalizeUrl, knownKeys,
} from "./lib/data-io.mjs";

const SEEN = PATHS.listings.replace(/listings\.json$/, "seen-urls.json");
const MAX_LEADS = Number(process.env.MAX_LEADS || 40);
const MAX_LINKS_PER_HUB = Number(process.env.MAX_LINKS_PER_HUB || 60);
const dryRun = process.argv.includes("--dry-run");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

// A page is interesting only if it looks like an opportunity AND like it is for
// pre-college students. Both groups must match, which kills most of the noise.
const OPPORTUNITY = /\b(summer camp|summer program|summer academy|academy|internship|scholarship|competition|workshop|bootcamp|outreach|pre-?college|research experience|dual enrollment|pathway)\b/i;
const AUDIENCE = /\b(high school|highschool|teen|grades? \d|9th|10th|11th|12th|k-?12|middle school|youth|student)\b/i;
const EXCLUDE = /\b(graduate|phd|doctoral|faculty|staff|employee|alumni|donate|giving|privacy|accessibility|login|sitemap|covid)\b/i;

const listings = readJSON(PATHS.listings);
const archive = readJSON(PATHS.archive, { items: [] });
const pending = readJSON(PATHS.pending, { candidates: [], skipped: [], leads: [] });
const { sources } = readJSON(PATHS.sources);
const seenStore = readJSON(SEEN, { urls: [] });

const seenUrls = new Set(seenStore.urls);
const knownListingKeys = knownKeys({ listings, archive, pending });
for (const l of pending.leads || []) seenUrls.add(normalizeUrl(l.url));

const fetchText = async (url) => {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!type.includes("html")) return null;
    return { html: await res.text(), finalUrl: res.url };
  } catch {
    return null;
  }
};

const titleOf = (html) => {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, " ").trim().slice(0, 140) : "";
};

/** Same-domain <a href> targets with their anchor text. */
function extractLinks(html, baseUrl, domain) {
  const out = new Map();
  const re = /<a\b[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    let href = m[1].trim();
    if (/^(mailto:|tel:|javascript:)/i.test(href)) continue;
    let abs;
    try { abs = new URL(href, baseUrl); } catch { continue; }
    if (!/^https?:$/.test(abs.protocol)) continue;
    if (!abs.hostname.endsWith(domain)) continue;
    if (/\.(pdf|jpe?g|png|gif|svg|zip|docx?|pptx?|xlsx?)$/i.test(abs.pathname)) continue;
    abs.hash = "";
    const text = m[2].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const key = abs.toString();
    if (!out.has(key)) out.set(key, text.slice(0, 120));
  }
  return [...out.entries()];
}

/* ------------------------------------------------------------------ */

const leads = [];
const scannedHubs = [];

for (const source of sources) {
  // Hub pages: explicit `watch` entries, plus links of existing listings on this domain.
  const fromListings = flatten(listings)
    .map((x) => x.link)
    .filter((u) => { try { return new URL(u).hostname.endsWith(source.domain); } catch { return false; } });
  const hubs = [...new Set([...(source.watch || []), ...fromListings])].slice(0, 4);

  if (!hubs.length) {
    console.log(`> ${source.name}: no known page to crawl (add a "watch" URL in data/sources.json)`);
    continue;
  }

  console.log(`> ${source.name} — ${hubs.length} hub page(s)`);

  for (const hub of hubs) {
    const page = await fetchText(hub);
    if (!page) { console.log(`    unreachable: ${hub}`); continue; }
    scannedHubs.push(hub);

    const links = extractLinks(page.html, page.finalUrl, source.domain).slice(0, MAX_LINKS_PER_HUB);
    for (const [url, anchor] of links) {
      const norm = normalizeUrl(url);
      if (seenUrls.has(norm)) continue;
      if (knownListingKeys.has(`u:${norm}`)) { seenUrls.add(norm); continue; }

      const haystack = `${anchor} ${url}`;
      if (EXCLUDE.test(haystack)) continue;
      if (!OPPORTUNITY.test(haystack) || !AUDIENCE.test(haystack)) continue;

      seenUrls.add(norm);
      if (leads.length >= MAX_LEADS) continue;

      const { ok, status, verdict } = await linkResolves(url, 20000);
      if (!ok) { console.log(`    unverified (${status}): ${url}`); continue; }

      const detail = await fetchText(url);
      leads.push({
        url,
        title: titleOf(detail?.html || "") || anchor || url,
        anchorText: anchor,
        source: { name: source.name, domain: source.domain },
        foundOn: hub,
        foundAt: new Date().toISOString().slice(0, 10),
        linkVerified: { status, verdict },
      });
      console.log(`    + ${anchor || url}`);
      console.log(`      ${url}`);
    }
  }
}

console.log(`\n${leads.length} new lead(s) from ${scannedHubs.length} hub page(s).`);
if (!leads.length) console.log("Nothing new — every matching page was already known.");

if (dryRun) {
  console.log("--dry-run: nothing written.");
  process.exit(0);
}

writeJSON(SEEN, { updatedAt: new Date().toISOString(), urls: [...seenUrls].sort() });
writeJSON(PATHS.pending, {
  ...pending,
  generatedAt: new Date().toISOString(),
  leads: [...(pending.leads || []), ...leads],
});
console.log(`Wrote ${PATHS.pending} and ${SEEN}`);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `lead_count=${leads.length}\n`);
}
