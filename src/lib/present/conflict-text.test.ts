import { describe, expect, test } from "vitest";
import { conflictText } from "./conflict-text";

describe("conflictText", () => {
  test("returns the verbatim note when set, before anything else", () => {
    expect(
      conflictText({ severity: "hard", projects: ["a", "b"], note: "custom explanation" }),
    ).toBe("custom explanation");
  });

  test("renders a dash for none and a labelled list otherwise", () => {
    expect(conflictText({ severity: "none", projects: [] })).toBe("—");
    expect(conflictText({ severity: "hard", projects: ["x", "y"] })).toBe("⛔ HARD: x, y");
    expect(conflictText({ severity: "soft", projects: [] })).toBe("⚠ SOFT");
  });
});
