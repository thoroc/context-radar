import type { LayerMeta, Meta, Tool } from "../../src/lib";

/** The canonical store as the page generators need it. */
export interface PageStore {
  meta: Meta;
  layers: LayerMeta[];
  tools: Tool[];
}
