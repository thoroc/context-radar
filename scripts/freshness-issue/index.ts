// Freshness-issue domain: turns a freshness report into one GitHub issue per
// drifting tool. Pure helpers (drift selection, issue composition, marker parsing)
// plus the GitHub API layer and the `run` orchestrator.

export { api } from "./api";
export { composeIssue } from "./compose-issue";
export { driftEntries } from "./drift-entries";
export { listFreshnessIssues } from "./list-freshness-issues";
export { parseToolMarker } from "./parse-tool-marker";
export { repoSlug } from "./repo-slug";
export { run } from "./run";
export { syncEntry } from "./sync-entry";
export type { Entry, Issue, Marker, Report } from "./types";
