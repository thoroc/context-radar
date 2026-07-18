import { describe, expect, test } from "vitest";
import { META, RECOMMENDATIONS, TOOLS, TOOLS_BY_ID } from "./index";

describe("catalogue data", () => {
  test("loads the store with a tool_count matching the tools length", () => {
    expect(TOOLS.length).toBeGreaterThan(0);
    expect(META.tool_count).toBe(TOOLS.length);
  });

  test("indexes every tool by its id", () => {
    expect(TOOLS_BY_ID.size).toBe(TOOLS.length);
    for (const tool of TOOLS) {
      expect(TOOLS_BY_ID.get(tool.id)).toBe(tool);
    }
  });

  test("loads recommendations whose pick and members are all known tools", () => {
    for (const rec of RECOMMENDATIONS) {
      expect(rec.members).toContain(rec.pick);
      for (const memberId of rec.members) {
        expect(TOOLS_BY_ID.has(memberId)).toBe(true);
      }
    }
  });
});
