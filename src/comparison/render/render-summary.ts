import { formatDisplayDate, META, TOOLS } from "../../lib";
import { LAYERS } from "../constants";
import { el } from "../dom";

export const renderSummary = (): void => {
  const layerCount = LAYERS.filter((layer) =>
    TOOLS.some((t) => layer.match.some((m) => t.layer.startsWith(m))),
  ).length;
  el("summary").innerHTML =
    `<strong>${TOOLS.length} tools</strong> across <strong>${layerCount} layers</strong> &middot; stars &amp; activity verified ${formatDisplayDate(META.stars_verified)} &middot; <a href="context-reduction-tools.csv">Download CSV</a>`;
};
