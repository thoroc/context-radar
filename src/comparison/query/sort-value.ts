import type { Tool } from "../../lib";

export const sortValue = (t: Tool, col: string): string | number => {
  switch (col) {
    case "whatItDoes":
      return t.whatItDoes.toLowerCase();
    case "conflict":
      return t.conflict.severity;
    case "activityStatus":
      return t.activityStatus.band;
    case "verdict":
      return t.verdict.decision;
    case "decisionRule":
      return t.decisionRule.toLowerCase();
    default:
      return t.tool.toLowerCase();
  }
};
