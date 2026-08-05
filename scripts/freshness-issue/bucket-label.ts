import type { Entry } from "./types";

/** GitHub label for a drift entry's severity, so issues are triageable at a glance. */
export const bucketLabel = (bucket: Entry["bucket"]): string =>
  bucket === "verdict-moving" ? "freshness:verdict-moving" : "freshness:observed-only";
