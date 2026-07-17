import { describe, expect, test } from "vitest";
import { maxParseableTag } from "./max-parseable-tag";

describe("maxParseableTag", () => {
  test("picks the highest parseable tag regardless of list order", () => {
    expect(maxParseableTag(["v0.9.23", "v0.10.0", "pkg@9.9.9"])?.tag).toBe("v0.10.0");
  });

  test("returns null when no tag parses", () => {
    expect(maxParseableTag(["pkg@1.2.3", "2024.01.15"])).toBeNull();
  });
});
