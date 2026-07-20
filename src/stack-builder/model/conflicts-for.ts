import type { ConflictGraph, EdgeSeverity } from "../../lib";

/** An unordered conflicting pair of selected tool ids and the pair's severity. */
export interface ConflictPair {
  a: string;
  b: string;
  severity: EdgeSeverity;
}

export interface ConflictReport {
  /** hard / either-or pairs: must be resolved (one of the two removed). */
  blocking: ConflictPair[];
  /** soft pairs: allowed, surfaced as a warning. */
  warnings: ConflictPair[];
  /** ids appearing in any blocking pair, for highlighting the conflicting cards. */
  conflictedIds: Set<string>;
}

/**
 * Evaluate the current selection against the conflict graph. Cross-layer aware
 * (the graph is global), deduped per unordered pair, and severity-split: hard and
 * either-or are blocking, soft is a warning. The UI composes the human message
 * from the ids and their layers; this stays pure over ids + graph.
 */
export const conflictsFor = (
  selected: ReadonlySet<string>,
  graph: ConflictGraph,
): ConflictReport => {
  const blocking: ConflictPair[] = [];
  const warnings: ConflictPair[] = [];
  const conflictedIds = new Set<string>();

  for (const id of selected) {
    const edges = graph.get(id);
    if (!edges) continue;
    for (const [other, severity] of edges) {
      // Each unordered pair once: only act from the lexicographically smaller id.
      if (!selected.has(other) || id >= other) continue;
      const pair: ConflictPair = { a: id, b: other, severity };
      if (severity === "soft") {
        warnings.push(pair);
      } else {
        blocking.push(pair);
        conflictedIds.add(id);
        conflictedIds.add(other);
      }
    }
  }

  return { blocking, warnings, conflictedIds };
};
