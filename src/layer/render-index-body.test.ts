import { describe, expect, test } from "vitest";
import type { LayerMeta } from "../lib";
import { makeTool } from "../test-support/make-tool";
import { renderIndexBody } from "./render-index-body";

const layer = (
  name: LayerMeta["name"],
  order: number,
  over: Partial<LayerMeta> = {},
): LayerMeta => ({
  name,
  order,
  cardinality: "stackable",
  summary: `What ${name} is.`,
  ...over,
});
const layers = [layer("Shell output", 1, { cardinality: "pick-one" }), layer("Code navigation", 9)];
const tools = [
  makeTool({ id: "rtk", tool: "RTK", layer: "Shell output" }),
  makeTool({ id: "cg", tool: "codegraph", layer: "Code navigation" }),
];

describe("renderIndexBody", () => {
  // D6: no floor. Every layer gets a page and the index links all of them, so
  // the index is the one place the layer count is verifiable by eye.
  test("links every layer, in store order", () => {
    const html = renderIndexBody(layers, tools, { base: "./", starsVerified: "2026-07-15" });
    expect(html).toContain('href="./layers/shell-output.html"');
    expect(html).toContain('href="./layers/code-navigation.html"');
    expect(html.indexOf("shell-output")).toBeLessThan(html.indexOf("code-navigation"));
  });

  test("shows each layer's summary and tool count", () => {
    const html = renderIndexBody(layers, tools, { base: "./", starsVerified: "2026-07-15" });
    expect(html).toContain("What Shell output is.");
    expect(html).toMatch(/1 tool\b/);
  });

  test("states the totals", () => {
    const html = renderIndexBody(layers, tools, { base: "./", starsVerified: "2026-07-15" });
    expect(html).toContain("2 layers");
    expect(html).toContain("2 tools");
  });
});
