import { describe, expect, test } from "vitest";
import { parseStars } from "./parse-stars";

describe("parseStars", () => {
  test("reads a plain count", () => {
    expect(parseStars("529")).toBe(529);
  });

  test("scales the k suffix instead of stripping it", () => {
    expect(parseStars("71k")).toBe(71000);
    expect(parseStars("3.9k")).toBe(3900);
    expect(parseStars("56.5k")).toBe(56500);
  });

  test("scales the m suffix", () => {
    expect(parseStars("1.2M")).toBe(1_200_000);
  });

  test("ignores an approximation prefix", () => {
    expect(parseStars("~1k")).toBe(1000);
    expect(parseStars("~4")).toBe(4);
  });

  test("returns 0 for a no-data dash", () => {
    expect(parseStars("-")).toBe(0);
  });
});
