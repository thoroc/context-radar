import { TOOL_MARKER } from "./parse-tool-marker";
import type { Entry } from "./types";

export const composeIssue = (e: Entry): { title: string; body: string } => {
  const recorded = e.recorded ?? "unrecorded";
  const upstream = e.upstream ?? "unknown";
  const title = `Freshness: ${e.tool} ${recorded} -> ${upstream}`;
  const body = [
    `Recorded version \`${recorded}\` is behind upstream \`${upstream}\`.`,
    "",
    `- Tool: ${e.tool}`,
    `- Repo: ${e.githubUrl}`,
    `- Why: ${e.reason}`,
    "",
    "This is a **freshness prompt, not a correctness claim**: an out-of-date version",
    "number is not the same as a wrong verdict. Run `project-comparison-fetch` to",
    "re-assess and re-record the tool. The bot does not change the data.",
    "",
    `${TOOL_MARKER} ${JSON.stringify({ id: e.id, upstream: e.upstream })} -->`,
  ].join("\n");
  return { title, body };
};
