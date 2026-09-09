import type { LayerMeta } from "../schema";

/** One display section of the comparison table: a heading and the layers under it. */
export interface LayerSection {
  heading: string;
  layers: LayerMeta[];
}

/**
 * Groups the store's layers into display sections, so the comparison table's
 * section list is derived from `data.layers[]` rather than from a parallel,
 * hand-maintained array.
 *
 * That array had drifted three ways: it carried 19 entries against the store's
 * 20, it matched by string prefix (so one filter option matched nothing at all
 * and quietly returned an empty table), and its guidance notes contradicted the
 * store -- labelling the code-navigation section "pick a primary; others
 * stackable" over a layer the store marks `pick-one`.
 *
 * Layers sharing a `group` collapse into one section but stay distinct inside
 * it, keeping their own names and cardinalities. Sections are ordered by their
 * earliest member's `order`, members by their own.
 */
export const layerSections = (layers: readonly LayerMeta[]): LayerSection[] => {
  const byHeading = new Map<string, LayerMeta[]>();
  for (const layer of layers) {
    const heading = layer.group ?? layer.name;
    const existing = byHeading.get(heading);
    if (existing) existing.push(layer);
    else byHeading.set(heading, [layer]);
  }
  return [...byHeading.entries()]
    .map(([heading, members]) => ({
      heading,
      layers: [...members].sort((a, b) => a.order - b.order),
    }))
    .sort((a, b) => a.layers[0].order - b.layers[0].order);
};
