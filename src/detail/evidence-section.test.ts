import { describe, expect, test } from "vitest";
import { makeTool } from "../test-support/make-tool";
import { evidenceSection } from "./evidence-section";

describe("evidenceSection", () => {
  test("returns an empty string when there is no evidence", () => {
    expect(evidenceSection(makeTool())).toBe("");
  });

  test("renders a labelled claim with its status and sources", () => {
    const html = evidenceSection(
      makeTool({
        activity: {
          evidence: {
            status: "confirmed",
            sources: [
              {
                url: "https://example.com/commit",
                quote: "does the thing",
                checkedOn: "2026-01-01",
                evidenceType: "source-code",
              },
            ],
          },
        },
      }),
    );
    expect(html).toContain("<h2>Evidence</h2>");
    expect(html).toContain("Activity");
    expect(html).toContain('class="ev-status ev-confirmed"');
    expect(html).toContain("Confirmed");
    expect(html).toContain("does the thing");
  });
});
