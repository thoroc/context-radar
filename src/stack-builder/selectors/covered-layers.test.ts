import { afterEach, describe, expect, test } from "vitest";
import { state } from "../state";
import { coveredLayers } from "./covered-layers";

afterEach(() => {
  state.sel = new Set();
});

describe("coveredLayers", () => {
  test("counts distinct layers with a selected tool", () => {
    expect(coveredLayers()).toBe(0);
    state.sel = new Set(["rtk", "sigmap"]); // shell + static-injection layers
    expect(coveredLayers()).toBe(2);
  });
});
