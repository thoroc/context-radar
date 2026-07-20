import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../lib/sleep", () => ({ sleep: vi.fn(async () => {}) }));
vi.mock("./api", () => ({ api: vi.fn() }));
vi.mock("node:fs", () => ({ readFileSync: vi.fn() }));

import { readFileSync } from "node:fs";
import { api } from "./api";
import { run } from "./run";

const apiMock = vi.mocked(api);
const readMock = vi.mocked(readFileSync);

const marker = (id: string, upstream: string): string =>
  `<!-- freshness-tool: {"id":"${id}","upstream":"${upstream}"} -->`;

const report = {
  generatedOn: "2026-07-20",
  counts: { unparseable: 0, structuralSkip: 0, transientError: 0 },
  verdictMoving: [],
  observedOnly: [
    {
      id: "drifting",
      tool: "Drift",
      githubUrl: "https://github.com/x/drift",
      recorded: "v1.0.0",
      upstream: "v2.0.0",
      reason: "minor/patch drift v1.0.0 -> v2.0.0",
    },
  ],
  noDrift: [
    {
      id: "resolved",
      tool: "Resolved",
      githubUrl: "https://github.com/x/resolved",
      recorded: "v3.0.0",
      upstream: "v3.0.0",
      reason: "recorded v3.0.0 is current with v3.0.0",
    },
  ],
  unparseable: [],
  structuralSkip: [],
  transientError: [],
};

// #10 belongs to the now-current tool; #20 to a tool still drifting at its
// recorded upstream (so syncEntry leaves it "unchanged").
const issues = [
  { number: 10, state: "open", body: marker("resolved", "v3.0.0") },
  { number: 20, state: "open", body: marker("drifting", "v2.0.0") },
];

const patchedClosed = (issuePath: string): boolean =>
  apiMock.mock.calls.some(
    ([method, path, body]) =>
      method === "PATCH" &&
      path === issuePath &&
      (body as { state?: string } | undefined)?.state === "closed",
  );

beforeEach(() => {
  apiMock.mockReset();
  readMock.mockReset();
  process.env.GITHUB_TOKEN = "x";
  process.env.GITHUB_REPOSITORY = "o/r";
  readMock.mockReturnValue(JSON.stringify(report));
  apiMock.mockImplementation(async (method: string) =>
    method === "GET"
      ? { status: 200, json: issues }
      : { status: method === "POST" ? 201 : 200, json: null },
  );
});

describe("run (freshness-issue) resolved-issue closing", () => {
  test("closes the open issue for a tool now current with upstream", async () => {
    await run("report.json", false);
    expect(apiMock).toHaveBeenCalledWith("PATCH", "/repos/o/r/issues/10", {
      state: "closed",
      state_reason: "completed",
    });
  });

  test("leaves the issue for a still-drifting tool open", async () => {
    await run("report.json", false);
    expect(patchedClosed("/repos/o/r/issues/20")).toBe(false);
  });

  test("does not re-touch an already-closed resolved issue (respects a human close)", async () => {
    apiMock.mockImplementation(async (method: string) =>
      method === "GET"
        ? {
            status: 200,
            json: [
              { number: 10, state: "closed", body: marker("resolved", "v3.0.0") },
              { number: 20, state: "open", body: marker("drifting", "v2.0.0") },
            ],
          }
        : { status: 200, json: null },
    );
    await run("report.json", false);
    const touched10 = apiMock.mock.calls.some(
      ([method, path]) => method === "PATCH" && path === "/repos/o/r/issues/10",
    );
    expect(touched10).toBe(false);
  });
});
