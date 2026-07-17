import type { Tool } from "../../lib";

export const verdictMatches = (t: Tool, fv: Set<string>): boolean => {
  if (fv.size === 0) return true;
  const d = t.verdict.decision;
  // "add" also covers the conditional "add-if" decision.
  return fv.has(d === "add-if" ? "add" : d);
};
