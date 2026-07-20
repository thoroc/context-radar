import { describe, expect, test } from "vitest";
import { resolvedIssueNumbers } from "./resolved-issue-numbers";
import type { Issue } from "./types";

const issue = (number: number, state: string): Issue => ({
  number,
  state,
  body: `<!-- freshness-tool: {"id":"t${number}","upstream":"v1.0.0"} -->`,
});

const byId = (pairs: Array<[string, Issue]>): Map<string, Issue> => new Map(pairs);

describe("resolvedIssueNumbers", () => {
  test("returns the numbers of open issues for confirmed-current tools", () => {
    const map = byId([
      ["a", issue(1, "open")],
      ["b", issue(2, "open")],
    ]);
    expect(resolvedIssueNumbers(map, ["a", "b"])).toEqual([1, 2]);
  });

  test("skips a tool whose issue is already closed (respects a human close)", () => {
    const map = byId([["a", issue(1, "closed")]]);
    expect(resolvedIssueNumbers(map, ["a"])).toEqual([]);
  });

  test("never closes on absence: an id with no tracked issue is ignored", () => {
    const map = byId([["a", issue(1, "open")]]);
    expect(resolvedIssueNumbers(map, ["ghost"])).toEqual([]);
  });

  test("closes only the resolved ids, leaving still-drifting issues open", () => {
    const map = byId([
      ["a", issue(1, "open")],
      ["b", issue(2, "open")],
    ]);
    // Only "a" is confirmed current; "b" is still drifting and absent here.
    expect(resolvedIssueNumbers(map, ["a"])).toEqual([1]);
  });

  test("is empty when nothing resolved", () => {
    expect(resolvedIssueNumbers(byId([["a", issue(1, "open")]]), [])).toEqual([]);
  });
});
