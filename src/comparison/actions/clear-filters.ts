import { el } from "../dom";
import { render } from "../render";

// Reset every filter control to its default and repaint. Resetting the
// multiselect checkboxes and dispatching `change` reuses each panel's own
// listener to refresh its summary label, so this stays the single source of
// truth for "no filters applied".
export const clearFilters = (): void => {
  el<HTMLInputElement>("s").value = "";
  el<HTMLSelectElement>("fl").value = "";
  el<HTMLSelectElement>("fr").value = "";
  for (const panelId of ["fv", "fa"]) {
    const panel = el<HTMLElement>(panelId);
    for (const cb of panel.querySelectorAll<HTMLInputElement>("input:checked")) {
      cb.checked = false;
    }
    panel.dispatchEvent(new Event("change"));
  }
  render();
};
