import { esc } from "../detail";
import {
  CARDINALITY_LABEL,
  conflictGraph,
  formatDisplayDate,
  type LayerMeta,
  layerSlug,
  type Recommendation,
  type Tool,
} from "../lib";
import { cardinalityBlock } from "./cardinality-block";
import { layerConflictsBlock } from "./layer-conflicts-block";
import { layerPickBlock } from "./layer-pick-block";
import { layerToolCards } from "./layer-tool-cards";
import type { LayerContext } from "./types";

/**
 * One layer's page body.
 *
 * Every section below the summary is conditional, because the layers are very
 * uneven: nine have no pick, two have no note, four hold a single tool, and one
 * is not installable at all. A layer with nothing to say in a section renders
 * no heading for it rather than an empty one, which is what stops the thin
 * pages reading as scaffolding.
 */
export const renderLayerBody = (
  layer: LayerMeta,
  tools: Tool[],
  allTools: Tool[],
  recs: Recommendation[],
  ctx: LayerContext,
): string => {
  const byId = new Map(allTools.map((t) => [t.id, t]));
  const pick = layerPickBlock(layer, recs, byId, ctx.base);
  const rec = recs.find((r) => r.layer === layer.name);
  const pickedId = rec?.pick ?? layer.curatedPick;
  const shown = pick !== "" && pickedId !== undefined ? new Set([pickedId]) : new Set<string>();
  const cards = layerToolCards(tools, shown, ctx.base);
  const conflicts = layerConflictsBlock(tools, conflictGraph(allTools), ctx.base);
  const others = tools.length - shown.size;

  return `<div class="head">
    <h1>${esc(layer.name)}</h1>
    <span class="card-badge cd-${layer.cardinality}">${esc(CARDINALITY_LABEL[layer.cardinality])}</span>
  </div>
  <p class="lede">${esc(layer.summary)}</p>
  <div class="cols">
    <div class="main">
      <section><h2>How many to install</h2>${cardinalityBlock(layer)}</section>
      ${pick ? `<section><h2>Where to start</h2>${pick}</section>` : ""}
      ${cards ? `<section><h2>${others === 1 ? "The other tool" : "The other tools"} in this layer</h2>${cards}</section>` : ""}
      ${conflicts ? `<section><h2>Conflicts within this layer</h2>${conflicts}</section>` : ""}
    </div>
    <aside>
      <div class="facts">
        <div class="row"><span class="k">Tools</span><span class="v">${tools.length}</span></div>
        <div class="row"><span class="k">Selection</span><span class="v">${esc(CARDINALITY_LABEL[layer.cardinality])}</span></div>
        <div class="row"><span class="k">Order</span><span class="v">${layer.order}</span></div>
        <div class="row"><span class="k">Verified</span><span class="v">${esc(formatDisplayDate(ctx.starsVerified))}</span></div>
        <div class="actions">
          <a class="btn accent" href="${ctx.base}comparison.html?layer=${encodeURIComponent(layer.name)}">See it in the table</a>
          <a class="btn" href="${ctx.base}stack-builder.html">Open stack builder</a>
        </div>
      </div>
    </aside>
  </div>
  <p class="layer-foot"><a href="${ctx.base}layers.html">All layers</a> &middot; <a href="${ctx.base}layers/${layerSlug(layer.name)}.html">Permalink</a></p>`;
};
