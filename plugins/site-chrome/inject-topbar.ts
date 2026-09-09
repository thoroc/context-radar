import { renderTopbar } from "../../src/lib/chrome";
import { activeRoute } from "./active-route";

/** The marker the three static HTML entries carry in place of a hand-written bar. */
export const TOPBAR_PLACEHOLDER = "<!-- topbar -->";

/**
 * Swaps the placeholder in a static entry for the shared top bar.
 *
 * Refuses to return unchanged HTML. A transform that quietly no-ops when its
 * marker does not match is the failure mode this phase is most exposed to: the
 * hand-written markup is deleted in the same change, so a missed placeholder
 * means a page with no navigation and a build that still reports success.
 * Throwing turns that into a build failure with the offending path named.
 */
export const injectTopbar = (html: string, path: string): string => {
  const count = html.split(TOPBAR_PLACEHOLDER).length - 1;
  if (count === 0) {
    throw new Error(
      `context-radar: ${path} has no ${TOPBAR_PLACEHOLDER} placeholder, so it would ship with no ` +
        "top bar. Add the placeholder where the bar belongs.",
    );
  }
  if (count > 1) {
    throw new Error(
      `context-radar: ${path} contains ${TOPBAR_PLACEHOLDER} ${count} times; it must appear once.`,
    );
  }
  // The static entries sit at the site root and keep the wordmark tag they
  // render today, which is what makes this phase visually neutral.
  return html.replace(
    TOPBAR_PLACEHOLDER,
    renderTopbar({ base: "./", active: activeRoute(path), tag: true }),
  );
};
