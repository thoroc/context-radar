import type { LayerCardinality } from "../../lib";

/**
 * The selection after activating a tool within a layer, honouring the layer's
 * cardinality. `pick-one` behaves as a radio: the layer's other tools are cleared
 * and the tool toggles (so re-clicking the current pick clears the layer).
 * `stackable`/`install-both` toggle the single tool. `reference` layers are not
 * selectable, so the selection is returned unchanged. Pure over the inputs.
 */
export const nextSelection = (
  current: ReadonlySet<string>,
  layerToolIds: readonly string[],
  toolId: string,
  cardinality: LayerCardinality,
): Set<string> => {
  if (cardinality === "reference") return new Set(current);
  const next = new Set(current);
  const wasSelected = next.has(toolId);
  if (cardinality === "pick-one") {
    for (const id of layerToolIds) next.delete(id);
    if (!wasSelected) next.add(toolId);
    return next;
  }
  if (wasSelected) next.delete(toolId);
  else next.add(toolId);
  return next;
};
