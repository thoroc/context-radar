import type { Tool } from "../schema";
import { SEVERITY_LABEL } from "./labels";

export const conflictText = (conflict: Tool["conflict"]): string => {
  if (conflict.note) return conflict.note;
  if (conflict.severity === "none") return "—";
  const head = SEVERITY_LABEL[conflict.severity];
  return conflict.projects.length ? `${head}: ${conflict.projects.join(", ")}` : head;
};
