import { describe, expect, test } from "vitest";
import { summarise } from "./summarise";
import type { VerifyResult } from "./verify-source";

const r = (status: VerifyResult["status"]): VerifyResult => ({ toolId: "t", url: "u", status });

describe("summarise", () => {
  test("exits non-zero only when there is a hard failure", () => {
    expect(summarise([r("ok"), r("unfetchable")]).exitCode).toBe(0);
    expect(summarise([r("ok"), r("mismatch")]).exitCode).toBe(1);
    expect(summarise([r("unparseable")]).exitCode).toBe(1);
  });

  test("buckets results by status", () => {
    const s = summarise([r("ok"), r("ok"), r("unfetchable"), r("mismatch"), r("unparseable")]);
    expect(s.ok).toHaveLength(2);
    expect(s.soft).toHaveLength(1);
    expect(s.hard).toHaveLength(2);
  });
});
