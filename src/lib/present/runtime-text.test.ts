import { describe, expect, test } from "vitest";
import { runtimeText } from "./runtime-text";

describe("runtimeText", () => {
  test("prefers verbatim detail, else joins named languages, else a dash", () => {
    expect(runtimeText({ languages: ["none"], detail: "custom detail" })).toBe("custom detail");
    expect(runtimeText({ languages: ["rust"] })).toBe("Rust");
    expect(runtimeText({ languages: ["rust", "node", "none"] })).toBe("Rust + Node");
    expect(runtimeText({ languages: ["none"] })).toBe("-");
  });
});
