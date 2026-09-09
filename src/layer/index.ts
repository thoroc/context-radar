// Layer domain: the page body for one layer and the index of all of them.
// Mirrors src/detail/ in shape: pure functions returning HTML strings, escaped
// through the shared `esc`, with internal links prefixed by a caller-supplied
// base.

export { cardinalityBlock } from "./cardinality-block";
export { layerConflictsBlock } from "./layer-conflicts-block";
export { layerPickBlock } from "./layer-pick-block";
export { layerToolCards } from "./layer-tool-cards";
export { renderIndexBody } from "./render-index-body";
export { renderLayerBody } from "./render-layer-body";
export type { LayerContext } from "./types";
