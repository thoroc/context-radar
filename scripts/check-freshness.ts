// Deterministic freshness detector. For every github.com tool it observes the
// latest upstream version (GitHub Releases, then paginated semver-sorted tags) and
// compares it against the recorded `activity.latestVersion`, classifying each tool
// into exactly one bucket. It writes nothing to the data store: its JSON report is
// the input to the human re-assessment loop (see the freshness refresh policy).
//
//   GITHUB_TOKEN=... bun scripts/check-freshness.ts [--out freshness-report.json]
//
// The pure logic lives in ./freshness and is covered by that folder's Vitest suite.
import { run } from "./freshness";

const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const outPath = outIdx >= 0 ? args[outIdx + 1] : "freshness-report.json";
await run(outPath);
