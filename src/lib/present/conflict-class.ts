import type { ConflictSeverity } from "../schema";
import { CONFLICT_CLASS } from "./labels";

export const conflictClass = (severity: ConflictSeverity): string => CONFLICT_CLASS[severity];
