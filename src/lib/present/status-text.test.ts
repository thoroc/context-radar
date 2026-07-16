import { describe, expect, test } from "vitest";
import { statusText } from "./status-text";

describe("statusText", () => {
  test("prefixes the band emoji", () => {
    expect(statusText({ band: "active", label: "Hyper-active" })).toBe("🟢 Hyper-active");
  });
});
