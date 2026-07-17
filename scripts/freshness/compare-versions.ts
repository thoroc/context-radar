import type { Version } from "./types";

/** Compare by core (major.minor.patch); a prerelease sorts below its release. */
export const compareVersions = (a: Version, b: Version): number => {
  for (const k of ["major", "minor", "patch"] as const) {
    if (a[k] !== b[k]) return a[k] < b[k] ? -1 : 1;
  }
  if (a.prerelease === b.prerelease) return 0;
  if (a.prerelease === null) return 1; // release > prerelease
  if (b.prerelease === null) return -1;
  return a.prerelease < b.prerelease ? -1 : 1;
};
