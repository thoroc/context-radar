import { describe, expect, test } from "vitest";
import { parsePermalink } from "./parse-permalink";

const sha = "f14b3bb5d70256211d094aced9a48c7018355dd5";

describe("parsePermalink", () => {
  test("maps a GitHub blob permalink to raw.githubusercontent.com", () => {
    expect(parsePermalink(`https://github.com/o/r/blob/${sha}/src/a.rs#L1-L6`)).toEqual({
      rawUrl: `https://raw.githubusercontent.com/o/r/${sha}/src/a.rs`,
      startLine: 1,
      endLine: 6,
    });
  });

  test("maps GitLab and Codeberg permalinks to their raw forms", () => {
    expect(parsePermalink(`https://gitlab.com/g/sub/r/-/blob/${sha}/a.ts#L42`)?.rawUrl).toBe(
      `https://gitlab.com/g/sub/r/-/raw/${sha}/a.ts`,
    );
    expect(parsePermalink(`https://codeberg.org/o/r/src/commit/${sha}/a.go#L5`)?.rawUrl).toBe(
      `https://codeberg.org/o/r/raw/commit/${sha}/a.go`,
    );
  });

  test("defaults a single-line anchor's end to its start", () => {
    const parsed = parsePermalink(`https://github.com/o/r/blob/${sha}/a.rs#L42`);
    expect(parsed?.startLine).toBe(42);
    expect(parsed?.endLine).toBe(42);
  });

  test("returns null for a branch ref, a missing anchor, or an inverted range", () => {
    expect(parsePermalink("https://github.com/o/r/blob/main/a.rs#L1")).toBeNull();
    expect(parsePermalink(`https://github.com/o/r/blob/${sha}/a.rs`)).toBeNull();
    expect(parsePermalink(`https://github.com/o/r/blob/${sha}/a.rs#L9-L2`)).toBeNull();
  });
});
