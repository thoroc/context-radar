import { META, type PageFragment, TOOLS, toolSlug } from "../lib";
import { renderDetailBody } from "./render-detail-body";

/**
 * Route -> { title, html } for every tool, so the comparison page can open a
 * tool's detail as a modal overlay keyed on the same `tools/<slug>.html` route
 * the table links to, and swap between tools via in-modal conflict links. Built
 * from data already in the bundle, so no fetch and no inlined page HTML.
 */
export const toolFragments = (): Record<string, PageFragment> => {
  const slugByName = new Map(TOOLS.map((t) => [t.tool, toolSlug(t.tool)]));
  const out: Record<string, PageFragment> = {};
  for (const tool of TOOLS) {
    const body = renderDetailBody(tool, {
      slugByName,
      base: "",
      starsVerified: META.stars_verified,
    });
    out[`tools/${toolSlug(tool.tool)}.html`] = {
      title: tool.tool,
      html: `<div class="tool-detail tool-detail--modal">${body}</div>`,
    };
  }
  return out;
};
