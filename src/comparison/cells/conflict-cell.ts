import { conflictText, type Tool } from "../../lib";
import { CONFLICT } from "../constants";
import { escapeHtml } from "../dom";

export const conflictCell = (t: Tool): string => {
  const [cls, label] = CONFLICT[t.conflict.severity];
  if (t.conflict.severity === "none" && !t.conflict.note) {
    return `<div class="conf cf-none">None</div>`;
  }
  return `<div class="conf ${cls}"><span class="sv">${label}</span>${escapeHtml(conflictText(t.conflict))}</div>`;
};
