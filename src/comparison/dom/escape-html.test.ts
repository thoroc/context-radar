import { describe, expect, test } from "vitest";
import { escapeHtml } from "./escape-html";

describe("escapeHtml", () => {
  test("escapes &, <, and >", () => {
    expect(escapeHtml("a & b < c > d")).toBe("a &amp; b &lt; c &gt; d");
  });
});
