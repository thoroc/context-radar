import { esc } from "../detail";
import { CARDINALITY_LABEL, type LayerMeta, layerSlug, type Tool } from "../lib";
import type { LayerContext } from "./types";

/**
 * The /layers.html index: every layer, in store order, with its summary and
 * tool count.
 *
 * Every layer appears, per D6. There is no floor filtering thin layers out of
 * the list, so this page is where the layer count is checkable by eye against
 * the comparison table's own figure.
 */
export const renderIndexBody = (layers: LayerMeta[], tools: Tool[], ctx: LayerContext): string => {
  const counts = new Map<string, number>();
  for (const tool of tools) counts.set(tool.layer, (counts.get(tool.layer) ?? 0) + 1);

  const cards = [...layers]
    .sort((a, b) => a.order - b.order)
    .map((layer) => {
      const count = counts.get(layer.name) ?? 0;
      return `<a class="layer-card" href="${ctx.base}layers/${layerSlug(layer.name)}.html">
      <span class="lc-head">
        <span class="lc-name">${esc(layer.name)}</span>
        <span class="card-badge cd-${layer.cardinality}">${esc(CARDINALITY_LABEL[layer.cardinality])}</span>
      </span>
      <span class="lc-what">${esc(layer.summary)}</span>
      <span class="lc-meta"><span class="lc-stars">${count} tool${count === 1 ? "" : "s"}</span></span>
    </a>`;
    })
    .join("");

  return `<div class="head"><h1>Layers</h1></div>
  <p class="lede">Tools are grouped by the layer of an agent's context they act on. Each layer says
  how many of its tools belong in one stack, and where to start.</p>
  <p class="stats"><strong>${layers.length} layers</strong> &middot; <strong>${tools.length} tools</strong></p>
  <div class="layer-cards">${cards}</div>`;
};
