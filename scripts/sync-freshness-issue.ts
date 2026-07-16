import { readFileSync } from "node:fs";

// Turns a freshness report (from check-freshness.ts) into a single consolidated
// digest issue in this repository. It never files per-tool issues and never writes
// to the data store. State is carried in a hidden marker in the issue body, so an
// unchanged run is a genuine no-op and a digest a human closed is not nagged again.
//
//   GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo \
//     bun scripts/sync-freshness-issue.ts [--report freshness-report.json]
//   bun scripts/sync-freshness-issue.ts --dry   # print the digest, no API calls

const LABEL = "freshness";
const MARKER = "<!-- freshness-state:";

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

/** Deterministic state token: the {id: upstream} map of what needs re-assessment. */
function stateToken(report: Report): string {
  const map: Record<string, string> = {};
  for (const e of report.verdictMoving) map[e.id] = e.upstream ?? "";
  return JSON.stringify(
    Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b))),
  );
}

function readMarker(body: string): string | null {
  const line = body.split("\n").find((l) => l.trim().startsWith(MARKER));
  if (!line) return null;
  return line
    .trim()
    .slice(MARKER.length)
    .replace(/-->\s*$/, "")
    .trim();
}

function composeBody(report: Report): { title: string; body: string } {
  const n = report.verdictMoving.length;
  const title = `Catalogue freshness: ${n} tool${n === 1 ? "" : "s"} to re-assess (${report.generatedOn})`;
  const rows = report.verdictMoving
    .map(
      (e) =>
        `| ${e.tool} | \`${e.recorded ?? "—"}\` | \`${e.upstream ?? "—"}\` | ${e.reason} | ${e.githubUrl} |`,
    )
    .join("\n");
  const lines = [
    "This is a **freshness prompt, not a correctness claim**: an out-of-date version number",
    "is not the same as a wrong verdict. Each entry is decision-support for a human to run",
    "`project-comparison-fetch` and re-record the tool. The bot does not change the data.",
    "",
    "## Verdict-moving changes",
    "",
    n
      ? `| Tool | Recorded | Upstream | Why | Repo |\n| --- | --- | --- | --- | --- |\n${rows}`
      : "_None this run._",
    "",
    "## Not escalated",
    "",
    `- Observed-only (minor/patch drift, recorded on next refresh): ${report.counts.observedOnly}`,
    `- Unparseable versions (need a human to read the tag scheme): ${report.counts.unparseable}`,
    `- Structural skips (no upstream version scheme / not github.com): ${report.counts.structuralSkip}`,
    `- Transient fetch errors (retried next run, not actioned): ${report.counts.transientError}`,
    "",
    `${MARKER} ${stateToken(report)} -->`,
  ];
  return { title, body: lines.join("\n") };
}

function repoSlug(): { owner: string; repo: string } {
  const full = process.env.GITHUB_REPOSITORY;
  if (!full || !full.includes("/")) {
    throw new Error("GITHUB_REPOSITORY (owner/repo) must be set");
  }
  const [owner, repo] = full.split("/");
  return { owner, repo };
}

async function api(
  method: string,
  path: string,
  body?: unknown,
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
  return { status: res.status, json: res.status === 204 ? null : await res.json() };
}

async function run(reportPath: string, dryRun: boolean): Promise<void> {
  const report = JSON.parse(readFileSync(reportPath, "utf8")) as Report;
  const { title, body } = composeBody(report);

  if (dryRun) {
    console.log(`# ${title}\n\n${body}`);
    return;
  }
  if (!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN must be set");
  const { owner, repo } = repoSlug();
  const nextState = stateToken(report);

  // Most-recent digest of any state (immediately consistent REST, not Search).
  const list = await api(
    "GET",
    `/repos/${owner}/${repo}/issues?labels=${LABEL}&state=all&sort=created&direction=desc&per_page=1`,
  );
  const existing = (list.json as Array<{ number: number; state: string; body: string }>)[0];

  if (existing) {
    const priorState = readMarker(existing.body ?? "");
    if (priorState === nextState) {
      console.log(`No change (${existing.state} #${existing.number}); nothing to do.`);
      return;
    }
    if (existing.state === "open") {
      await api("PATCH", `/repos/${owner}/${repo}/issues/${existing.number}`, { title, body });
      console.log(`Updated digest #${existing.number}.`);
      return;
    }
    // Closed but the drift set changed: do not reopen; open a fresh digest.
  }
  const created = await api("POST", `/repos/${owner}/${repo}/issues`, {
    title,
    body,
    labels: [LABEL],
  });
  console.log(`Opened digest #${(created.json as { number: number }).number}.`);
}

const args = process.argv.slice(2);
const reportIdx = args.indexOf("--report");
const reportPath = reportIdx >= 0 ? args[reportIdx + 1] : "freshness-report.json";
await run(reportPath, args.includes("--dry"));
