import { describe, expect, test } from "vitest";
import { makeTool } from "../../test-support/make-tool";
import { conflictCell } from "./conflict-cell";

describe("conflictCell", () => {
  test("shows None for a conflict-free tool and labels hard conflicts", () => {
    expect(conflictCell(makeTool())).toContain("None");
    const hard = conflictCell(makeTool({ conflict: { severity: "hard", projects: ["x"] } }));
    expect(hard).toContain("Hard conflict");
    expect(hard).toContain("cf-hard");
  });
});
