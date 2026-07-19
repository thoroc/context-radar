import { sleep } from "../lib/sleep";
import { api } from "./api";
import { composeIssue } from "./compose-issue";
import { MUTATION_SPACING_MS } from "./constants";
import { LABEL } from "./list-freshness-issues";
import { parseToolMarker } from "./parse-tool-marker";
import type { Entry, Issue } from "./types";

/** Outcome of reconciling one drift entry with its GitHub issue. */
export type SyncOutcome = "opened" | "updated" | "unchanged" | { failed: string };

/**
 * Reconcile one drifting tool with its issue: leave it untouched when the
 * recorded upstream is unchanged (so a human's close is respected), patch an open
 * issue whose upstream moved, or open a fresh issue. A closed issue whose upstream
 * moved again is left closed and a new one opened.
 */
export const syncEntry = async (
  owner: string,
  repo: string,
  entry: Entry,
  existing: Issue | undefined,
): Promise<SyncOutcome> => {
  const { title, body } = composeIssue(entry);
  if (existing) {
    const prior = parseToolMarker(existing.body);
    if (prior && prior.upstream === entry.upstream) return "unchanged";
    if (existing.state === "open") {
      await sleep(MUTATION_SPACING_MS);
      const res = await api("PATCH", `/repos/${owner}/${repo}/issues/${existing.number}`, {
        title,
        body,
      });
      return res.status === 200 ? "updated" : { failed: `${entry.id} (update HTTP ${res.status})` };
    }
    // Closed but upstream moved again: do not reopen; open a fresh issue below.
  }
  await sleep(MUTATION_SPACING_MS);
  const res = await api("POST", `/repos/${owner}/${repo}/issues`, { title, body, labels: [LABEL] });
  return res.status === 201 ? "opened" : { failed: `${entry.id} (create HTTP ${res.status})` };
};
