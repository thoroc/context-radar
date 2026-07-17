import { describe, expect, test } from "vitest";
import { conflictClass } from "./conflict-class";

describe("conflictClass", () => {
  test("maps severity to a class", () => {
    expect(conflictClass("hard")).toBe("conf-hard");
    expect(conflictClass("stackable")).toBe("conf-none");
  });
});
