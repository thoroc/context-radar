import { renderBody } from "./render-body";
import type { MarkdownPage, PageFragment } from "./types";

/** Map of route -> { title, html } for the in-page modal overlays. */
export const pageFragments = (pages: MarkdownPage[]): Record<string, PageFragment> => {
  const out: Record<string, PageFragment> = {};
  for (const page of pages) {
    out[page.route] = { title: page.title, html: renderBody(page) };
  }
  return out;
};
