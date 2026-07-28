# Deadline & listing automation

**Everything here is free.** No API key, no paid services, no npm dependencies —
Node's built-ins only. GitHub Actions is free for public repos. The site still loads
`scripts/data.js` from a plain `<script>` tag exactly as before.

```
data/listings.json        source of truth — edit this, never scripts/data.js
data/archive.json         expired, dead-link, and rejected listings (never hard-deleted)
data/pending-review.json  leads awaiting your review
data/link-health.json     per-link health history
data/seen-urls.json       URLs already surfaced, so leads are not repeated
data/sources.json         the trusted sites the weekly scan may visit
scripts/data.js           GENERATED from listings.json — do not hand-edit
```

## Deadline formats

| `deadline` value | Meaning | Card shows | Expires? |
|---|---|---|---|
| `"02-06"` | recurring annually | `Next deadline ~Feb 6` | **never** — rolls to next year |
| `"2027-03-15"` | one-time, single cycle | `Deadline Mar 15, 2027` | yes, 14 days after it passes |
| `null` | rolling / ongoing | `No fixed deadline · Summer` | never |
| `retireOn: "2027-01-01"` | program discontinued | — | yes, on that date |

**Why recurring never expires:** all your dated listings are annual. A naive "delete
when the date passed" rule would drop COSMOS every February 7th and hide most of the
directory by December. Recurring deadlines roll forward instead. `tools/test-expiry.mjs`
enforces this and runs before every automated change.

Anything closing within 30 days gets a **Closing soon** badge, a highlighted card, and
sorts to the top under "Featured".

## The weekly job

One workflow, `.github/workflows/weekly-maintenance.yml`, Mondays ~6am Pacific:

1. **Verify the expiry rules** (`test-expiry.mjs`) — aborts before touching data if the
   "recurring never expires" guarantee is broken.
2. **Archive expired listings** — one-time deadlines that passed, `retireOn` dates.
3. **Check all 67 links** — anything returning 404/410 for **3 consecutive weeks** is
   archived automatically.
4. **Scan trusted sources** for new pages → opens a PR with leads.

Steps 2–3 commit straight to `main` (safe: reversible, nothing hard-deleted).
Step 4 opens a PR, because new leads need your judgement.

### Why only 404 can remove a listing

Measured against your real data, "unreachable" splits three ways, and only one means gone:

| Result | Example | Archives? |
|---|---|---|
| `404`/`410` | Delta College's old engineering URL | **yes**, after 3 weeks |
| `403` bot-block | UC Merced, Stanford SMYSP | never — same URLs return 200 under a browser UA |
| TLS / DNS error | Conrad Challenge, HOSA | never — Node-only quirks; fine in a browser |

Treating a 403 as death would have deleted healthy programs. Blocked and erroring links
are reported for you to eyeball, never acted on.

## Commands

```bash
node tools/build-data.mjs           # regenerate scripts/data.js from listings.json
node tools/build-data.mjs --check   # verify it is in sync (exits 1 if stale)
node tools/archive-expired.mjs      # sweep expired listings into archive.json
node tools/check-links.mjs          # check every link, archive long-dead ones
node tools/check-links.mjs --report # show current link health, check nothing
node tools/scan-sources.mjs         # find new candidate pages on trusted sources
node tools/approve.mjs --list       # review leads and candidates
node tools/test-expiry.mjs          # guards "recurring never expires"
node tools/test-verify.mjs          # link-check + dedupe tests (hits the network)
```

Every tool takes `--dry-run` (except the tests and `build-data`).

**After editing `data/listings.json` by hand, run `node tools/build-data.mjs`.**
The weekly job also regenerates it, so drift self-heals within a week.

## Reviewing leads

The scan records **leads** — a verified URL and page title, plus where it was found.
It does *not* fill in grades, cost, or deadline; that is the honest limit of a
keyword-based scanner with no LLM behind it.

```bash
node tools/approve.mjs --list
```

For anything worth adding, append an object to the right array in
`data/listings.json` and run `node tools/build-data.mjs`. Anything you ignore is
remembered in `data/seen-urls.json` and never suggested twice.

Tune the matching in `tools/scan-sources.mjs` — a page must match **both** an
opportunity word (`summer camp`, `scholarship`, `internship`…) **and** an audience word
(`high school`, `grades 9`, `youth`…), while avoiding `graduate`, `faculty`, `alumni`.
Expect roughly two useful leads for every noisy one.

To widen coverage, add `watch` URLs to `data/sources.json`:

```json
{ "name": "Fresno State", "domain": "fresnostate.edu", "focus": "...",
  "watch": ["https://engineering.fresnostate.edu/young-minds-explore/"] }
```

Without `watch`, the scanner falls back to the links of listings you already have on
that domain — so sources with no listings yet need one to be scanned at all.

## Optional: the paid version

`tools/discover.mjs` uses the Claude API with web search to return **fully filled-in
listings** instead of bare links. It is **not** wired into any workflow and refuses to
run without `ANTHROPIC_API_KEY`, so it cannot bill you by accident.

Roughly **$1.50–$3.50 per run** (~$6–15/month weekly), mostly input tokens from search
results. If you ever want it:

1. Key from <https://console.anthropic.com/settings/keys>
2. Repo **Settings → Secrets and variables → Actions → New repository secret**, named
   `ANTHROPIC_API_KEY`
3. Add a step calling `node tools/discover.mjs` to the workflow

Locally: `ANTHROPIC_API_KEY=sk-ant-... node tools/discover.mjs --dry-run`

## Anti-fabrication guarantees

Nothing is ever published on a URL that was not fetched successfully first. For the
paid path there are two more layers: search is restricted to one trusted domain per
call, and every returned listing is schema-validated (type, grades 6–12, known field
keys, known counties, valid deadline format) before it is kept. Failures are logged
with a reason rather than guessed at.
