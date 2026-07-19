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

  test("scales k-suffixed counts into the running total", () => {
    // rtk is 71k stars; the total must read 71.0k, not 71.
    state.sel = new Set(["rtk"]);
    expect(totalStars()).toBe("71.0k");
  });
});
