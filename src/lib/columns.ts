import type { Tool } from "./schema";

export interface ColumnDef {
  key: keyof Tool;
  /** Full display header, used in the CSV export. */
  header: string;
}

/**
 * Canonical column order. Drives the CSV export (order and headers). The
 * comparison table's own column labels live in the markup; this list is the
 * machine-facing order shared by the CSV export and any tabular consumer.
 */
export const COLUMNS: ColumnDef[] = [
  { key: "tool", header: "Tool" },
  { key: "githubUrl", header: "GitHub URL" },
  { key: "layer", header: "Layer" },
  { key: "whatItDoes", header: "What it does" },
  { key: "conflict", header: "Conflict / Overlap" },
  { key: "runtime", header: "Runtime" },
  { key: "requirements", header: "Requirements" },
  { key: "licence", header: "Licence" },
  { key: "stars", header: "Stars" },
  { key: "trend", header: "Trend (30d)" },
  { key: "activity", header: "Activity (Issues / PRs)" },
  { key: "activityStatus", header: "Activity Status" },
  { key: "verdict", header: "Verdict" },
  { key: "decisionRule", header: "Decision Rule" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats an ISO date (YYYY-MM-DD) as a short display date, e.g. "15 Jul 2026". */
export function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map((n) => Number.parseInt(n, 10));
  return `${d} ${MONTHS[(m ?? 1) - 1] ?? ""} ${y}`;
}

/** RFC 4180 quoting: wrap in quotes and double any internal quotes when the
 * value contains a comma, quote, or newline. */
function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export interface CsvDataset {
  meta: { stars_verified: string };
  tools: Tool[];
}

/** Serialises the dataset to CSV in COLUMNS order. The Stars header carries the
 * snapshot date (from meta.stars_verified) for continuity with the old export. */
export function toCsv(dataset: CsvDataset): string {
  const headers = COLUMNS.map((c) =>
    c.key === "stars" ? `Stars (${formatDisplayDate(dataset.meta.stars_verified)})` : c.header,
  );
  const rows = dataset.tools.map((t) => COLUMNS.map((c) => csvCell(t[c.key])).join(","));
  return `${[headers.map(csvCell).join(","), ...rows].join("\n")}\n`;
}
