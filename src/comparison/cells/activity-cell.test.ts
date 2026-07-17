import { describe, expect, test } from "vitest";
import { makeTool } from "../../test-support/make-tool";
import { activityCell } from "./activity-cell";

describe("activityCell", () => {
  test("renders the band label and shows the trend only when present", () => {
    expect(
      activityCell(makeTool({ activityStatus: { band: "active", label: "Hyper" } })),
    ).toContain("Hyper");
    expect(activityCell(makeTool({ trend: 5 }))).toContain("▲ +5%");
    expect(activityCell(makeTool({ trend: null }))).not.toContain("trend");
  });
});
