import { describe, expect, test } from "vitest";
import { makeTool } from "../../src/test-support/make-tool";
import { checkConflicts } from "./check-conflicts";

describe("checkConflicts", () => {
  test("resolves a reference by tool id", () => {
    const tools = [
      makeTool({ id: "rtk", tool: "RTK", conflict: { severity: "either-or", projects: ["sqz"] } }),
      makeTool({ id: "sqz", tool: "sqz" }),
    ];
    expect(checkConflicts(tools)).toEqual([]);
  });

  test("resolves a reference by display name (case-insensitive)", () => {
    const tools = [
      makeTool({
        id: "omni",
        tool: "omni",
        conflict: { severity: "either-or", projects: ["RTK"] },
      }),
      makeTool({ id: "rtk", tool: "RTK" }),
    ];
    expect(checkConflicts(tools)).toEqual([]);
  });

  test("flags a reference that resolves to no tool", () => {
    const tools = [
      makeTool({ id: "rtk", tool: "RTK", conflict: { severity: "hard", projects: ["ghost"] } }),
    ];
    const errors = checkConflicts(tools);
    expect(errors.some((e) => e.includes("ghost") && e.includes("resolves to no tool"))).toBe(true);
  });
});
