import { RECOMMENDATIONS, TOOLS_BY_ID, toolSlug } from "../../lib";
import { selectInLayer } from "../actions";
import { buildCard } from "../cards";
import { type BuilderLayer, LAYERS } from "../constants";
import { el } from "../dom";
import { idealPick } from "../model";
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

// A provenance-aware line under the layer head: a curated or suggested pick (with
// a link), or an honest "no clear pick" for complementary/immature layers, or a
// "further reading" note for the non-installable reference layer.
const pickLine = (layer: BuilderLayer): string => {
  if (layer.cardinality === "reference") {
    return '<div class="layer-rec">Further reading, not installable stack components.</div>';
  }
  const pick = idealPick(layer, layer.tools, RECOMMENDATIONS);
  if (pick.provenance === "none" || !pick.toolId) {
    return '<div class="layer-rec">No clear pick here, choose what fits your setup.</div>';
  }
  const tool = TOOLS_BY_ID.get(pick.toolId);
  if (!tool) return "";
  const label = pick.provenance === "curated" ? "Catalogue pick" : "Suggested pick";
  return `<div class="layer-rec">${label}: <a href="tools/${toolSlug(tool.tool)}.html">${tool.tool}</a></div>`;
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
    h += pickLine(layer);
    h += `<div class="tools-grid" id="tg-${layer.order}"></div>`;
    sec.innerHTML = h;
    const tg = sec.querySelector(`#tg-${layer.order}`);
    if (!tg) continue;
    for (const t of visible) {
      const onActivate =
        layer.cardinality === "reference" ? undefined : () => selectInLayer(layer, t.id);
      tg.appendChild(buildCard(t, state.sel.has(t.id), conflictedIds.has(t.id), onActivate));
    }
    grid.appendChild(sec);
  }
};
