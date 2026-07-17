import { describe, expect, test } from "vitest";
import { statusClass } from "./status-class";

describe("statusClass", () => {
  test("maps the band to a class", () => {
    expect(statusClass("active")).toBe("a-hyper");
    expect(statusClass("dormant")).toBe("a-dead");
  });
});
