import { syncEntry } from "./sync-entry";
import type { Entry, Issue } from "./types";

export interface SyncCounts {
  opened: number;
  updated: number;
  relabeled: number;
  unchanged: number;
  failed: string[];
}

/** Reconciles every drifting tool with its GitHub issue, tallying the outcomes. */
export const syncDrift = async (
  owner: string,
  repo: string,
  drift: Entry[],
  byId: Map<string, Issue>,
): Promise<SyncCounts> => {
  const counts: SyncCounts = { opened: 0, updated: 0, relabeled: 0, unchanged: 0, failed: [] };
  for (const e of drift) {
    const outcome = await syncEntry(owner, repo, e, byId.get(e.id));
    if (outcome === "opened") counts.opened++;
    else if (outcome === "updated") counts.updated++;
    else if (outcome === "relabeled") counts.relabeled++;
    else if (outcome === "unchanged") counts.unchanged++;
    else counts.failed.push(outcome.failed);
  }
  return counts;
};
