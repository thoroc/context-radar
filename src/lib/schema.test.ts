import { describe, expect, test } from "vitest";
import { makeTool } from "../test-support/make-tool";
import { datasetSchema, evidenceSourceSchema, toolSchema } from "./schema";

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

describe("datasetSchema", () => {
  const meta = { last_updated: "2026-07-15", stars_verified: "2026-07-15", tool_count: 1 };

  test("accepts a consistent dataset", () => {
    expect(datasetSchema.safeParse({ meta, tools: [makeTool()] }).success).toBe(true);
  });

  test("requires meta.tool_count to equal tools.length", () => {
    expect(
      datasetSchema.safeParse({ meta: { ...meta, tool_count: 2 }, tools: [makeTool()] }).success,
    ).toBe(false);
  });

  test("rejects duplicate tool names and duplicate ids", () => {
    const count = { ...meta, tool_count: 2 };
    const dupName = {
      meta: count,
      tools: [makeTool({ id: "a", tool: "A" }), makeTool({ id: "b", tool: "A" })],
    };
    const dupId = {
      meta: count,
      tools: [makeTool({ id: "a", tool: "A" }), makeTool({ id: "a", tool: "B" })],
    };
    expect(datasetSchema.safeParse(dupName).success).toBe(false);
    expect(datasetSchema.safeParse(dupId).success).toBe(false);
  });
});
