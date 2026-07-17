import { compareVersions } from "./compare-versions";
import { parseVersion } from "./parse-version";
import type { Version } from "./types";

/** Pick the highest parseable tag from a list; null if none parse. */
export const maxParseableTag = (tags: string[]): { tag: string; version: Version } | null => {
  let best: { tag: string; version: Version } | null = null;
  for (const tag of tags) {
    const version = parseVersion(tag);
    if (version && (!best || compareVersions(version, best.version) > 0)) best = { tag, version };
  }
  return best;
};
