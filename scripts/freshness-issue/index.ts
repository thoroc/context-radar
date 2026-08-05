// Freshness-issue domain: turns a freshness report into one GitHub issue per
// drifting tool. Pure helpers (drift selection, issue composition, marker parsing)
// plus the GitHub API layer and the `run` orchestrator.

export { api } from "./api";
export { bucketLabel } from "./bucket-label";
export { closeLegacyDigests } from "./close-legacy-digests";
export { closeResolved } from "./close-resolved";
export { composeIssue } from "./compose-issue";
export { driftEntries } from "./drift-entries";
export { groupIssues } from "./group-issues";
export { listFreshnessIssues } from "./list-freshness-issues";
export { parseToolMarker } from "./parse-tool-marker";
export { repoSlug } from "./repo-slug";
export { resolvedIssueNumbers } from "./resolved-issue-numbers";
export { run } from "./run";
export { syncDrift } from "./sync-drift";
export { syncEntry } from "./sync-entry";
export type { Entry, Issue, Marker, Report } from "./types";
