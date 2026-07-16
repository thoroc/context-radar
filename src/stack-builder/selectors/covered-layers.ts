import { LAYERS } from "../stack-data";
import { state } from "../state";

export const coveredLayers = (): number => {
  const s = new Set<string>();
  for (const l of LAYERS) {
    if (l.tools.some((t) => state.sel.has(t.id))) s.add(l.id);
  }
  return s.size;
};
