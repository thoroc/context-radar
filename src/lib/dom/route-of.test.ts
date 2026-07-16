import { describe, expect, test } from "vitest";
import { routeOf } from "./route-of";

describe("routeOf", () => {
  test("strips a leading ./ or / and tolerates null", () => {
    expect(routeOf("./methodology.html")).toBe("methodology.html");
    expect(routeOf("/glossary.html")).toBe("glossary.html");
    expect(routeOf("plain")).toBe("plain");
    expect(routeOf(null)).toBe("");
  });
});
