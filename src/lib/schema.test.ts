import { describe, expect, test } from "vitest";
import { makeTool } from "../test-support/make-tool";
import { datasetSchema, toolSchema } from "./schema";

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
