import { describe, expect, test } from "vitest";
import { makeTool } from "../../test-support/make-tool";
import type { Evidence } from "../schema";
import { hasConfirmedSourceEvidence } from "./has-confirmed-source-evidence";

const evidence = (over: Partial<Evidence> = {}): Evidence => ({
  status: "confirmed",
  sources: [
    {
      url: "https://github.com/o/r/blob/abc1234/src/a.ts#L1",
      quote: "x",
      checkedOn: "2026-07-18",
      evidenceType: "source-code",
    },
  ],
  ...over,
});

describe("hasConfirmedSourceEvidence", () => {
  test("true for a confirmed verdict with a source-code source", () => {
    expect(
      hasConfirmedSourceEvidence(
        makeTool({ verdict: { decision: "best", rationale: "", evidence: evidence() } }),
      ),
    ).toBe(true);
  });

  test("false when the verdict has no evidence", () => {
    expect(hasConfirmedSourceEvidence(makeTool())).toBe(false);
  });

  test("false when confirmed but backed only by a readme source", () => {
    const readmeOnly = evidence({
      sources: [
        {
          url: "https://github.com/o/r/blob/abc1234/README.md#L1",
          quote: "x",
          checkedOn: "2026-07-18",
          evidenceType: "readme",
        },
      ],
    });
    expect(
      hasConfirmedSourceEvidence(
        makeTool({ verdict: { decision: "add", rationale: "", evidence: readmeOnly } }),
      ),
    ).toBe(false);
  });

  test("false when a source-code source exists but the status is not confirmed", () => {
    expect(
      hasConfirmedSourceEvidence(
        makeTool({
          verdict: { decision: "add", rationale: "", evidence: evidence({ status: "caveated" }) },
        }),
      ),
    ).toBe(false);
  });
});
