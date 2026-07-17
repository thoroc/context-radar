import pages from "virtual:context-radar-pages";
import { initThemeToggle, wirePageModals } from "../lib";
import { clearAll, exportMd, loadRec, setFilter } from "./actions";
import { FILTERS } from "./constants";
import { el } from "./dom";
import { render } from "./render";
import { LAYERS, TOTAL_LAYERS } from "./stack-data";

// Derive the header counts from the data so they can never drift from the catalogue.
el("sb-tools").textContent = String(LAYERS.reduce((n, l) => n + l.tools.length, 0));
el("sb-layers").textContent = String(TOTAL_LAYERS);

// Entry point: build the filter chips, wire the controls, and do the first paint.
for (const f of FILTERS) {
  const c = document.createElement("div");
  c.className = `chip${f.id === "all" ? " active" : ""}`;
  c.dataset.f = f.id;
  c.textContent = f.label;
  c.addEventListener("click", () => setFilter(f.id));
  el("fbar").appendChild(c);
}

el("btn-rec").addEventListener("click", loadRec);
el("btn-clear").addEventListener("click", clearAll);
el("btn-export").addEventListener("click", exportMd);
el("q").addEventListener("input", render);

wirePageModals(pages);
initThemeToggle();
render();
