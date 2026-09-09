import { describe, expect, test } from "vitest";
import type { LayerMeta } from "../../lib";
import { layerHeader } from "./layer-header";

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

describe("layerHeader", () => {
  test("shows the layer's own guidance note for a single-layer section", () => {
    const html = layerHeader({
      heading: "Code navigation",
      layers: [
        layer("Code navigation", 9, {
          cardinality: "pick-one",
          note: "Install one code nav tool.",
        }),
      ],
    });
    expect(html).toContain("Code navigation");
    expect(html).toContain("Install one code nav tool.");
  });

  // Two layers under one heading have to keep their separate cardinalities
  // visible, or the heading would imply one selection rule for both. The
  // hand-maintained taxonomy this replaces said "pick exactly one shell tool"
  // over a section that also contained a stackable layer.
  test("names each member and its cardinality for a grouped section", () => {
    const html = layerHeader({
      heading: "Shell & tool output compression",
      layers: [
        layer("Shell output", 1, { cardinality: "pick-one" }),
        layer("All tool output", 2, { cardinality: "stackable" }),
      ],
    });
    expect(html).toContain("Shell &amp; tool output compression");
    expect(html).toContain("Shell output");
    expect(html).toContain("pick one");
    expect(html).toContain("All tool output");
    expect(html).toContain("stackable");
  });

  test("renders no note element when a single layer has no note", () => {
    const html = layerHeader({
      heading: "Architecture violation detection",
      layers: [layer("Architecture violation detection", 10)],
    });
    expect(html).not.toContain("lh-note");
  });

  // Deliberately the index and not one of the two: a grouped heading covers
  // both layers, and choosing one would send the reader to the wrong page half
  // the time.
  test("links a single-layer section to its page and a grouped one to the index", () => {
    const single = layerHeader({
      heading: "Code navigation",
      layers: [layer("Code navigation", 9)],
    });
    expect(single).toContain('href="layers/code-navigation.html"');
    const grouped = layerHeader({
      heading: "Shell & tool output compression",
      layers: [layer("Shell output", 1), layer("All tool output", 2)],
    });
    expect(grouped).toContain('href="layers.html"');
  });

  test("escapes the heading and the note", () => {
    const html = layerHeader({
      heading: "Codebase understanding & onboarding",
      layers: [layer("Codebase understanding & onboarding", 8, { note: 'a "quoted" <b>note</b>' })],
    });
    expect(html).toContain("Codebase understanding &amp; onboarding");
    expect(html).toContain("&lt;b&gt;");
    expect(html).not.toContain("<b>note</b>");
  });
});
