import { describe, expect, test } from "vitest";
import { classify } from "./classify";

describe("classify", () => {
  test("flags a major jump or a missing recorded version as verdict-moving", () => {
    expect(classify("v1.9.0", "v2.0.0").bucket).toBe("verdict-moving");
    expect(classify(undefined, "v1.0.0").bucket).toBe("verdict-moving");
  });

  test("treats a minor/patch bump as observed-only", () => {
    expect(classify("v1.2.3", "v1.2.4").bucket).toBe("observed-only");
  });

  test("treats equal or behind upstream as no-drift", () => {
    expect(classify("v1.2.3", "v1.2.3").bucket).toBe("no-drift");
    expect(classify("v2.0.0", "v1.9.0").bucket).toBe("no-drift");
  });

  test("routes missing or unparseable versions to their own buckets", () => {
    expect(classify("v1.0.0", null).bucket).toBe("structural-skip");
    expect(classify("v1.0.0", "2024.01.15").bucket).toBe("unparseable");
  });
});
