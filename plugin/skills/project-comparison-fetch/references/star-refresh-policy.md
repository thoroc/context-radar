# Catalogue freshness refresh policy

Load this when refreshing a tool's data, or when deciding how often a given tool
needs re-checking. It covers three freshness dimensions on one velocity-tiered
cadence: **star counts**, **upstream version**, and **activity status**. A thin
deterministic detector (`scripts/check-freshness.ts`) can surface candidates, but
the re-assessment and every write to the store are done by a human.

## Star counts

When updating star counts for all tools:

- Run `web_search` for each tool — do not rely on previously cached fetches
- Group searches where possible (3–4 tools per query) to reduce round trips
- Flag significant movements (>50% change) in the table footnote
- Update `meta.stars_verified` to the refresh date (the CSV export's `Stars (<date>)` header is derived from it)
- For tools where page render and search disagree, use the higher/more-recent figure and note both sources

## Version and activity

- `activity.latestVersion` records the **newest upstream release observed on the
  evidence `checkedOn` date**. It is an observation of upstream, never a recommended
  pin, so the drift comparison converges once re-recorded. Keep it a comparable
  version string (e.g. `v1.2.3`).
- On refresh, re-observe the latest upstream release (GitHub Releases, then tags) and
  update `latestVersion`, `releaseCount`, and `releasedOn` (ISO YYYY-MM-DD).
- Re-check `activityStatus.band` against commit/release recency: a tool can slip from
  `active` to `slowing`/`dormant`, or a new project can climb from `early` to `active`.

## What warrants a full re-assessment (verdict-moving triggers)

Refresh the record for any freshness change, but only escalate to a full
`project-comparison-fetch` re-assessment when the change can move the verdict:

- a **major-version jump** upstream (semver major increment) — minor/patch bumps are
  recorded as observed, not escalated;
- an **`activityStatus.band` transition** (e.g. active to dormant, early to active);
- a **licence change**;
- a **star swing beyond the >50%** threshold above.

A patch or minor bump with no band or licence change rarely changes any field the
catalogue asserts, so recording the new `latestVersion` is enough; do not open a
re-assessment for it.

## Volatility tiering

This category moves faster than a single refresh date communicates. Real examples from one ~3-week window: ponytail +57%, caveman +38%, codegraph +117% over several months, GitNexus steady but continuous. Treat tools differently based on observed velocity:

- **High-velocity** (recently trending, <6 months old, prior >30% swing observed): re-verify every session that touches freshness, regardless of scope.
- **Stable/mature** (large, established, low week-over-week change per star-history-style trackers): safe to leave for longer between refreshes.
- **Dormant** (no commits/releases in 2+ months): star count and version rarely need re-checking, but re-verify the *activity status* — a dormant tool can still be receiving stars from discovery even with no development.

## Evidence-gap signal

The freshness report also carries an `evidenceGap` array (and `counts.evidenceGap`): every
verdict not yet backed by confirmed source-code evidence, `best`/`either-or` verdicts first. It is
a **signal, not a gate** — it never blocks a tool addition, it just keeps the source-verification
backlog visible each run. Treat a `best` or `either-or` entry in that list as a priority for the
next source-verification backfill (see [Cross-tool recommendation placement](recommendation-placement.md)
and [Source verification](source-verification.md)); a recommendation cannot use a tool until this
gap is closed for it.

## Refresh coverage disclosure

When asked to refresh "all tools" or run a full sweep, state explicitly which subset was actually re-verified versus which retained prior data — by name or count, not just in aggregate. Never let a partial-coverage refresh read as if every entry was checked. If time/call budget only allows a partial sweep, prioritize high-velocity and highest-star tools first, and say plainly what remains unverified and roughly how old that data is.
