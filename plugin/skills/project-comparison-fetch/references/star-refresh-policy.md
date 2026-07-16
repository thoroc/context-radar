# Star count refresh policy

Load this when refreshing star counts across the catalogue, or when deciding how
often a given tool's stars need re-checking.

When updating star counts for all tools:

- Run `web_search` for each tool — do not rely on previously cached fetches
- Group searches where possible (3–4 tools per query) to reduce round trips
- Flag significant movements (>50% change) in the table footnote
- Update `meta.stars_verified` to the refresh date (the CSV export's `Stars (<date>)` header is derived from it)
- For tools where page render and search disagree, use the higher/more-recent figure and note both sources

## Volatility tiering

This category moves faster than a single refresh date communicates. Real examples from one ~3-week window: ponytail +57%, caveman +38%, codegraph +117% over several months, GitNexus steady but continuous. Treat tools differently based on observed velocity:

- **High-velocity** (recently trending, <6 months old, prior >30% swing observed): re-verify every session that touches star counts, regardless of scope.
- **Stable/mature** (large, established, low week-over-week change per star-history-style trackers): safe to leave for longer between refreshes.
- **Dormant** (no commits/releases in 2+ months): star count rarely needs re-checking, but re-verify the *activity status* — a dormant tool can still be receiving stars from discovery even with no development.

## Refresh coverage disclosure

When asked to refresh "all tools" or run a full sweep, state explicitly which subset was actually re-verified versus which retained prior data — by name or count, not just in aggregate. Never let a partial-coverage refresh read as if every entry was checked. If time/call budget only allows a partial sweep, prioritize high-velocity and highest-star tools first, and say plainly what remains unverified and roughly how old that data is.
