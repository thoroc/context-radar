import { esc } from "../detail";
import { CARDINALITY_LABEL, type LayerMeta } from "../lib";

// How many of a layer's tools belong in one stack, in a full sentence. The
// short badge wording lives in the shared CARDINALITY_LABEL; this is the
// explanation that sits under it.
//
// All four values are spelled out. install-both and reference each cover
// exactly one layer today, so a missing branch would have been wrong on one
// page in twenty and easy to miss.
const EXPLANATION: Record<LayerMeta["cardinality"], string> = {
  "pick-one": "Pick exactly one. These tools are mutually exclusive.",
  stackable: "Add as many as apply. These tools are complementary.",
  "install-both": "The tools here are complementary and meant to run together.",
  reference: "Not an installable layer. These are curated further-reading lists.",
};

/** The layer's selection rule: a badge, the explanation, and the store's own rationale if it has one. */
export const cardinalityBlock = (layer: LayerMeta): string => {
  const note = layer.note ? `<p class="card-note">${esc(layer.note)}</p>` : "";
  return `<div class="callout">
      <span class="card-badge cd-${layer.cardinality}">${esc(CARDINALITY_LABEL[layer.cardinality])}</span>
      <p class="rationale">${esc(EXPLANATION[layer.cardinality])}</p>
      ${note}
    </div>`;
};
