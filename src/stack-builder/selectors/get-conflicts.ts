import { CONFLICTS } from "../stack-data";
import { state } from "../state";

export const getConflicts = () =>
  CONFLICTS.filter((c) =>
    c.check ? c.check(state.sel) : c.ids.filter((id) => state.sel.has(id)).length >= (c.min ?? 2),
  );
