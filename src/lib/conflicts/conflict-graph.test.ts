import { describe, expect, test } from "vitest";
import { makeTool } from "../../test-support/make-tool";
import { conflictGraph } from "./conflict-graph";

describe("conflictGraph", () => {
  test("adds a symmetric edge even when only one side lists the other", () => {
    const tools = [
      makeTool({
        id: "omni",
        tool: "omni",
        conflict: { severity: "either-or", projects: ["RTK"] },
      }),
      makeTool({ id: "rtk", tool: "RTK" }),
    ];
    const g = conflictGraph(tools);
    expect(g.get("omni")?.get("rtk")).toBe("either-or");
    expect(g.get("rtk")?.get("omni")).toBe("either-or");
  });

  test("records the pair at the max severity seen from either direction", () => {
    const tools = [
      makeTool({ id: "a", tool: "A", conflict: { severity: "hard", projects: ["b"] } }),
      makeTool({ id: "b", tool: "B", conflict: { severity: "soft", projects: ["a"] } }),
    ];
    const g = conflictGraph(tools);
    expect(g.get("a")?.get("b")).toBe("hard");
    expect(g.get("b")?.get("a")).toBe("hard");
  });

  test("adds no edge for stackable or none", () => {
    const tools = [
      makeTool({ id: "a", tool: "A", conflict: { severity: "stackable", projects: ["b"] } }),
      makeTool({ id: "b", tool: "B", conflict: { severity: "none", projects: [] } }),
    ];
    const g = conflictGraph(tools);
    expect(g.get("a")?.size).toBe(0);
    expect(g.get("b")?.size).toBe(0);
  });

  test("ignores self-references and unresolvable references", () => {
    const tools = [
      makeTool({ id: "a", tool: "A", conflict: { severity: "hard", projects: ["a", "ghost"] } }),
    ];
    const g = conflictGraph(tools);
    expect(g.get("a")?.size).toBe(0);
  });
});
