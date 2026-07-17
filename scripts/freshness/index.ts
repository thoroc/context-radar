// Freshness domain: deterministic upstream-version drift detection. Pure version
// logic (parse/compare/classify) plus the GitHub observation layer and the `run`
// orchestrator that writes the JSON report.

export { classify } from "./classify";
export { compareVersions } from "./compare-versions";
export { maxParseableTag } from "./max-parseable-tag";
export { observeUpstream } from "./observe-upstream";
export { parseGithubRepo } from "./parse-github-repo";
export { parseVersion } from "./parse-version";
export { run } from "./run";
export type { Bucket, Classification, Version } from "./types";
