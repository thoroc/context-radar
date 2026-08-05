import { readFileSync } from "node:fs";
import { closeLegacyDigests } from "./close-legacy-digests";
import { closeResolved } from "./close-resolved";
import { composeIssue } from "./compose-issue";
import { driftEntries } from "./drift-entries";
import { groupIssues } from "./group-issues";
import { listFreshnessIssues } from "./list-freshness-issues";
import { repoSlug } from "./repo-slug";
import { syncDrift } from "./sync-drift";
import type { Report } from "./types";

export const run = async (reportPath: string, dryRun: boolean): Promise<void> => {
  const report = JSON.parse(readFileSync(reportPath, "utf8")) as Report;
  const drift = driftEntries(report);

  if (dryRun) {
    for (const e of drift) {
      const { title, body, labels } = composeIssue(e);
      console.log(`# ${title}\n\nLabels: ${labels.join(", ")}\n\n${body}\n\n---\n`);
    }
    console.log(
      `(${drift.length} per-tool issues; ${report.counts.unparseable} unparseable, ${report.counts.structuralSkip} skipped, ${report.counts.transientError} errors not issued)`,
    );
    return;
  }
  if (!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN must be set");
  const { owner, repo } = repoSlug();

  const issues = await listFreshnessIssues(owner, repo);
  const { byId, digests } = groupIssues(issues);

  const { opened, updated, relabeled, unchanged, failed } = await syncDrift(
    owner,
    repo,
    drift,
    byId,
  );
  const resolved = await closeResolved(
    owner,
    repo,
    byId,
    report.noDrift.map((e) => e.id),
  );
  const closed = await closeLegacyDigests(owner, repo, digests);

  console.log(
    `Per-tool freshness: ${opened} opened, ${updated} updated` +
      (relabeled ? `, ${relabeled} relabeled` : "") +
      `, ${unchanged} unchanged` +
      (resolved ? `, ${resolved} resolved (closed)` : "") +
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
