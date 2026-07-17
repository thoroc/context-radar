import { describe, expect, test } from "vitest";
import { makeTool } from "../../test-support/make-tool";
import { sortValue } from "./sort-value";

describe("sortValue", () => {
  test("returns a comparable value per column, lowercased for text", () => {
    expect(sortValue(makeTool({ whatItDoes: "Zebra" }), "whatItDoes")).toBe("zebra");
    expect(sortValue(makeTool({ conflict: { severity: "hard", projects: [] } }), "conflict")).toBe(
      "hard",
    );
    expect(sortValue(makeTool({ tool: "Alpha" }), "unknown-col")).toBe("alpha");
  });
});
