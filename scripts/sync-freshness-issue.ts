// Turns a freshness report (from check-freshness.ts) into one issue PER drifting
// tool in this repository. Each tool's issue is found by a per-tool marker in the
// body (single `freshness` label, no per-tool label sprawl), updated in place when
// the upstream version moves, left alone when unchanged, and never reopened once a
// human closes it. It writes nothing to the data store.
//
//   GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo \
//     bun scripts/sync-freshness-issue.ts [--report freshness-report.json]
//   bun scripts/sync-freshness-issue.ts --dry   # print the issues, no API calls
import { run } from "./freshness-issue";

const args = process.argv.slice(2);
const reportIdx = args.indexOf("--report");
const reportPath = reportIdx >= 0 ? args[reportIdx + 1] : "freshness-report.json";
await run(reportPath, args.includes("--dry"));
