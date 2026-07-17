import { describe, expect, test } from "vitest";
import { parseGithubRepo } from "./parse-github-repo";

describe("parseGithubRepo", () => {
  test("extracts owner and repo from a github.com URL", () => {
    expect(parseGithubRepo("https://github.com/rtk-ai/rtk")?.repo).toBe("rtk");
  });

  test("returns null for non-github URLs", () => {
    expect(parseGithubRepo("https://docs.anthropic.com/x")).toBeNull();
  });
});
