import { describe, expect, test } from "vitest";
import { makeTool } from "../../test-support/make-tool";
import { toolCell } from "./tool-cell";

describe("toolCell", () => {
  test("links to the detail page and shows runtime, licence, and stars", () => {
    const html = toolCell(
      makeTool({ tool: "Foo Bar", runtime: { languages: ["rust"] }, stars: 1500 }),
    );
    expect(html).toContain('href="tools/foo-bar.html"');
    expect(html).toContain("Rust");
    expect(html).toContain("MIT");
    expect(html).toContain("1.5k");
  });

  test("flags tools that need external infra", () => {
    expect(toolCell(makeTool({ requiresExternal: true }))).toContain("needs model or infra");
    expect(toolCell(makeTool({ requiresExternal: false }))).not.toContain("needs model or infra");
  });
});
