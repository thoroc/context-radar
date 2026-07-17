import { readFileSync } from "node:fs";
import { sleep } from "../lib/sleep";
import { api } from "./api";
import { composeIssue } from "./compose-issue";
import { driftEntries } from "./drift-entries";
import { LABEL, listFreshnessIssues } from "./list-freshness-issues";
import { parseToolMarker } from "./parse-tool-marker";
import { repoSlug } from "./repo-slug";
import type { Issue, Report } from "./types";

const DIGEST_MARKER = "<!-- freshness-state:"; // legacy consolidated digest, to be closed
// GitHub's secondary rate limit rejects bursts of content creation (~>80/min).
// Keep writes to roughly one per 1.5s so a full backfill does not trip it.
const MUTATION_SPACING_MS = 1500;

export const run = async (reportPath: string, dryRun: boolean): Promise<void> => {
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
};
