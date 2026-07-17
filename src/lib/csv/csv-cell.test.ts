import { describe, expect, test } from "vitest";
import { csvCell } from "./csv-cell";

describe("csvCell", () => {
  test("passes plain values through unquoted", () => {
    expect(csvCell("plain")).toBe("plain");
  });

  test("RFC 4180 quotes values with commas, quotes, or newlines", () => {
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
  });
});
