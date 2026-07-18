export interface MarkdownPage {
  /** Absolute path to the source `.md` file. */
  source: string;
  /** Output filename served at the site root, e.g. `methodology.html`. */
  route: string;
  /** Document title. */
  title: string;
}

export interface MarkdownPagesOptions {
  pages: MarkdownPage[];
}
