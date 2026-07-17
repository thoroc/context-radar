import { describe, expect, test } from "vitest";

import { runVerification } from "./run";

const sha = "f14b3bb5d70256211d094aced9a48c7018355dd5";

describe("runVerification", () => {
  test("verifies every source-code citation across the tools", async () => {
    const tools = [
      {
        id: "alpha",
        verdict: {
          evidence: {
            sources: [
              {
                url: `https://github.com/o/r/blob/${sha}/a.rs#L1`,
                quote: "hello",
                checkedOn: "2026-07-16",
                evidenceType: "source-code",
              },
            ],
          },
        },
      },
      { id: "beta" },
    ];
    const results = await runVerification(tools, async () => "hello world");
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ toolId: "alpha", status: "ok" });
  });

  test("returns nothing when there are no source-code citations", async () => {
    const results = await runVerification([{ id: "beta" }], async () => "x");
    expect(results).toEqual([]);
  });
});
