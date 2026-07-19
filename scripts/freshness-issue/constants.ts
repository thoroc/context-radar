// GitHub's secondary rate limit rejects bursts of content creation (~>80/min).
// Keep writes to roughly one per 1.5s so a full backfill does not trip it.
export const MUTATION_SPACING_MS = 1500;

// Marker on the legacy consolidated digest issue, retired in favour of the
// per-tool issues; run() closes any that remain open.
export const DIGEST_MARKER = "<!-- freshness-state:";
