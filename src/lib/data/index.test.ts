import { describe, expect, test } from "vitest";
import { META, TOOLS } from "./index";

describe("catalogue data", () => {
  test("loads the store with a tool_count matching the tools length", () => {
    expect(TOOLS.length).toBeGreaterThan(0);
    expect(META.tool_count).toBe(TOOLS.length);
  });
});
