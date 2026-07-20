import { LAYERS } from "../constants";
import { state } from "../state";

/** Count of installable layers (reference excluded) with at least one selected tool. */
export const coveredLayers = (): number => {
  let n = 0;
  for (const layer of LAYERS) {
    if (layer.cardinality === "reference") continue;
    if (layer.tools.some((t) => state.sel.has(t.id))) n++;
  }
  return n;
};
