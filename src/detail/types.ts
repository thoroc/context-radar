import type { Evidence } from "../lib";

/** One row in a tool's evidence ledger: a claim, its evidence, and any proof-ledger decision. */
export interface EvidenceRow {
  label: string;
  evidence: Evidence;
  proofLedger?: string;
}

/**
 * Options shared by every consumer of `renderDetailBody`. `base` prefixes the
 * body's internal links so they resolve from wherever the body is mounted:
 * `"../"` from a standalone page under `/tools/`, `""` from a modal on a
 * root-level page. `starsVerified` is the raw ISO date shown in the facts panel.
 */
export interface DetailContext {
  slugByName: Map<string, string>;
  base: string;
  starsVerified: string;
}
