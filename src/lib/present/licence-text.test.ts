import { describe, expect, test } from "vitest";
import { licenceText } from "./licence-text";

describe("licenceText", () => {
  test("returns the SPDX identifier", () => {
    expect(licenceText({ spdx: "MIT" })).toBe("MIT");
  });
});
