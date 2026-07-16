import { el } from "../dom";
import type { StackTool } from "../stack-data";
import { state } from "../state";

export const toolVisible = (t: StackTool): boolean => {
  const q = el<HTMLInputElement>("q").value.toLowerCase();
  if (state.fActive === "rec" && !t.rec) return false;
  if (state.fActive === "sel" && !state.sel.has(t.id)) return false;
  if (state.fActive === "open" && t.lic !== "open") return false;
  if (state.fActive === "warn" && !t.warn) return false;
  if (
    q &&
    !t.name.toLowerCase().includes(q) &&
    !t.desc.toLowerCase().includes(q) &&
    !t.ll.toLowerCase().includes(q) &&
    !t.req.toLowerCase().includes(q)
  )
    return false;
  return true;
};
