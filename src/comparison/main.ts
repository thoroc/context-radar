import pages from "virtual:context-radar-pages";
import { toolFragments } from "../detail";
import { delegateModals, initThemeToggle, wirePageModals } from "../lib";
import { clearFilters } from "./actions";
import { el } from "./dom";
import { render, renderSummary, setupMultiselect } from "./render";
import { sortState } from "./state";

// Entry point: wire the controls to the render domain and do the first paint.
el("s").addEventListener("input", render);
el("fl").addEventListener("change", render);
el("fr").addEventListener("change", render);
// The empty-state "Clear all filters" button is re-rendered with the table, so
// delegate its click from the stable tbody.
el("tb").addEventListener("click", (e) => {
  if ((e.target as HTMLElement).closest(".empty-clear")) clearFilters();
});
setupMultiselect("fv", "All verdicts");
setupMultiselect("fa", "All activity");
// Sortable headers are real <button>s so they are keyboard-operable; the parent
// <th> carries aria-sort so assistive tech announces the current sort.
for (const th of document.querySelectorAll<HTMLTableCellElement>("th[data-col]")) {
  th.querySelector("button")?.addEventListener("click", () => {
    const c = th.dataset.col ?? "";
    if (sortState.col === c) sortState.dir *= -1;
    else {
      sortState.col = c;
      sortState.dir = 1;
    }
    for (const t of document.querySelectorAll<HTMLTableCellElement>("th[data-col]")) {
      t.classList.remove("sort-asc", "sort-desc");
      t.removeAttribute("aria-sort");
    }
    th.classList.add(sortState.dir === 1 ? "sort-asc" : "sort-desc");
    th.setAttribute("aria-sort", sortState.dir === 1 ? "ascending" : "descending");
    render();
  });
}

// Nav links (Methodology/Glossary) and every tool's detail are modal-backed.
// Registering the tool fragments here lets in-modal conflict links swap tools.
wirePageModals({ ...pages, ...toolFragments() });
// Tool-name links in the table body are re-rendered on every filter/sort, so
// delegate their clicks to open the detail overlay in place.
delegateModals(el("tb"));
initThemeToggle();
renderSummary();
render();
