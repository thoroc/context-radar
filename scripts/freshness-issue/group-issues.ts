import { DIGEST_MARKER } from "./constants";
import { parseToolMarker } from "./parse-tool-marker";
import type { Issue } from "./types";

/** Latest issue per tool id (list is newest-first), plus any legacy digests to close. */
export const groupIssues = (issues: Issue[]): { byId: Map<string, Issue>; digests: Issue[] } => {
  const byId = new Map<string, Issue>();
  const digests: Issue[] = [];
  for (const issue of issues) {
    const marker = parseToolMarker(issue.body);
    if (marker) {
      if (!byId.has(marker.id)) byId.set(marker.id, issue);
    } else if ((issue.body ?? "").includes(DIGEST_MARKER)) {
      digests.push(issue);
    }
  }
  return { byId, digests };
};
