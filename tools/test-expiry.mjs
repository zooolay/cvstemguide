#!/usr/bin/env node
// Guards the one rule that would be most damaging to get wrong:
// a recurring deadline must NEVER cause a listing to be archived.
//
//   node tools/test-expiry.mjs

import { isExpired, nextDeadline, daysUntil, readJSON, PATHS, flatten } from "./lib/data-io.mjs";

let fail = 0;
const t = (name, cond) => {
  console.log((cond ? "  pass  " : "  FAIL  ") + name);
  if (!cond) fail++;
};

const live = flatten(readJSON(PATHS.listings));

console.log(`1) Real listings must never expire, at any point in the year (${live.length} listings):`);
for (const when of ["2027-01-15", "2027-06-30", "2027-12-31", "2030-03-01"]) {
  const n = new Date(`${when}T12:00:00`);
  const gone = live.filter((x) => isExpired(x, n));
  t(`on ${when}: 0 expire` + (gone.length ? ` — got ${gone.map((g) => g.title).join(", ")}` : ""), gone.length === 0);
}

console.log("\n2) One-time dates and retireOn do expire (with a 14-day grace):");
const now = new Date("2026-07-27T12:00:00");
t("one-time 2026-01-10 (long past) expires",       isExpired({ deadline: "2026-01-10" }, now) === true);
t("one-time 2026-07-20 (7d ago, in grace) stays",  isExpired({ deadline: "2026-07-20" }, now) === false);
t("one-time 2026-07-01 (26d ago) expires",         isExpired({ deadline: "2026-07-01" }, now) === true);
t("one-time 2026-12-01 (future) stays",            isExpired({ deadline: "2026-12-01" }, now) === false);
t("retireOn 2026-01-01 expires",                   isExpired({ deadline: "03-15", retireOn: "2026-01-01" }, now) === true);
t("retireOn 2030-01-01 stays",                     isExpired({ deadline: "03-15", retireOn: "2030-01-01" }, now) === false);
t("recurring 01-10 (passed this year) stays",      isExpired({ deadline: "01-10" }, now) === false);
t("null deadline (rolling) stays",                 isExpired({ deadline: null }, now) === false);

console.log("\n3) Recurring deadlines roll forward; absolute ones keep their year:");
const rolled = nextDeadline("01-10", now);
t("01-10 rolls to 2027", rolled.getFullYear() === 2027 && daysUntil(rolled, now) > 0);
t("12-01 stays in 2026", nextDeadline("12-01", now).getFullYear() === 2026);
t("2028-04-05 keeps 2028", nextDeadline("2028-04-05", now).getFullYear() === 2028);

console.log(fail ? `\n${fail} FAILURE(S)` : "\nAll expiry tests passed.");
process.exit(fail ? 1 : 0);
