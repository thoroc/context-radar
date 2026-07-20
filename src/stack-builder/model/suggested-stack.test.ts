import { describe, expect, test } from "vitest";
import { conflictGraph, type LayerMeta } from "../../lib";
import { makeTool } from "../../test-support/make-tool";
import { suggestedStack } from "./suggested-stack";

const layers: LayerMeta[] = [
  { name: "Shell output", order: 1, cardinality: "pick-one", curatedPick: "rtk" },
  { name: "Code navigation", order: 2, cardinality: "pick-one" },
  { name: "Reference resource (curated list)", order: 3, cardinality: "reference" },
];

const tools = [
  makeTool({
    id: "rtk",
    tool: "RTK",
    layer: "Shell output",
    stars: 71000,
    verdict: { decision: "best", rationale: "" },
    conflict: { severity: "hard", projects: ["cg"] },
  }),
  makeTool({
    id: "cg",
    tool: "CG",
    layer: "Code navigation",
    stars: 60000,
    verdict: { decision: "add", rationale: "" },
  }),
  makeTool({ id: "refx", tool: "RefX", layer: "Reference resource (curated list)" }),
];

describe("suggestedStack", () => {
  test("picks per installable layer, excludes reference layers", () => {
    // No conflict graph in play: both installable picks survive, reference skipped.
    const { ids, provenance } = suggestedStack(tools, layers, [], conflictGraph([]));
    expect(ids.has("rtk")).toBe(true);
    expect(ids.has("cg")).toBe(true);
    expect(ids.has("refx")).toBe(false);
    expect(provenance.get("Shell output")).toBe("curated");
    expect(provenance.get("Code navigation")).toBe("suggested");
    expect(provenance.has("Reference resource (curated list)")).toBe(false);
  });

  test("drops the lower-priority side of a cross-layer blocking conflict", () => {
    const { ids } = suggestedStack(tools, layers, [], conflictGraph(tools));
    // rtk (curated) outranks cg (suggested), so cg is dropped; no blocking conflict remains.
    expect(ids.has("rtk")).toBe(true);
    expect(ids.has("cg")).toBe(false);
  });

  test("keeps both sides of a soft conflict", () => {
    const soft = tools.map((t) =>
      t.id === "rtk" ? { ...t, conflict: { severity: "soft" as const, projects: ["cg"] } } : t,
    );
    const { ids } = suggestedStack(soft, layers, [], conflictGraph(soft));
    expect(ids.has("rtk")).toBe(true);
    expect(ids.has("cg")).toBe(true);
  });
});
