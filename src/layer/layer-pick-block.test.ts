import { describe, expect, test } from "vitest";
import type { LayerMeta, Recommendation } from "../lib";
import { makeTool } from "../test-support/make-tool";
import { layerPickBlock } from "./layer-pick-block";

const layer = (over: Partial<LayerMeta> = {}): LayerMeta => ({
  name: "Shell output",
  order: 1,
  cardinality: "pick-one",
  summary: "s",
  ...over,
});
const rtk = makeTool({ id: "rtk", tool: "RTK", layer: "Shell output" });
const sqz = makeTool({ id: "sqz", tool: "sqz", layer: "Shell output" });
const byId = new Map([rtk, sqz].map((t) => [t.id, t]));

const rec: Recommendation = {
  id: "shell-output",
  layer: "Shell output",
  members: ["rtk", "sqz"],
  pick: "rtk",
  alternatives: [{ id: "sqz", when: "repeat file reads dominate" }],
  rationale: "rtk is the most established of the three.",
};

describe("layerPickBlock", () => {
  // The recommendation carries a rationale and per-alternative conditions;
  // curatedPick is only a tool id. Prefer the richer source where it exists so
  // the layer page does not invent a second, thinner pick presentation.
  test("prefers the recommendation, showing its rationale and alternatives", () => {
    const html = layerPickBlock(layer({ curatedPick: "rtk" }), [rec], byId, "../");
    expect(html).toContain("RTK");
    expect(html).toContain("rtk is the most established of the three.");
    expect(html).toContain("repeat file reads dominate");
    expect(html).toContain('href="../tools/sqz.html"');
  });

  test("falls back to curatedPick when no recommendation covers the layer", () => {
    const html = layerPickBlock(layer({ curatedPick: "rtk" }), [], byId, "../");
    expect(html).toContain("RTK");
    expect(html).toContain('href="../tools/rtk.html"');
    expect(html).not.toContain("Alternatives");
  });

  // 9 of the 20 layers have neither, so this is the common case, not an edge.
  test("renders nothing when the layer has no pick from either source", () => {
    expect(layerPickBlock(layer(), [], byId, "../")).toBe("");
  });

  test("renders nothing rather than a broken link when curatedPick is unknown", () => {
    expect(layerPickBlock(layer({ curatedPick: "ghost" }), [], byId, "../")).toBe("");
  });

  test("only matches a recommendation for this layer", () => {
    const otherLayer = layer({ name: "Code navigation", curatedPick: undefined });
    expect(layerPickBlock(otherLayer, [rec], byId, "../")).toBe("");
  });
});
