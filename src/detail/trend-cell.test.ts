import { describe, expect, test } from "vitest";
import { trendCell } from "./trend-cell";

describe("trendCell", () => {
  test("renders nothing for a null trend", () => {
    expect(trendCell(null)).toBe("");
  });

  test("marks a positive trend as up", () => {
    expect(trendCell(120)).toContain('class="trend-up"');
  });

  test("marks a negative trend as down", () => {
    expect(trendCell(-30)).toContain('class="trend-down"');
  });

  test("marks a zero trend as flat", () => {
    expect(trendCell(0)).toContain('class="trend-flat"');
  });
});
