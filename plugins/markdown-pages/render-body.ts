import { readFileSync } from "node:fs";
import MarkdownIt from "markdown-it";
import { stripFrontMatter } from "./strip-front-matter";
import type { MarkdownPage } from "./types";

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

/** Rendered inner HTML of the markdown, without the standalone-page chrome. */
export const renderBody = (page: MarkdownPage): string => {
  const html = md.render(stripFrontMatter(readFileSync(page.source, "utf8")));
  // Cross-links in the source point at sibling `.md` files; rewrite them to the
  // generated `.html` routes so both the standalone page and the modal resolve.
  return html.replace(/href="(?!https?:)([^"]+)\.md(#[^"]*)?"/g, 'href="$1.html$2"');
};
