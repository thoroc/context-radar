import {
  conflictText,
  runtimeText,
  starsText,
  statusText,
  trendText,
  verdictText,
} from "../present";
import type { ColumnDef } from "./types";

/**
 * Canonical column order and CSV serialisation. The structured record is
 * flattened back to the 14 display columns the download has always had, so the
 * CSV is unchanged even though the JSON is now structured.
 */
export const COLUMNS: ColumnDef[] = [
  { header: "Tool", value: (t) => t.tool },
  { header: "GitHub URL", value: (t) => t.githubUrl },
  { header: "Layer", value: (t) => t.layer },
  { header: "What it does", value: (t) => t.whatItDoes },
  { header: "Conflict / Overlap", value: (t) => conflictText(t.conflict) },
  { header: "Runtime", value: (t) => runtimeText(t.runtime) },
  { header: "Requirements", value: (t) => t.requirements },
  {
    header: "Licence",
    value: (t) => (t.licence.warning ? `⚠ ${t.licence.warning}` : t.licence.spdx),
  },
  { header: "Stars", value: (t) => starsText(t.stars) },
  { header: "Trend (30d)", value: (t) => trendText(t.trend) },
  { header: "Activity (Issues / PRs)", value: (t) => t.activity.notes ?? "" },
  { header: "Activity Status", value: (t) => statusText(t.activityStatus) },
  { header: "Verdict", value: (t) => verdictText(t.verdict) },
  { header: "Decision Rule", value: (t) => t.decisionRule },
];
