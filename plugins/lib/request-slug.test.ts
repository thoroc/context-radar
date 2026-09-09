import { describe, expect, test } from "vitest";
import { requestSlug } from "./request-slug";

describe("requestSlug", () => {
  test("extracts the slug from a request under the output directory", () => {
    expect(requestSlug("/tools/rtk.html", "tools")).toBe("rtk");
    expect(requestSlug("/layers/code-navigation.html", "layers")).toBe("code-navigation");
  });

  test("ignores a query string", () => {
    expect(requestSlug("/layers/code-navigation.html?x=1", "layers")).toBe("code-navigation");
  });

  test("returns null for anything outside the directory or not an html file", () => {
    expect(requestSlug("/comparison.html", "layers")).toBeNull();
    expect(requestSlug("/layers/code-navigation", "layers")).toBeNull();
    expect(requestSlug(undefined, "layers")).toBeNull();
  });

  // The index sits beside the directory, not inside it, so it has to be routed
  // separately in dev. Asserted here because the mismatch only shows up under
  // `vite dev` and a build-only check cannot catch it.
  test("does not match the directory's own index page", () => {
    expect(requestSlug("/layers.html", "layers")).toBeNull();
  });
});
