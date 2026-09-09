import { describe, expect, test } from "vitest";
import { makeTool } from "../test-support/make-tool";
import { layerToolCards } from "./layer-tool-cards";

const rtk = makeTool({
  id: "rtk",
  tool: "RTK",
  layer: "Shell output",
  verdict: { decision: "best", rationale: "" },
});
const sqz = makeTool({ id: "sqz", tool: "sqz", layer: "Shell output", stars: null });

describe("layerToolCards", () => {
  test("renders one linked card per tool, with its verdict", () => {
    const html = layerToolCards([rtk, sqz], new Set(), "../");
    expect(html).toContain('href="../tools/rtk.html"');
    expect(html).toContain('href="../tools/sqz.html"');
    expect(html).toMatch(/Best in class/);
  });

  // The pick is already presented above with its rationale, so repeating it as
  // a card would show the same tool twice on one page.
  test("omits tools already shown as the layer's pick", () => {
    const html = layerToolCards([rtk, sqz], new Set(["rtk"]), "../");
    expect(html).not.toContain('href="../tools/rtk.html"');
    expect(html).toContain('href="../tools/sqz.html"');
  });

  test("renders a tool with no star count without breaking", () => {
    expect(layerToolCards([sqz], new Set(), "../")).toContain("sqz");
  });

  test("renders nothing when every tool is excluded", () => {
    expect(layerToolCards([rtk], new Set(["rtk"]), "../")).toBe("");
  });
});
