import type { VerdictDecision } from "../../lib";

// Higher = stronger endorsement. `either-or` ranks above `add` deliberately: it is
// a positive "one of these wins" verdict, whereas `add` is "complementary, include
// if it applies". Total over the enum (including `drop`, lowest) so ranking never
// sees an undefined rank.
const RANK: Record<VerdictDecision, number> = {
  best: 6,
  "either-or": 5,
  add: 4,
  "add-if": 3,
  watch: 2,
  reference: 1,
  drop: 0,
};

export const verdictRank = (decision: VerdictDecision): number => RANK[decision];
