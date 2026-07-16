import { readFileSync, writeFileSync } from "node:fs";
import { datasetSchema, type Tool } from "../src/lib/schema";

// Deterministic freshness detector. For every github.com tool it observes the
// latest upstream version (GitHub Releases, then paginated semver-sorted tags) and
// compares it against the recorded `activity.latestVersion`, classifying each tool
// into exactly one bucket. It writes nothing to the data store: its JSON report is
// the input to the human re-assessment loop (see the freshness refresh policy).
//
//   GITHUB_TOKEN=... bun scripts/check-freshness.ts [--out freshness-report.json]
//   bun scripts/check-freshness.ts --selftest   # pure-logic checks, no network

// ---------------------------------------------------------------------------
// Pure version logic (parse-or-skip: never coerce a non-semver tag into a number)
// ---------------------------------------------------------------------------

export interface Version {
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null;
}

/**
 * Parse a strict-ish semver tag. Accepts an optional leading `v` and a 2-part
 * `major.minor` (padded to patch 0). Everything else (CalVer, date tags, monorepo
 * `pkg@1.2.3`, hashes) returns null so the caller routes it to a human rather than
 * guessing. A major >= 1000 is treated as CalVer/date and rejected.
 */
export function parseVersion(raw: string): Version | null {
  const m = raw.trim().match(/^v?(\d+)\.(\d+)(?:\.(\d+))?(?:[-+]([0-9A-Za-z.-]+))?$/);
  if (!m) return null;
  const major = Number(m[1]);
  if (major >= 1000) return null; // 2024.01.15 and friends are not semver
  return {
    major,
    minor: Number(m[2]),
    patch: m[3] === undefined ? 0 : Number(m[3]),
    prerelease: m[4] ?? null,
  };
}

/** Compare by core (major.minor.patch); a prerelease sorts below its release. */
export function compareVersions(a: Version, b: Version): number {
  for (const k of ["major", "minor", "patch"] as const) {
    if (a[k] !== b[k]) return a[k] < b[k] ? -1 : 1;
  }
  if (a.prerelease === b.prerelease) return 0;
  if (a.prerelease === null) return 1; // release > prerelease
  if (b.prerelease === null) return -1;
  return a.prerelease < b.prerelease ? -1 : 1;
}

/** Pick the highest parseable tag from a list; null if none parse. */
export function maxParseableTag(tags: string[]): { tag: string; version: Version } | null {
  let best: { tag: string; version: Version } | null = null;
  for (const tag of tags) {
    const version = parseVersion(tag);
    if (version && (!best || compareVersions(version, best.version) > 0)) best = { tag, version };
  }
  return best;
}

export type Bucket =
  | "verdict-moving"
  | "observed-only"
  | "no-drift"
  | "structural-skip"
  | "unparseable"
  | "transient-error";

export interface Classification {
  bucket: Bucket;
  reason: string;
}

/**
 * Decide the bucket from the recorded and upstream version strings. `upstream` is
 * null when the repo publishes no parseable version at all.
 */
export function classify(recorded: string | undefined, upstream: string | null): Classification {
  if (upstream === null) return { bucket: "structural-skip", reason: "no upstream version scheme" };
  const up = parseVersion(upstream);
  if (!up) return { bucket: "unparseable", reason: `upstream tag not semver: ${upstream}` };
  if (!recorded)
    return { bucket: "verdict-moving", reason: `upstream has ${upstream} but no version recorded` };
  const rec = parseVersion(recorded);
  if (!rec) return { bucket: "unparseable", reason: `recorded version not semver: ${recorded}` };
  const cmp = compareVersions(up, rec);
  if (cmp <= 0)
    return { bucket: "no-drift", reason: `recorded ${recorded} is current with ${upstream}` };
  if (up.major > rec.major)
    return { bucket: "verdict-moving", reason: `major jump ${recorded} -> ${upstream}` };
  return { bucket: "observed-only", reason: `minor/patch drift ${recorded} -> ${upstream}` };
}

export function parseGithubRepo(url: string): { owner: string; repo: string } | null {
  const m = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
}

// ---------------------------------------------------------------------------
// GitHub fetch layer (rate-limit aware)
// ---------------------------------------------------------------------------

const TOKEN = process.env.GITHUB_TOKEN;
const MAX_TAG_PAGES = 5; // 500 tags; capped runs are reported, never silent
const REQUEST_SPACING_MS = 150;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface FetchResult {
  status: number;
  headers: Headers;
  json: unknown;
}

async function ghFetch(path: string, attempt = 0): Promise<FetchResult> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "context-radar-freshness",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  // Secondary/abuse limits (403/429) and primary exhaustion: honour Retry-After /
  // x-ratelimit-reset, then back off exponentially, up to 3 attempts.
  if ((res.status === 403 || res.status === 429) && attempt < 3) {
    const retryAfter = Number(res.headers.get("retry-after"));
    const reset = Number(res.headers.get("x-ratelimit-reset"));
    const remaining = res.headers.get("x-ratelimit-remaining");
    let waitMs = 2000 * 2 ** attempt;
    if (retryAfter) waitMs = retryAfter * 1000;
    else if (remaining === "0" && reset) waitMs = Math.max(0, reset * 1000 - Date.now()) + 1000;
    await sleep(waitMs);
    return ghFetch(path, attempt + 1);
  }
  return {
    status: res.status,
    headers: res.headers,
    json: res.status === 204 ? null : await res.json(),
  };
}

/** Observe the latest upstream version: releases/latest, then paginated tags. */
async function observeUpstream(
  owner: string,
  repo: string,
): Promise<{ version: string | null; source: string; capped: boolean }> {
  const rel = await ghFetch(`/repos/${owner}/${repo}/releases/latest`);
  if (rel.status === 200) {
    const tag = (rel.json as { tag_name?: string }).tag_name;
    if (tag) return { version: tag, source: "releases/latest", capped: false };
  }
  if (rel.status !== 200 && rel.status !== 404) {
    throw new Error(`releases/latest -> HTTP ${rel.status}`);
  }
  // Fall through to tags (the endpoint is NOT newest-first, so page and take the max).
  const allTags: string[] = [];
  let capped = false;
  for (let page = 1; page <= MAX_TAG_PAGES; page++) {
    await sleep(REQUEST_SPACING_MS);
    const res = await ghFetch(`/repos/${owner}/${repo}/tags?per_page=100&page=${page}`);
    if (res.status === 404) break;
    if (res.status !== 200) throw new Error(`tags -> HTTP ${res.status}`);
    const names = (res.json as Array<{ name: string }>).map((t) => t.name);
    allTags.push(...names);
    if (names.length < 100) break;
    if (page === MAX_TAG_PAGES) capped = true;
  }
  const best = maxParseableTag(allTags);
  return { version: best ? best.tag : null, source: allTags.length ? "tags" : "none", capped };
}

interface Entry {
  id: string;
  tool: string;
  githubUrl: string;
  recorded?: string;
  upstream: string | null;
  source: string;
  bucket: Bucket;
  reason: string;
  capped?: boolean;
}

async function run(outPath: string): Promise<void> {
  const dataset = datasetSchema.parse(
    JSON.parse(readFileSync("data/context-reduction-tools.json", "utf8")),
  );
  if (!TOKEN) console.warn("warning: no GITHUB_TOKEN set; unauthenticated 60/hr limit applies");

  const entries: Entry[] = [];
  for (const t of dataset.tools as Tool[]) {
    const base = {
      id: t.id,
      tool: t.tool,
      githubUrl: t.githubUrl,
      recorded: t.activity.latestVersion,
    };
    const repo = parseGithubRepo(t.githubUrl);
    if (!repo) {
      entries.push({
        ...base,
        upstream: null,
        source: "none",
        bucket: "structural-skip",
        reason: "not a github.com repo",
      });
      continue;
    }
    await sleep(REQUEST_SPACING_MS);
    try {
      const { version, source, capped } = await observeUpstream(repo.owner, repo.repo);
      const { bucket, reason } = classify(t.activity.latestVersion, version);
      entries.push({ ...base, upstream: version, source, bucket, reason, capped });
    } catch (err) {
      entries.push({
        ...base,
        upstream: null,
        source: "error",
        bucket: "transient-error",
        reason: (err as Error).message,
      });
    }
  }

  const by = (b: Bucket) => entries.filter((e) => e.bucket === b);
  const report = {
    generatedOn: new Date().toISOString().slice(0, 10),
    counts: {
      total: entries.length,
      verdictMoving: by("verdict-moving").length,
      observedOnly: by("observed-only").length,
      noDrift: by("no-drift").length,
      structuralSkip: by("structural-skip").length,
      unparseable: by("unparseable").length,
      transientError: by("transient-error").length,
    },
    verdictMoving: by("verdict-moving"),
    observedOnly: by("observed-only"),
    unparseable: by("unparseable"),
    structuralSkip: by("structural-skip"),
    transientError: by("transient-error"),
  };
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `Freshness: ${report.counts.verdictMoving} verdict-moving, ${report.counts.observedOnly} observed-only, ` +
      `${report.counts.unparseable} unparseable, ${report.counts.structuralSkip} skipped, ` +
      `${report.counts.transientError} errors. Wrote ${outPath}`,
  );
}

// ---------------------------------------------------------------------------
// Self-test: pure logic only, no network. Exits non-zero on any failure.
// ---------------------------------------------------------------------------

function selftest(): void {
  const checks: Array<[string, boolean]> = [
    ["v1.2.3 parses", parseVersion("v1.2.3")?.patch === 3],
    ["v6.10 pads patch", parseVersion("v6.10")?.patch === 0],
    ["v1.108.25 parses", parseVersion("v1.108.25")?.major === 1],
    ["date tag rejected", parseVersion("2024.01.15") === null],
    ["monorepo tag rejected", parseVersion("pkg@1.2.3") === null],
    ["major jump is verdict-moving", classify("v1.9.0", "v2.0.0").bucket === "verdict-moving"],
    ["patch bump is observed-only", classify("v1.2.3", "v1.2.4").bucket === "observed-only"],
    ["equal is no-drift", classify("v1.2.3", "v1.2.3").bucket === "no-drift"],
    ["behind upstream is no-drift", classify("v2.0.0", "v1.9.0").bucket === "no-drift"],
    [
      "missing recorded is verdict-moving",
      classify(undefined, "v1.0.0").bucket === "verdict-moving",
    ],
    ["no upstream is structural-skip", classify("v1.0.0", null).bucket === "structural-skip"],
    ["unparseable upstream flagged", classify("v1.0.0", "2024.01.15").bucket === "unparseable"],
    [
      "max tag ignores order",
      maxParseableTag(["v0.9.23", "v0.10.0", "pkg@9.9.9"])?.tag === "v0.10.0",
    ],
    ["repo parsed", parseGithubRepo("https://github.com/rtk-ai/rtk")?.repo === "rtk"],
    ["non-github rejected", parseGithubRepo("https://docs.anthropic.com/x") === null],
  ];
  let failed = 0;
  for (const [name, ok] of checks) {
    if (!ok) {
      console.error(`FAIL: ${name}`);
      failed++;
    }
  }
  if (failed) {
    console.error(`${failed}/${checks.length} self-tests failed`);
    process.exit(1);
  }
  console.log(`OK: ${checks.length} self-tests passed`);
}

const args = process.argv.slice(2);
if (args.includes("--selftest")) {
  selftest();
} else {
  const outIdx = args.indexOf("--out");
  const outPath = outIdx >= 0 ? args[outIdx + 1] : "freshness-report.json";
  await run(outPath);
}
