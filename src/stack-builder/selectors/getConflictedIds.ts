import { state } from "../state";
import { getConflicts } from "./getConflicts";

export const getConflictedIds = (): Set<string> => {
  const s = new Set<string>();
  for (const c of getConflicts()) {
    for (const id of c.ids.filter((id) => state.sel.has(id))) s.add(id);
  }
  return s;
};
