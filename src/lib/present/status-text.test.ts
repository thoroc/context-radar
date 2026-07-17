import { describe, expect, test } from "vitest";
import { statusText } from "./status-text";

describe("statusText", () => {
  test("returns the plain label with no emoji prefix", () => {
    expect(statusText({ band: "active", label: "Hyper-active" })).toBe("Hyper-active");
  });
});
