import { describe, expect, test } from "vitest";
import { conflictGraph } from "../lib";
import { makeTool } from "../test-support/make-tool";
import { layerConflictsBlock } from "./layer-conflicts-block";

const rtk = makeTool({
  id: "rtk",
  tool: "RTK",
  layer: "Shell output",
  conflict: { severity: "either-or", projects: ["sqz"] },
});
const sqz = makeTool({ id: "sqz", tool: "sqz", layer: "Shell output" });
const nav = makeTool({
  id: "codegraph",
  tool: "codegraph",
  layer: "Code navigation",
  conflict: { severity: "hard", projects: ["rtk"] },
});

describe("layerConflictsBlock", () => {
  test("lists a conflicting pair inside the layer, with its severity", () => {
    const html = layerConflictsBlock([rtk, sqz], conflictGraph([rtk, sqz]), "../");
    expect(html).toContain("RTK");
    expect(html).toContain("sqz");
    expect(html).toMatch(/either/i);
  });

  test("names each pair once rather than from both sides", () => {
    const html = layerConflictsBlock([rtk, sqz], conflictGraph([rtk, sqz]), "../");
    expect(html.split('href="../tools/rtk.html"').length - 1).toBe(1);
  });

  // The block is about choosing within a layer, so an edge leaving the layer
  // belongs on the tool page, not here.
  test("excludes conflicts with tools outside the layer", () => {
    const graph = conflictGraph([rtk, sqz, nav]);
    const html = layerConflictsBlock([rtk, sqz], graph, "../");
    expect(html).not.toContain("codegraph");
  });

  test("renders nothing when no pair inside the layer conflicts", () => {
    expect(layerConflictsBlock([sqz], conflictGraph([sqz]), "../")).toBe("");
  });
});
