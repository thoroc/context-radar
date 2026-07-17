import { describe, expect, test } from "vitest";
import { TOOLS, toolSlug } from "../lib";
import { toolFragments } from "./tool-fragments";

describe("toolFragments", () => {
  test("keys every tool by its tools/<slug>.html route", () => {
    const frags = toolFragments();
    expect(Object.keys(frags)).toHaveLength(TOOLS.length);
    const first = TOOLS[0];
    const key = `tools/${toolSlug(first.tool)}.html`;
    expect(frags[key].title).toBe(first.tool);
    expect(frags[key].html).toContain("tool-detail tool-detail--modal");
  });

  test("uses root-relative internal links (no ../) for the modal context", () => {
    const html = Object.values(toolFragments())[0].html;
    expect(html).not.toContain('href="../');
  });
});
