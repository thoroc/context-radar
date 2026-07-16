import type { Tool } from "../schema";

export interface ColumnDef {
  /** Full display header, used in the CSV export. */
  header: string;
  /** Flattens the structured record to a single display string for the CSV. */
  value: (t: Tool) => string;
}

export interface CsvDataset {
  meta: { stars_verified: string };
  tools: Tool[];
}
