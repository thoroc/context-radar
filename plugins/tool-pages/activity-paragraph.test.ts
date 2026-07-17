import { describe, expect, test } from "vitest";
import { makeTool } from "../../src/test-support/make-tool";
import { activityParagraph } from "./activity-paragraph";

describe("activityParagraph", () => {
  test("falls back when there are no activity notes or facts", () => {
    expect(activityParagraph(makeTool({ activity: {} }))).toBe("<p>No activity notes.</p>");
  });

  test("renders notes and a joined facts line", () => {
    const html = activityParagraph(
      makeTool({ activity: { notes: "Steady", contributors: 3, releaseCount: 12 } }),
    );
    expect(html).toContain("<p>Steady</p>");
    expect(html).toContain("<p>3 contributors, 12 releases</p>");
  });

  test("escapes free-text facts", () => {
    const html = activityParagraph(makeTool({ activity: { latestVersion: "v1 & v2" } }));
    expect(html).toContain("latest v1 &amp; v2");
  });
});
