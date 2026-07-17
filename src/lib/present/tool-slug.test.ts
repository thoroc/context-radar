import { describe, expect, test } from "vitest";
import { toolSlug } from "./tool-slug";

describe("toolSlug", () => {
  test("lowercases and hyphenates", () => {
    expect(toolSlug("RTK")).toBe("rtk");
    expect(toolSlug("Claude Code!")).toBe("claude-code");
  });

  test("collapses runs of non-alphanumerics and trims leading/trailing separators", () => {
    expect(toolSlug("  --Foo   Bar--  ")).toBe("foo-bar");
    expect(toolSlug("a/b_c.d")).toBe("a-b-c-d");
  });
});
