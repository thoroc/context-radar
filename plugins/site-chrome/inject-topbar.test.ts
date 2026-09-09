import { describe, expect, test } from "vitest";
import { injectTopbar, TOPBAR_PLACEHOLDER } from "./inject-topbar";

const page = (body: string): string => `<!doctype html><html><body>${body}</body></html>`;

describe("injectTopbar", () => {
  test("replaces the placeholder with a bar carrying the page's active link", () => {
    const out = injectTopbar(page(TOPBAR_PLACEHOLDER), "/comparison.html");
    expect(out).toContain('data-chrome="v1"');
    expect(out).toContain('href="./comparison.html" class="active"');
    expect(out).not.toContain(TOPBAR_PLACEHOLDER);
  });

  test("gives the static entries the wordmark tag they have today", () => {
    expect(injectTopbar(page(TOPBAR_PLACEHOLDER), "/index.html")).toContain('class="tag"');
  });

  // The Risk review flagged exactly this: a marker-matching transform that
  // silently no-ops ships the page without a bar and the build stays green.
  // Since the hand-written markup is being deleted in the same change, a
  // no-op means no navigation at all, so it has to fail loudly.
  test("throws when the placeholder is missing rather than emitting a bar-less page", () => {
    expect(() => injectTopbar(page("<h1>no placeholder</h1>"), "/index.html")).toThrow(
      /placeholder/i,
    );
  });

  test("throws when the placeholder appears more than once", () => {
    const twice = page(`${TOPBAR_PLACEHOLDER}${TOPBAR_PLACEHOLDER}`);
    expect(() => injectTopbar(twice, "/index.html")).toThrow(/once/i);
  });
});
