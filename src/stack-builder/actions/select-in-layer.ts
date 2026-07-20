import type { BuilderLayer } from "../constants";
import { nextSelection } from "../model";
import { render } from "../render";
import { state } from "../state";

/**
 * Activate a tool within its layer, honouring the layer's cardinality (pick-one
 * layers swap; stackable layers toggle), then repaint. This is how a user swaps
 * the tool chosen for a layer without leaving a within-layer conflict.
 */
export const selectInLayer = (layer: BuilderLayer, toolId: string): void => {
  state.sel = nextSelection(
    state.sel,
    layer.tools.map((t) => t.id),
    toolId,
    layer.cardinality,
  );
  render();
};
