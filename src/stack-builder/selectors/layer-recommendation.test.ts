import { describe, expect, test } from "vitest";
import type { Recommendation, Tool } from "../../lib";
import { makeTool } from "../../test-support/make-tool";
import { layerRecommendation } from "./layer-recommendation";

const recs: Recommendation[] = [
  {
    id: "shell-output",
    layer: "Shell output",
    members: ["rtk", "sqz"],
    pick: "rtk",
    alternatives: [{ id: "sqz", when: "dedup" }],
    rationale: "rtk is the default",
  },
  {
    id: "code-nav-ast-graph",
    layer: "Code navigation",
    group: "AST knowledge-graph",
    members: ["codegraph", "tokensave"],
    pick: "codegraph",
    alternatives: [{ id: "tokensave", when: "broader scope" }],
    rationale: "codegraph is battle-tested",
  },
];

const byId = new Map<string, Tool>([
  ["rtk", makeTool({ id: "rtk", tool: "RTK" })],
  ["codegraph", makeTool({ id: "codegraph", tool: "codegraph" })],
]);

describe("layerRecommendation", () => {
  test("returns the pick for a mapped layer with a recommendation", () => {
    expect(layerRecommendation("shell", recs, byId)).toEqual({
      pickName: "RTK",
      pickHref: "tools/rtk.html",
      group: undefined,
    });
  });

  test("carries the sub-group when the recommendation has one", () => {
    const rec = layerRecommendation("codenav", recs, byId);
    expect(rec?.pickName).toBe("codegraph");
    expect(rec?.group).toBe("AST knowledge-graph");
  });

  test("returns undefined for a stack layer that maps to no store layer", () => {
    expect(layerRecommendation("know", recs, byId)).toBeUndefined();
  });

  test("returns undefined when no recommendation covers the mapped layer", () => {
    expect(layerRecommendation("shell", [], byId)).toBeUndefined();
  });

  test("returns undefined when the pick is not a known tool", () => {
    const orphan: Recommendation[] = [{ ...recs[0], pick: "ghost", members: ["ghost", "sqz"] }];
    expect(layerRecommendation("shell", orphan, byId)).toBeUndefined();
  });
});
