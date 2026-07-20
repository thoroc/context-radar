import { describe, expect, test } from "vitest";
import { licenceWarns } from "./licence-warns";

describe("licenceWarns", () => {
  test("flags a non-permissive spdx", () => {
    expect(licenceWarns({ spdx: "AGPL-3.0" })).toBe(true);
  });

  test("flags any licence carrying a warning", () => {
    expect(licenceWarns({ spdx: "MIT", warning: "no LICENSE file" })).toBe(true);
  });

  test("passes a plain permissive licence", () => {
    expect(licenceWarns({ spdx: "MIT" })).toBe(false);
  });
});
