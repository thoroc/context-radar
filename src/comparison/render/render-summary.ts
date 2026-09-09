import { formatDisplayDate, LAYERS_META, META, TOOLS } from "../../lib";
import { el } from "../dom";

export const renderSummary = (): void => {
  // Counted off the store, so this figure and the layer set the table renders
  // cannot disagree. It reported 19 while the store held 20.
  const layerCount = LAYERS_META.filter((layer) =>
    TOOLS.some((t) => t.layer === layer.name),
  ).length;
  el("summary").innerHTML =
    `<strong>${TOOLS.length} tools</strong> across <strong>${layerCount} layers</strong> &middot; stars &amp; activity verified ${formatDisplayDate(META.stars_verified)} &middot; <a href="context-reduction-tools.csv">Download CSV</a>`;
};
