// @vitest-environment happy-dom
import { beforeEach, describe, expect, test } from "vitest";
import type { LayerMeta } from "../../lib";
import { setupLayerFilter } from "./setup-layer-filter";

const layer = (name: LayerMeta["name"], order: number): LayerMeta => ({
  name,
  order,
  cardinality: "stackable",
  summary: "What this layer is and where its waste comes from.",
});

beforeEach(() => {
  document.body.innerHTML = '<select id="fl"><option value="">All layers</option></select>';
});

const select = (): HTMLSelectElement => document.getElementById("fl") as HTMLSelectElement;

describe("setupLayerFilter", () => {
  // The options were hand-written in comparison.html and had drifted from the
  // store: "Config stack audit & optimisation" existed as an option while the
  // store's layer was "Config stack audit", and because the filter matched by
  // prefix, choosing it returned an empty table on the live site. Deriving the
  // options from the store is what makes that class of bug impossible.
  test("adds one option per layer, valued exactly as the store names it", () => {
    setupLayerFilter([layer("Config stack audit", 13), layer("Code navigation", 9)]);
    const values = [...select().options].map((o) => o.value);
    expect(values).toContain("Config stack audit");
    expect(values).not.toContain("Config stack audit & optimisation");
  });

  test("keeps the existing all-layers option first and adds layers in store order", () => {
    setupLayerFilter([layer("Code navigation", 9), layer("Shell output", 1)]);
    expect([...select().options].map((o) => o.textContent)).toEqual([
      "All layers",
      "Shell output",
      "Code navigation",
    ]);
    expect(select().options[0].value).toBe("");
  });

  test("is idempotent, so a re-run cannot duplicate the option list", () => {
    setupLayerFilter([layer("Code navigation", 9)]);
    setupLayerFilter([layer("Code navigation", 9)]);
    expect(select().options).toHaveLength(2);
  });

  test("is a no-op when the select is absent", () => {
    document.body.innerHTML = "";
    expect(() => setupLayerFilter([layer("Code navigation", 9)])).not.toThrow();
  });
});
