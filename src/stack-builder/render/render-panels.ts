import { el } from "../dom";
import { totalStars } from "../selectors";
import { type CONFLICTS, type StackTool, TOTAL_LAYERS } from "../stack-data";

export const renderPanels = (conf: typeof CONFLICTS, warns: StackTool[], covered: number): void => {
  const confBox = el("confBox");
  if (conf.length) {
    confBox.style.display = "block";
    el("confList").innerHTML = conf.map((c) => `<div class="conf-line">${c.msg}</div>`).join("");
  } else {
    confBox.style.display = "none";
  }
  const reqBox = el("reqBox");
  if (warns.length) {
    reqBox.style.display = "block";
    el("reqList").innerHTML = warns
      .map((w) => `<div class="req-warn-line"><strong>${w.name}:</strong> ${w.req}</div>`)
      .join("");
  } else {
    reqBox.style.display = "none";
  }
  el("sCov").textContent = `${covered} / ${TOTAL_LAYERS}`;
  el("bCov").style.transform = `scaleX(${covered / TOTAL_LAYERS})`;
  el("sConf").textContent =
    conf.length === 0 ? "none" : `${conf.length} conflict${conf.length > 1 ? "s" : ""}`;
  el("sConf").style.color = conf.length > 0 ? "var(--red-mid)" : "var(--teal)";
  el("bConf").style.transform = `scaleX(${Math.min(conf.length * 0.34, 1)})`;
  el("sStars").textContent = totalStars();
};
