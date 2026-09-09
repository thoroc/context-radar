import { describe, expect, test } from "vitest";
import type { LayerMeta, Recommendation } from "../../src/lib/schema";
import { checkLayerPicks } from "./check-layer-picks";

const layer = (over: Partial<LayerMeta> = {}): LayerMeta => ({
  name: "Shell output",
  order: 1,
  cardinality: "pick-one",
  summary: "s",
  ...over,
});
const rec = (over: Partial<Recommendation> = {}): Recommendation => ({
  id: "shell-output",
  layer: "Shell output",
  members: ["rtk", "sqz"],
  pick: "rtk",
  alternatives: [],
  rationale: "r",
  ...over,
});

describe("checkLayerPicks", () => {
  test("passes when the two sources name the same tool", () => {
    expect(checkLayerPicks([layer({ curatedPick: "rtk" })], [rec()])).toEqual([]);
  });

  // Two mechanisms name a layer's pick and nothing enforced agreement. They
  // agree today, so this locks that in before a layer page starts presenting
  // one of them as the answer.
  test("flags a layer whose curatedPick disagrees with its recommendation", () => {
    const errors = checkLayerPicks([layer({ curatedPick: "sqz" })], [rec()]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/sqz/);
    expect(errors[0]).toMatch(/rtk/);
  });

  test("passes a layer with only a curatedPick", () => {
    expect(checkLayerPicks([layer({ curatedPick: "rtk" })], [])).toEqual([]);
  });

  test("passes a layer with only a recommendation", () => {
    expect(checkLayerPicks([layer()], [rec()])).toEqual([]);
  });

  // A recommendation can be scoped to a sub-slice of a layer via `group`, in
  // which case its pick is the pick for that slice, not for the whole layer, so
  // it is not required to match the layer-wide curated pick.
  test("does not compare a group-scoped recommendation against the layer pick", () => {
    const scoped = rec({ group: "AST knowledge-graph", pick: "sqz" });
    expect(checkLayerPicks([layer({ curatedPick: "rtk" })], [scoped])).toEqual([]);
  });
});
