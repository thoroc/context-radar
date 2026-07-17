import { describe, expect, test } from "vitest";
import { requirementsBlock } from "./requirements-block";

describe("requirementsBlock", () => {
  test("styles a plain requirement as ok", () => {
    expect(requirementsBlock("Node 20", false)).toBe('<div class="req-ok">Node 20</div>');
  });

  test("styles an external-dependency requirement as a warning", () => {
    expect(requirementsBlock("needs a token", true)).toBe(
      '<div class="req-warn">needs a token</div>',
    );
  });

  test("escapes the requirement text", () => {
    expect(requirementsBlock("a & b", false)).toContain("a &amp; b");
  });
});
