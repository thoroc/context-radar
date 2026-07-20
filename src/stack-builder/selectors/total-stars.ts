import { compactCount } from "../../lib";
import { LAYERS } from "../constants";
import { state } from "../state";

/** Combined community-star count of the selected tools, formatted compactly. */
export const totalStars = (): string => {
  let n = 0;
  for (const layer of LAYERS) {
    for (const t of layer.tools) {
      if (state.sel.has(t.id)) n += t.stars ?? 0;
    }
  }
  return n === 0 ? "-" : compactCount(n);
};
