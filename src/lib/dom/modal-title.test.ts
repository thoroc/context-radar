import { describe, expect, test } from "vitest";
import { modalTitle } from "./modal-title";

describe("modalTitle", () => {
  test("strips the site-name suffix after an em dash, as the titles are written", () => {
    expect(modalTitle("Methodology — Context Radar")).toBe("Methodology");
    expect(modalTitle("Glossary — Context Radar")).toBe("Glossary");
  });

  test("still strips a hyphen or en dash suffix", () => {
    expect(modalTitle("Comparison - Context Radar")).toBe("Comparison");
    expect(modalTitle("Layers – Context Radar")).toBe("Layers");
  });

  // Tool names reach this function too, and several contain hyphens.
  test("leaves a hyphenated name intact", () => {
    expect(modalTitle("lean-ctx")).toBe("lean-ctx");
    expect(modalTitle("token-optimizer-mcp")).toBe("token-optimizer-mcp");
  });

  test("returns a title with no suffix unchanged", () => {
    expect(modalTitle("RTK")).toBe("RTK");
  });
});
