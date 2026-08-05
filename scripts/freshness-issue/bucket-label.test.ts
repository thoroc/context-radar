import { describe, expect, test } from "vitest";
import { bucketLabel } from "./bucket-label";

describe("bucketLabel", () => {
  test("labels a major-version jump as verdict-moving", () => {
    expect(bucketLabel("verdict-moving")).toBe("freshness:verdict-moving");
  });

  test("labels minor/patch drift as observed-only", () => {
    expect(bucketLabel("observed-only")).toBe("freshness:observed-only");
  });
});
