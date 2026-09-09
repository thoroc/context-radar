import { esc } from "../detail";
import { DECISION_LABEL, starsText, statusText, type Tool, toolSlug, verdictClass } from "../lib";

/**
 * The layer's tools as linked cards.
 *
 * `exclude` holds ids already presented above as the layer's pick, so the same
 * tool is not shown twice on one page. Returns an empty string rather than an
 * empty grid when nothing is left, which is what keeps a single-tool layer from
 * rendering a heading over nothing.
 */
export const layerToolCards = (tools: Tool[], exclude: Set<string>, base: string): string => {
  const cards = tools
    .filter((t) => !exclude.has(t.id))
    .map(
      (t) => `<a class="layer-card" href="${base}tools/${toolSlug(t.tool)}.html">
      <span class="lc-head">
        <span class="lc-name">${esc(t.tool)}</span>
        <span class="verdict ${verdictClass(t.verdict.decision)}">${esc(DECISION_LABEL[t.verdict.decision])}</span>
      </span>
      <span class="lc-what">${esc(t.whatItDoes)}</span>
      <span class="lc-meta">
        <span class="act"><span class="dot dot-${t.activityStatus.band}"></span>${esc(statusText(t.activityStatus))}</span>
        <span class="lc-stars">${esc(starsText(t.stars))} stars</span>
        <span class="lc-lic">${esc(t.licence.spdx)}</span>
      </span>
    </a>`,
    )
    .join("");
  return cards === "" ? "" : `<div class="layer-cards">${cards}</div>`;
};
