import { describe, expect, test } from "vitest";
import { makeTool } from "../../test-support/make-tool";
import { needsExternal } from "./needs-external";

describe("needsExternal", () => {
  test("reflects the typed requiresExternal flag", () => {
    expect(needsExternal(makeTool({ requiresExternal: true }))).toBe(true);
    expect(needsExternal(makeTool({ requiresExternal: false }))).toBe(false);
  });
});
