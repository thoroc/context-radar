import type { Version } from "./types";

/**
 * Parse a strict-ish semver tag. Accepts an optional leading `v` and a 2-part
 * `major.minor` (padded to patch 0). Everything else (CalVer, date tags, monorepo
 * `pkg@1.2.3`, hashes) returns null so the caller routes it to a human rather than
 * guessing. A major >= 1000 is treated as CalVer/date and rejected.
 */
export const parseVersion = (raw: string): Version | null => {
  const m = raw.trim().match(/^v?(\d+)\.(\d+)(?:\.(\d+))?(?:[-+]([0-9A-Za-z.-]+))?$/);
  if (!m) return null;
  const major = Number(m[1]);
  if (major >= 1000) return null; // 2024.01.15 and friends are not semver
  return {
    major,
    minor: Number(m[2]),
    patch: m[3] === undefined ? 0 : Number(m[3]),
    prerelease: m[4] ?? null,
  };
};
