import { COLUMNS } from "./columns";
import { csvCell } from "./csv-cell";
import { formatDisplayDate } from "./format-display-date";
import type { CsvDataset } from "./types";

/** Serialises the dataset to CSV in COLUMNS order. The Stars header carries the
 * snapshot date (from meta.stars_verified) for continuity with the old export. */
export const toCsv = (dataset: CsvDataset): string => {
  const headers = COLUMNS.map((c) =>
    c.header === "Stars" ? `Stars (${formatDisplayDate(dataset.meta.stars_verified)})` : c.header,
  );
  const rows = dataset.tools.map((t) => COLUMNS.map((c) => csvCell(c.value(t))).join(","));
  return `${[headers.map(csvCell).join(","), ...rows].join("\n")}\n`;
};
