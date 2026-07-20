import { describe, expect, test } from "vitest";
import { driftEntries } from "./drift-entries";
import type { Entry, Report } from "./types";

const entry = (id: string): Entry => ({
  id,
  tool: id,
  githubUrl: `https://github.com/x/${id}`,
  upstream: "v2.0.0",
  reason: "drift",
});

const report = (verdictMoving: Entry[], observedOnly: Entry[]): Report => ({
  generatedOn: "2026-07-17",
  counts: {},
  verdictMoving,
  observedOnly,
  noDrift: [],
  unparseable: [],
  structuralSkip: [],
  transientError: [],
});

describe("driftEntries", () => {
  test("concatenates verdict-moving then observed-only", () => {
    const a = entry("a");
    const b = entry("b");
    expect(driftEntries(report([a], [b]))).toEqual([a, b]);
  });

  test("is empty when nothing has drifted", () => {
    expect(driftEntries(report([], []))).toEqual([]);
  });
});
