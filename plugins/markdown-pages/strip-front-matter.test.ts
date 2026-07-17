import { describe, expect, test } from "vitest";
import { stripFrontMatter } from "./strip-front-matter";

describe("stripFrontMatter", () => {
  test("removes a leading YAML front-matter block", () => {
    expect(stripFrontMatter("---\ntitle: X\n---\n# Body")).toBe("# Body");
  });

  test("leaves content without front-matter untouched", () => {
    expect(stripFrontMatter("# Body\nmore text")).toBe("# Body\nmore text");
  });
});
