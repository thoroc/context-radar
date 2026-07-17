import type { Tool } from "../../src/lib";
import type { EvidenceRow } from "./types";

export const evidenceRows = (tool: Tool): EvidenceRow[] => {
  const rows: EvidenceRow[] = [];
  if (tool.conflict.evidence)
    rows.push({ label: "Conflict / overlap", evidence: tool.conflict.evidence });
  if (tool.activity.evidence) rows.push({ label: "Activity", evidence: tool.activity.evidence });
  if (tool.licence.evidence) rows.push({ label: "Licence", evidence: tool.licence.evidence });
  if (tool.runtime.evidence) rows.push({ label: "Runtime", evidence: tool.runtime.evidence });
  for (const claim of tool.extraClaims ?? []) {
    rows.push({ label: claim.label, evidence: claim.evidence, proofLedger: claim.proofLedger });
  }
  return rows;
};
