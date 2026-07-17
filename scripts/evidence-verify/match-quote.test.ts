import { describe, expect, test } from "vitest";
import { matchQuote } from "./match-quote";

const file = [
  "//! Reproducible benchmark harness.",
  "//! Loads a query file (TOML).",
  "fn main() {}",
].join("\n");

describe("matchQuote", () => {
  test("matches a quote present in the cited range, ignoring comment markers", () => {
    expect(matchQuote("Reproducible benchmark harness.", file, 1, 2).ok).toBe(true);
    expect(matchQuote("Loads a query file (TOML).", file, 1, 2).ok).toBe(true);
  });

  test("fails when the quote is not in the cited range", () => {
    const r = matchQuote("something never written", file, 1, 2);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/not found/);
  });

  test("fails when the quote is outside the cited lines", () => {
    // The 'fn main' text is on line 3, but we cite only lines 1-2.
    expect(matchQuote("fn main", file, 1, 2).ok).toBe(false);
  });

  test("fails on an out-of-bounds range or an empty quote", () => {
    expect(matchQuote("x", file, 1, 99).ok).toBe(false);
    expect(matchQuote("   ", file, 1, 2).ok).toBe(false);
  });
});
