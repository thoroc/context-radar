import { type Recommendation, type Tool, toolSlug } from "../../lib";

/**
 * Stack-builder layer id -> the store `layer` it corresponds to. Only layers that
 * map cleanly onto a single store layer are listed; the other stack-builder layers
 * are finer groupings with no 1:1 store equivalent, so they carry no catalogue
 * pick. Extend this as recommendations reach more layers.
 */
const STORE_LAYER_BY_STACK_ID: Record<string, string> = {
  shell: "Shell output",
  codenav: "Code navigation",
};

/** The catalogue pick to surface on a stack-builder layer. */
export interface LayerRec {
  pickName: string;
  pickHref: string;
  group?: string;
}

/**
 * The store recommendation covering a stack-builder layer, if any: the pick's
 * display name and a link to its detail page (where the full rationale and
 * alternatives live). Undefined when the layer maps to no store layer, no
 * recommendation covers that layer, or the pick is not a known tool, so the
 * builder surfaces the evidence-backed pick without duplicating it into the
 * curated stack data.
 */
export const layerRecommendation = (
  stackLayerId: string,
  recs: Recommendation[],
  byId: Map<string, Tool>,
): LayerRec | undefined => {
  const storeLayer = STORE_LAYER_BY_STACK_ID[stackLayerId];
  if (!storeLayer) return undefined;
  const rec = recs.find((r) => r.layer === storeLayer);
  if (!rec) return undefined;
  const pick = byId.get(rec.pick);
  if (!pick) return undefined;
  return {
    pickName: pick.tool,
    pickHref: `tools/${toolSlug(pick.tool)}.html`,
    group: rec.group,
  };
};
