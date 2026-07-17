import { describe, expect, test } from "vitest";
import { requestPath } from "./request-path";

describe("requestPath", () => {
  test("strips the query string and the leading slash", () => {
    expect(requestPath("/context-reduction-tools.csv?v=1")).toBe("context-reduction-tools.csv");
    expect(requestPath("/tools/rtk.html")).toBe("tools/rtk.html");
    expect(requestPath("plain")).toBe("plain");
    expect(requestPath(undefined)).toBe("");
  });
});
