import { afterEach, describe, expect, test } from "vitest";
import { state } from "../state";
import { totalStars } from "./total-stars";

afterEach(() => {
  state.sel = new Set();
});

describe("totalStars", () => {
  test("dashes an empty selection", () => {
    expect(totalStars()).toBe("-");
  });

  test("compacts the running total of numeric star counts", () => {
    // rtk is 71,000 stars; the total must read 71k, not 71.
    state.sel = new Set(["rtk"]);
    expect(totalStars()).toBe("71k");
  });
});
