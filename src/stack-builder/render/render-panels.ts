import { SEVERITY_LABEL, TOOLS_BY_ID, type Tool } from "../../lib";
import { TOTAL_LAYERS } from "../constants";
import { el } from "../dom";
import type { ConflictReport } from "../model";
import { totalStars } from "../selectors";

const nameOf = (id: string): string => TOOLS_BY_ID.get(id)?.tool ?? id;

const pairLine = (p: { a: string; b: string; severity: string }): string =>
  `<div class="conf-line">${SEVERITY_LABEL[p.severity as keyof typeof SEVERITY_LABEL]}: ${nameOf(p.a)} and ${nameOf(p.b)}</div>`;

export const renderPanels = (report: ConflictReport, warns: Tool[], covered: number): void => {
  const { blocking, warnings } = report;
  const confBox = el("confBox");
  if (blocking.length || warnings.length) {
    confBox.style.display = "block";
    const sections: string[] = [];
    if (blocking.length) {
      sections.push(
        `<div class="conf-sub">To resolve (remove one of each pair):</div>${blocking.map(pairLine).join("")}`,
      );
    }
    if (warnings.length) {
      sections.push(
        `<div class="conf-sub">Overlaps to review (allowed):</div>${warnings.map(pairLine).join("")}`,
      );
    }
    el("confList").innerHTML = sections.join("");
  } else {
    confBox.style.display = "none";
  }

  const reqBox = el("reqBox");
  if (warns.length) {
    reqBox.style.display = "block";
    el("reqList").innerHTML = warns
      .map((w) => `<div class="req-warn-line"><strong>${w.tool}:</strong> ${w.requirements}</div>`)
      .join("");
  } else {
    reqBox.style.display = "none";
  }

  el("sCov").textContent = `${covered} / ${TOTAL_LAYERS}`;
  el("bCov").style.transform = `scaleX(${TOTAL_LAYERS ? covered / TOTAL_LAYERS : 0})`;

  // The scoreboard headline is blocking conflicts only (the ones that must be
  // resolved); soft overlaps are advisory and reported in the box above.
  const nBlock = blocking.length;
  const soft = warnings.length ? `, ${warnings.length} to review` : "";
  el("sConf").textContent =
    nBlock === 0 ? (warnings.length ? `0${soft}` : "none") : `${nBlock} to resolve${soft}`;
  el("sConf").style.color = nBlock > 0 ? "var(--red-mid)" : "var(--teal)";
  el("bConf").style.transform = `scaleX(${Math.min(nBlock * 0.34, 1)})`;
  el("sStars").textContent = totalStars();
};
