import { describe, expect, test } from "vitest";
import { licenceWarns } from "./licence-warns";

describe("licenceWarns", () => {
  test("flags a known non-permissive SPDX identifier", () => {
    expect(licenceWarns({ spdx: "AGPL-3.0" })).toBe(true);
  });

  test("flags an explicit warning note", () => {
    expect(licenceWarns({ spdx: "MIT", warning: "no LICENSE file" })).toBe(true);
  });

  test("passes a permissive licence without warning", () => {
    expect(licenceWarns({ spdx: "MIT" })).toBe(false);
  });
});
