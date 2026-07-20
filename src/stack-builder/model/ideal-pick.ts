import type { LayerMeta, Recommendation, Tool } from "../../lib";
import { activityRank } from "./activity-rank";
import type { IdealPick } from "./types";
import { verdictRank } from "./verdict-rank";

// A heuristic suggestion needs at least an `add` verdict; `add-if` (conditional),
// `watch` (immature), `reference` and `drop` do not earn a default pick, so those
// layers are left for the user to choose ("no clear pick").
const CONFIDENT = verdictRank("add");

// Best-candidate order: verdict rank, then stars (null sorts last), then activity.
const rankTools = (candidates: Tool[]): Tool[] =>
  [...candidates].sort((a, b) => {
    const v = verdictRank(b.verdict.decision) - verdictRank(a.verdict.decision);
    if (v !== 0) return v;
    const s = (b.stars ?? -1) - (a.stars ?? -1);
    if (s !== 0) return s;
    return activityRank(b.activityStatus.band) - activityRank(a.activityStatus.band);
  });

/**
 * The pick for one layer, with provenance. A curated recommendation for the layer
 * wins first, then the layer's `curatedPick`, then the top-ranked candidate as a
 * `suggested` pick, but only if it clears the confidence floor; otherwise the
 * layer gets no pick. `candidates` are the tools in this layer.
 */
export const idealPick = (
  layer: LayerMeta,
  candidates: Tool[],
  recs: Recommendation[],
): IdealPick => {
  const rec = recs.find((r) => r.layer === layer.name);
  if (rec) return { toolId: rec.pick, provenance: "curated" };
  if (layer.curatedPick) return { toolId: layer.curatedPick, provenance: "curated" };

  const top = rankTools(candidates)[0];
  if (!top || verdictRank(top.verdict.decision) < CONFIDENT) return { provenance: "none" };
  return { toolId: top.id, provenance: "suggested" };
};
