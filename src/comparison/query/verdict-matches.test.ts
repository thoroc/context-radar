import { describe, expect, test } from "vitest";
import { makeTool } from "../../test-support/make-tool";
import { verdictMatches } from "./verdict-matches";

describe("verdictMatches", () => {
  test("an empty filter matches everything", () => {
    expect(verdictMatches(makeTool(), new Set())).toBe(true);
  });

  test("the add filter also covers the conditional add-if decision", () => {
    const add = new Set(["add"]);
    expect(verdictMatches(makeTool({ verdict: { decision: "add-if", rationale: "" } }), add)).toBe(
      true,
    );
    expect(verdictMatches(makeTool({ verdict: { decision: "add", rationale: "" } }), add)).toBe(
      true,
    );
    expect(verdictMatches(makeTool({ verdict: { decision: "drop", rationale: "" } }), add)).toBe(
      false,
    );
  });
});
