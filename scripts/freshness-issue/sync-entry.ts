import { sleep } from "../lib/sleep";
import { api } from "./api";
import { composeIssue } from "./compose-issue";
import { MUTATION_SPACING_MS } from "./constants";
import { parseToolMarker } from "./parse-tool-marker";
import type { Entry, Issue } from "./types";

/** Outcome of reconciling one drift entry with its GitHub issue. */
export type SyncOutcome = "opened" | "updated" | "relabeled" | "unchanged" | { failed: string };

const hasAllLabels = (issue: Issue, labels: string[]): boolean => {
  const names = new Set((issue.labels ?? []).map((l) => l.name));
  return labels.every((label) => names.has(label));
};

/**
 * Reconcile one drifting tool with its issue: leave it untouched when the
 * recorded upstream is unchanged and the severity label is already correct (so a
 * human's close is respected); relabel in place when only the severity label is
 * stale; patch an open issue whose upstream moved; or open a fresh issue. A closed
 * issue whose upstream moved again is left closed and a new one opened.
 */
export const syncEntry = async (
  owner: string,
  repo: string,
  entry: Entry,
  existing: Issue | undefined,
): Promise<SyncOutcome> => {
  const { title, body, labels } = composeIssue(entry);
  if (existing) {
    const prior = parseToolMarker(existing.body);
    if (prior && prior.upstream === entry.upstream) {
      if (existing.state !== "open" || hasAllLabels(existing, labels)) return "unchanged";
      await sleep(MUTATION_SPACING_MS);
      const res = await api("PATCH", `/repos/${owner}/${repo}/issues/${existing.number}`, {
        labels,
      });
      return res.status === 200
        ? "relabeled"
        : { failed: `${entry.id} (relabel HTTP ${res.status})` };
    }
    if (existing.state === "open") {
      await sleep(MUTATION_SPACING_MS);
      const res = await api("PATCH", `/repos/${owner}/${repo}/issues/${existing.number}`, {
        title,
        body,
        labels,
      });
      return res.status === 200 ? "updated" : { failed: `${entry.id} (update HTTP ${res.status})` };
    }
    // Closed but upstream moved again: do not reopen; open a fresh issue below.
  }
  await sleep(MUTATION_SPACING_MS);
  const res = await api("POST", `/repos/${owner}/${repo}/issues`, { title, body, labels });
  return res.status === 201 ? "opened" : { failed: `${entry.id} (create HTTP ${res.status})` };
};
