import { describe, expect, test } from "vitest";
import { makeTool } from "../test-support/make-tool";
import { evidenceRows } from "./evidence-rows";

describe("evidenceRows", () => {
  test("returns no rows when the record carries no evidence", () => {
    expect(evidenceRows(makeTool())).toEqual([]);
  });

  test("collects a labelled row per evidenced field", () => {
    const evidence = { status: "unverified" as const, sources: [] };
    const rows = evidenceRows(
      makeTool({
        conflict: { severity: "none", projects: [], evidence },
        licence: { spdx: "MIT", evidence },
      }),
    );
    expect(rows.map((r) => r.label)).toEqual(["Conflict / overlap", "Licence"]);
  });
});
