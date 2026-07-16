import { describe, expect, test } from "vitest";
import { fmtStars } from "./fmt-stars";

describe("fmtStars", () => {
  test("dashes null, passes small numbers, abbreviates thousands", () => {
    expect(fmtStars(null)).toBe("—");
    expect(fmtStars(999)).toBe("999");
    expect(fmtStars(1500)).toBe("1.5k");
    expect(fmtStars(2000)).toBe("2k");
  });
});
