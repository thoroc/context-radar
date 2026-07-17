/**
 * URL-safe stable identifier for a tool name. Shared by the comparison table
 * (which links to detail pages) and the tool-pages plugin (which emits them),
 * so the link targets and the generated filenames never drift apart.
 */
export const toolSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
