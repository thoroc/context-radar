import { describe, expect, test } from "vitest";
import { makeTool } from "../test-support/make-tool";
import { conflictBlock } from "./conflict-block";

describe("conflictBlock", () => {
  test("renders the no-conflict message when severity is none and there is no note", () => {
    const html = conflictBlock(
      makeTool({ conflict: { severity: "none", projects: [] } }),
      new Map(),
      "../",
    );
    expect(html).toBe('<p class="conf-none">No known conflicts or overlap.</p>');
  });

  test("links known projects by slug and leaves unknown ones as spans", () => {
    const tool = makeTool({
      conflict: { severity: "hard", projects: ["Known", "Unknown"], note: "overlap" },
    });
    const html = conflictBlock(tool, new Map([["Known", "known"]]), "../");
    expect(html).toContain('<a href="../tools/known.html">Known</a>');
    expect(html).toContain("<span>Unknown</span>");
  });

  test("prefixes cross-links with the given base (empty base for the modal overlay)", () => {
    const tool = makeTool({ conflict: { severity: "soft", projects: ["Known"], note: "n" } });
    const html = conflictBlock(tool, new Map([["Known", "known"]]), "");
    expect(html).toContain('<a href="tools/known.html">Known</a>');
  });
});
