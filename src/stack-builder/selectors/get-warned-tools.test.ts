import { afterEach, describe, expect, test } from "vitest";
import { state } from "../state";
import { getWarnedTools } from "./get-warned-tools";

afterEach(() => {
  state.sel = new Set();
});

describe("getWarnedTools", () => {
  test("returns only selected tools that need external infra", () => {
    state.sel = new Set(["token-optimizer-mcp", "rtk"]);
    const warned = getWarnedTools().map((t) => t.id);
    expect(warned).toContain("token-optimizer-mcp");
    expect(warned).not.toContain("rtk");
  });
});
