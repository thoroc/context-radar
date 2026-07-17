import { DECISION_LABEL, searchText, TOOLS, verdictClass } from "../../lib";
import { activityCell, conflictCell, toolCell } from "../cells";
import { LAYERS } from "../constants";
import { el, escapeHtml } from "../dom";
import { isDrop, needsExternal, selectedValues, sortValue, verdictMatches } from "../query";
import { sortState } from "../state";

export const render = (): void => {
  const q = el<HTMLInputElement>("s").value.toLowerCase();
  const fl = el<HTMLSelectElement>("fl").value;
  const fv = selectedValues("fv");
  const fa = selectedValues("fa");
  const fr = el<HTMLSelectElement>("fr").value;
  const tb = el("tb");
  tb.innerHTML = "";
  let total = 0;
  for (const layer of LAYERS) {
    const rows = TOOLS.filter((t) => {
      if (!layer.match.some((m) => t.layer.startsWith(m))) return false;
      if (fl && !t.layer.startsWith(fl) && !layer.match.some((m) => m.startsWith(fl))) return false;
      if (q && !searchText(t).includes(q)) return false;
      if (!verdictMatches(t, fv)) return false;
      if (fa.size && !fa.has(t.activityStatus.band)) return false;
      if (fr === "clean" && needsExternal(t)) return false;
      if (fr === "warn" && !needsExternal(t)) return false;
      return true;
    });
    if (!rows.length) continue;
    if (sortState.col !== null) {
      const col = sortState.col;
      rows.sort((a, b) => {
        const av = sortValue(a, col);
        const bv = sortValue(b, col);
        return av < bv ? -sortState.dir : av > bv ? sortState.dir : 0;
      });
    } else {
      // Default: alphabetical by tool name within each layer.
      rows.sort((a, b) => a.tool.toLowerCase().localeCompare(b.tool.toLowerCase()));
    }
    total += rows.length;
    const hdr = document.createElement("tr");
    hdr.className = "lh";
    const note = layer.note ? `<span class="lh-note">${escapeHtml(layer.note)}</span>` : "";
    hdr.innerHTML = `<td colspan="6">${escapeHtml(layer.label)}${note}</td>`;
    tb.appendChild(hdr);
    for (const t of rows) {
      const tr = document.createElement("tr");
      if (isDrop(t)) tr.className = "dropped";
      tr.innerHTML =
        `<td>${toolCell(t)}</td>` +
        `<td><div class="desc" title="${escapeHtml(t.whatItDoes)}">${escapeHtml(t.whatItDoes)}</div></td>` +
        `<td>${conflictCell(t)}</td>` +
        `<td>${activityCell(t)}</td>` +
        `<td><span class="verdict ${verdictClass(t.verdict.decision)}">${DECISION_LABEL[t.verdict.decision]}</span></td>` +
        `<td><div class="rule" title="${escapeHtml(t.decisionRule)}">${escapeHtml(t.decisionRule)}</div></td>`;
      tb.appendChild(tr);
    }
  }
  el("cnt").textContent = `${total} tool${total === 1 ? "" : "s"} shown`;
};
