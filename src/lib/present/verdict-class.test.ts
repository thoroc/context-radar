import { describe, expect, test } from "vitest";
import { verdictClass } from "./verdict-class";

describe("verdictClass", () => {
  test("maps the decision to a class", () => {
    expect(verdictClass("best")).toBe("v-best");
    expect(verdictClass("drop")).toBe("v-drop");
  });
});
