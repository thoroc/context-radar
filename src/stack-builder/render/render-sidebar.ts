import type { Tool } from "../../lib";
import { toggle } from "../actions";
import { LAYERS, TOTAL_LAYERS } from "../constants";
import { el } from "../dom";
import { state } from "../state";

export const renderSidebar = (conflictedIds: Set<string>, covered: number): void => {
  const selTools: Array<Tool & { layerName: string }> = [];
  for (const layer of LAYERS) {
    for (const t of layer.tools) {
      if (state.sel.has(t.id)) selTools.push({ ...t, layerName: layer.name });
    }
  }
  el("cnt").textContent = `${selTools.length} tool${selTools.length !== 1 ? "s" : ""}`;
  el("sub").textContent =
    selTools.length === 0
      ? "Click tools to add, or load the suggested stack."
      : `${covered} of ${TOTAL_LAYERS} layers covered`;
  const body = el("body");
  if (!selTools.length) {
    body.innerHTML =
      '<div class="stack-empty"><i class="ti ti-stack-2"></i>Nothing selected yet.<br>Click any tool to add it.</div>';
    return;
  }
  body.innerHTML = selTools
    .map((t) => {
      const dotCls = conflictedIds.has(t.id) ? "cd" : t.requiresExternal ? "warn" : "";
      const reqLine = t.requiresExternal ? `<div class="si-req">${t.requirements}</div>` : "";
      return `<div class="si">
        <div class="si-dot${dotCls ? ` ${dotCls}` : ""}"></div>
        <div class="si-info"><div class="si-name">${t.tool}</div><div class="si-layer">${t.layerName}</div>${reqLine}</div>
        <i class="ti ti-x si-rm" data-id="${t.id}" title="Remove"></i>
      </div>`;
    })
    .join("");
  for (const rm of body.querySelectorAll<HTMLElement>(".si-rm")) {
    rm.addEventListener("click", () => {
      const id = rm.dataset.id;
      if (id) toggle(id);
    });
  }
};
