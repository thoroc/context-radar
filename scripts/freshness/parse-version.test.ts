import { describe, expect, test } from "vitest";
import { parseVersion } from "./parse-version";

describe("parseVersion", () => {
  test("parses semver tags, padding a missing patch to 0", () => {
    expect(parseVersion("v1.2.3")?.patch).toBe(3);
    expect(parseVersion("v6.10")?.patch).toBe(0);
    expect(parseVersion("v1.108.25")?.major).toBe(1);
  });

  test("returns null for date tags and monorepo tags rather than guessing", () => {
    expect(parseVersion("2024.01.15")).toBeNull();
    expect(parseVersion("pkg@1.2.3")).toBeNull();
  });
});
