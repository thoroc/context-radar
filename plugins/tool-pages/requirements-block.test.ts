import { describe, expect, test } from "vitest";
import { requirementsBlock } from "./requirements-block";

describe("requirementsBlock", () => {
  test("marks a plain requirement as ok", () => {
    expect(requirementsBlock("Node 20")).toBe('<div class="req-ok">✓ Node 20</div>');
  });

  test("marks a requirement leading with a warning glyph", () => {
    expect(requirementsBlock("⚠ needs a token")).toBe(
      '<div class="req-warn">⚠ ⚠ needs a token</div>',
    );
  });

  test("escapes the requirement text", () => {
    expect(requirementsBlock("a & b")).toContain("a &amp; b");
  });
});
