import { describe, expect, test } from "vitest";
import { docShell } from "./doc-shell";

describe("docShell", () => {
  test("wraps the body in an article the TOC mounts against", () => {
    const html = docShell({ body: "<h2>x</h2>", articleClass: "detail layer-detail" });
    expect(html).toContain("data-doc-shell");
    expect(html).toContain('data-article class="detail layer-detail"');
    expect(html).toContain("<h2>x</h2>");
  });

  test("provides the empty nav the TOC fills, and its label", () => {
    const html = docShell({ body: "", articleClass: "detail" });
    expect(html).toContain("data-toc");
    expect(html).toMatch(/On this page/);
  });

  // Opt-in, not opt-out. A tool or layer page's article is itself two columns,
  // so capping it caps the pair and the prose column ends up narrower than it
  // was without the shell.
  test("applies the reading measure only when asked", () => {
    expect(docShell({ body: "", articleClass: "md-prose", measure: true })).toContain(
      "prose-measure",
    );
    expect(docShell({ body: "", articleClass: "detail" })).not.toContain("prose-measure");
  });
});
