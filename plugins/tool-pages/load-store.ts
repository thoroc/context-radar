import { toolSlug } from "../../src/lib";
import { loadStore, type PageStore, slugMap } from "../lib";

/** The store plus a tool-name-to-slug map, collision-checked. */
export const loadToolStore = (
  dataPath: string,
): { store: PageStore; slugByName: Map<string, string> } => {
  const store = loadStore(dataPath);
  return { store, slugByName: slugMap(store.tools, (t) => t.tool, toolSlug, "Tool") };
};
