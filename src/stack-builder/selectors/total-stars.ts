import { LAYERS } from "../stack-data";
import { state } from "../state";
import { parseStars } from "./parse-stars";

export const totalStars = (): string => {
  let n = 0;
  for (const l of LAYERS) {
    for (const t of l.tools) {
      if (state.sel.has(t.id)) n += parseStars(t.stars);
    }
  }
  if (n === 0) return "-";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${Math.round(n)}`;
};
