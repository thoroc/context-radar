import { api } from "./api";
import type { Issue } from "./types";

export const LABEL = "freshness";

/** Every freshness-labelled issue (any state), across all pages. */
export const listFreshnessIssues = async (owner: string, repo: string): Promise<Issue[]> => {
  const out: Issue[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await api(
      "GET",
      `/repos/${owner}/${repo}/issues?labels=${LABEL}&state=all&sort=created&direction=desc&per_page=100&page=${page}`,
    );
    const batch = res.json as Issue[];
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
};
