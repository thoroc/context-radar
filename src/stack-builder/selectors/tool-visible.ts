import { licenceClass, searchText, type Tool } from "../../lib";
import { CURATED_PICK_IDS } from "../constants";
import { el } from "../dom";
import { state } from "../state";

/** Whether a tool passes the active filter chip and the search box. */
export const toolVisible = (t: Tool): boolean => {
  if (state.fActive === "rec" && !CURATED_PICK_IDS.has(t.id)) return false;
  if (state.fActive === "sel" && !state.sel.has(t.id)) return false;
  if (state.fActive === "open" && licenceClass(t.licence) !== "open") return false;
  if (state.fActive === "warn" && !t.requiresExternal) return false;
  const q = el<HTMLInputElement>("q").value.trim().toLowerCase();
  return q === "" || searchText(t).includes(q);
};
