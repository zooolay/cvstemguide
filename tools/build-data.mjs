#!/usr/bin/env node
// Regenerates scripts/data.js from data/listings.json.
//
//   node tools/build-data.mjs          write scripts/data.js
//   node tools/build-data.mjs --check  verify it is up to date (exit 1 if not)

import fs from "node:fs";
import { PATHS, readJSON, generateDataJs } from "./lib/data-io.mjs";

const check = process.argv.includes("--check");
const data = readJSON(PATHS.listings);
const out = generateDataJs(data);
const total = data.programs.length + data.scholarships.length + data.competitions.length;

if (check) {
  const current = fs.existsSync(PATHS.dataJs) ? fs.readFileSync(PATHS.dataJs, "utf8") : "";
  if (current !== out) {
    console.error("scripts/data.js is out of date. Run: node tools/build-data.mjs");
    process.exit(1);
  }
  console.log(`scripts/data.js is up to date (${total} listings).`);
} else {
  fs.writeFileSync(PATHS.dataJs, out);
  console.log(`Wrote scripts/data.js — ${total} listings ` +
    `(${data.programs.length} programs, ${data.scholarships.length} scholarships, ${data.competitions.length} competitions).`);
}
