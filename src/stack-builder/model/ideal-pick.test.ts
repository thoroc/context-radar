import { describe, expect, test } from "vitest";
import type { LayerMeta, Recommendation, VerdictDecision } from "../../lib";
import { makeTool } from "../../test-support/make-tool";
import { idealPick } from "./ideal-pick";

const layer = (over: Partial<LayerMeta> = {}): LayerMeta => ({
  name: "Code navigation",
  order: 1,
  cardinality: "pick-one",
  ...over,
});

const cand = (id: string, decision: VerdictDecision, stars: number) =>
  makeTool({ id, layer: "Code navigation", stars, verdict: { decision, rationale: "" } });

const rec: Recommendation = {
  id: "code-nav",
  layer: "Code navigation",
  members: ["codegraph", "tokensave"],
  pick: "codegraph",
  alternatives: [{ id: "tokensave", when: "you want the Rust rewrite" }],
  rationale: "codegraph is the default",
};

describe("idealPick", () => {
  test("a recommendation for the layer wins as a curated pick", () => {
    expect(idealPick(layer(), [cand("tokensave", "best", 999)], [rec])).toEqual({
      toolId: "codegraph",
      provenance: "curated",
    });
  });

  test("the layer curatedPick wins when there is no recommendation", () => {
    expect(idealPick(layer({ curatedPick: "codegraph" }), [cand("x", "best", 1)], [])).toEqual({
      toolId: "codegraph",
      provenance: "curated",
    });
  });

  test("suggests the top-ranked candidate above the confidence floor", () => {
    const picks = [cand("low", "add", 10), cand("high", "add", 5000), cand("best", "best", 1)];
    expect(idealPick(layer(), picks, [])).toEqual({ toolId: "best", provenance: "suggested" });
  });

  test("breaks a verdict tie by stars", () => {
    const picks = [cand("low", "add", 10), cand("high", "add", 5000)];
    expect(idealPick(layer(), picks, [])).toEqual({ toolId: "high", provenance: "suggested" });
  });

  test("returns no pick when the best candidate is below the floor (watch)", () => {
    expect(idealPick(layer(), [cand("w", "watch", 9000)], [])).toEqual({ provenance: "none" });
  });

  test("returns no pick for an empty layer", () => {
    expect(idealPick(layer(), [], [])).toEqual({ provenance: "none" });
  });
});
