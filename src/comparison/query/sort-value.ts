import type { Tool, VerdictDecision } from "../../lib";

// Sort the Verdict column by decision rank (Best to Drop), not alphabetically.
const VERDICT_RANK: Record<VerdictDecision, number> = {
  best: 0,
  add: 1,
  "add-if": 2,
  "either-or": 3,
  watch: 4,
  reference: 5,
  drop: 6,
};

export const sortValue = (t: Tool, col: string): string | number => {
  switch (col) {
    case "whatItDoes":
      return t.whatItDoes.toLowerCase();
    case "conflict":
      return t.conflict.severity;
    case "activityStatus":
      return t.activityStatus.band;
    case "verdict":
      return VERDICT_RANK[t.verdict.decision];
    case "decisionRule":
      return t.decisionRule.toLowerCase();
    default:
      return t.tool.toLowerCase();
  }
};
