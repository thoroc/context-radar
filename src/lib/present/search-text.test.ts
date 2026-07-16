import { describe, expect, test } from "vitest";
import { makeTool } from "../../test-support/make-tool";
import { searchText } from "./search-text";

describe("searchText", () => {
  test("is a lowercased haystack of the record's human-readable values", () => {
    const t = makeTool({
      tool: "RTK",
      whatItDoes: "Compresses OUTPUT",
      decisionRule: "Use It",
    });
    const s = searchText(t);
    expect(s).toBe(s.toLowerCase());
    expect(s).toContain("rtk");
    expect(s).toContain("compresses output");
    expect(s).toContain("use it");
  });

  test("folds optional activity and licence fields in when present", () => {
    const s = searchText(
      makeTool({
        licence: { spdx: "MIT", warning: "no LICENSE file" },
        activity: { notes: "busy repo", latestVersion: "v9.9" },
      }),
    );
    expect(s).toContain("no license file");
    expect(s).toContain("busy repo");
    expect(s).toContain("v9.9");
  });
});
