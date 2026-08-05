import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Issue } from "./types";

vi.mock("../lib/sleep", () => ({ sleep: vi.fn(async () => {}) }));
vi.mock("./api", () => ({ api: vi.fn() }));

import { api } from "./api";
import { closeResolved } from "./close-resolved";

const apiMock = vi.mocked(api);

const issue = (number: number, state: string): Issue => ({
  number,
  state,
  body: `<!-- freshness-tool: {"id":"t${number}","upstream":"v1.0.0"} -->`,
});

beforeEach(() => apiMock.mockReset());

describe("closeResolved", () => {
  test("closes each open issue confirmed current with upstream", async () => {
    apiMock.mockResolvedValue({ status: 200, json: null });
    const byId = new Map([["a", issue(1, "open")]]);
    expect(await closeResolved("o", "r", byId, ["a"])).toBe(1);
    expect(apiMock).toHaveBeenCalledWith("PATCH", "/repos/o/r/issues/1", {
      state: "closed",
      state_reason: "completed",
    });
  });

  test("leaves an already-closed resolved issue untouched", async () => {
    const byId = new Map([["a", issue(1, "closed")]]);
    expect(await closeResolved("o", "r", byId, ["a"])).toBe(0);
    expect(apiMock).not.toHaveBeenCalled();
  });
});
