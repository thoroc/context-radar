import type { Tool } from "../../lib";
import { LAYERS } from "../constants";
import { state } from "../state";

/** Selected tools that need a model API or external infrastructure to run. */
export const getWarnedTools = (): Tool[] => {
  const out: Tool[] = [];
  for (const layer of LAYERS) {
    for (const t of layer.tools) {
      if (state.sel.has(t.id) && t.requiresExternal) out.push(t);
    }
  }
  return out;
};
