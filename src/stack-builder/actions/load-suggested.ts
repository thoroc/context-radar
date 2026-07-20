import { LAYERS_META, RECOMMENDATIONS, TOOLS } from "../../lib";
import { CONFLICT_GRAPH } from "../constants";
import { suggestedStack } from "../model";
import { render } from "../render";
import { state } from "../state";

/** Replace the selection with the derived suggested starting stack, then repaint. */
export const loadSuggested = (): void => {
  state.sel = suggestedStack(TOOLS, LAYERS_META, RECOMMENDATIONS, CONFLICT_GRAPH).ids;
  render();
};
