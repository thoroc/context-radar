import { describe, expect, test } from "bun:test";
import { COLUMNS, type CsvDataset, formatDisplayDate, toCsv } from "./columns";
import type { Tool } from "./schema";

const makeTool = (overrides: Partial<Tool> = {}): Tool => ({
  id: "t",
  tool: "Example",
  githubUrl: "https://example.com/example",
  layer: "Shell output",
  whatItDoes: "does a thing",
  conflict: { severity: "none", projects: [] },
  runtime: { languages: ["none"] },
  requirements: "none",
  licence: { spdx: "MIT" },
  stars: 1,
  trend: 0,
  activity: {},
  activityStatus: { band: "stable", label: "Stable" },
  verdict: { decision: "add", rationale: "" },
  decisionRule: "use it",
  ...overrides,
});

describe("formatDisplayDate", () => {
  test("renders an ISO date as a short display date", () => {
    expect(formatDisplayDate("2026-07-15")).toBe("15 Jul 2026");
    expect(formatDisplayDate("2026-01-05")).toBe("5 Jan 2026");
  });
});

describe("toCsv", () => {
  const dataset: CsvDataset = {
    meta: { stars_verified: "2026-07-15" },
    tools: [makeTool()],
  };

  test("emits the canonical header row with the snapshot date in the Stars column", () => {
    const [header] = toCsv(dataset).split("\n");
    expect(header).toBe(
      "Tool,GitHub URL,Layer,What it does,Conflict / Overlap,Runtime,Requirements,Licence," +
        "Stars (15 Jul 2026),Trend (30d),Activity (Issues / PRs),Activity Status,Verdict,Decision Rule",
    );
  });

  test("has one data row per tool and a trailing newline", () => {
    const csv = toCsv(dataset);
    expect(csv.endsWith("\n")).toBe(true);
    // header + one tool + trailing empty from the final newline
    expect(csv.split("\n")).toHaveLength(3);
  });

  test("RFC 4180 quotes cells containing commas or quotes", () => {
    const csv = toCsv({
      meta: { stars_verified: "2026-07-15" },
      tools: [makeTool({ whatItDoes: "a,b", decisionRule: 'say "hi"' })],
    });
    expect(csv).toContain('"a,b"');
    expect(csv).toContain('"say ""hi"""');
  });

  test("stays in lock-step with the COLUMNS definition", () => {
    const [header] = toCsv(dataset).split("\n");
    expect(header?.split(",")).toHaveLength(COLUMNS.length);
  });
});
