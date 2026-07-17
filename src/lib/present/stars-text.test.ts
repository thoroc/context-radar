import { describe, expect, test } from "vitest";
import { starsText } from "./stars-text";

describe("starsText", () => {
  test("renders a dash for null, otherwise the number", () => {
    expect(starsText(null)).toBe("-");
    expect(starsText(0)).toBe("0");
    expect(starsText(1234)).toBe("1234");
  });
});
