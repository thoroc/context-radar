import type { Tool } from "../schema";

/**
 * True when a tool's verdict carries `confirmed` evidence backed by at least one
 * `source-code` citation. This is the source-verification bar a recommendation
 * member must clear and the gap the freshness report tracks, kept in one place so
 * the two never drift.
 */
export const hasConfirmedSourceEvidence = (tool: Tool): boolean =>
  tool.verdict.evidence?.status === "confirmed" &&
  tool.verdict.evidence.sources.some((s) => s.evidenceType === "source-code");
