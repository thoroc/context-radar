import { describe, expect, test } from "vitest";
import type { Evidence, Tool } from "../../src/lib/schema";
import { makeTool } from "../../src/test-support/make-tool";
import { evidenceGap } from "./evidence-gap";

const sourceEvidence: Evidence = {
  status: "confirmed",
  sources: [
    {
      url: "https://github.com/o/r/blob/abc1234/src/a.ts#L1",
      quote: "x",
      checkedOn: "2026-07-18",
      evidenceType: "source-code",
    },
  ],
};

describe("evidenceGap", () => {
  test("lists only tools without confirmed source-code verdict evidence", () => {
    const tools: Tool[] = [
      makeTool({
        id: "verified",
        verdict: { decision: "best", rationale: "", evidence: sourceEvidence },
      }),
      makeTool({ id: "bare", verdict: { decision: "add", rationale: "" } }),
    ];
    const gap = evidenceGap(tools);
    expect(gap.map((e) => e.id)).toEqual(["bare"]);
  });

  test("orders best/either-or verdicts ahead of the rest, then by id", () => {
    const tools: Tool[] = [
      makeTool({ id: "zzz-add", verdict: { decision: "add", rationale: "" } }),
      makeTool({ id: "aaa-best", verdict: { decision: "best", rationale: "" } }),
      makeTool({ id: "mmm-either", verdict: { decision: "either-or", rationale: "" } }),
    ];
    expect(evidenceGap(tools).map((e) => e.id)).toEqual(["aaa-best", "mmm-either", "zzz-add"]);
  });

  test("carries the verdict decision for each gap entry", () => {
    const gap = evidenceGap([makeTool({ id: "t", verdict: { decision: "watch", rationale: "" } })]);
    expect(gap[0]).toEqual({ id: "t", tool: "Example", decision: "watch" });
  });

  test("returns an empty list when every verdict is source-verified", () => {
    const tools: Tool[] = [
      makeTool({ id: "a", verdict: { decision: "best", rationale: "", evidence: sourceEvidence } }),
    ];
    expect(evidenceGap(tools)).toEqual([]);
  });
});
