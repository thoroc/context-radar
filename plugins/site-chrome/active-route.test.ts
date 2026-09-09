import { describe, expect, test } from "vitest";
import { activeRoute } from "./active-route";

describe("activeRoute", () => {
  test("reduces a transform context path to a bare nav href", () => {
    expect(activeRoute("/index.html")).toBe("index.html");
    expect(activeRoute("/comparison.html")).toBe("comparison.html");
    expect(activeRoute("/stack-builder.html")).toBe("stack-builder.html");
  });

  test("handles an absolute filesystem path, which is what the build passes", () => {
    expect(activeRoute("/Users/someone/context-radar/src/comparison.html")).toBe("comparison.html");
  });

  test("ignores a query string or hash", () => {
    expect(activeRoute("/comparison.html?v=2")).toBe("comparison.html");
    expect(activeRoute("/comparison.html#top")).toBe("comparison.html");
  });

  test("treats a bare directory request as the index", () => {
    expect(activeRoute("/")).toBe("index.html");
    expect(activeRoute("")).toBe("index.html");
  });
});
