import { describe, expect, test } from "vitest";
import { compareVersions } from "./compare-versions";
import type { Version } from "./types";

const v = (
  major: number,
  minor: number,
  patch: number,
  prerelease: string | null = null,
): Version => ({ major, minor, patch, prerelease });

describe("compareVersions", () => {
  test("orders by major, then minor, then patch", () => {
    expect(compareVersions(v(1, 2, 3), v(1, 2, 3))).toBe(0);
    expect(compareVersions(v(2, 0, 0), v(1, 9, 9))).toBe(1);
    expect(compareVersions(v(1, 2, 3), v(1, 2, 4))).toBe(-1);
  });

  test("sorts a prerelease below its release", () => {
    expect(compareVersions(v(1, 0, 0), v(1, 0, 0, "rc.1"))).toBe(1);
    expect(compareVersions(v(1, 0, 0, "rc.1"), v(1, 0, 0))).toBe(-1);
    expect(compareVersions(v(1, 0, 0, "rc.1"), v(1, 0, 0, "rc.2"))).toBe(-1);
  });
});
