import pages from "virtual:context-radar-pages";
import { wirePageModals } from "../lib";
import { el } from "./dom";
import { render, renderSummary, setupMultiselect } from "./render";
import { sortState } from "./state";

// Entry point: wire the controls to the render domain and do the first paint.
el("s").addEventListener("input", render);
el("fl").addEventListener("change", render);
el("fr").addEventListener("change", render);
setupMultiselect("fv", "All verdicts");
setupMultiselect("fa", "All activity");
for (const th of document.querySelectorAll<HTMLTableCellElement>("th[data-col]")) {
  th.addEventListener("click", () => {
    const c = th.dataset.col ?? "";
    if (sortState.col === c) sortState.dir *= -1;
    else {
      sortState.col = c;
      sortState.dir = 1;
    }
    for (const t of document.querySelectorAll("th")) t.classList.remove("sort-asc", "sort-desc");
    th.classList.add(sortState.dir === 1 ? "sort-asc" : "sort-desc");
    render();
  });
}

wirePageModals(pages);
renderSummary();
render();
