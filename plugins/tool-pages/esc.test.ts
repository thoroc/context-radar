import { describe, expect, test } from "vitest";
import { esc } from "./esc";

describe("esc", () => {
  test("escapes HTML-significant characters", () => {
    expect(esc(`<a href="x">Tom & Jerry</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&lt;/a&gt;",
    );
  });

  test("leaves plain text unchanged", () => {
    expect(esc("plain text")).toBe("plain text");
  });
});
