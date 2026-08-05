import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Issue } from "./types";

vi.mock("../lib/sleep", () => ({ sleep: vi.fn(async () => {}) }));
vi.mock("./api", () => ({ api: vi.fn() }));

import { api } from "./api";
import { closeLegacyDigests } from "./close-legacy-digests";

const apiMock = vi.mocked(api);

beforeEach(() => apiMock.mockReset());

describe("closeLegacyDigests", () => {
  test("closes an open legacy digest as not_planned", async () => {
    apiMock.mockResolvedValue({ status: 200, json: null });
    const digest: Issue = { number: 5, state: "open", body: "<!-- freshness-state: {} -->" };
    expect(await closeLegacyDigests("o", "r", [digest])).toBe(1);
    expect(apiMock).toHaveBeenCalledWith("PATCH", "/repos/o/r/issues/5", {
      state: "closed",
      state_reason: "not_planned",
    });
  });

  test("skips a digest that is already closed", async () => {
    const digest: Issue = { number: 5, state: "closed", body: "<!-- freshness-state: {} -->" };
    expect(await closeLegacyDigests("o", "r", [digest])).toBe(0);
    expect(apiMock).not.toHaveBeenCalled();
  });
});
