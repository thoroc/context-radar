import { afterEach, describe, expect, test } from "vitest";
import { state } from "../state";
import { getConflicts } from "./get-conflicts";

afterEach(() => {
  state.sel = new Set();
});

describe("getConflicts", () => {
  test("flags a hard conflict when two mutually-exclusive shell tools are selected", () => {
    state.sel = new Set(["rtk", "sqz"]);
    const conflicts = getConflicts();
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts.some((c) => c.msg.includes("Shell tools"))).toBe(true);
  });

  test("no conflict for a single shell tool", () => {
    state.sel = new Set(["rtk"]);
    expect(getConflicts()).toHaveLength(0);
  });
});
