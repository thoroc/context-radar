import { describe, expect, test } from "vitest";
import { nextSelection } from "./next-selection";

const layer = ["a", "b", "c"];

describe("nextSelection", () => {
  test("pick-one selects a tool and clears the layer's others (radio)", () => {
    const next = nextSelection(new Set(["a", "x"]), layer, "b", "pick-one");
    expect([...next].sort()).toEqual(["b", "x"]);
  });

  test("pick-one re-clicking the current pick clears the layer", () => {
    const next = nextSelection(new Set(["a", "x"]), layer, "a", "pick-one");
    expect([...next]).toEqual(["x"]);
  });

  test("stackable toggles a single tool without touching others", () => {
    expect([...nextSelection(new Set(["a"]), layer, "b", "stackable")].sort()).toEqual(["a", "b"]);
    expect([...nextSelection(new Set(["a", "b"]), layer, "b", "stackable")]).toEqual(["a"]);
  });

  test("install-both toggles like stackable", () => {
    expect([...nextSelection(new Set(), layer, "a", "install-both")]).toEqual(["a"]);
  });

  test("reference layers are not selectable", () => {
    const current = new Set(["a"]);
    expect([...nextSelection(current, layer, "b", "reference")]).toEqual(["a"]);
  });
});
