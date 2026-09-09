import { describe, expect, test } from "vitest";
import { slugMap } from "./slug-map";

const slug = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

describe("slugMap", () => {
  test("maps each name to its slug", () => {
    const map = slugMap(["RTK", "Claude Mem"], (n) => n, slug, "tool");
    expect(map.get("RTK")).toBe("rtk");
    expect(map.get("Claude Mem")).toBe("claude-mem");
  });

  // Two names collapsing to one slug means one page silently overwrites the
  // other in the build output, with no error anywhere. Both the tool and the
  // layer page generators depend on this not happening.
  test("throws on a collision, naming both sides and the slug", () => {
    // Asserted independently of argument order: the message names whichever
    // side is reached second first, and that ordering is not the contract.
    let message = "";
    try {
      slugMap(["A & B", "A + B"], (n) => n, slug, "layer");
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain("layer");
    expect(message).toContain("A & B");
    expect(message).toContain("A + B");
    expect(message).toContain("a-b");
  });

  test("is empty for an empty input", () => {
    expect(slugMap([], (n: string) => n, slug, "tool").size).toBe(0);
  });
});
