import { describe, expect, test } from "vitest";
import { TOOLS } from "../lib";
import { CURATED_PICK_IDS, FILTERS, LAYERS, TOTAL_LAYERS } from "./constants";

describe("stack-builder constants", () => {
  test("exposes the five filter chips", () => {
    expect(FILTERS.map((f) => f.id)).toEqual(["all", "rec", "sel", "open", "warn"]);
  });

  test("derives LAYERS from the store, ordered, with tools grouped by layer", () => {
    expect(LAYERS.length).toBeGreaterThan(0);
    for (let i = 1; i < LAYERS.length; i++) {
      expect(LAYERS[i]?.order).toBeGreaterThan(LAYERS[i - 1]?.order ?? 0);
    }
    for (const layer of LAYERS) {
      for (const t of layer.tools) expect(t.layer).toBe(layer.name);
    }
    const grouped = LAYERS.reduce((n, l) => n + l.tools.length, 0);
    expect(grouped).toBe(TOOLS.length);
  });

  test("TOTAL_LAYERS counts installable layers only (reference excluded)", () => {
    const reference = LAYERS.filter((l) => l.cardinality === "reference").length;
    expect(TOTAL_LAYERS).toBe(LAYERS.length - reference);
  });

  test("CURATED_PICK_IDS holds the curated per-layer picks", () => {
    expect(CURATED_PICK_IDS.has("rtk")).toBe(true);
    expect(CURATED_PICK_IDS.has("codegraph")).toBe(true);
  });
});
