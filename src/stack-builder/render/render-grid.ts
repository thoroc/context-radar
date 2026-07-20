import { TOOLS_BY_ID, toolSlug } from "../../lib";
import { buildCard } from "../cards";
import { type BuilderLayer, LAYERS } from "../constants";
import { el } from "../dom";
import { toolVisible } from "../selectors";
import { state } from "../state";

// Cardinality drives the layer badge: label + colour class (reusing the existing
// b-pick / b-add / b-watch styles).
const BADGE: Record<BuilderLayer["cardinality"], { label: string; cls: string }> = {
  "pick-one": { label: "pick one", cls: "b-pick" },
  stackable: { label: "stackable", cls: "b-add" },
  "install-both": { label: "install both", cls: "b-add" },
  reference: { label: "reference", cls: "b-watch" },
};

const curatedPickLine = (layer: BuilderLayer): string => {
  if (!layer.curatedPick) return "";
  const pick = TOOLS_BY_ID.get(layer.curatedPick);
  if (!pick) return "";
  return `<div class="layer-rec">Catalogue pick: <a href="tools/${toolSlug(pick.tool)}.html">${pick.tool}</a></div>`;
};

export const renderGrid = (conflictedIds: Set<string>): void => {
  const grid = el("grid");
  grid.innerHTML = "";
  for (const layer of LAYERS) {
    const visible = layer.tools.filter(toolVisible);
    if (!visible.length) continue;
    const badge = BADGE[layer.cardinality];
    const sec = document.createElement("div");
    sec.className = "layer";
    let h = `<div class="layer-head"><span class="layer-name">${layer.name}</span><span class="badge ${badge.cls}">${badge.label}</span></div>`;
    if (layer.note) h += `<div class="layer-note">${layer.note}</div>`;
    h += curatedPickLine(layer);
    h += `<div class="tools-grid" id="tg-${layer.order}"></div>`;
    sec.innerHTML = h;
    const tg = sec.querySelector(`#tg-${layer.order}`);
    if (!tg) continue;
    for (const t of visible)
      tg.appendChild(buildCard(t, state.sel.has(t.id), conflictedIds.has(t.id)));
    grid.appendChild(sec);
  }
};
