import { esc } from "../detail";
import { type LayerMeta, type Recommendation, type Tool, toolSlug } from "../lib";

const link = (tool: Tool, base: string): string =>
  `<a href="${base}tools/${toolSlug(tool.tool)}.html">${esc(tool.tool)}</a>`;

/**
 * The layer's starting pick.
 *
 * Two sources name a pick and they must not both be presented. `layers[].curatedPick`
 * is a bare tool id; `data/tool-recommendations.json` carries the same pick plus a
 * rationale and a condition per alternative, and is already rendered on tool pages.
 * The richer source wins where it exists, and `curatedPick` is the fallback, so the
 * layer page does not invent a second, thinner presentation of the same decision.
 * `scripts/validate-data.ts` enforces that the two agree wherever both are set.
 *
 * Empty for the nine layers that have neither, which is the common case rather
 * than an edge case.
 */
export const layerPickBlock = (
  layer: LayerMeta,
  recs: Recommendation[],
  byId: Map<string, Tool>,
  base: string,
): string => {
  const rec = recs.find((r) => r.layer === layer.name);
  if (rec) {
    const pick = byId.get(rec.pick);
    if (!pick) return "";
    const where = rec.group ? ` <span class="rec-when">within ${esc(rec.group)}</span>` : "";
    const alts = rec.alternatives
      .map((a) => {
        const alt = byId.get(a.id);
        return alt
          ? `<li>${link(alt, base)} <span class="rec-when">when ${esc(a.when)}</span></li>`
          : "";
      })
      .join("");
    return `<div class="callout rec">
      <div class="rec-lead"><span class="rec-tag">Recommended pick</span> ${link(pick, base)}${where}</div>
      <p class="rationale">${esc(rec.rationale)}</p>
      ${alts ? `<div class="rec-alts"><span class="rec-alts-head">Alternatives</span><ul>${alts}</ul></div>` : ""}
    </div>`;
  }

  if (layer.curatedPick === undefined) return "";
  const curated = byId.get(layer.curatedPick);
  if (!curated) return "";
  return `<div class="callout rec">
      <div class="rec-lead"><span class="rec-tag">Curated pick</span> ${link(curated, base)}</div>
      <p class="rationale">${esc(curated.decisionRule)}</p>
    </div>`;
};
