import { readFileSync, writeFileSync } from "node:fs";
import { datasetSchema, type Tool } from "../../src/lib/schema";
import { sleep } from "../lib/sleep";
import { classify } from "./classify";
import { evidenceGap } from "./evidence-gap";
import { observeUpstream, REQUEST_SPACING_MS, TOKEN } from "./observe-upstream";
import { parseGithubRepo } from "./parse-github-repo";
import type { Bucket } from "./types";

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

export const run = async (outPath: string): Promise<void> => {
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
  const gap = evidenceGap(dataset.tools as Tool[]);
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
      evidenceGap: gap.length,
    },
    verdictMoving: by("verdict-moving"),
    observedOnly: by("observed-only"),
    // Tools confirmed current with upstream this run. Serialised so the issue sync
    // can positively close a resolved tool's issue, never on mere absence (a
    // transient error must not read as "resolved").
    noDrift: by("no-drift"),
    unparseable: by("unparseable"),
    structuralSkip: by("structural-skip"),
    transientError: by("transient-error"),
    // Verdicts with no confirmed source-code evidence (Phase 2 source-verification
    // gap). Reported, never gated: visible without blocking tool additions.
    evidenceGap: gap,
  };
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `Freshness: ${report.counts.verdictMoving} verdict-moving, ${report.counts.observedOnly} observed-only, ` +
      `${report.counts.unparseable} unparseable, ${report.counts.structuralSkip} skipped, ` +
      `${report.counts.transientError} errors, ${report.counts.evidenceGap} evidence-gap. Wrote ${outPath}`,
  );
};
