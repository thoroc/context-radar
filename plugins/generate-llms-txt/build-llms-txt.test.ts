import { describe, expect, test } from "vitest";
import { buildLlmsTxt } from "./build-llms-txt";

const dataPath = new URL("../../data/context-reduction-tools.json", import.meta.url).pathname;
const txt = buildLlmsTxt(dataPath);

describe("buildLlmsTxt", () => {
  // The hand-maintained file this replaces claimed 81 tools against a store of
  // 84 and 19 layers against 20, cited a data/context-reduction-tools.csv that
  // does not exist, and described the JSON as {meta, tools} while omitting
  // layers. Every one of those was derived data kept by hand.
  test("states the counts the store actually holds", () => {
    const { tools, layers } = JSON.parse(require("node:fs").readFileSync(dataPath, "utf8")) as {
      tools: unknown[];
      layers: unknown[];
    };
    expect(txt).toContain(`${tools.length} tools`);
    expect(txt).toContain(`${layers.length} layers`);
    expect(txt).not.toContain("81 tools");
    expect(txt).not.toContain("19 layers");
  });

  test("cites only files that exist", () => {
    expect(txt).toContain("data/context-reduction-tools.json");
    expect(txt).not.toContain("data/context-reduction-tools.csv");
  });

  test("describes the JSON shape including layers", () => {
    expect(txt).toMatch(/\{meta, layers, tools\}/);
  });

  test("gives every layer a section carrying its cardinality and summary", () => {
    const store = JSON.parse(require("node:fs").readFileSync(dataPath, "utf8")) as {
      layers: { name: string; summary: string; cardinality: string }[];
    };
    for (const layer of store.layers) {
      expect(txt).toContain(`### ${layer.name}`);
      expect(txt).toContain(layer.summary);
    }
  });

  test("lists every tool exactly once", () => {
    const store = JSON.parse(require("node:fs").readFileSync(dataPath, "utf8")) as {
      tools: { tool: string; githubUrl: string }[];
    };
    for (const tool of store.tools) {
      expect(txt.split(`(${tool.githubUrl})`).length - 1).toBe(1);
    }
  });

  test("keeps the decision-support caveat", () => {
    expect(txt).toMatch(/decision support/i);
  });
});
