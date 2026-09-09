import { describe, expect, test } from "vitest";
import type { LayerMeta } from "../schema";
import { layerSections } from "./layer-sections";

const layer = (
  name: LayerMeta["name"],
  order: number,
  extra: Partial<LayerMeta> = {},
): LayerMeta => ({
  name,
  order,
  cardinality: "stackable",
  summary: "What this layer is and where its waste comes from.",
  ...extra,
});

describe("layerSections", () => {
  test("gives an ungrouped layer a section of its own, headed by its name", () => {
    const sections = layerSections([layer("Code navigation", 9)]);
    expect(sections).toHaveLength(1);
    expect(sections[0].heading).toBe("Code navigation");
    expect(sections[0].layers.map((l) => l.name)).toEqual(["Code navigation"]);
  });

  // The whole point of D5: the two layers share a display heading but keep
  // their own names and cardinalities, so the section carries both rather than
  // the store merging them into one layer.
  test("collapses layers that share a group into one section, preserving both", () => {
    const sections = layerSections([
      layer("Shell output", 1, {
        cardinality: "pick-one",
        group: "Shell & tool output compression",
      }),
      layer("All tool output", 2, { group: "Shell & tool output compression" }),
      layer("Code navigation", 9),
    ]);
    expect(sections.map((s) => s.heading)).toEqual([
      "Shell & tool output compression",
      "Code navigation",
    ]);
    expect(sections[0].layers.map((l) => l.name)).toEqual(["Shell output", "All tool output"]);
    expect(sections[0].layers.map((l) => l.cardinality)).toEqual(["pick-one", "stackable"]);
  });

  test("orders sections by their earliest member and members by their own order", () => {
    const sections = layerSections([
      layer("Code navigation", 9),
      layer("All tool output", 2, { group: "Shell & tool output compression" }),
      layer("Shell output", 1, { group: "Shell & tool output compression" }),
    ]);
    expect(sections.map((s) => s.heading)).toEqual([
      "Shell & tool output compression",
      "Code navigation",
    ]);
    expect(sections[0].layers.map((l) => l.order)).toEqual([1, 2]);
  });

  test("does not merge layers whose group differs, even by one character", () => {
    const sections = layerSections([
      layer("Shell output", 1, { group: "Output" }),
      layer("All tool output", 2, { group: "Output " }),
    ]);
    expect(sections).toHaveLength(2);
  });

  // A section count that silently drifts from the store is the bug this whole
  // phase exists to remove, so the invariant is asserted rather than assumed.
  test("accounts for every layer exactly once", () => {
    const input = [
      layer("Shell output", 1, { group: "Shell & tool output compression" }),
      layer("All tool output", 2, { group: "Shell & tool output compression" }),
      layer("Code navigation", 9),
      layer("Config stack audit", 13),
    ];
    const sections = layerSections(input);
    expect(
      sections
        .flatMap((s) => s.layers)
        .map((l) => l.name)
        .sort(),
    ).toEqual(input.map((l) => l.name).sort());
  });
});
