import type { Issue } from "./types";

/**
 * Numbers of the open freshness issues whose tool is confirmed current with
 * upstream this run. Only positively-resolved ids (the report's `no-drift` set)
 * close an issue; a tool merely absent from a run (transient error, skip) is never
 * treated as resolved. Closed issues are skipped, so an earlier human close stays
 * as it is rather than being re-touched.
 */
export const resolvedIssueNumbers = (
  byId: Map<string, Issue>,
  noDriftIds: Iterable<string>,
): number[] => {
  const numbers: number[] = [];
  for (const id of noDriftIds) {
    const issue = byId.get(id);
    if (issue && issue.state === "open") numbers.push(issue.number);
  }
  return numbers;
};
