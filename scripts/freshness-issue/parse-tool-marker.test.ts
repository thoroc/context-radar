import { describe, expect, test } from "vitest";
import { composeIssue } from "./compose-issue";
import { parseToolMarker } from "./parse-tool-marker";
import type { Entry } from "./types";

describe("parseToolMarker", () => {
  test("round-trips the marker that composeIssue embeds", () => {
    const e: Entry = {
      id: "t1",
      tool: "RTK",
      githubUrl: "https://github.com/rtk-ai/rtk",
      recorded: "v1.0.0",
      upstream: "v2.0.0",
      reason: "major jump",
    };
    expect(parseToolMarker(composeIssue(e).body)).toEqual({ id: "t1", upstream: "v2.0.0" });
  });

  test("returns null when there is no marker or the JSON is malformed", () => {
    expect(parseToolMarker("just a plain body")).toBeNull();
    expect(parseToolMarker("<!-- freshness-tool: not json -->")).toBeNull();
  });
});
