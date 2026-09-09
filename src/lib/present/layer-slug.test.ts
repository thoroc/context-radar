import { describe, expect, test } from "vitest";
import { layerSlug } from "./layer-slug";

describe("layerSlug", () => {
  test("lowercases and hyphenates", () => {
    expect(layerSlug("Code navigation")).toBe("code-navigation");
    expect(layerSlug("Shell output")).toBe("shell-output");
  });

  test("collapses runs of non-alphanumerics and trims leading/trailing separators", () => {
    expect(layerSlug("Static context injection (push model)")).toBe(
      "static-context-injection-push-model",
    );
    expect(layerSlug("  --Foo   Bar--  ")).toBe("foo-bar");
  });

  // The two conjunction spellings below both drop the connector, so a layer
  // differing from another only in `&` versus `+` would collide. That is
  // asserted here so the behaviour is deliberate and visible; the store-wide
  // guard against an actual collision lives in scripts/validate-data.ts,
  // because a unit test cannot see the whole layer set.
  test("drops meaning-bearing conjunctions, which is why a store-wide collision check exists", () => {
    expect(layerSlug("Codebase understanding & onboarding")).toBe(
      "codebase-understanding-onboarding",
    );
    expect(layerSlug("Response verbosity + memory compression")).toBe(
      "response-verbosity-memory-compression",
    );
    expect(layerSlug("A & B")).toBe(layerSlug("A + B"));
  });
});
