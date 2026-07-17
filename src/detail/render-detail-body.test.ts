import { describe, expect, test } from "vitest";
import { makeTool } from "../test-support/make-tool";
import { renderDetailBody } from "./render-detail-body";

const ctx = { slugByName: new Map<string, string>(), base: "", starsVerified: "2026-07-15" };

describe("renderDetailBody", () => {
  test("renders the header, verdict badge and facts panel", () => {
    const html = renderDetailBody(makeTool({ tool: "Alpha" }), ctx);
    expect(html).toContain("<h1>Alpha</h1>");
    expect(html).toContain('class="verdict');
    expect(html).toContain('class="facts"');
    expect(html).toContain("View on GitHub");
  });

  test("prefixes internal links with the given base", () => {
    expect(renderDetailBody(makeTool(), { ...ctx, base: "../" })).toContain(
      'href="../stack-builder.html"',
    );
    expect(renderDetailBody(makeTool(), ctx)).toContain('href="stack-builder.html"');
  });

  test("escapes the tool name", () => {
    const html = renderDetailBody(makeTool({ tool: "A & <b>" }), ctx);
    expect(html).toContain("A &amp; &lt;b&gt;");
    expect(html).not.toContain("<b>");
  });
});
