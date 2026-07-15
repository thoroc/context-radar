import rawData from "../../data/context-reduction-tools.json";
import { COLUMN_COUNT, type Dataset, type DatasetMeta, type ToolRow } from "./types";

const dataset = rawData as Dataset;

if (dataset.meta.columns.length !== COLUMN_COUNT) {
  throw new Error(
    `Data has ${dataset.meta.columns.length} columns, expected ${COLUMN_COUNT}. ` +
      "The data shape changed — update src/lib/types.ts and the skill schema.",
  );
}

/** Column headers in canonical order (authoritative, read from the data). */
export const COLUMNS: readonly string[] = dataset.meta.columns;

/** Catalogue metadata: refresh date, tool count, column headers. */
export const META: DatasetMeta = dataset.meta;

/** Tools projected to positional rows, aligned with {@link COLUMNS}. */
export const ROWS: ToolRow[] = dataset.tools.map((tool) => COLUMNS.map((col) => tool[col] ?? ""));
