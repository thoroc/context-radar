import { NAV_LINKS } from "./nav-links";

/**
 * The site's top bar, rendered from one template for every page: the three
 * static entries (through the site-chrome transform), the generated tool pages,
 * and the generated markdown pages, which never had a bar at all.
 *
 * `data-chrome="v1"` is provenance, not decoration. Phase 0's success marker
 * needs a signal that can only be present after the extraction, and counting
 * `class="topbar"` is not one: it returned 1 on all four call sites before any
 * of this existed, so it could not distinguish a refactored page from an
 * untouched one. Bump the version if the markup contract changes.
 *
 * `tag` defaults to false so tool and layer pages keep the bar they have today,
 * without the landing page's wordmark suffix. Passing it as an option rather
 * than always rendering it is what keeps this phase visually neutral: the
 * alternative was adding the tag to 84 tool pages or dropping it from the
 * landing, either of which is a visible change.
 */
export const renderTopbar = (opts: { base: string; active: string; tag?: boolean }): string => {
  const links = NAV_LINKS.map(
    (l) =>
      `        <a href="${opts.base}${l.href}"${l.href === opts.active ? ' class="active"' : ""}>${l.label}</a>`,
  ).join("\n");
  const tag = opts.tag ? '\n        <span class="tag">Context reduction tools</span>' : "";
  return `<div class="topbar" data-chrome="v1">
      <a class="brand" href="${opts.base}index.html">
        <span class="mark">Context Radar<span class="d">.</span></span>${tag}
      </a>
      <nav>
${links}
      </nav>
      <button class="theme-toggle" id="theme-toggle" type="button" aria-label="Switch theme"></button>
    </div>`;
};
