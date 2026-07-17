import { describe, expect, test } from "vitest";
import { runtimeChips } from "./runtime-chips";

describe("runtimeChips", () => {
  test("falls back to the detail text when there are no named languages", () => {
    expect(runtimeChips({ languages: ["none"], detail: "bundled binary" })).toContain(
      "bundled binary",
    );
  });

  test("falls back to an em rule when no named languages and no detail", () => {
    expect(runtimeChips({ languages: ["none"] })).toBe('<span class="rt">—</span>');
  });

  test("renders a chip for each named language", () => {
    const html = runtimeChips({ languages: ["rust", "python"] });
    expect(html.match(/class="rt"/g)).toHaveLength(2);
  });
});
