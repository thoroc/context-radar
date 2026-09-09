import { layerSlug } from "../../src/lib";
import { loadStore, type PageStore, slugMap } from "../lib";

/**
 * The store plus a layer-name-to-slug map, collision-checked.
 *
 * The check matters more here than for tools: `layerSlug` collapses `&` and `+`
 * to the same separator, so two layer names differing only in their conjunction
 * would emit one file and silently lose the other. `scripts/validate-data.ts`
 * catches it earlier; this is the backstop at generation time.
 */
export const loadLayerStore = (
  dataPath: string,
): { store: PageStore; slugByName: Map<string, string> } => {
  const store = loadStore(dataPath);
  return { store, slugByName: slugMap(store.layers, (l) => l.name, layerSlug, "Layer") };
};
