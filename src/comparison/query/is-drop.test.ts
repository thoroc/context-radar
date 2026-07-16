import { describe, expect, test } from "vitest";
import { makeTool } from "../../test-support/make-tool";
import { isDrop } from "./is-drop";

describe("isDrop", () => {
  test("is true only for the drop verdict", () => {
    expect(isDrop(makeTool({ verdict: { decision: "drop", rationale: "" } }))).toBe(true);
    expect(isDrop(makeTool())).toBe(false);
  });
});
