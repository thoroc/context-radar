import type { ConflictGraph, LayerMeta, Recommendation, Tool } from "../../lib";
import { idealPick } from "./ideal-pick";
import type { Provenance } from "./types";
import { verdictRank } from "./verdict-rank";

export interface SuggestedStack {
  /** The selected tool ids after cross-layer blocking conflicts are resolved. */
  ids: Set<string>;
  /** Where each layer's pick came from, keyed by layer name (before resolution). */
  provenance: Map<string, Provenance>;
}

// Keep-priority when two picks block each other: curated beats suggested, then
// higher verdict rank, then more stars. Star counts (max ~90k) never outweigh a
// verdict tier or the curated bonus.
const keepScore = (tool: Tool | undefined, provenance: Provenance): number => {
  const curated = provenance === "curated" ? 1_000_000 : 0;
  if (!tool) return curated;
  return curated + verdictRank(tool.verdict.decision) * 100_000 + (tool.stars ?? 0);
};

/**
 * Assemble the suggested starting stack from the canonical store: one pick per
 * installable layer (idealPick), excluding reference layers, then resolve
 * cross-layer blocking conflicts by dropping the lower-priority side so the
 * emitted set carries no hard/either-or conflict. Soft conflicts are left in
 * (they are allowed, surfaced as warnings). The provenance map records where each
 * layer's pick came from; `ids` is the source of truth for what survived.
 */
export const suggestedStack = (
  tools: Tool[],
  layers: LayerMeta[],
  recs: Recommendation[],
  graph: ConflictGraph,
): SuggestedStack => {
  const byId = new Map(tools.map((t) => [t.id, t]));
  const byLayer = new Map<string, Tool[]>();
  for (const t of tools) {
    const arr = byLayer.get(t.layer);
    if (arr) arr.push(t);
    else byLayer.set(t.layer, [t]);
  }

  const provenance = new Map<string, Provenance>();
  const provById = new Map<string, Provenance>();
  const chosen = new Set<string>();

  for (const layer of layers) {
    if (layer.cardinality === "reference") continue;
    const pick = idealPick(layer, byLayer.get(layer.name) ?? [], recs);
    provenance.set(layer.name, pick.provenance);
    if (pick.toolId) {
      chosen.add(pick.toolId);
      provById.set(pick.toolId, pick.provenance);
    }
  }

  // Resolve blocking conflicts between chosen picks: drop the lower-scoring side.
  for (const id of [...chosen]) {
    if (!chosen.has(id)) continue;
    const edges = graph.get(id);
    if (!edges) continue;
    for (const [other, severity] of edges) {
      if (severity === "soft" || !chosen.has(other)) continue;
      const keepId =
        keepScore(byId.get(id), provById.get(id) ?? "suggested") >=
        keepScore(byId.get(other), provById.get(other) ?? "suggested")
          ? id
          : other;
      chosen.delete(keepId === id ? other : id);
    }
  }

  return { ids: chosen, provenance };
};
