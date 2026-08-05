import { sleep } from "../lib/sleep";
import { api } from "./api";
import { MUTATION_SPACING_MS } from "./constants";
import type { Issue } from "./types";

/** Retires any legacy consolidated digest issue in favour of the per-tool issues. */
export const closeLegacyDigests = async (
  owner: string,
  repo: string,
  digests: Issue[],
): Promise<number> => {
  let closed = 0;
  for (const d of digests) {
    if (d.state === "open") {
      await sleep(MUTATION_SPACING_MS);
      await api("PATCH", `/repos/${owner}/${repo}/issues/${d.number}`, {
        state: "closed",
        state_reason: "not_planned",
      });
      closed++;
    }
  }
  return closed;
};
