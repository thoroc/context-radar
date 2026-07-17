import { LAYERS } from "../stack-data";
import { state } from "../state";

export const totalStars = (): string => {
  let n = 0;
  for (const l of LAYERS) {
    for (const t of l.tools) {
      if (state.sel.has(t.id)) {
        const v = Number.parseInt(t.stars.replace(/[^0-9]/g, ""), 10);
        if (!Number.isNaN(v)) n += v;
      }
    }
  }
  if (n === 0) return "-";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
};
