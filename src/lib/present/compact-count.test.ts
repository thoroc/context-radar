import { describe, expect, test } from "vitest";
import { compactCount } from "./compact-count";

describe("compactCount", () => {
  test("dashes a null count", () => {
    expect(compactCount(null)).toBe("-");
  });

  test("shows a sub-thousand count verbatim", () => {
    expect(compactCount(529)).toBe("529");
    expect(compactCount(0)).toBe("0");
  });

  test("compacts thousands, dropping a trailing .0", () => {
    expect(compactCount(71000)).toBe("71k");
    expect(compactCount(3900)).toBe("3.9k");
    expect(compactCount(56500)).toBe("56.5k");
    expect(compactCount(1000)).toBe("1k");
  });
});
