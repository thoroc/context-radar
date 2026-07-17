import type { Evidence, Tool } from "../../src/lib";

export interface ToolPagesOptions {
  /** Absolute path to the canonical JSON store. */
  dataPath: string;
  /** Output directory (relative to the site root) the pages are emitted into. */
  outDir?: string;
}

export interface Store {
  meta: { stars_verified: string };
  tools: Tool[];
}

export interface EvidenceRow {
  label: string;
  evidence: Evidence;
  proofLedger?: string;
}
