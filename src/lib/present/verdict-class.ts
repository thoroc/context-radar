import type { VerdictDecision } from "../schema";
import { DECISION_CLASS } from "./labels";

export const verdictClass = (decision: VerdictDecision): string => DECISION_CLASS[decision];
