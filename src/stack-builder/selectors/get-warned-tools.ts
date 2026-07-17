import { LAYERS, type StackTool } from "../stack-data";
import { state } from "../state";

export const getWarnedTools = (): StackTool[] => {
  const out: StackTool[] = [];
  for (const l of LAYERS) {
    for (const t of l.tools) {
      if (state.sel.has(t.id) && t.warn) out.push(t);
    }
  }
  return out;
};
