import { describe, expect, test } from "vitest";
import type { Evidence, Recommendation, Tool } from "../../src/lib/schema";
import { makeTool } from "../../src/test-support/make-tool";
import { checkRecommendations } from "./check-recommendations";

const sha = "f14b3bb5d70256211d094aced9a48c7018355dd5";
const sourceEvidence: Evidence = {
  status: "confirmed",
  sources: [
    {
      url: `https://github.com/o/r/blob/${sha}/a.rs#L1`,
      quote: "q",
      checkedOn: "2026-07-16",
      evidenceType: "source-code",
    },
  ],
};

const verified = (id: string, decision: Tool["verdict"]["decision"]): Tool =>
  makeTool({
    id,
    layer: "Shell output",
    verdict: { decision, rationale: "", evidence: sourceEvidence },
  });

const rec = (over: Partial<Recommendation> = {}): Recommendation => ({
  id: "shell",
  layer: "Shell output",
  members: ["rtk", "sqz"],
  pick: "rtk",
  alternatives: [{ id: "sqz", when: "you want a pure-Rust binary" }],
  rationale: "prefer rtk",
  ...over,
});

describe("checkRecommendations", () => {
  test("passes a well-formed, source-verified recommendation", () => {
    const tools = [verified("rtk", "best"), verified("sqz", "add")];
    expect(checkRecommendations(tools, [rec()])).toEqual([]);
  });

  test("flags a member that is not a known tool id", () => {
    const tools = [verified("rtk", "best")];
    const errors = checkRecommendations(tools, [rec({ members: ["rtk", "ghost"] })]);
    expect(errors.some((e) => e.includes("ghost") && e.includes("not a known tool"))).toBe(true);
  });

  test("flags a member in the wrong layer", () => {
    const tools = [
      verified("rtk", "best"),
      makeTool({
        id: "sqz",
        layer: "Code navigation",
        verdict: { decision: "add", rationale: "", evidence: sourceEvidence },
      }),
    ];
    const errors = checkRecommendations(tools, [rec()]);
    expect(errors.some((e) => e.includes("sqz") && e.includes("Code navigation"))).toBe(true);
  });

  test("flags a pick whose verdict is not best/either-or", () => {
    const tools = [verified("rtk", "add"), verified("sqz", "add")];
    const errors = checkRecommendations(tools, [rec()]);
    expect(errors.some((e) => e.includes("pick 'rtk'") && e.includes("must be 'best'"))).toBe(true);
  });

  test("gate: flags a member lacking confirmed source-code verdict evidence", () => {
    const tools = [
      verified("rtk", "best"),
      makeTool({ id: "sqz", layer: "Shell output", verdict: { decision: "add", rationale: "" } }),
    ];
    const errors = checkRecommendations(tools, [rec()]);
    expect(
      errors.some((e) => e.includes("sqz") && e.includes("source-code verdict evidence")),
    ).toBe(true);
  });

  test("flags overlapping members across recommendations in the same layer", () => {
    const tools = [verified("rtk", "best"), verified("sqz", "add"), verified("omni", "best")];
    const a = rec({
      id: "shell-a",
      members: ["rtk", "sqz"],
      pick: "rtk",
      alternatives: [{ id: "sqz", when: "x" }],
    });
    const b = rec({
      id: "shell-b",
      members: ["rtk", "omni"],
      pick: "omni",
      alternatives: [{ id: "rtk", when: "y" }],
    });
    const errors = checkRecommendations(tools, [a, b]);
    expect(errors.some((e) => e.includes("disjoint"))).toBe(true);
  });

  test("flags duplicate recommendation ids", () => {
    const tools = [verified("rtk", "best"), verified("sqz", "add")];
    const errors = checkRecommendations(tools, [rec(), rec()]);
    expect(errors.some((e) => e.includes("ids must be unique"))).toBe(true);
  });
});
