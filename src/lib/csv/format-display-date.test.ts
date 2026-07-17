import { describe, expect, test } from "vitest";
import { formatDisplayDate } from "./format-display-date";

describe("formatDisplayDate", () => {
  test("renders an ISO date as a short display date", () => {
    expect(formatDisplayDate("2026-07-15")).toBe("15 Jul 2026");
    expect(formatDisplayDate("2026-01-05")).toBe("5 Jan 2026");
  });
});
