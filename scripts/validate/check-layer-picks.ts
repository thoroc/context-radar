import type { LayerMeta, Recommendation } from "../../src/lib/schema";

/**
 * Two mechanisms name a layer's starting pick: `layers[].curatedPick` (a bare
 * tool id) and a record in `data/tool-recommendations.json` (the same pick plus
 * a rationale and per-alternative conditions). They agree today and nothing
 * required them to, which matters now that the layer page presents one of them
 * as the answer.
 *
 * A recommendation carrying a `group` is scoped to a sub-slice of its layer, so
 * its pick is the pick for that slice rather than for the layer as a whole and
 * is not compared against the layer-wide value.
 */
export const checkLayerPicks = (layers: LayerMeta[], recs: Recommendation[]): string[] => {
  const errors: string[] = [];
  for (const layer of layers) {
    if (layer.curatedPick === undefined) continue;
    const rec = recs.find((r) => r.layer === layer.name && r.group === undefined);
    if (!rec || rec.pick === layer.curatedPick) continue;
    errors.push(
      `layer '${layer.name}': curatedPick '${layer.curatedPick}' disagrees with ` +
        `recommendation '${rec.id}' which picks '${rec.pick}'`,
    );
  }
  return errors;
};
