import { describe, expect, test } from "vitest";
import type { VerdictDecision } from "../../lib";
import { verdictRank } from "./verdict-rank";

describe("verdictRank", () => {
  test("orders best highest and drop lowest, with either-or above add", () => {
    const order: VerdictDecision[] = [
      "best",
      "either-or",
      "add",
      "add-if",
      "watch",
      "reference",
      "drop",
    ];
    const ranks = order.map(verdictRank);
    for (let i = 1; i < ranks.length; i++) {
      expect(ranks[i - 1]).toBeGreaterThan(ranks[i] as number);
    }
  });

  test("is total over the enum (every member has a rank)", () => {
    for (const d of ["best", "either-or", "add", "add-if", "watch", "reference", "drop"] as const) {
      expect(Number.isFinite(verdictRank(d))).toBe(true);
    }
  });
});
