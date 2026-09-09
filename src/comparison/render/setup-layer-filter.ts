import type { LayerMeta } from "../../lib";

/**
 * Fills the layer filter from the store, in store order.
 *
 * The options used to be hand-written in comparison.html, which made them a
 * fourth copy of the layer taxonomy and let them drift: the option
 * "Config stack audit & optimisation" never matched the store's
 * "Config stack audit", and since the filter compared by prefix, selecting it
 * returned an empty table on the deployed site with no error anywhere.
 *
 * Idempotent, so it can run before the first paint without risking a doubled
 * list if it is ever called again.
 */
export const setupLayerFilter = (layers: readonly LayerMeta[]): void => {
  const select = document.getElementById("fl");
  if (!(select instanceof HTMLSelectElement)) return;
  for (const option of [...select.options]) {
    if (option.value !== "") option.remove();
  }
  for (const layer of [...layers].sort((a, b) => a.order - b.order)) {
    const option = document.createElement("option");
    option.value = layer.name;
    option.textContent = layer.name;
    select.appendChild(option);
  }
};
