import { describe, expect, test } from "vitest";
import { trendText } from "./trend-text";

describe("trendText", () => {
  test("distinguishes null, flat, up, and down", () => {
    expect(trendText(null)).toBe("-");
    expect(trendText(0)).toBe("● flat");
    expect(trendText(5)).toBe("▲ +5%");
    expect(trendText(-3)).toBe("▼ -3%");
  });
});
