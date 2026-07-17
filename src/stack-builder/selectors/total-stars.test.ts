import { afterEach, describe, expect, test } from "vitest";
import { state } from "../state";
import { totalStars } from "./total-stars";

afterEach(() => {
  state.sel = new Set();
});

describe("totalStars", () => {
  test("dashes an empty selection and sums the digits otherwise", () => {
    expect(totalStars()).toBe("-");
    state.sel = new Set(["rtk"]);
    expect(totalStars()).toBe("71");
  });
});
