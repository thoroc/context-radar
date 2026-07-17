import { compareVersions } from "./compare-versions";
import { parseVersion } from "./parse-version";
import type { Classification } from "./types";

/**
 * Decide the bucket from the recorded and upstream version strings. `upstream` is
 * null when the repo publishes no parseable version at all.
 */
export const classify = (recorded: string | undefined, upstream: string | null): Classification => {
  if (upstream === null) return { bucket: "structural-skip", reason: "no upstream version scheme" };
  const up = parseVersion(upstream);
  if (!up) return { bucket: "unparseable", reason: `upstream tag not semver: ${upstream}` };
  if (!recorded)
    return { bucket: "verdict-moving", reason: `upstream has ${upstream} but no version recorded` };
  const rec = parseVersion(recorded);
  if (!rec) return { bucket: "unparseable", reason: `recorded version not semver: ${recorded}` };
  const cmp = compareVersions(up, rec);
  if (cmp <= 0)
    return { bucket: "no-drift", reason: `recorded ${recorded} is current with ${upstream}` };
  if (up.major > rec.major)
    return { bucket: "verdict-moving", reason: `major jump ${recorded} -> ${upstream}` };
  return { bucket: "observed-only", reason: `minor/patch drift ${recorded} -> ${upstream}` };
};
