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
    // rtk is 79,399 stars; the total must read 79.4k, not 79.
    state.sel = new Set(["rtk"]);
    expect(totalStars()).toBe("79.4k");
  });
});
