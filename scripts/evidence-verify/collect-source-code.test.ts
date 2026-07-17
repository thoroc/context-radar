import { describe, expect, test } from "vitest";
import { collectSourceCode } from "./collect-source-code";

describe("collectSourceCode", () => {
  test("finds source-code citations in any nested evidence block, tagged by tool id", () => {
    const tools = [
      {
        id: "alpha",
        verdict: {
          evidence: {
            sources: [
              {
                url: "https://x/a#L1",
                quote: "q1",
                checkedOn: "2026-07-16",
                evidenceType: "source-code",
              },
              {
                url: "https://x/readme",
                quote: "r",
                checkedOn: "2026-07-16",
                evidenceType: "readme",
              },
            ],
          },
        },
        conflict: {
          evidence: {
            sources: [
              {
                url: "https://x/b#L2",
                quote: "q2",
                checkedOn: "2026-07-16",
                evidenceType: "source-code",
              },
            ],
          },
        },
      },
      { id: "beta" },
    ];
    const found = collectSourceCode(tools);
    expect(found).toHaveLength(2);
    expect(found.map((c) => c.url).sort()).toEqual(["https://x/a#L1", "https://x/b#L2"]);
    expect(found.every((c) => c.toolId === "alpha")).toBe(true);
  });

  test("returns nothing when there are no source-code citations", () => {
    expect(collectSourceCode([{ id: "beta" }])).toEqual([]);
  });
});
