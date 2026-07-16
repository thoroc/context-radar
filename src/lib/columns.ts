import {
  conflictText,
  runtimeText,
  starsText,
  statusText,
  trendText,
  verdictText,
} from "./present";
import type { Tool } from "./schema";

export interface ColumnDef {
  /** Full display header, used in the CSV export. */
  header: string;
  /** Flattens the structured record to a single display string for the CSV. */
  value: (t: Tool) => string;
}

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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats an ISO date (YYYY-MM-DD) as a short display date, e.g. "15 Jul 2026". */
export const formatDisplayDate = (iso: string): string => {
  const [y, m, d] = iso.split("-").map((n) => Number.parseInt(n, 10));
  return `${d} ${MONTHS[(m ?? 1) - 1] ?? ""} ${y}`;
};

/** RFC 4180 quoting: wrap in quotes and double any internal quotes when the
 * value contains a comma, quote, or newline. */
const csvCell = (value: string): string =>
  /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

export interface CsvDataset {
  meta: { stars_verified: string };
  tools: Tool[];
}

/** Serialises the dataset to CSV in COLUMNS order. The Stars header carries the
 * snapshot date (from meta.stars_verified) for continuity with the old export. */
export const toCsv = (dataset: CsvDataset): string => {
  const headers = COLUMNS.map((c) =>
    c.header === "Stars" ? `Stars (${formatDisplayDate(dataset.meta.stars_verified)})` : c.header,
  );
  const rows = dataset.tools.map((t) => COLUMNS.map((c) => csvCell(c.value(t))).join(","));
  return `${[headers.map(csvCell).join(","), ...rows].join("\n")}\n`;
};
