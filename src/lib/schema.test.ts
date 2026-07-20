import { describe, expect, test } from "vitest";
import { makeTool } from "../test-support/make-tool";
import {
  datasetSchema,
  evidenceSourceSchema,
  recommendationSchema,
  toolSchema,
  verdictSchema,
} from "./schema";

describe("toolSchema", () => {
  test("accepts a well-formed record", () => {
    expect(toolSchema.safeParse(makeTool()).success).toBe(true);
  });

  test("rejects an empty id and a non-URL githubUrl", () => {
    expect(toolSchema.safeParse(makeTool({ id: "" })).success).toBe(false);
    expect(toolSchema.safeParse(makeTool({ githubUrl: "not-a-url" })).success).toBe(false);
  });

  test("constrains releasedOn to an ISO date", () => {
    expect(toolSchema.safeParse(makeTool({ activity: { releasedOn: "2026-07-15" } })).success).toBe(
      true,
    );
    expect(toolSchema.safeParse(makeTool({ activity: { releasedOn: "15-07-2026" } })).success).toBe(
      false,
    );
  });
});

describe("evidenceSourceSchema — source-code permalink rule", () => {
  const base = { quote: "some cited text", checkedOn: "2026-07-16" } as const;
  const ok = (url: string, evidenceType = "source-code") =>
    evidenceSourceSchema.safeParse({ ...base, url, evidenceType }).success;

  test("accepts SHA-pinned permalinks with a line anchor across hosts", () => {
    const sha = "f14b3bb5d70256211d094aced9a48c7018355dd5";
    expect(ok(`https://github.com/o/r/blob/${sha}/src/a.rs#L42`)).toBe(true);
    expect(ok(`https://github.com/o/r/blob/${sha}/src/a.rs#L1-L6`)).toBe(true);
    expect(ok(`https://gitlab.com/o/r/-/blob/${sha}/src/a.rs#L42`)).toBe(true);
    expect(ok(`https://codeberg.org/o/r/src/commit/${sha}/src/a.rs#L42`)).toBe(true);
  });

  test("rejects a source-code URL on a branch, or without a line anchor", () => {
    const sha = "f14b3bb5d70256211d094aced9a48c7018355dd5";
    expect(ok("https://github.com/o/r/blob/main/src/a.rs#L42")).toBe(false);
    expect(ok(`https://github.com/o/r/blob/${sha}/src/a.rs`)).toBe(false);
    expect(ok("https://github.com/o/r")).toBe(false);
  });

  test("applies the rule only to source-code sources", () => {
    expect(ok("https://example.com/docs", "official-docs")).toBe(true);
    expect(ok("https://github.com/o/r/blob/main/README.md", "readme")).toBe(true);
  });
});

describe("verdictSchema — evidence coherence", () => {
  const sha = "f14b3bb5d70256211d094aced9a48c7018355dd5";
  const confirmed = {
    status: "confirmed",
    sources: [
      {
        url: `https://github.com/o/r/blob/${sha}/a.rs#L1`,
        quote: "q",
        checkedOn: "2026-07-16",
        evidenceType: "source-code",
      },
    ],
  };
  const refuted = {
    status: "refuted",
    sources: [
      { url: "https://x.com/y", quote: "q", checkedOn: "2026-07-16", evidenceType: "third-party" },
    ],
  };
  const unverified = { status: "unverified", sources: [] };
  const verdict = (decision: string, evidence?: unknown) =>
    verdictSchema.safeParse({ decision, rationale: "r", ...(evidence ? { evidence } : {}) })
      .success;

  test("accepts a verdict with no evidence (optional)", () => {
    expect(verdict("best")).toBe(true);
  });

  test("accepts a 'best' verdict backed by confirmed evidence", () => {
    expect(verdict("best", confirmed)).toBe(true);
  });

  test("rejects a 'best'/'either-or' verdict on refuted or unverified evidence", () => {
    expect(verdict("best", refuted)).toBe(false);
    expect(verdict("best", unverified)).toBe(false);
    expect(verdict("either-or", refuted)).toBe(false);
  });

  test("allows non-recommendation verdicts to carry weak evidence", () => {
    expect(verdict("add", refuted)).toBe(true);
    expect(verdict("watch", unverified)).toBe(true);
  });
});

describe("recommendationSchema — intra-record shape", () => {
  const rec = (over: Record<string, unknown> = {}) =>
    recommendationSchema.safeParse({
      id: "shell",
      layer: "Shell output",
      members: ["rtk", "sqz"],
      pick: "rtk",
      alternatives: [{ id: "sqz", when: "you want a pure-Rust binary" }],
      rationale: "prefer rtk",
      ...over,
    }).success;

  test("accepts a well-formed recommendation", () => {
    expect(rec()).toBe(true);
  });

  test("rejects an unknown layer", () => {
    expect(rec({ layer: "Not a layer" })).toBe(false);
  });

  test("rejects a pick absent from members, or also listed as an alternative", () => {
    expect(rec({ pick: "ghost" })).toBe(false);
    expect(
      rec({ pick: "rtk", alternatives: [{ id: "rtk", when: "x" }], members: ["rtk", "sqz"] }),
    ).toBe(false);
  });

  test("requires members to equal exactly the pick plus alternatives", () => {
    // 'extra' is a member never mentioned as pick or alternative.
    expect(rec({ members: ["rtk", "sqz", "extra"] })).toBe(false);
    // alternative 'ghost' is not in members.
    expect(rec({ members: ["rtk", "sqz"], alternatives: [{ id: "ghost", when: "x" }] })).toBe(
      false,
    );
  });

  test("rejects duplicate alternatives and fewer than two members", () => {
    expect(
      rec({
        members: ["rtk", "sqz"],
        alternatives: [
          { id: "sqz", when: "x" },
          { id: "sqz", when: "y" },
        ],
      }),
    ).toBe(false);
    expect(rec({ members: ["rtk"], alternatives: [] })).toBe(false);
  });
});

describe("datasetSchema", () => {
  const meta = { last_updated: "2026-07-15", stars_verified: "2026-07-15", tool_count: 1 };
  const layers = [{ name: "Shell output", order: 1, cardinality: "pick-one" }];

  test("accepts a consistent dataset", () => {
    expect(datasetSchema.safeParse({ meta, layers, tools: [makeTool()] }).success).toBe(true);
  });

  test("requires meta.tool_count to equal tools.length", () => {
    expect(
      datasetSchema.safeParse({ meta: { ...meta, tool_count: 2 }, layers, tools: [makeTool()] })
        .success,
    ).toBe(false);
  });

  test("rejects duplicate tool names and duplicate ids", () => {
    const count = { ...meta, tool_count: 2 };
    const dupName = {
      meta: count,
      layers,
      tools: [makeTool({ id: "a", tool: "A" }), makeTool({ id: "b", tool: "A" })],
    };
    const dupId = {
      meta: count,
      layers,
      tools: [makeTool({ id: "a", tool: "A" }), makeTool({ id: "a", tool: "B" })],
    };
    expect(datasetSchema.safeParse(dupName).success).toBe(false);
    expect(datasetSchema.safeParse(dupId).success).toBe(false);
  });

  test("requires every tool's layer to have a layers[] entry", () => {
    const orphan = { meta, layers, tools: [makeTool({ layer: "Code navigation" })] };
    expect(datasetSchema.safeParse(orphan).success).toBe(false);
  });

  test("rejects duplicate layer names and duplicate orders", () => {
    const dupName = {
      meta,
      layers: [
        { name: "Shell output", order: 1, cardinality: "pick-one" },
        { name: "Shell output", order: 2, cardinality: "stackable" },
      ],
      tools: [makeTool()],
    };
    const dupOrder = {
      meta,
      layers: [
        { name: "Shell output", order: 1, cardinality: "pick-one" },
        { name: "Code navigation", order: 1, cardinality: "pick-one" },
      ],
      tools: [makeTool()],
    };
    expect(datasetSchema.safeParse(dupName).success).toBe(false);
    expect(datasetSchema.safeParse(dupOrder).success).toBe(false);
  });
});
