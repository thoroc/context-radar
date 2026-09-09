import { describe, expect, test } from "vitest";
import type { LayerMeta, Recommendation } from "../lib";
import { makeTool } from "../test-support/make-tool";
import { renderLayerBody } from "./render-layer-body";

const layer = (over: Partial<LayerMeta> = {}): LayerMeta => ({
  name: "Shell output",
  order: 1,
  cardinality: "pick-one",
  summary: "Shell output arrives in full and most of it is never read.",
  ...over,
});
const rtk = makeTool({ id: "rtk", tool: "RTK", layer: "Shell output" });
const sqz = makeTool({
  id: "sqz",
  tool: "sqz",
  layer: "Shell output",
  conflict: { severity: "either-or", projects: ["rtk"] },
});
const ctx = { base: "../", starsVerified: "2026-07-15" };

describe("renderLayerBody", () => {
  test("always shows the name, summary and selection rule", () => {
    const html = renderLayerBody(layer(), [rtk], [rtk], [], ctx);
    expect(html).toContain("Shell output");
    expect(html).toContain("most of it is never read");
    expect(html).toContain("How many to install");
  });

  // Nine of the twenty layers have no pick and two have no note, so absence is
  // the common case. An empty heading is what would make a thin page read as
  // scaffolding.
  test("omits every optional section a layer has nothing for", () => {
    const html = renderLayerBody(layer(), [rtk], [rtk], [], ctx);
    expect(html).not.toContain("Where to start");
    expect(html).not.toContain("Conflicts within this layer");
    expect(html).not.toContain("<section></section>");
  });

  test("shows the pick section when the layer has a curated pick", () => {
    const html = renderLayerBody(layer({ curatedPick: "rtk" }), [rtk], [rtk], [], ctx);
    expect(html).toContain("Where to start");
    expect(html).toContain("RTK");
  });

  test("shows in-layer conflicts when two of its tools clash", () => {
    const html = renderLayerBody(layer(), [rtk, sqz], [rtk, sqz], [], ctx);
    expect(html).toContain("Conflicts within this layer");
  });

  // The pick is presented above with its rationale, so it must not also appear
  // as a card. It may still be named elsewhere: these two conflict, and a
  // conflict pair names both sides, which is correct.
  test("does not repeat the pick among the other tools", () => {
    const html = renderLayerBody(layer({ curatedPick: "rtk" }), [rtk, sqz], [rtk, sqz], [], ctx);
    const cardHrefs = [...html.matchAll(/class="layer-card" href="([^"]+)"/g)].map((m) => m[1]);
    expect(cardHrefs).toEqual(["../tools/sqz.html"]);
    expect(html).toContain("The other tool");
  });

  test("prefers a recommendation over the curated pick", () => {
    const rec: Recommendation = {
      id: "shell-output",
      layer: "Shell output",
      members: ["rtk", "sqz"],
      pick: "rtk",
      alternatives: [{ id: "sqz", when: "repeat reads dominate" }],
      rationale: "rtk is the most established.",
    };
    const html = renderLayerBody(layer({ curatedPick: "rtk" }), [rtk, sqz], [rtk, sqz], [rec], ctx);
    expect(html).toContain("rtk is the most established.");
    expect(html).toContain("repeat reads dominate");
  });

  test("reports the layer's tool count and links back to the index", () => {
    const html = renderLayerBody(layer(), [rtk, sqz], [rtk, sqz], [], ctx);
    expect(html).toContain("../layers.html");
    expect(html).toMatch(/Tools<\/span><span class="v">2</);
  });

  test("escapes a layer name and summary", () => {
    const html = renderLayerBody(
      layer({ name: "Codebase understanding & onboarding", summary: "<b>x</b>" }),
      [],
      [],
      [],
      ctx,
    );
    expect(html).toContain("Codebase understanding &amp; onboarding");
    expect(html).toContain("&lt;b&gt;");
  });
});
