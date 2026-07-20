import { describe, expect, test } from "vitest";
import { conflictGraph } from "../../lib";
import { makeTool } from "../../test-support/make-tool";
import { conflictsFor } from "./conflicts-for";

const graph = conflictGraph([
  makeTool({ id: "a", tool: "A", conflict: { severity: "hard", projects: ["b"] } }),
  makeTool({ id: "b", tool: "B" }),
  makeTool({ id: "c", tool: "C", conflict: { severity: "soft", projects: ["a"] } }),
]);

describe("conflictsFor", () => {
  test("splits blocking from warnings and records conflicted ids", () => {
    const report = conflictsFor(new Set(["a", "b", "c"]), graph);
    expect(report.blocking).toEqual([{ a: "a", b: "b", severity: "hard" }]);
    expect(report.warnings).toEqual([{ a: "a", b: "c", severity: "soft" }]);
    expect([...report.conflictedIds].sort()).toEqual(["a", "b"]);
  });

  test("ignores conflicts with tools that are not selected", () => {
    const report = conflictsFor(new Set(["a"]), graph);
    expect(report.blocking).toEqual([]);
    expect(report.warnings).toEqual([]);
    expect(report.conflictedIds.size).toBe(0);
  });

  test("reports each pair once", () => {
    const report = conflictsFor(new Set(["a", "b"]), graph);
    expect(report.blocking).toHaveLength(1);
  });
});
