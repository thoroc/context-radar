/** Strips a leading YAML front-matter block (`---` ... `---`) if present. */
export const stripFrontMatter = (source: string): string =>
  source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
