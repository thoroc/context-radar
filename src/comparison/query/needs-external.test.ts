import { describe, expect, test } from "vitest";
import { makeTool } from "../../test-support/make-tool";
import { needsExternal } from "./needs-external";

describe("needsExternal", () => {
  test("is true when requirements start with the warning marker", () => {
    expect(needsExternal(makeTool({ requirements: "⚠ needs a model" }))).toBe(true);
    expect(needsExternal(makeTool({ requirements: "  ⚠ leading space" }))).toBe(true);
    expect(needsExternal(makeTool({ requirements: "none" }))).toBe(false);
  });
});
