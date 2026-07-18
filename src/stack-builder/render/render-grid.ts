import { RECOMMENDATIONS, TOOLS_BY_ID } from "../../lib";
import { buildCard } from "../cards";
import { el } from "../dom";
import { layerRecommendation, toolVisible } from "../selectors";
import { LAYERS } from "../stack-data";
import { state } from "../state";

export const renderGrid = (cIds: Set<string>): void => {
  const grid = el("grid");
  grid.innerHTML = "";
  for (const layer of LAYERS) {
    const vis = layer.tools.filter(toolVisible);
    if (!vis.length) continue;
    const sec = document.createElement("div");
    sec.className = "layer";
    let h = `<div class="layer-head"><span class="layer-name">${layer.name}</span><span class="badge ${layer.bc}">${layer.badge}</span></div>`;
    if (layer.note) h += `<div class="layer-note">${layer.note}</div>`;
    const rec = layerRecommendation(layer.id, RECOMMENDATIONS, TOOLS_BY_ID);
    if (rec) {
      const group = rec.group ? ` (${rec.group})` : "";
      h += `<div class="layer-rec">Catalogue pick${group}: <a href="${rec.pickHref}">${rec.pickName}</a></div>`;
    }
    h += `<div class="tools-grid" id="tg-${layer.id}"></div>`;
    sec.innerHTML = h;
    const tg = sec.querySelector(`#tg-${layer.id}`);
    if (!tg) continue;
    for (const t of vis) tg.appendChild(buildCard(t, state.sel.has(t.id), cIds.has(t.id)));
    grid.appendChild(sec);
  }
};
