import { describe, expect, test } from "vitest";
import type { ActivityBand } from "../../lib";
import { activityRank } from "./activity-rank";

describe("activityRank", () => {
  test("orders active highest and none lowest", () => {
    const order: ActivityBand[] = ["active", "stable", "slowing", "early", "dormant", "none"];
    const ranks = order.map(activityRank);
    for (let i = 1; i < ranks.length; i++) {
      expect(ranks[i - 1]).toBeGreaterThan(ranks[i] as number);
    }
  });
});
