import { describe, expect, test } from "vitest";
import { NAV_LINKS } from "./nav-links";

describe("NAV_LINKS", () => {
  test("names every top-level destination once", () => {
    expect(NAV_LINKS.map((l) => l.label)).toEqual([
      "Home",
      "Comparison",
      "Stack builder",
      "Methodology",
      "Glossary",
    ]);
  });

  // renderTopbar prefixes each href with the caller's base, so a leading "./"
  // or "/" here would produce "././index.html" on root pages and an absolute
  // path on nested ones, breaking the project-pages subpath the whole site is
  // built for (vite.config.ts sets `base: "./"` for exactly that reason).
  test("hrefs are base-relative, carrying no leading separator", () => {
    for (const link of NAV_LINKS) {
      expect(link.href).not.toMatch(/^[./]/);
      expect(link.href).toMatch(/^[a-z-]+\.html$/);
    }
  });

  test("hrefs are unique", () => {
    expect(new Set(NAV_LINKS.map((l) => l.href)).size).toBe(NAV_LINKS.length);
  });
});
