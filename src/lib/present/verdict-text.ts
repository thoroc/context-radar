import type { Tool } from "../schema";
import { DECISION_LABEL } from "./labels";

export const verdictText = (verdict: Tool["verdict"]): string =>
  verdict.rationale
    ? `${DECISION_LABEL[verdict.decision]} - ${verdict.rationale}`
    : DECISION_LABEL[verdict.decision];
