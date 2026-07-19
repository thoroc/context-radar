import { beforeEach, describe, expect, test, vi } from "vitest";
import { composeIssue } from "./compose-issue";
import type { Entry, Issue } from "./types";

vi.mock("../lib/sleep", () => ({ sleep: vi.fn(async () => {}) }));
vi.mock("./api", () => ({ api: vi.fn() }));

import { api } from "./api";
import { syncEntry } from "./sync-entry";

const apiMock = vi.mocked(api);

const entry: Entry = {
  id: "t1",
  tool: "RTK",
  githubUrl: "https://github.com/rtk-ai/rtk",
  recorded: "v1.0.0",
  upstream: "v2.0.0",
  reason: "major jump",
};

/** An existing issue carrying the marker for `entry` at the given upstream. */
const issueFor = (upstream: string, state = "open"): Issue => ({
  number: 7,
  state,
  body: composeIssue({ ...entry, upstream }).body,
});

beforeEach(() => apiMock.mockReset());

describe("syncEntry", () => {
  test("leaves an issue whose recorded upstream is unchanged (respects a human close)", async () => {
    expect(await syncEntry("o", "r", entry, issueFor("v2.0.0", "closed"))).toBe("unchanged");
    expect(apiMock).not.toHaveBeenCalled();
  });

  test("patches an open issue whose upstream moved", async () => {
    apiMock.mockResolvedValue({ status: 200 } as Awaited<ReturnType<typeof api>>);
    expect(await syncEntry("o", "r", entry, issueFor("v1.5.0"))).toBe("updated");
    expect(apiMock).toHaveBeenCalledWith("PATCH", "/repos/o/r/issues/7", expect.any(Object));
  });

  test("reports a failed update", async () => {
    apiMock.mockResolvedValue({ status: 500 } as Awaited<ReturnType<typeof api>>);
    expect(await syncEntry("o", "r", entry, issueFor("v1.5.0"))).toEqual({
      failed: "t1 (update HTTP 500)",
    });
  });

  test("opens a fresh issue when none exists", async () => {
    apiMock.mockResolvedValue({ status: 201 } as Awaited<ReturnType<typeof api>>);
    expect(await syncEntry("o", "r", entry, undefined)).toBe("opened");
    expect(apiMock).toHaveBeenCalledWith("POST", "/repos/o/r/issues", expect.any(Object));
  });

  test("opens a fresh issue when the prior one is closed and upstream moved again", async () => {
    apiMock.mockResolvedValue({ status: 201 } as Awaited<ReturnType<typeof api>>);
    expect(await syncEntry("o", "r", entry, issueFor("v1.5.0", "closed"))).toBe("opened");
    expect(apiMock).toHaveBeenCalledWith("POST", "/repos/o/r/issues", expect.any(Object));
  });

  test("reports a failed create", async () => {
    apiMock.mockResolvedValue({ status: 422 } as Awaited<ReturnType<typeof api>>);
    expect(await syncEntry("o", "r", entry, undefined)).toEqual({ failed: "t1 (create HTTP 422)" });
  });
});
