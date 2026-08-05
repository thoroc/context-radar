import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Entry, Issue } from "./types";

vi.mock("../lib/sleep", () => ({ sleep: vi.fn(async () => {}) }));
vi.mock("./api", () => ({ api: vi.fn() }));

import { api } from "./api";
import { syncDrift } from "./sync-drift";

const apiMock = vi.mocked(api);

const entry = (id: string): Entry => ({
  id,
  tool: id,
  githubUrl: `https://github.com/x/${id}`,
  upstream: "v2.0.0",
  reason: "drift",
  bucket: "observed-only",
});

beforeEach(() => apiMock.mockReset());

describe("syncDrift", () => {
  test("tallies opened, updated, and failed outcomes across every drift entry", async () => {
    // Entries are processed in order, so each call matches a: POST, b: PATCH, c: PATCH.
    apiMock
      .mockResolvedValueOnce({ status: 201, json: null })
      .mockResolvedValueOnce({ status: 200, json: null })
      .mockResolvedValueOnce({ status: 500, json: null });
    const byId = new Map<string, Issue>([
      [
        "b",
        {
          number: 1,
          state: "open",
          body: '<!-- freshness-tool: {"id":"b","upstream":"v1.0.0"} -->',
        },
      ],
      [
        "c",
        {
          number: 2,
          state: "open",
          body: '<!-- freshness-tool: {"id":"c","upstream":"v1.0.0"} -->',
        },
      ],
    ]);
    const counts = await syncDrift("o", "r", [entry("a"), entry("b"), entry("c")], byId);
    expect(counts.opened).toBe(1);
    expect(counts.updated).toBe(1);
    expect(counts.failed).toEqual(["c (update HTTP 500)"]);
  });

  test("is a no-op tally when there is nothing to sync", async () => {
    expect(await syncDrift("o", "r", [], new Map())).toEqual({
      opened: 0,
      updated: 0,
      relabeled: 0,
      unchanged: 0,
      failed: [],
    });
    expect(apiMock).not.toHaveBeenCalled();
  });
});
