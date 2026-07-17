import { describe, expect, test } from "vitest";
import { verdictText } from "./verdict-text";

describe("verdictText", () => {
  test("appends the rationale only when present", () => {
    expect(verdictText({ decision: "add", rationale: "" })).toBe("Add");
    expect(verdictText({ decision: "best", rationale: "fast and stable" })).toBe(
      "Best in class — fast and stable",
    );
  });
});
