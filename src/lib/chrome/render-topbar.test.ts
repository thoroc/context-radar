import { describe, expect, test } from "vitest";
import { NAV_LINKS } from "./nav-links";
import { renderTopbar } from "./render-topbar";

const occurrences = (html: string, needle: string): number => html.split(needle).length - 1;

describe("renderTopbar", () => {
  test("stamps the provenance attribute exactly once", () => {
    // Phase 0's success marker greps for this. It exists because the obvious
    // marker -- counting `class="topbar"` -- returns 1 on every page before the
    // extraction too, so it cannot tell a refactored page from an untouched one.
    expect(
      occurrences(renderTopbar({ base: "./", active: "index.html" }), 'data-chrome="v1"'),
    ).toBe(1);
  });

  test("prefixes every nav href and the brand link with the caller's base", () => {
    const nested = renderTopbar({ base: "../", active: "comparison.html" });
    for (const link of NAV_LINKS) {
      expect(nested).toContain(`href="../${link.href}"`);
    }
    expect(nested).toContain('class="brand" href="../index.html"');
    expect(nested).not.toContain('href="./');
  });

  test("marks exactly one nav link active, and only the matching one", () => {
    const html = renderTopbar({ base: "./", active: "stack-builder.html" });
    expect(occurrences(html, 'class="active"')).toBe(1);
    expect(html).toContain('href="./stack-builder.html" class="active"');
  });

  // Tool and layer pages pass an `active` that is not in NAV_LINKS. They should
  // render a bar with nothing highlighted rather than throwing or guessing.
  test("highlights nothing when the active route is not a nav destination", () => {
    const html = renderTopbar({ base: "../", active: "tools/rtk.html" });
    expect(occurrences(html, 'class="active"')).toBe(0);
    expect(occurrences(html, 'data-chrome="v1"')).toBe(1);
  });

  test("renders the wordmark tag only when asked", () => {
    expect(renderTopbar({ base: "./", active: "index.html", tag: true })).toContain(
      '<span class="tag">Context reduction tools</span>',
    );
    expect(renderTopbar({ base: "./", active: "index.html" })).not.toContain('class="tag"');
  });

  test("always renders the theme toggle, which generated pages never had", () => {
    for (const base of ["./", "../"]) {
      expect(renderTopbar({ base, active: "index.html" })).toContain('id="theme-toggle"');
    }
  });

  // The success marker requires the emitted bar to be byte-identical across all
  // five pages once base, active and tag are normalised away. Asserting it here
  // means a future edit that special-cases one call site fails a test rather
  // than only failing a grep someone has to remember to run.
  test("is byte-identical across call sites once base, active and tag are normalised", () => {
    const normalise = (html: string): string =>
      html
        .replaceAll('href="../', 'href="B')
        .replaceAll('href="./', 'href="B')
        .replace(' class="active"', "")
        // Strip the tag with its own leading newline and indent, not just the
        // element: leaving the whitespace behind would make every tagged bar
        // differ from every untagged one and the assertion would pass or fail
        // on indentation rather than on the markup contract.
        .replace('\n        <span class="tag">Context reduction tools</span>', "");
    const variants = [
      renderTopbar({ base: "./", active: "index.html", tag: true }),
      renderTopbar({ base: "./", active: "comparison.html", tag: true }),
      renderTopbar({ base: "./", active: "methodology.html" }),
      renderTopbar({ base: "../", active: "tools/rtk.html" }),
    ].map(normalise);
    expect(new Set(variants).size).toBe(1);
  });
});
