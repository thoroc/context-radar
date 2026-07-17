import { describe, expect, test } from "vitest";
import { makeTool } from "../../test-support/make-tool";
import { COLUMNS } from "./columns";
import { toCsv } from "./to-csv";
import type { CsvDataset } from "./types";

const dataset: CsvDataset = {
  meta: { stars_verified: "2026-07-15" },
  tools: [makeTool()],
};

describe("toCsv", () => {
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

  test("stays in lock-step with the COLUMNS definition", () => {
    const [header] = toCsv(dataset).split("\n");
    expect(header?.split(",")).toHaveLength(COLUMNS.length);
  });
});
