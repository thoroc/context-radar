import { describe, expect, test } from "vitest";
import { resolveProjectRef } from "./resolve-project-ref";

const ids = new Set(["rtk", "gitnexus"]);
const byName = new Map([
  ["rtk", "rtk"],
  ["gitnexus", "gitnexus"],
]);

describe("resolveProjectRef", () => {
  test("resolves a reference that is already an id", () => {
    expect(resolveProjectRef("rtk", ids, byName)).toBe("rtk");
  });

  test("resolves a display-name reference case-insensitively", () => {
    expect(resolveProjectRef("GitNexus", ids, byName)).toBe("gitnexus");
  });

  test("returns null for an unresolvable reference", () => {
    expect(resolveProjectRef("ghost", ids, byName)).toBeNull();
  });
});
