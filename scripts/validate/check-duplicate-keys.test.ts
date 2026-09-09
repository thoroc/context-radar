import { describe, expect, test } from "vitest";
import { checkDuplicateKeys } from "./check-duplicate-keys";

describe("checkDuplicateKeys", () => {
  test("passes clean JSON", () => {
    expect(checkDuplicateKeys('{"a":1,"b":{"c":2}}', "store.json")).toEqual([]);
  });

  // The case this exists for: codeboarding's activity object carried
  // releasedOn twice, so a freshness update to 2026-09-06 was silently
  // overwritten by a stale 2026-07-13 that happened to come after it. Every
  // JSON parser keeps the last occurrence and reports nothing, so the record
  // contradicted itself and both the schema and the site accepted it.
  test("reports a duplicated key, naming it", () => {
    const errors = checkDuplicateKeys('{"activity":{"releasedOn":"a","releasedOn":"b"}}', "s.json");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/releasedOn/);
  });

  test("allows the same key name in sibling objects", () => {
    expect(checkDuplicateKeys('[{"id":1},{"id":2}]', "s.json")).toEqual([]);
  });

  test("allows a key whose value merely repeats the key name", () => {
    expect(checkDuplicateKeys('{"note":"note","other":"note"}', "s.json")).toEqual([]);
  });
});
