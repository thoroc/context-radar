import { readFileSync } from "node:fs";
import type { PageStore } from "./types";

/**
 * Reads the canonical JSON store for a page generator.
 *
 * The store is validated against the Zod schema at build and CI time by
 * `mise run validate`, so the generators trust it and take only the inferred
 * type, exactly as the browser-side data domain does.
 */
export const loadStore = (dataPath: string): PageStore =>
  JSON.parse(readFileSync(dataPath, "utf8")) as PageStore;
