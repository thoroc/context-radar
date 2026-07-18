import { describe, expect, test } from "vitest";
import type { Recommendation, Tool } from "../lib";
import { makeTool } from "../test-support/make-tool";
import { recommendationBlock } from "./recommendation-block";

const rec: Recommendation = {
  id: "shell",
  layer: "Shell output",
  group: "Group X",
  members: ["pick", "alt1"],
  pick: "pick",
  alternatives: [{ id: "alt1", when: "you need Y" }],
  rationale: "pick is best",
};

const byId = new Map<string, Tool>([
  ["pick", makeTool({ id: "pick", tool: "Pick" })],
  ["alt1", makeTool({ id: "alt1", tool: "Alt" })],
]);

describe("recommendationBlock", () => {
  test("returns empty when the tool is in no recommendation", () => {
    expect(recommendationBlock(makeTool({ id: "zzz" }), [rec], byId, "")).toBe("");
  });

  test("renders the pick view with the layer, group, rationale and alternatives", () => {
    const html = recommendationBlock(makeTool({ id: "pick", tool: "Pick" }), [rec], byId, "");
    expect(html).toContain("Recommended pick");
    expect(html).toContain("Shell output · Group X");
    expect(html).toContain("pick is best");
    expect(html).toContain(">Alt</a>");
    expect(html).toContain("when you need Y");
  });

  test("renders the alternative view pointing at the pick with its condition", () => {
    const html = recommendationBlock(makeTool({ id: "alt1", tool: "Alt" }), [rec], byId, "");
    expect(html).toContain("the recommended pick is");
    expect(html).toContain(">Pick</a>");
    expect(html).toContain("Prefer Alt when you need Y");
  });

  test("prefixes member links with the base", () => {
    const html = recommendationBlock(makeTool({ id: "alt1", tool: "Alt" }), [rec], byId, "../");
    expect(html).toContain('href="../tools/');
  });

  test("omits the separator when there is no group", () => {
    const noGroup: Recommendation = { ...rec, group: undefined };
    const html = recommendationBlock(makeTool({ id: "pick", tool: "Pick" }), [noGroup], byId, "");
    expect(html).toContain("Shell output");
    expect(html).not.toContain("·");
  });

  test("escapes member conditions", () => {
    const nasty: Recommendation = {
      ...rec,
      alternatives: [{ id: "alt1", when: "<script>" }],
    };
    const html = recommendationBlock(makeTool({ id: "pick", tool: "Pick" }), [nasty], byId, "");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  test("falls back to the raw id when a member is unknown", () => {
    const orphan: Recommendation = {
      ...rec,
      members: ["pick", "ghost"],
      alternatives: [{ id: "ghost", when: "never" }],
    };
    const html = recommendationBlock(makeTool({ id: "pick", tool: "Pick" }), [orphan], byId, "");
    expect(html).toContain("ghost");
  });
});
