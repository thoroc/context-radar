import { describe, expect, test } from "vitest";
import { requestSlug } from "./request-slug";

describe("requestSlug", () => {
  test("extracts the slug from a matching path", () => {
    expect(requestSlug("/tools/rtk.html", "tools")).toBe("rtk");
  });

  test("strips a query string before matching", () => {
    expect(requestSlug("/tools/rtk.html?v=1", "tools")).toBe("rtk");
  });

  test("returns null for a path outside the output directory", () => {
    expect(requestSlug("/comparison.html", "tools")).toBeNull();
  });

  test("returns null for a non-html path", () => {
    expect(requestSlug("/tools/rtk.json", "tools")).toBeNull();
  });

  test("returns null for an undefined url", () => {
    expect(requestSlug(undefined, "tools")).toBeNull();
  });
});
