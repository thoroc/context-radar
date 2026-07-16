import { readFileSync } from "node:fs";

// Turns a freshness report (from check-freshness.ts) into one issue PER drifting
// tool in this repository. Each tool's issue is found by a per-tool marker in the
// body (single `freshness` label, no per-tool label sprawl), updated in place when
// the upstream version moves, left alone when unchanged, and never reopened once a
// human closes it. It writes nothing to the data store.
//
//   GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo \
//     bun scripts/sync-freshness-issue.ts [--report freshness-report.json]
//   bun scripts/sync-freshness-issue.ts --dry   # print the issues, no API calls

const LABEL = "freshness";
const TOOL_MARKER = "<!-- freshness-tool:"; // per-tool issue
const DIGEST_MARKER = "<!-- freshness-state:"; // legacy consolidated digest, to be closed
// GitHub's secondary rate limit rejects bursts of content creation (~>80/min).
// Keep writes to roughly one per 1.5s so a full backfill does not trip it.
const MUTATION_SPACING_MS = 1500;

interface Entry {
  id: string;
  tool: string;
  githubUrl: string;
  recorded?: string;
  upstream: string | null;
  reason: string;
}
interface Report {
  generatedOn: string;
  counts: Record<string, number>;
  verdictMoving: Entry[];
  observedOnly: Entry[];
  unparseable: Entry[];
  structuralSkip: Entry[];
  transientError: Entry[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** All tools whose recorded version is behind upstream: verdict-moving + observed. */
function driftEntries(report: Report): Entry[] {
  return [...report.verdictMoving, ...report.observedOnly];
}

function composeIssue(e: Entry): { title: string; body: string } {
  const recorded = e.recorded ?? "unrecorded";
  const upstream = e.upstream ?? "unknown";
  const title = `Freshness: ${e.tool} ${recorded} -> ${upstream}`;
  const body = [
    `Recorded version \`${recorded}\` is behind upstream \`${upstream}\`.`,
    "",
    `- Tool: ${e.tool}`,
    `- Repo: ${e.githubUrl}`,
    `- Why: ${e.reason}`,
    "",
    "This is a **freshness prompt, not a correctness claim**: an out-of-date version",
    "number is not the same as a wrong verdict. Run `project-comparison-fetch` to",
    "re-assess and re-record the tool. The bot does not change the data.",
    "",
    `${TOOL_MARKER} ${JSON.stringify({ id: e.id, upstream: e.upstream })} -->`,
  ].join("\n");
  return { title, body };
}

interface Marker {
  id: string;
  upstream: string | null;
}
function parseToolMarker(body: string): Marker | null {
  const line = (body ?? "").split("\n").find((l) => l.trim().startsWith(TOOL_MARKER));
  if (!line) return null;
  const json = line
    .trim()
    .slice(TOOL_MARKER.length)
    .replace(/-->\s*$/, "")
    .trim();
  try {
    return JSON.parse(json) as Marker;
  } catch {
    return null;
  }
}

function repoSlug(): { owner: string; repo: string } {
  const full = process.env.GITHUB_REPOSITORY;
  if (!full || !full.includes("/")) throw new Error("GITHUB_REPOSITORY (owner/repo) must be set");
  const [owner, repo] = full.split("/");
  return { owner, repo };
}

async function api(
  method: string,
  path: string,
  body?: unknown,
  attempt = 0,
): Promise<{ status: number; json: unknown }> {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "context-radar-freshness",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  // Honour secondary/abuse limits on bursts of writes, then back off, up to 3 tries.
  if ((res.status === 403 || res.status === 429) && attempt < 3) {
    const retryAfter = Number(res.headers.get("retry-after"));
    const reset = Number(res.headers.get("x-ratelimit-reset"));
    const remaining = res.headers.get("x-ratelimit-remaining");
    let waitMs = 3000 * 2 ** attempt;
    if (retryAfter) waitMs = retryAfter * 1000;
    else if (remaining === "0" && reset) waitMs = Math.max(0, reset * 1000 - Date.now()) + 1000;
    await sleep(waitMs);
    return api(method, path, body, attempt + 1);
  }
  return { status: res.status, json: res.status === 204 ? null : await res.json() };
}

interface Issue {
  number: number;
  state: string;
  body: string;
}

/** Every freshness-labelled issue (any state), across all pages. */
async function listFreshnessIssues(owner: string, repo: string): Promise<Issue[]> {
  const out: Issue[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await api(
      "GET",
      `/repos/${owner}/${repo}/issues?labels=${LABEL}&state=all&sort=created&direction=desc&per_page=100&page=${page}`,
    );
    const batch = res.json as Issue[];
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

async function run(reportPath: string, dryRun: boolean): Promise<void> {
  const report = JSON.parse(readFileSync(reportPath, "utf8")) as Report;
  const drift = driftEntries(report);

  if (dryRun) {
    for (const e of drift) {
      const { title, body } = composeIssue(e);
      console.log(`# ${title}\n\n${body}\n\n---\n`);
    }
    console.log(
      `(${drift.length} per-tool issues; ${report.counts.unparseable} unparseable, ${report.counts.structuralSkip} skipped, ${report.counts.transientError} errors not issued)`,
    );
    return;
  }
  if (!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN must be set");
  const { owner, repo } = repoSlug();

  const issues = await listFreshnessIssues(owner, repo);
  // Latest issue per tool id (list is newest-first), plus any legacy digests to close.
  const byId = new Map<string, Issue>();
  const digests: Issue[] = [];
  for (const issue of issues) {
    const marker = parseToolMarker(issue.body);
    if (marker) {
      if (!byId.has(marker.id)) byId.set(marker.id, issue);
    } else if ((issue.body ?? "").includes(DIGEST_MARKER)) {
      digests.push(issue);
    }
  }

  let opened = 0;
  let updated = 0;
  let unchanged = 0;
  const failed: string[] = [];
  for (const e of drift) {
    const { title, body } = composeIssue(e);
    const existing = byId.get(e.id);
    if (existing) {
      const prior = parseToolMarker(existing.body);
      if (prior && prior.upstream === e.upstream) {
        unchanged++;
        continue; // open or closed, same upstream: leave it (respects a human's close)
      }
      if (existing.state === "open") {
        await sleep(MUTATION_SPACING_MS);
        const res = await api("PATCH", `/repos/${owner}/${repo}/issues/${existing.number}`, {
          title,
          body,
        });
        if (res.status === 200) updated++;
        else failed.push(`${e.id} (update HTTP ${res.status})`);
        continue;
      }
      // Closed but upstream moved again: do not reopen; open a fresh issue below.
    }
    await sleep(MUTATION_SPACING_MS);
    const res = await api("POST", `/repos/${owner}/${repo}/issues`, {
      title,
      body,
      labels: [LABEL],
    });
    if (res.status === 201) opened++;
    else failed.push(`${e.id} (create HTTP ${res.status})`);
  }

  // Retire any legacy consolidated digest in favour of the per-tool issues.
  let closed = 0;
  for (const d of digests) {
    if (d.state === "open") {
      await sleep(MUTATION_SPACING_MS);
      await api("PATCH", `/repos/${owner}/${repo}/issues/${d.number}`, {
        state: "closed",
        state_reason: "not_planned",
      });
      closed++;
    }
  }

  console.log(
    `Per-tool freshness: ${opened} opened, ${updated} updated, ${unchanged} unchanged` +
      (closed ? `, ${closed} legacy digest(s) closed` : "") +
      `. (${report.counts.unparseable} unparseable, ${report.counts.structuralSkip} skipped, ${report.counts.transientError} errors not issued.)`,
  );

  if (failed.length) {
    console.error(
      `Failed to sync ${failed.length} issue(s): ${failed.join(", ")}. ` +
        "Re-run to complete; issues already synced this run will no-op.",
    );
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const reportIdx = args.indexOf("--report");
const reportPath = reportIdx >= 0 ? args[reportIdx + 1] : "freshness-report.json";
await run(reportPath, args.includes("--dry"));
