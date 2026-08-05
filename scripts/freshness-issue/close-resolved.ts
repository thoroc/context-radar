import { sleep } from "../lib/sleep";
import { api } from "./api";
import { MUTATION_SPACING_MS } from "./constants";
import { resolvedIssueNumbers } from "./resolved-issue-numbers";
import type { Issue } from "./types";

/**
 * Closes the issue for any tool now confirmed current with upstream. Driven by
 * the report's no-drift set (positive resolution), so a transient error never
 * reads as "resolved"; only open issues are touched, leaving a human's close
 * alone. Re-closing is a no-op since a closed issue drops out of the set.
 */
export const closeResolved = async (
  owner: string,
  repo: string,
  byId: Map<string, Issue>,
  noDriftIds: Iterable<string>,
): Promise<number> => {
  let resolved = 0;
  for (const number of resolvedIssueNumbers(byId, noDriftIds)) {
    await sleep(MUTATION_SPACING_MS);
    await api("PATCH", `/repos/${owner}/${repo}/issues/${number}`, {
      state: "closed",
      state_reason: "completed",
    });
    resolved++;
  }
  return resolved;
};
