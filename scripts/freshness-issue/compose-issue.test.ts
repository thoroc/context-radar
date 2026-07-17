import { describe, expect, test } from "vitest";
import { composeIssue } from "./compose-issue";
import type { Entry } from "./types";

const entry = (over: Partial<Entry> = {}): Entry => ({
  id: "t1",
  tool: "RTK",
  githubUrl: "https://github.com/rtk-ai/rtk",
  recorded: "v1.0.0",
  upstream: "v2.0.0",
  reason: "major jump v1.0.0 -> v2.0.0",
  ...over,
});

describe("composeIssue", () => {
  test("titles the issue with the recorded and upstream versions", () => {
    expect(composeIssue(entry()).title).toBe("Freshness: RTK v1.0.0 -> v2.0.0");
  });

  test("falls back to 'unrecorded' and 'unknown' when versions are absent", () => {
    expect(composeIssue(entry({ recorded: undefined, upstream: null })).title).toBe(
      "Freshness: RTK unrecorded -> unknown",
    );
  });

  test("embeds a machine-readable per-tool marker in the body", () => {
    expect(composeIssue(entry()).body).toContain(
      '<!-- freshness-tool: {"id":"t1","upstream":"v2.0.0"} -->',
    );
  });
});
