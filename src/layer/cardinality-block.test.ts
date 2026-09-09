import { describe, expect, test } from "vitest";
import type { LayerMeta } from "../lib";
import { cardinalityBlock } from "./cardinality-block";

const layer = (over: Partial<LayerMeta> = {}): LayerMeta => ({
  name: "Shell output",
  order: 1,
  cardinality: "pick-one",
  summary: "s",
  ...over,
});

describe("cardinalityBlock", () => {
  // All four values, not the two the plan first assumed. install-both and
  // reference each hold exactly one layer, so a fallthrough would have gone
  // unnoticed on 1 page in 20 apiece.
  test("gives each of the four cardinalities its own wording", () => {
    const wording = (["pick-one", "stackable", "install-both", "reference"] as const).map((c) =>
      cardinalityBlock(layer({ cardinality: c })),
    );
    expect(new Set(wording).size).toBe(4);
    expect(wording[0]).toMatch(/exactly one/i);
    expect(wording[1]).toMatch(/as many/i);
    expect(wording[2]).toMatch(/complementary|both/i);
    expect(wording[3]).toMatch(/not.*install/i);
  });

  test("uses the store's note as the rationale when there is one", () => {
    const html = cardinalityBlock(layer({ note: "Running two shell hooks duplicates work." }));
    expect(html).toContain("Running two shell hooks duplicates work.");
  });

  // Two of the twenty layers carry no note. The block must not leave an empty
  // element behind, which is what would turn a thin page into scaffolding.
  test("renders no rationale element when the layer has no note", () => {
    expect(cardinalityBlock(layer())).not.toContain("card-note");
  });

  test("escapes the note", () => {
    expect(cardinalityBlock(layer({ note: '<b>x</b> & "y"' }))).toContain("&lt;b&gt;");
  });
});
