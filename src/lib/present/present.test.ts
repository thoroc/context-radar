import { describe, expect, test } from "bun:test";
import { conflictClass } from "./conflictClass";
import { conflictText } from "./conflictText";
import { licenceText } from "./licenceText";
import { runtimeText } from "./runtimeText";
import { starsText } from "./starsText";
import { statusClass } from "./statusClass";
import { statusText } from "./statusText";
import { toolSlug } from "./toolSlug";
import { trendText } from "./trendText";
import { verdictClass } from "./verdictClass";
import { verdictText } from "./verdictText";

describe("toolSlug", () => {
  test("lowercases and hyphenates", () => {
    expect(toolSlug("RTK")).toBe("rtk");
    expect(toolSlug("Claude Code!")).toBe("claude-code");
  });

  test("collapses runs of non-alphanumerics and trims leading/trailing separators", () => {
    expect(toolSlug("  --Foo   Bar--  ")).toBe("foo-bar");
    expect(toolSlug("a/b_c.d")).toBe("a-b-c-d");
  });
});

describe("starsText", () => {
  test("renders a dash for null, otherwise the number", () => {
    expect(starsText(null)).toBe("—");
    expect(starsText(0)).toBe("0");
    expect(starsText(1234)).toBe("1234");
  });
});

describe("trendText", () => {
  test("distinguishes null, flat, up, and down", () => {
    expect(trendText(null)).toBe("—");
    expect(trendText(0)).toBe("● flat");
    expect(trendText(5)).toBe("▲ +5%");
    expect(trendText(-3)).toBe("▼ -3%");
  });
});

describe("statusText / statusClass", () => {
  test("prefixes the band emoji and maps the band to a class", () => {
    expect(statusText({ band: "active", label: "Hyper-active" })).toBe("🟢 Hyper-active");
    expect(statusClass("active")).toBe("a-hyper");
    expect(statusClass("dormant")).toBe("a-dead");
  });
});

describe("verdictText / verdictClass", () => {
  test("appends the rationale only when present", () => {
    expect(verdictText({ decision: "add", rationale: "" })).toBe("Add");
    expect(verdictText({ decision: "best", rationale: "fast and stable" })).toBe(
      "Best in class — fast and stable",
    );
    expect(verdictClass("best")).toBe("v-best");
    expect(verdictClass("drop")).toBe("v-drop");
  });
});

describe("conflictText / conflictClass", () => {
  test("returns the verbatim note when set, before anything else", () => {
    expect(
      conflictText({ severity: "hard", projects: ["a", "b"], note: "custom explanation" }),
    ).toBe("custom explanation");
  });

  test("renders a dash for none and a labelled list otherwise", () => {
    expect(conflictText({ severity: "none", projects: [] })).toBe("—");
    expect(conflictText({ severity: "hard", projects: ["x", "y"] })).toBe("⛔ HARD: x, y");
    expect(conflictText({ severity: "soft", projects: [] })).toBe("⚠ SOFT");
  });

  test("maps severity to a class", () => {
    expect(conflictClass("hard")).toBe("conf-hard");
    expect(conflictClass("stackable")).toBe("conf-none");
  });
});

describe("runtimeText", () => {
  test("prefers verbatim detail, else joins named languages, else a dash", () => {
    expect(runtimeText({ languages: ["none"], detail: "custom detail" })).toBe("custom detail");
    expect(runtimeText({ languages: ["rust"] })).toBe("Rust");
    expect(runtimeText({ languages: ["rust", "node", "none"] })).toBe("Rust + Node");
    expect(runtimeText({ languages: ["none"] })).toBe("—");
  });
});

describe("licenceText", () => {
  test("returns the SPDX identifier", () => {
    expect(licenceText({ spdx: "MIT" })).toBe("MIT");
  });
});
