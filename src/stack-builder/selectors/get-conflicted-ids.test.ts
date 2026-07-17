import { afterEach, describe, expect, test } from "vitest";
import { state } from "../state";
import { getConflictedIds } from "./get-conflicted-ids";

afterEach(() => {
  state.sel = new Set();
});

describe("getConflictedIds", () => {
  test("returns the selected ids that participate in a conflict", () => {
    state.sel = new Set(["rtk", "sqz"]);
    expect(getConflictedIds()).toEqual(new Set(["rtk", "sqz"]));
  });

  test("is empty when there is no conflict", () => {
    state.sel = new Set(["rtk"]);
    expect(getConflictedIds().size).toBe(0);
  });
});
