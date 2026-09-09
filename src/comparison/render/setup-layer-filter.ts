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
  // Copied before sorting: sort mutates, and the parameter is readonly.
  const ordered = [...layers].sort((a, b) => a.order - b.order);
  const options = ordered.map((layer) => {
    const option = document.createElement("option");
    option.value = layer.name;
    option.textContent = layer.name;
    return option;
  });
  // Replaced in one call rather than removed in a loop. select.options is a
  // live collection, so removing from it while iterating skips entries, and
  // keeping the empty-valued option that comes from the HTML avoids restating
  // its label here.
  const allLayers = select.querySelector('option[value=""]');
  select.replaceChildren(...(allLayers ? [allLayers, ...options] : options));
};
