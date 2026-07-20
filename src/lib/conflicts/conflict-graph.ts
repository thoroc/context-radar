import type { Tool } from "../schema";
import { resolveProjectRef } from "./resolve-project-ref";

/** Conflict severities that place an edge between two tools; stackable/none do not. */
export type EdgeSeverity = "hard" | "either-or" | "soft";

/** Symmetric adjacency: for each tool id, its conflicting ids and the pair's severity. */
export type ConflictGraph = ReadonlyMap<string, ReadonlyMap<string, EdgeSeverity>>;

const RANK: Record<EdgeSeverity, number> = { hard: 3, "either-or": 2, soft: 1 };

const isEdge = (s: Tool["conflict"]["severity"]): s is EdgeSeverity =>
  s === "hard" || s === "either-or" || s === "soft";

/**
 * Build a symmetric conflict graph from the store. `conflict.projects` is
 * directional and its severity can differ by direction (A->B hard, B->A soft),
 * so each unordered pair is recorded once at the MAX severity seen from either
 * side. References resolve by id or display name; stackable/none add no edge.
 */
export const conflictGraph = (tools: Tool[]): ConflictGraph => {
  const ids = new Set(tools.map((t) => t.id));
  const byName = new Map(tools.map((t) => [t.tool.toLowerCase(), t.id]));
  const graph = new Map<string, Map<string, EdgeSeverity>>();
  for (const t of tools) graph.set(t.id, new Map());

  const link = (from: string, to: string, sev: EdgeSeverity): void => {
    const edges = graph.get(from);
    if (!edges) return;
    const current = edges.get(to);
    if (!current || RANK[sev] > RANK[current]) edges.set(to, sev);
  };

  for (const t of tools) {
    if (!isEdge(t.conflict.severity)) continue;
    for (const ref of t.conflict.projects) {
      const other = resolveProjectRef(ref, ids, byName);
      if (!other || other === t.id) continue;
      link(t.id, other, t.conflict.severity);
      link(other, t.id, t.conflict.severity);
    }
  }
  return graph;
};
