import { hasConfirmedSourceEvidence } from "../../src/lib";
import type { Tool } from "../../src/lib/schema";

/** A tool whose verdict is not yet backed by confirmed source-code evidence. */
export interface EvidenceGapEntry {
  id: string;
  tool: string;
  decision: string;
}

/**
 * Tools whose verdict lacks confirmed source-code evidence, most consequential
 * first (a `best`/`either-or` verdict without evidence matters more than an
 * `add`/`watch` one). Pure over the store, no network, so the freshness report can
 * keep the source-verification gap visible without gating any tool addition.
 */
export const evidenceGap = (tools: Tool[]): EvidenceGapEntry[] => {
  const priority = (decision: string): number =>
    decision === "best" || decision === "either-or" ? 0 : 1;
  return tools
    .filter((t) => !hasConfirmedSourceEvidence(t))
    .map((t) => ({ id: t.id, tool: t.tool, decision: t.verdict.decision }))
    .sort((a, b) => priority(a.decision) - priority(b.decision) || a.id.localeCompare(b.id));
};
