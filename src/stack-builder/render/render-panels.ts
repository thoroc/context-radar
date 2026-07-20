import { SEVERITY_LABEL, TOOLS_BY_ID, type Tool } from "../../lib";
import { TOTAL_LAYERS } from "../constants";
import { el } from "../dom";
import type { ConflictReport } from "../model";
import { totalStars } from "../selectors";

const nameOf = (id: string): string => TOOLS_BY_ID.get(id)?.tool ?? id;

export const renderPanels = (report: ConflictReport, warns: Tool[], covered: number): void => {
  const pairs = [...report.blocking, ...report.warnings];
  const confBox = el("confBox");
  if (pairs.length) {
    confBox.style.display = "block";
    el("confList").innerHTML = pairs
      .map(
        (p) =>
          `<div class="conf-line">${SEVERITY_LABEL[p.severity]}: ${nameOf(p.a)} and ${nameOf(p.b)}</div>`,
      )
      .join("");
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

  const n = pairs.length;
  el("sConf").textContent = n === 0 ? "none" : `${n} conflict${n > 1 ? "s" : ""}`;
  el("sConf").style.color = n > 0 ? "var(--red-mid)" : "var(--teal)";
  el("bConf").style.transform = `scaleX(${Math.min(n * 0.34, 1)})`;
  el("sStars").textContent = totalStars();
};
