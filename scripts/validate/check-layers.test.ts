import { describe, expect, test } from "vitest";
import type { LayerMeta } from "../../src/lib/schema";
import { makeTool } from "../../src/test-support/make-tool";
import { checkLayers } from "./check-layers";

const layer = (over: Partial<LayerMeta> = {}): LayerMeta => ({
  name: "Shell output",
  order: 1,
  cardinality: "pick-one",
  ...over,
});

describe("checkLayers", () => {
  test("passes when a curatedPick resolves to a tool in that layer", () => {
    const tools = [makeTool({ id: "rtk", layer: "Shell output" })];
    expect(checkLayers(tools, [layer({ curatedPick: "rtk" })])).toEqual([]);
  });

  test("passes a layer with no curatedPick", () => {
    expect(checkLayers([], [layer()])).toEqual([]);
  });

  test("flags a curatedPick that is not a known tool id", () => {
    const errors = checkLayers([], [layer({ curatedPick: "ghost" })]);
    expect(errors.some((e) => e.includes("ghost") && e.includes("not a known tool"))).toBe(true);
  });

  test("flags a curatedPick that sits in a different layer", () => {
    const tools = [makeTool({ id: "codegraph", layer: "Code navigation" })];
    const errors = checkLayers(tools, [layer({ curatedPick: "codegraph" })]);
    expect(errors.some((e) => e.includes("codegraph") && e.includes("Code navigation"))).toBe(true);
  });
});
