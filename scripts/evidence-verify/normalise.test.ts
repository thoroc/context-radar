import { describe, expect, test } from "vitest";
import { normalise } from "./normalise";

describe("normalise", () => {
  test("strips leading comment markers and collapses whitespace", () => {
    expect(normalise("//! Reproducible harness\n//! loads a query file")).toBe(
      "Reproducible harness loads a query file",
    );
    expect(normalise("  #   a shell comment  ")).toBe("a shell comment");
    expect(normalise(" * jsdoc line\n * second")).toBe("jsdoc line second");
  });

  test("leaves code without comment markers intact bar whitespace", () => {
    expect(normalise("const x = 1;\n  const y = 2;")).toBe("const x = 1; const y = 2;");
  });
});
