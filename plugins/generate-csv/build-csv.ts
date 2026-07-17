import { readFileSync } from "node:fs";
import { type CsvDataset, toCsv } from "../../src/lib";

/** Read the canonical JSON store and serialise it to CSV. */
export const buildCsv = (dataPath: string): string =>
  toCsv(JSON.parse(readFileSync(dataPath, "utf8")) as CsvDataset);
