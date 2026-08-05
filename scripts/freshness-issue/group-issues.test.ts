import { describe, expect, test } from "vitest";
import { DIGEST_MARKER } from "./constants";
import { groupIssues } from "./group-issues";
import type { Issue } from "./types";

const marker = (id: string, upstream: string): string =>
  `<!-- freshness-tool: {"id":"${id}","upstream":"${upstream}"} -->`;

describe("groupIssues", () => {
  test("maps the newest issue per tool id", () => {
    const issues: Issue[] = [
      { number: 2, state: "open", body: marker("a", "v2.0.0") },
      { number: 1, state: "closed", body: marker("a", "v1.5.0") },
    ];
    const { byId } = groupIssues(issues);
    expect(byId.get("a")?.number).toBe(2);
  });

  test("collects legacy digest issues separately", () => {
    const issues: Issue[] = [{ number: 3, state: "open", body: `${DIGEST_MARKER} {} -->` }];
    const { byId, digests } = groupIssues(issues);
    expect(byId.size).toBe(0);
    expect(digests).toEqual(issues);
  });

  test("ignores issues with neither a tool marker nor a digest marker", () => {
    const issues: Issue[] = [{ number: 4, state: "open", body: "unrelated issue" }];
    const { byId, digests } = groupIssues(issues);
    expect(byId.size).toBe(0);
    expect(digests).toEqual([]);
  });
});
